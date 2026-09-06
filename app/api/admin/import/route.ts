import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { asBool, parseCSV, slugify } from "@/app/lib/admin/utils";
import memoryStore from "@/app/lib/data/memoryStore";

export const dynamic = "force-dynamic";

function rowToToolData(row: Record<string, string>, name: string, slug: string) {
  return {
    slug,
    name,
    category: String(row["category"] || "Uncategorized").trim(),
    pricing: String(row["pricing"] || "Free").trim(),
    website: row["website"] || row["url"] || undefined,
    url: row["url"] || row["website"] || undefined,
    shortDescription: row["shortdescription"] || "",
    description: row["description"] || row["fulldescription"] || "",
    desc: row["shortdescription"] || row["description"] || row["fulldescription"] || "",
    features: String(row["features"] || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean),
    tags: String(row["tags"] || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean),
    featured: asBool(row["featured"]),
    sponsored: asBool(row["sponsored"]),
    rating: Number(row["rating"]) || 0,
    reviews: Number(row["reviews"]) || 0,
    status: ["draft", "published", "archived"].includes(row["status"])
      ? row["status"]
      : "published",
  };
}

export async function POST(request: Request) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const body = await request.json();
    const csv = String(body.csv || "");
    if (!csv.trim()) return Response.json({ error: "CSV content is required" }, { status: 400 });

    // Enforce payload and row caps to protect against DoS (VOT-SEC-020)
    if (csv.length > 2 * 1024 * 1024) {
      return Response.json(
        { error: "CSV content exceeds maximum allowed size of 2MB" },
        { status: 400 }
      );
    }

    const rows = parseCSV(csv);
    if (rows.length === 0) {
      return Response.json({ error: "No data rows found in CSV" }, { status: 400 });
    }
    if (rows.length > 500) {
      return Response.json(
        { error: "CSV contains too many rows. Maximum allowed is 500 rows per batch." },
        { status: 400 }
      );
    }

    let imported = 0;
    const errors: string[] = [];
    const created: string[] = [];
    const useMemory = !isDBConnected();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = String(row["name"] || "").trim();
      if (!name) {
        errors.push(`Row ${i + 1}: missing name`);
        continue;
      }
      try {
        const slug = String(row["slug"] || slugify(name)).trim();
        const data = rowToToolData(row, name, slug);

        if (useMemory) {
          const existing = await memoryStore.getToolBySlug(slug);
          if (existing) {
            await memoryStore.updateTool(String(existing._id), data);
          } else {
            await memoryStore.createTool(data);
            created.push(slug);
          }
          imported++;
          continue;
        }

        try {
          const existing = await Tool.findOne({ slug });
          if (existing) {
            await Tool.updateOne({ _id: existing._id }, { $set: data });
          } else {
            await Tool.create({ ...data, publishDate: new Date() });
            created.push(slug);
          }
          imported++;
        } catch (mongoErr: any) {
          // Fall back to memory for this row if Mongo buffers/fails.
          console.warn(`import row ${i + 1} Mongo failed:`, mongoErr?.message || mongoErr);
          const existing = await memoryStore.getToolBySlug(slug);
          if (existing) {
            await memoryStore.updateTool(String(existing._id), data);
          } else {
            await memoryStore.createTool(data);
            created.push(slug);
          }
          imported++;
        }
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message || "failed"}`);
      }
    }

    await logActivity(user.email, "imported", `csv:${imported}`, {
      created: created.length,
      errors: errors.length,
      source: useMemory ? "memory" : "database",
    });
    return Response.json({ imported, errors });
  } catch (err: any) {
    return errorResponse(err);
  }
}
