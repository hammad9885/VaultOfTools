"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Upload, FileJson } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { PageHeader, Card } from "../../components/admin/cards";
import { Button, Field, Textarea } from "../../components/admin/ui";
const EXPORTS = [
  { type: "tools" as const, label: "Export tools (CSV)", desc: "All tools with name, category, pricing, features, tags and flags." },
  { type: "users" as const, label: "Export users (CSV)", desc: "All registered users with role and status." },
  { type: "subscribers" as const, label: "Export subscribers (CSV)", desc: "Newsletter list with status." },
  { type: "reviews" as const, label: "Export reviews (CSV)", desc: "All reviews with ratings and status." },
];

export default function AdminDataPage() {
  const [csv, setCsv] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [backingUp, setBackingUp] = useState(false);

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runExport = async (type: "tools" | "users" | "subscribers" | "reviews") => {
    try {
      const text = await adminApi.exportCSV(type);
      download(text, `${type}.csv`, "text/csv");
      toast.success(`${type} exported`);
    } catch (err: any) {
      toast.error(err?.message || "Export failed");
    }
  };

  const runImport = async () => {
    if (!csv.trim()) {
      toast.error("Paste CSV content first");
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await adminApi.importToolsCSV(csv);
      setImportResult(res);
      toast.success(`Imported ${res.imported} tool${res.imported === 1 ? "" : "s"}`);
    } catch (err: any) {
      toast.error(err?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const runBackup = async () => {
    setBackingUp(true);
    try {
      const text = await adminApi.downloadBackup();
      download(text, `vaultoftools-backup-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
      toast.success("Backup downloaded");
    } catch (err: any) {
      toast.error(err?.message || "Backup failed");
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div>
      <PageHeader title="Data & Backup" description="CSV import/export and full JSON backups" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Export data" description="Download CSV snapshots of your collections">
          <div className="space-y-3">
            {EXPORTS.map((e) => (
              <div key={e.type} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{e.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{e.desc}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => runExport(e.type)}>
                  <Download size={13} /> Export
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Import tools (CSV)" description="Columns: name, slug, category, pricing, website, url, shortDescription, description, features (;), tags (;), featured, sponsored, status">
            <Field label="CSV content">
              <Textarea
                rows={8}
                placeholder={"name,slug,category,pricing,website,url,shortDescription,features,tags,featured,sponsored,status\nExample AI,example-ai,Writing,Free,https://example.com,https://example.com,Does things,feature1;feature2,tag1;tag2,true,false,published"}
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
              />
            </Field>
            <div className="mt-4">
              <Button onClick={runImport} disabled={importing}>
                <Upload size={14} /> {importing ? "Importing…" : "Import tools"}
              </Button>
            </div>
            {importResult && (
              <div className="mt-4 rounded-lg border border-border p-4 text-sm">
                <p className="font-medium text-foreground">Imported: {importResult.imported}</p>
                {importResult.errors.length > 0 && (
                  <ul className="mt-2 max-h-40 list-inside list-disc space-y-1 overflow-y-auto text-xs text-destructive">
                    {importResult.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>

          <Card title="Full backup" description="JSON dump of every collection (tools, users, reviews, categories, tags, posts, subscribers, submissions, consultations)">
            <Button variant="outline" onClick={runBackup} disabled={backingUp}>
              <FileJson size={14} /> {backingUp ? "Preparing…" : "Download full backup"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
