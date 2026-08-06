import { getFirestoreDb } from "../config/firebaseAdmin";
import {
  CollectionReference,
  DocumentReference,
  QuerySnapshot,
} from "firebase-admin/firestore";

// ─────────────────────────────────────────────────────────────
// FirestoreModel: a Mongoose-like model interface backed by
// Cloud Firestore. Supports the subset of the Mongoose API used
// across VaultOfTools routes:
//   Model.find(filter).sort().skip().limit().select().lean()  (awaitable chain)
//   Model.findOne(filter), Model.findById(id)
//   Model.countDocuments(filter)
//   Model.create(data) / new Model(data).save()
//   Model.updateOne(filter, update), Model.updateMany(filter, update)
//   Model.findOneAndUpdate(filter, update, opts)
//   Model.findByIdAndUpdate(id, update, opts)
//   Model.deleteOne(filter), Model.deleteMany(filter), Model.findByIdAndDelete(id)
//   Model.aggregate(pipeline) — $match, $group, $sort, $limit, $project, $unwind, $sum, $avg, $cond
//   Model.distinct(field)
//   instance.save(), instance.remove(), instance.toObject()
//   per-model instance methods (e.g. User.comparePassword / toProfile)
//
// Document ids map 1:1 to Firestore document ids; every document
// also carries an `_id` field equal to its document id so route
// code that reads `doc._id` keeps working. Timestamps createdAt /
// updatedAt are added automatically (same as Mongoose timestamps).
// ─────────────────────────────────────────────────────────────

export type FirestoreDoc = Record<string, any> & { _id: string };

// Query builder type shared between the Firestore model and the
// mongoose fallback, so route code compiles against either backend.
export type AppQuery = {
  sort(sortObj: any): AppQuery;
  skip(n: number): AppQuery;
  limit(n: number): AppQuery;
  select(arg: any): AppQuery;
  lean(): AppQuery;
  populate(...args: any[]): AppQuery;
  exec(): Promise<any[]>;
  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2>;
};

// Model interface that mirrors the Mongoose surface used by the app.
// Constructable via `new Model(data)` and callable as `Model(data)`.
export type AppModel = {
  find(filter?: any, projection?: any): AppQuery;
  findOne(filter?: any): Promise<any>;
  findById(id: string): Promise<any>;
  countDocuments(filter?: any): Promise<number>;
  create(data: any): Promise<any>;
  insertMany(items: any[]): Promise<any[]>;
  updateOne(filter: any, update: any): Promise<any>;
  updateMany(filter: any, update: any): Promise<any>;
  findOneAndUpdate(filter: any, update: any, opts?: any): Promise<any>;
  findByIdAndUpdate(id: string, update: any, opts?: any): Promise<any>;
  deleteOne(filter: any): Promise<any>;
  deleteMany(filter: any): Promise<any>;
  findByIdAndDelete(id: string): Promise<any>;
  distinct(field: string): Promise<any[]>;
  aggregate<T = any>(pipeline: Record<string, any>[]): Promise<T[]>;
  (data?: any): any;
  new (data?: any): any;
};

type Filter = Record<string, any>;

type UpdateOp = {
  $set?: Record<string, any>;
  $inc?: Record<string, number>;
  $push?: Record<string, any>;
  $unset?: Record<string, any>;
};

interface ModelOptions {
  methods?: Record<string, (...args: any[]) => any>;
  preSave?: (data: Record<string, any>) => Promise<void>;
  timestamps?: boolean;
}

function getValue(obj: any, path: string): any {
  if (!path) return undefined;
  if (path === "$") return obj;
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function setValue(obj: any, path: string, value: any) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null || typeof cur[parts[i]] !== "object") {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function matchesRegex(value: any, cond: any): boolean {
  const flags = cond.$options || "";
  const re = new RegExp(cond.$regex, flags);
  if (Array.isArray(value)) return value.some((v) => re.test(String(v)));
  return re.test(String(value ?? ""));
}

function matchesCond(value: any, cond: any): boolean {
  if (cond && typeof cond === "object" && !(cond instanceof Date) && !Array.isArray(cond)) {
    const keys = Object.keys(cond);
    if (keys.every((k) => k.startsWith("$"))) {
      if (cond.$regex !== undefined) return matchesRegex(value, cond);
      if (cond.$ne !== undefined) return value != cond.$ne;
      if (cond.$gt !== undefined) return value > cond.$gt;
      if (cond.$gte !== undefined) return value >= cond.$gte;
      if (cond.$lt !== undefined) return value < cond.$lt;
      if (cond.$lte !== undefined) return value <= cond.$lte;
      if (cond.$in !== undefined) return cond.$in.includes(value);
      if (cond.$nin !== undefined) return !cond.$in?.includes(value);
      if (cond.$exists !== undefined) return cond.$exists ? value !== undefined : value === undefined;
      return false;
    }
    return false;
  }
  if (cond instanceof Date && value instanceof Date) return value.getTime() === cond.getTime();
  return String(value ?? "") === String(cond ?? "");
}

function matchesFilter(doc: any, filter?: Filter): boolean {
  if (!filter) return true;
  if (filter.$or) return filter.$or.some((f: Filter) => matchesFilter(doc, f));
  if (filter.$and) return filter.$and.every((f: Filter) => matchesFilter(doc, f));
  for (const [key, cond] of Object.entries(filter)) {
    if (key === "$or" || key === "$and" || key === "$nor") continue;
    const value = getValue(doc, key);
    if (!matchesCond(value, cond)) return false;
  }
  return true;
}

function compareValues(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
  return (a as number) - (b as number);
}

function sortDocs(docs: any[], sortObj: Record<string, 1 | -1> | undefined) {
  if (!sortObj) return docs;
  const keys = Object.entries(sortObj);
  return docs.slice().sort((x, y) => {
    for (const [key, dir] of keys) {
      const c = compareValues(getValue(x, key), getValue(y, key));
      if (c !== 0) return c * dir;
    }
    return 0;
  });
}

function applySelect(docs: any[], select: any) {
  if (!select) return docs;
  if (typeof select === "string") {
    const fields = select.trim().split(/\s+/).filter(Boolean);
    if (fields.length === 0) return docs;
    const allExclude = fields.every((f) => f.startsWith("-"));
    return docs.map((d) => {
      const out: any = {};
      if (allExclude) {
        const excluded = new Set(fields.map((f) => f.replace(/^-/, "")));
        for (const [k, v] of Object.entries(d)) if (!excluded.has(k)) out[k] = v;
        return out;
      }
      for (const f of fields) {
        if (f === "_id") out._id = d._id;
        else if (d[f] !== undefined) out[f] = d[f];
      }
      return out;
    });
  }
  if (typeof select === "object") {
    return docs.map((d) => {
      const out: any = {};
      for (const [k, v] of Object.entries(select)) {
        if (v === 1 || v === true) out[k] = d[k];
        else if (v === 0 && d[k] !== undefined) out[k] = d[k];
      }
      if (d._id !== undefined && out._id === undefined) out._id = d._id;
      return out;
    });
  }
  return docs;
}

function genId(): string {
  const chars = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

function serializeForFirestore(value: any): any {
  if (value === undefined) return undefined;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(serializeForFirestore);
  if (value && typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      out[k] = serializeForFirestore(v);
    }
    return out;
  }
  return value;
}

function deserializeFromFirestore(value: any): any {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  if (Array.isArray(value)) return value.map(deserializeFromFirestore);
  if (value && typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) out[k] = deserializeFromFirestore(v);
    return out;
  }
  return value;
}

class FSQuery {
  private model: FirestoreModel;
  private filter?: Filter;
  private sortObj?: Record<string, 1 | -1>;
  private skipN = 0;
  private limitN?: number;
  private selectArg?: any;
  private projection?: Filter;

  constructor(model: FirestoreModel, filter?: Filter, projection?: Filter) {
    this.model = model;
    this.filter = filter;
    this.projection = projection;
  }

  sort(sortObj: Record<string, 1 | -1> | string): this {
    if (typeof sortObj === "string") {
      const obj: Record<string, 1 | -1> = {};
      for (const f of sortObj.trim().split(/\s+/).filter(Boolean)) {
        const neg = f.startsWith("-");
        obj[neg ? f.slice(1) : f] = neg ? -1 : 1;
      }
      this.sortObj = obj;
    } else {
      this.sortObj = sortObj;
    }
    return this;
  }

  skip(n: number): this {
    this.skipN = n;
    return this;
  }

  limit(n: number): this {
    this.limitN = n;
    return this;
  }

  select(arg: any): this {
    this.selectArg = arg;
    return this;
  }

  lean(): this {
    return this;
  }

  populate(): this {
    // No-op: the app's populate usage only needs the referenced
    // fields already present on the stored document (userId string).
    return this;
  }

  async exec(): Promise<FirestoreDoc[]> {
    const docs = await this.model._allDocs();
    let out = docs.filter((d) => matchesFilter(d, this.filter));
    out = applySelect(out, this.selectArg || this.projection);
    out = sortDocs(out, this.sortObj);
    if (this.skipN) out = out.slice(this.skipN);
    if (this.limitN !== undefined) out = out.slice(0, this.limitN);
    return out.map((d) => this.model._instance(d));
  }

  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

export class FirestoreModel {
  collectionName: string;
  options: ModelOptions;

  constructor(collectionName: string, options: ModelOptions = {}) {
    this.collectionName = collectionName;
    this.options = { timestamps: true, ...options };
  }

  col(): CollectionReference {
    return getFirestoreDb().collection(this.collectionName);
  }

  doc(id: string): DocumentReference {
    return this.col().doc(id);
  }

  async _allDocs(): Promise<FirestoreDoc[]> {
    const snap: QuerySnapshot = await this.col().get();
    return snap.docs.map((d) => ({
      _id: d.id,
      ...deserializeFromFirestore(d.data()),
    }));
  }

  async _docData(id: string): Promise<FirestoreDoc | null> {
    const snap = await this.doc(id).get();
    if (!snap.exists) return null;
    return { _id: snap.id, ...deserializeFromFirestore(snap.data()) };
  }

  _instance(data: any) {
    const dataFields: any = {};
    Object.assign(dataFields, data);
    const inst: any = dataFields;
    inst.save = async () => {
      if (this.options.preSave) {
        await this.options.preSave(inst);
      }
      const now = new Date();
      if (this.options.timestamps !== false) {
        if (!inst.createdAt) inst.createdAt = now;
        inst.updatedAt = now;
      }
      const doc: any = {};
      for (const [k, v] of Object.entries(inst)) {
        if (typeof v === "function") continue;
        doc[k] = v;
      }
      delete doc._id;
      const cleaned = serializeForFirestore(doc);
      await this.doc(String(inst._id)).set(cleaned, { merge: true });
      return inst;
    };
    inst.remove = async () => {
      await this.doc(String(inst._id)).delete();
      return inst;
    };
    inst.deleteOne = inst.remove;
    inst.toObject = () => {
      const out: any = {};
      for (const [k, v] of Object.entries(inst)) {
        if (typeof v === "function") continue;
        out[k] = v;
      }
      return out;
    };
    if (this.options.methods) {
      for (const [name, fn] of Object.entries(this.options.methods)) {
        inst[name] = fn.bind(inst);
      }
    }
    return inst;
  }

  async _create(data: any): Promise<FirestoreDoc> {
    const docId = data._id || data.id || genId();
    const inst = this._instance({ _id: docId, ...data });
    await inst.save();
    return inst;
  }

  find(filter?: Filter, projection?: Filter): FSQuery {
    return new FSQuery(this, filter, projection);
  }

  async findOne(filter?: Filter): Promise<any | null> {
    const docs = await this._allDocs();
    const hit = docs.find((d) => matchesFilter(d, filter));
    return hit ? this._instance(hit) : null;
  }

  async findById(id: string): Promise<any | null> {
    const data = await this._docData(String(id));
    return data ? this._instance(data) : null;
  }

  async countDocuments(filter?: Filter): Promise<number> {
    const docs = await this._allDocs();
    return docs.filter((d) => matchesFilter(d, filter)).length;
  }

  async create(data: any): Promise<any> {
    return this._create(data);
  }

  async insertMany(items: any[]): Promise<any[]> {
    const out: any[] = [];
    for (const item of items) out.push(await this._create(item));
    return out;
  }

  async updateOne(filter: Filter, update: UpdateOp): Promise<any> {
    const docs = await this._allDocs();
    const hit = docs.find((d) => matchesFilter(d, filter));
    if (!hit) return { matchedCount: 0, modifiedCount: 0 };
    const updated = this._applyUpdate(hit, update);
    await this._create(updated);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async updateMany(filter: Filter, update: UpdateOp): Promise<any> {
    const docs = await this._allDocs();
    let matched = 0;
    for (const d of docs) {
      if (matchesFilter(d, filter)) {
        const updated = this._applyUpdate(d, update);
        await this._create(updated);
        matched++;
      }
    }
    return { matchedCount: matched, modifiedCount: matched };
  }

  async findOneAndUpdate(filter: Filter, update: UpdateOp, opts: any = {}): Promise<any | null> {
    const docs = await this._allDocs();
    let hit = docs.find((d) => matchesFilter(d, filter));
    if (!hit && opts.upsert) {
      hit = { _id: genId(), ...this._filterToDoc(filter) };
    }
    if (!hit) return null;
    const updated = this._applyUpdate(hit, update);
    await this._create(updated);
    return opts.new === false ? this._instance(hit) : this._instance(updated);
  }

  async findByIdAndUpdate(id: string, update: UpdateOp, opts: any = {}): Promise<any | null> {
    return this.findOneAndUpdate({ _id: String(id) }, update, opts);
  }

  async deleteOne(filter: Filter): Promise<any> {
    const docs = await this._allDocs();
    const hit = docs.find((d) => matchesFilter(d, filter));
    if (!hit) return { deletedCount: 0 };
    await this.doc(String(hit._id)).delete();
    return { deletedCount: 1 };
  }

  async deleteMany(filter: Filter): Promise<any> {
    const docs = await this._allDocs();
    let deleted = 0;
    for (const d of docs) {
      if (matchesFilter(d, filter)) {
        await this.doc(String(d._id)).delete();
        deleted++;
      }
    }
    return { deletedCount: deleted };
  }

  async findByIdAndDelete(id: string): Promise<any | null> {
    const data = await this._docData(String(id));
    if (!data) return null;
    await this.doc(String(id)).delete();
    return this._instance(data);
  }

  async distinct(field: string): Promise<any[]> {
    const docs = await this._allDocs();
    const set = new Set<any>();
    for (const d of docs) {
      const v = getValue(d, field);
      if (Array.isArray(v)) for (const x of v) set.add(x);
      else set.add(v);
    }
    return [...set];
  }

  _applyUpdate(doc: any, update: UpdateOp): any {
    const out: any = { ...doc };
    if (update.$set) {
      for (const [k, v] of Object.entries(update.$set)) setValue(out, k, v);
    }
    if (update.$inc) {
      for (const [k, v] of Object.entries(update.$inc)) {
        setValue(out, k, (getValue(out, k) || 0) + v);
      }
    }
    if (update.$push) {
      for (const [k, v] of Object.entries(update.$push)) {
        const arr = getValue(out, k);
        if (Array.isArray(arr)) arr.push(v);
        else setValue(out, k, [v]);
      }
    }
    if (update.$unset) {
      for (const [k] of Object.entries(update.$unset)) {
        const parts = k.split(".");
        const last = parts.pop()!;
        let cur = out;
        for (const p of parts) cur = cur?.[p];
        if (cur) delete cur[last];
      }
    }
    return out;
  }

  _filterToDoc(filter: Filter): Record<string, any> {
    const doc: Record<string, any> = {};
    for (const [k, v] of Object.entries(filter)) {
      if (k.startsWith("$")) continue;
      if (v && typeof v === "object" && Object.keys(v).every((x) => x.startsWith("$"))) continue;
      doc[k] = v;
    }
    return doc;
  }

  async aggregate(pipeline: Record<string, any>[]): Promise<any[]> {
    let docs = await this._allDocs();
    for (const stage of pipeline) {
      const [op, spec] = Object.entries(stage)[0];
      switch (op) {
        case "$match": {
          docs = docs.filter((d) => matchesFilter(d, spec));
          break;
        }
        case "$unwind": {
          const path = String(spec).replace(/^\$/, "");
          const out: any[] = [];
          for (const d of docs) {
            const arr = getValue(d, path);
            if (Array.isArray(arr)) {
              for (const item of arr) {
                out.push({ ...d, [path]: item });
              }
            } else if (arr !== undefined) {
              out.push(d);
            }
          }
          docs = out;
          break;
        }
        case "$group": {
          const idSpec = spec._id;
          const map = new Map<string, any[]>();
          for (const d of docs) {
            let key: string;
            if (idSpec === null) key = "__all__";
            else key = String(getValue(d, String(idSpec).replace(/^\$/, "")) ?? "");
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(d);
          }
          const out: any[] = [];
          for (const [key, group] of map.entries()) {
            const row: any = { _id: key === "__all__" ? null : key };
            for (const [field, expr] of Object.entries(spec)) {
              if (field === "_id") continue;
              row[field] = this._aggAccumulator(expr, group);
            }
            out.push(row);
          }
          docs = out;
          break;
        }
        case "$sort": {
          docs = sortDocs(docs, spec);
          break;
        }
        case "$limit": {
          docs = docs.slice(0, Number(spec));
          break;
        }
        case "$skip": {
          docs = docs.slice(Number(spec));
          break;
        }
        case "$project": {
          const out: any[] = [];
          for (const d of docs) {
            const row: any = {};
            for (const [field, expr] of Object.entries(spec)) {
              if (expr === 1 || expr === true) {
                row[field] = getValue(d, field);
              } else if (expr === 0 || expr === false) {
                // skip
              } else if (typeof expr === "string" && expr.startsWith("$")) {
                row[field] = getValue(d, expr.slice(1));
              }
            }
            out.push(row);
          }
          docs = out;
          break;
        }
        default:
          break;
      }
    }
    return docs;
  }

  _aggAccumulator(expr: any, group: any[]): any {
    if (expr && typeof expr === "object" && !Array.isArray(expr)) {
      if (expr.$sum !== undefined) {
        const val = expr.$sum;
        if (val === 1) return group.length;
        if (val === 0) return 0;
        if (typeof val === "string") {
          return group.reduce((acc, d) => acc + (Number(getValue(d, val.slice(1))) || 0), 0);
        }
        if (typeof val === "object" && val.$cond) {
          const { if: cond, then, else: els } = val.$cond;
          return group.reduce(
            (acc, d) => acc + (this._evalCond(cond, d) ? Number(then) : Number(els)),
            0
          );
        }
        return 0;
      }
      if (expr.$avg !== undefined) {
        const val = expr.$avg;
        if (typeof val === "string") {
          const nums = group.map((d) => Number(getValue(d, val.slice(1)) || 0));
          if (nums.length === 0) return 0;
          return nums.reduce((a, b) => a + b, 0) / nums.length;
        }
        return 0;
      }
      if (expr.$cond) {
        const { if: cond, then, else: els } = expr.$cond;
        const d = group[0] || {};
        return this._evalCond(cond, d) ? Number(then) : Number(els);
      }
      return 0;
    }
    if (typeof expr === "string" && expr.startsWith("$")) {
      const d = group[0] || {};
      return getValue(d, expr.slice(1));
    }
    return expr;
  }

  _evalCond(cond: any, doc: any): boolean {
    if (Array.isArray(cond) && cond.length === 3) {
      const [lhs, op, rhs] = cond;
      const l = typeof lhs === "string" && lhs.startsWith("$") ? getValue(doc, lhs.slice(1)) : lhs;
      switch (op) {
        case "$eq": return l == rhs;
        case "$ne": return l != rhs;
        case "$gt": return l > rhs;
        case "$gte": return l >= rhs;
        case "$lt": return l < rhs;
        case "$lte": return l <= rhs;
        default: return false;
      }
    }
    return false;
  }
}

// Returns a constructible model: `new Model(data)` creates a draft
// instance with `.save()`, and `Model.find(...)` etc. work as statics.
export function createFirestoreModel(
  collectionName: string,
  options: ModelOptions = {}
): AppModel {
  const model = new FirestoreModel(collectionName, options);
  function FSModelConstructor(data?: Record<string, any>): any {
    if (data && typeof data === "object" && !data.__isModel) {
      return model._instance({ _id: data._id || data.id || genId(), ...data });
    }
    return model;
  }
  // Attach statics
  for (const name of [
    "find", "findOne", "findById", "countDocuments", "create", "insertMany",
    "updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate",
    "deleteOne", "deleteMany", "findByIdAndDelete", "distinct", "aggregate",
    "_allDocs", "col", "doc",
  ] as const) {
    (FSModelConstructor as any)[name] = (model as any)[name].bind(model);
  }
  return FSModelConstructor as unknown as AppModel;
}
