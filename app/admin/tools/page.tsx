"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { ToolRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Badge, Button, Field, Input, Modal, PromotionBadge, Select, StatusBadge, Textarea } from "../../components/admin/ui";
import { slugify } from "../../lib/admin/utils";
import { ToolLogo } from "../../components/ToolLogo";

type ListFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  addLabel?: string;
  placeholder?: string;
};

function ListField({ label, value, onChange, addLabel = "Add", placeholder }: ListFieldProps) {
  const items = value.split(",");
  const update = (idx: number, next: string) => {
    const copy = [...items];
    copy[idx] = next;
    onChange(copy.join(","));
  };
  const remove = (idx: number) => {
    const copy = items.filter((_, i) => i !== idx);
    onChange(copy.join(","));
  };
  const add = () => {
    if (items[items.length - 1]?.trim()) {
      onChange(`${value.replace(/,\s*$/, "")}, `);
    }
  };
  const cleanup = () =>
    onChange(
      items
        .map((it) => it.trim())
        .filter(Boolean)
        .join(", ")
    );
  return (
    <Field label={label}>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              value={item.trim()}
              placeholder={placeholder}
              onChange={(e) => update(idx, e.target.value)}
              onBlur={cleanup}
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remove ${label} item`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus size={14} /> {addLabel}
        </Button>
      </div>
    </Field>
  );
}

function parseAltList(json: string): { slug: string; name: string }[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((a: any) => ({ slug: String(a?.slug || "").trim(), name: String(a?.name || a?.slug || "").trim() }))
      .filter((a) => a.slug);
  } catch {
    return [];
  }
}

type AlternativeFieldProps = {
  label: string;
  value: string;
  currentSlug?: string;
  onChange: (value: string) => void;
};

function AlternativeField({ label, value, currentSlug, onChange }: AlternativeFieldProps) {
  const selected = parseAltList(value);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ToolRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      adminApi
        .getTools({ search: q, limit: 8 })
        .then((res) => {
          if (cancelled) return;
          setResults((res.items as ToolRow[]).filter((t) => t.slug !== currentSlug));
          setSearching(false);
          setOpen(true);
        })
        .catch(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, currentSlug]);

  const add = (tool: ToolRow) => {
    if (selected.some((s) => s.slug === tool.slug)) return;
    onChange(JSON.stringify([...selected, { slug: tool.slug, name: tool.name }]));
    setQuery("");
    setOpen(false);
  };
  const remove = (slug: string) => {
    onChange(JSON.stringify(selected.filter((s) => s.slug !== slug)));
  };

  const matched = selected.length > 0 ? selected : null;

  return (
    <Field label={label} hint="Select existing tools as alternatives">
      <div className="space-y-2">
        <div className="relative">
          <div className="flex flex-wrap items-center gap-1.5">
            {matched?.map((s) => (
              <span
                key={s.slug}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground"
              >
                {s.name}
                <button
                  type="button"
                  onClick={() => remove(s.slug)}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${s.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <Input
            value={query}
            placeholder="Search existing tools to add…"
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setOpen(true);
            }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {open && (results.length > 0 || searching) && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-xl">
              {searching && !results.length && <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>}
              {results.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(t);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span className="truncate">{t.name}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">/{t.slug}</span>
                </button>
              ))}
              {!searching && results.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">No tools match “{query}”</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Field>
  );
}

function parseAttrList(json: string): { label: string; value: string }[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((a: any) => ({
        label: String(a?.label || "").trim(),
        value: String(a?.value || "").trim(),
      }))
      .filter((a) => a.label || a.value);
  } catch {
    return [];
  }
}

function toNum(value: string): number | null {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) ? n : null;
}

type AttributeListFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  addLabel?: string;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
};

function AttributeListField({
  label,
  value,
  onChange,
  addLabel = "Add attribute",
  labelPlaceholder = "e.g. Context Window",
  valuePlaceholder = "e.g. 200k tokens",
}: AttributeListFieldProps) {
  const rows = parseAttrList(value);
  const serialize = (next: { label: string; value: string }[]) => onChange(JSON.stringify(next));
  const update = (idx: number, key: "label" | "value", nextValue: string) => {
    const copy = rows.map((r) => ({ ...r }));
    copy[idx] = { ...copy[idx], [key]: nextValue };
    serialize(copy);
  };
  const remove = (idx: number) => {
    serialize(rows.filter((_, i) => i !== idx));
  };
  const add = () => {
    const last = rows[rows.length - 1];
    if (!last || last.label.trim() || last.value.trim()) {
      serialize([...rows, { label: "", value: "" }]);
    }
  };
  const cleanup = () => serialize(rows.filter((r) => r.label.trim() || r.value.trim()));
  return (
    <Field label={label}>
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              value={row.label}
              placeholder={labelPlaceholder}
              onChange={(e) => update(idx, "label", e.target.value)}
              onBlur={cleanup}
            />
            <Input
              value={row.value}
              placeholder={valuePlaceholder}
              onChange={(e) => update(idx, "value", e.target.value)}
              onBlur={cleanup}
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remove ${label} item`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus size={14} /> {addLabel}
        </Button>
      </div>
    </Field>
  );
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  category: "",
  subcategory: "",
  toolType: "",
  logo: "",
  imageUrl: "",
  website: "",
  url: "",
  shortDescription: "",
  description: "",
  pricing: "Free",
  startingPrice: "",
  billingPeriod: "",
  freePlan: false,
  freeTrial: false,
  trialDuration: "",
  features: "",
  pros: "",
  cons: "",
  bestFor: "",
  useCases: "",
  tags: "",
  searchKeywords: "",
  alternatives: "",
  videoUrl: "",
  screenshots: "",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  compareOverallRating: "",
  compareEaseOfUse: "",
  compareFeaturesScore: "",
  compareValueForMoney: "",
  compareAiPowered: false,
  compareApiAvailable: false,
  compareTeamCollaboration: false,
  compareCustomerSupport: "",
  comparePlatforms: "",
  compareIntegrations: "",
  compareAttributes: "[]",
  featured: false,
  featuredOrder: "",
  sponsored: false,
  sponsorName: "",
  sponsorStartDate: "",
  sponsorEndDate: "",
  sponsorPriority: "",
  sponsorActive: false,
  trending: false,
  editorsChoice: false,
  verified: false,
  displayOrder: "",
  status: "published",
};

export default function AdminToolsPage() {
  const [rows, setRows] = useState<ToolRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState("");
  const [sponsored, setSponsored] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ToolRow | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTools({
        search: search || undefined,
        status: status || undefined,
        featured: featured || undefined,
        sponsored: sponsored || undefined,
        page,
        limit: 10,
      });
      setRows(res.items as ToolRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load tools");
    } finally {
      setLoading(false);
    }
  }, [search, status, featured, sponsored, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (tool: ToolRow) => {
    setEditing(tool);
    setForm({
      name: tool.name,
      slug: tool.slug,
      category: tool.category,
      subcategory: tool.subcategory || "",
      toolType: tool.toolType || "",
      logo: tool.logo || tool.logoUrl || tool.imageUrl || "",
      imageUrl: tool.imageUrl || tool.bannerUrl || "",
      website: tool.website || tool.url || "",
      url: tool.url || "",
      shortDescription: tool.shortDescription || "",
      description: tool.description || "",
      pricing: tool.pricing,
      startingPrice: tool.startingPrice || "",
      billingPeriod: tool.billingPeriod || "",
      freePlan: tool.freePlan || false,
      freeTrial: tool.freeTrial || false,
      trialDuration: tool.trialDuration || "",
      features: (tool.features || []).join(", "),
      pros: (tool.pros || []).join(", "),
      cons: (tool.cons || []).join(", "),
      bestFor: tool.bestFor || "",
      useCases: (tool.useCases || []).join(", "),
      tags: (tool.tags || []).join(", "),
      searchKeywords: (tool.searchKeywords || []).join(", "),
      alternatives: JSON.stringify(
        (tool.alternatives || []).map((slug) => ({ slug, name: slug }))
      ),
      videoUrl: tool.videoUrl || "",
      screenshots: (tool.screenshots || []).join(", "),
      seoTitle: tool.seoTitle || "",
      seoDescription: tool.seoDescription || "",
      ogImage: tool.ogImage || "",
      compareOverallRating: tool.compare?.overallRating != null ? String(tool.compare.overallRating) : "",
      compareEaseOfUse: tool.compare?.easeOfUse != null ? String(tool.compare.easeOfUse) : "",
      compareFeaturesScore: tool.compare?.featuresScore != null ? String(tool.compare.featuresScore) : "",
      compareValueForMoney: tool.compare?.valueForMoney != null ? String(tool.compare.valueForMoney) : "",
      compareAiPowered: tool.compare?.aiPowered || false,
      compareApiAvailable: tool.compare?.apiAvailable || false,
      compareTeamCollaboration: tool.compare?.teamCollaboration || false,
      compareCustomerSupport: tool.compare?.customerSupport || "",
      comparePlatforms: (tool.compare?.platforms || []).join(", "),
      compareIntegrations: (tool.compare?.integrations || []).join(", "),
      compareAttributes: JSON.stringify(tool.compare?.attributes || []),
      featured: tool.featured,
      featuredOrder: tool.featuredOrder != null ? String(tool.featuredOrder) : "",
      sponsored: tool.sponsored,
      sponsorName: tool.sponsorName || "",
      sponsorStartDate: tool.sponsorStartDate ? String(tool.sponsorStartDate).slice(0, 10) : "",
      sponsorEndDate: tool.sponsorEndDate ? String(tool.sponsorEndDate).slice(0, 10) : "",
      sponsorPriority: tool.sponsorPriority != null ? String(tool.sponsorPriority) : "",
      sponsorActive: tool.sponsorActive || false,
      trending: tool.trending || false,
      editorsChoice: tool.editorsChoice || false,
      verified: tool.verified || false,
      displayOrder: tool.displayOrder != null ? String(tool.displayOrder) : "",
      status: tool.status,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const websiteUrl = form.url.trim() || form.website.trim();
      const splitList = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);
      const payload = {
        ...form,
        url: websiteUrl,
        website: websiteUrl,
        slug: form.slug.trim() || slugify(form.name),
        features: splitList(form.features),
        pros: splitList(form.pros),
        cons: splitList(form.cons),
        useCases: splitList(form.useCases),
        tags: splitList(form.tags),
        searchKeywords: splitList(form.searchKeywords),
        alternatives: parseAltList(form.alternatives).map((a) => a.slug),
        videoUrl: form.videoUrl.trim(),
        screenshots: splitList(form.screenshots),
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        ogImage: form.ogImage.trim(),
        trending: form.trending,
        editorsChoice: form.editorsChoice,
        verified: form.verified,
        displayOrder: toNum(form.displayOrder),
        featuredOrder: toNum(form.featuredOrder),
        sponsorName: form.sponsorName.trim(),
        sponsorStartDate: form.sponsorStartDate ? new Date(form.sponsorStartDate).toISOString() : null,
        sponsorEndDate: form.sponsorEndDate ? new Date(form.sponsorEndDate).toISOString() : null,
        sponsorPriority: toNum(form.sponsorPriority),
        sponsorActive: form.sponsorActive,
        compare: {
          overallRating: toNum(form.compareOverallRating),
          easeOfUse: toNum(form.compareEaseOfUse),
          featuresScore: toNum(form.compareFeaturesScore),
          valueForMoney: toNum(form.compareValueForMoney),
          aiPowered: form.compareAiPowered,
          apiAvailable: form.compareApiAvailable,
          teamCollaboration: form.compareTeamCollaboration,
          customerSupport: form.compareCustomerSupport.trim(),
          platforms: splitList(form.comparePlatforms),
          integrations: splitList(form.compareIntegrations),
          attributes: parseAttrList(form.compareAttributes),
        },
      };
      if (editing) {
        await adminApi.updateTool(editing._id, payload);
        toast.success("Tool updated");
      } else {
        await adminApi.createTool(payload);
        toast.success("Tool created");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = async (tool: ToolRow, key: "featured" | "sponsored") => {
    try {
      await adminApi.updateTool(tool._id, { [key]: !tool[key] });
      toast.success(`${tool.name} ${key === "featured" ? "featured" : "sponsored"} toggled`);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  const remove = async (tool: ToolRow) => {
    if (!confirm(`Delete "${tool.name}"? This cannot be undone.`)) return;
    setDeleting(tool._id);
    try {
      await adminApi.deleteTool(tool._id);
      toast.success("Tool deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<ToolRow>[] = [
    {
      key: "name",
      header: "Tool",
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            <ToolLogo name={t.name} logo={t.logo} website={t.website || t.url} size={22} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{t.name}</p>
            <p className="truncate text-xs text-muted-foreground">/{t.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (t) => <span className="text-muted-foreground">{t.category}</span>,
      hideOnMobile: true,
    },
    {
      key: "pricing",
      header: "Pricing",
      render: (t) => <Badge tone={t.pricing === "Free" ? "success" : "default"}>{t.pricing}</Badge>,
      hideOnMobile: true,
    },
    {
      key: "rating",
      header: "Rating",
      render: (t) => (
        <span className="text-sm">
          ★ <span className="font-medium">{t.rating || "—"}</span>
          {t.reviews > 0 && <span className="text-xs text-muted-foreground"> ({t.reviews})</span>}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "flags",
      header: "Flags",
      render: (t) => (
        <div className="flex flex-wrap gap-1">
          {t.featured && <Badge tone="violet">Featured</Badge>}
          {t.sponsored && <Badge tone="info">Sponsored</Badge>}
          {t.editorsChoice && <Badge tone="violet">Editor's Choice</Badge>}
          {t.verified && <Badge tone="success">Verified</Badge>}
          {(t.featured || t.sponsored) && (
            <PromotionBadge
              startDate={t.sponsorStartDate}
              endDate={t.sponsorEndDate}
              active={t.sponsorActive}
            />
          )}
          <StatusBadge status={t.status} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="AI Tools"
        description={`${total} tools in the catalog`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus size={14} /> New Tool
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
        >
          <Input
            placeholder="Search by name, slug or category…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" size="md">Search</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Select
            className="w-32"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
          <Select
            className="w-32"
            value={featured}
            onChange={(e) => {
              setFeatured(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any featured</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </Select>
          <Select
            className="w-32"
            value={sponsored}
            onChange={(e) => {
              setSponsored(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any sponsored</option>
            <option value="true">Sponsored</option>
            <option value="false">Not sponsored</option>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No tools found"
          emptyDescription="Try adjusting the filters, or create your first tool."
          rowActions={(t) => (
            <>
              <Button variant="ghost" size="icon" aria-label="Toggle featured" onClick={() => toggleFlag(t, "featured")}>
                <Star size={14} className={t.featured ? "fill-amber-400 text-amber-400" : ""} />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(t)}>
                <Pencil size={14} />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete" disabled={deleting === t._id} onClick={() => remove(t)}>
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </>
          )}
        />
        <Pagination page={page} pages={pages} total={total} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Create new tool"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save tool"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basic</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name *">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Slug" hint="Auto-generated from name if empty">
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Category *">
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </Field>
              <Field label="Subcategory">
                <Input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tool Type">
                <Select value={form.toolType} onChange={(e) => setForm({ ...form, toolType: e.target.value })}>
                  <option value="">— Select —</option>
                  <option>AI Tool</option>
                  <option>Software</option>
                  <option>SaaS</option>
                  <option>Chrome Extension</option>
                  <option>Browser Extension</option>
                  <option>Mobile App</option>
                  <option>Desktop App</option>
                  <option>Plugin</option>
                  <option>Open Source</option>
                  <option>API</option>
                  <option>Website</option>
                  <option>Other</option>
                </Select>
              </Field>
            </div>
            <Field label="Website URL" hint="Regular website or affiliate URL">
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" />
            </Field>
            <div className="mt-4">
              <Field label="Short description">
                <Textarea rows={2} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Full description">
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pricing</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Pricing Type">
                <Select value={form.pricing} onChange={(e) => setForm({ ...form, pricing: e.target.value })}>
                  <option>Free</option>
                  <option>Freemium</option>
                  <option>Paid</option>
                  <option>Subscription</option>
                </Select>
              </Field>
              <Field label="Starting Price" hint="e.g. $9.99">
                <Input value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: e.target.value })} placeholder="$0" />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Billing Period" hint="e.g. monthly, yearly, one-time">
                <Input value={form.billingPeriod} onChange={(e) => setForm({ ...form, billingPeriod: e.target.value })} placeholder="Monthly" />
              </Field>
              <Field label="Trial Duration" hint="e.g. 14 days">
                <Input value={form.trialDuration} onChange={(e) => setForm({ ...form, trialDuration: e.target.value })} placeholder="7 days" />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Free Plan">
                <Select value={form.freePlan ? "yes" : "no"} onChange={(e) => setForm({ ...form, freePlan: e.target.value === "yes" })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </Field>
              <Field label="Free Trial">
                <Select value={form.freeTrial ? "yes" : "no"} onChange={(e) => setForm({ ...form, freeTrial: e.target.value === "yes" })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </Field>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Features</h4>
            <ListField
              label="Key Features"
              value={form.features}
              onChange={(v) => setForm({ ...form, features: v })}
              addLabel="Add feature"
              placeholder="e.g. AI-powered search"
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ListField
                label="Pros"
                value={form.pros}
                onChange={(v) => setForm({ ...form, pros: v })}
                addLabel="Add pro"
                placeholder="e.g. Easy to use"
              />
              <ListField
                label="Cons"
                value={form.cons}
                onChange={(v) => setForm({ ...form, cons: v })}
                addLabel="Add con"
                placeholder="e.g. Limited free plan"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Best For" hint="e.g. Developers, marketers">
                <Input value={form.bestFor} onChange={(e) => setForm({ ...form, bestFor: e.target.value })} />
              </Field>
              <ListField
                label="Use Cases"
                value={form.useCases}
                onChange={(v) => setForm({ ...form, useCases: v })}
                addLabel="Add use case"
                placeholder="e.g. Content writing"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ListField
                label="Tags"
                value={form.tags}
                onChange={(v) => setForm({ ...form, tags: v })}
                addLabel="Add tag"
                placeholder="e.g. AI"
              />
              <ListField
                label="Search Keywords"
                value={form.searchKeywords}
                onChange={(v) => setForm({ ...form, searchKeywords: v })}
                addLabel="Add keyword"
                placeholder="e.g. best ai writer"
              />
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alternatives</h4>
            <AlternativeField
              label="Alternative Tools"
              value={form.alternatives}
              currentSlug={editing?.slug}
              onChange={(v) => setForm({ ...form, alternatives: v })}
            />
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compare Data</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Overall Rating" hint="0–10 score">
                <Input type="number" min={0} max={10} step={0.1} value={form.compareOverallRating} placeholder="8.5" onChange={(e) => setForm({ ...form, compareOverallRating: e.target.value })} />
              </Field>
              <Field label="Ease of Use" hint="0–10 score">
                <Input type="number" min={0} max={10} step={0.1} value={form.compareEaseOfUse} placeholder="9" onChange={(e) => setForm({ ...form, compareEaseOfUse: e.target.value })} />
              </Field>
              <Field label="Features Score" hint="0–10 score">
                <Input type="number" min={0} max={10} step={0.1} value={form.compareFeaturesScore} placeholder="9.2" onChange={(e) => setForm({ ...form, compareFeaturesScore: e.target.value })} />
              </Field>
              <Field label="Value for Money" hint="0–10 score">
                <Input type="number" min={0} max={10} step={0.1} value={form.compareValueForMoney} placeholder="8.8" onChange={(e) => setForm({ ...form, compareValueForMoney: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="AI Powered">
                <Select value={form.compareAiPowered ? "yes" : "no"} onChange={(e) => setForm({ ...form, compareAiPowered: e.target.value === "yes" })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </Field>
              <Field label="API Available">
                <Select value={form.compareApiAvailable ? "yes" : "no"} onChange={(e) => setForm({ ...form, compareApiAvailable: e.target.value === "yes" })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </Field>
              <Field label="Team Collaboration">
                <Select value={form.compareTeamCollaboration ? "yes" : "no"} onChange={(e) => setForm({ ...form, compareTeamCollaboration: e.target.value === "yes" })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </Field>
              <Field label="Customer Support" hint="e.g. Email, live chat, 24/7">
                <Input value={form.compareCustomerSupport} placeholder="Email, live chat" onChange={(e) => setForm({ ...form, compareCustomerSupport: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ListField
                label="Platforms"
                value={form.comparePlatforms}
                onChange={(v) => setForm({ ...form, comparePlatforms: v })}
                addLabel="Add platform"
                placeholder="e.g. Web, iOS, API"
              />
              <ListField
                label="Integrations"
                value={form.compareIntegrations}
                onChange={(v) => setForm({ ...form, compareIntegrations: v })}
                addLabel="Add integration"
                placeholder="e.g. Slack, Zapier"
              />
            </div>
            <div className="mt-4">
              <AttributeListField
                label="Comparison Attributes"
                value={form.compareAttributes}
                onChange={(v) => setForm({ ...form, compareAttributes: v })}
                addLabel="Add attribute"
              />
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Media</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Logo" hint="URL to the tool logo image">
                <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://…/logo.png" />
              </Field>
              <Field label="Thumbnail" hint="URL to the cover/thumbnail image">
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…/cover.png" />
              </Field>
            </div>
            <div className="mt-4">
              <ListField
                label="Screenshots"
                value={form.screenshots}
                onChange={(v) => setForm({ ...form, screenshots: v })}
                addLabel="Add screenshot URL"
                placeholder="https://…/screenshot.png"
              />
            </div>
            <div className="mt-4">
              <Field label="Video / Demo URL" hint="YouTube, Vimeo or demo link">
                <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://…" />
              </Field>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO</h4>
            <div className="grid grid-cols-1 gap-4">
              <Field label="SEO Title" hint="Browser & search title">
                <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="Tool name — Best AI tool for…" />
              </Field>
              <Field label="Meta Description" hint="Shown in search results">
                <Textarea rows={2} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
              </Field>
              <Field label="OG Image" hint="Social sharing image URL">
                <Input value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} placeholder="https://…/og.png" />
              </Field>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publishing</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.sponsored} onChange={(e) => setForm({ ...form, sponsored: e.target.checked })} />
                Sponsored
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.editorsChoice} onChange={(e) => setForm({ ...form, editorsChoice: e.target.checked })} />
                Editor&apos;s Choice
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
                Verified
              </label>
              <Field label="Display Order" hint="Lower numbers sort first">
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} placeholder="0" />
              </Field>
            </div>
            <div className="mt-4 sm:max-w-xs">
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
            </div>
            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h5 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
                Paid Promotion <span className="ml-1 font-normal normal-case text-muted-foreground">(Sponsored / Featured / Trending Override)</span>
              </h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={form.sponsorActive} onChange={(e) => setForm({ ...form, sponsorActive: e.target.checked })} />
                  Promotion Active
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.trending}
                    onChange={(e) => setForm({ ...form, trending: e.target.checked })}
                  />
                  Trending Override (paid)
                </label>
                <Field label="Sponsor / Company" hint="Optional paid-promotion label">
                  <Input value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} placeholder="Company or campaign name" />
                </Field>
                <Field label="Priority / Position" hint="Lower = higher placement">
                  <Input type="number" value={form.sponsorPriority} onChange={(e) => setForm({ ...form, sponsorPriority: e.target.value })} placeholder="1" />
                </Field>
                <Field label="Promotion Start Date" hint="Placement starts on this date">
                  <Input type="date" value={form.sponsorStartDate} onChange={(e) => setForm({ ...form, sponsorStartDate: e.target.value })} />
                </Field>
                <Field label="Promotion End Date" hint="Auto-expires after this date">
                  <Input type="date" value={form.sponsorEndDate} onChange={(e) => setForm({ ...form, sponsorEndDate: e.target.value })} />
                </Field>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Promotion runs between Start and End dates, then automatically expires and the tool returns to the
                normal organic ranking. Sponsored/Featured placement is kept separate from organic trending scores.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
