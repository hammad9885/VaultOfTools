import { connectDB } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { asBool, parseCSV, slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const body = await request.json();
    const csv = String(body.csv || "");
    if (!csv.trim()) return Response.json({ error: "CSV content is required" }, { status: 400 });

    const rows = parseCSV(csv);
    if (rows.length === 0) return Response.json({ error: "No data rows found in CSV" }, { status: 400 });

    let imported = 0;
    const errors: string[] = [];
    const created: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = String(row["name"] || "").trim();
      if (!name) {
        errors.push(`Row ${i + 1}: missing name`);
        continue;
      }
      try {
        const slug = String(row["slug"] || slugify(name)).trim();
        const existing = await Tool.findOne({ slug });
        const data: Record<string, any> = {
          slug,
          name,
          category: String(row["category"] || "Uncategorized").trim(),
          pricing: String(row["pricing"] || "Free").trim(),
          website: row["website"] || row["url"] || undefined,
          url: row["url"] || undefined,
          shortDescription: row["shortdescription"] || "",
          description: row["description"] || row["fulldescription"] || "",
          desc: row["shortdescription"] || row["description"] || row["fulldescription"] || "",
          features: String(row["features"] || "").split(";").map((s) => s.trim()).filter(Boolean),
          tags: String(row["tags"] || "").split(";").map((s) => s.trim()).filter(Boolean),
          featured: asBool(row["featured"]),
          sponsored: asBool(row["sponsored"]),
          rating: Number(row["rating"]) || 0,
          reviews: Number(row["reviews"]) || 0,
          status: ["draft", "published", "archived"].includes(row["status"]) ? row["status"] : "published",
        };

        if (existing) {
          data.name = existing.name;
          await Tool.updateOne({ _id: existing._id }, { $set: data });
        } else {
          await Tool.create({ ...data, publishDate: new Date() });
          created.push(slug);
        }
        imported++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message || "failed"}`);
      }
    }

    await logActivity(user.email, "imported", `csv:${imported}`, { created: created.length, errors: errors.length });
    return Response.json({ imported, errors });
  } catch (err: any) {
    return errorResponse(err);
  }
}
