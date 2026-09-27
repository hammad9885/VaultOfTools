"use client";

import { useEffect, useState } from "react";
import { toast } from "../../lib/admin/notify";
import { adminApi } from "../../lib/admin/api";
import { AdminSettings } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { Button, Field, Input, Spinner, Textarea } from "../../components/admin/ui";
import { cn } from "../../lib/utils";

type SettingsState = AdminSettings & { smtp: any };

const TABS = [
  { id: "general", label: "General" },
  { id: "seo", label: "SEO" },
  { id: "branding", label: "Branding" },
  { id: "homepage", label: "Homepage" },
  { id: "social", label: "Social" },
  { id: "analytics", label: "Analytics" },
] as const;

const DEFAULTS: SettingsState = {
  general: {
    siteName: "Vault of Tools",
    tagline: "Discover the best tools for your workflow",
    supportEmail: "support@vaultoftools.com",
    timezone: "UTC",
    itemsPerPage: 12,
    maintenanceMode: false,
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImageUrl: "",
    canonicalUrl: "",
    robotsIndex: true,
  },
  branding: { logoUrl: "", faviconUrl: "", primaryColor: "#6366f1", accentColor: "#8b5cf6" },
  homepage: {
    heroTitle: "Find the perfect tool for the job",
    heroSubtitle: "A curated directory of the tools professionals love.",
    heroCtaLabel: "Explore Tools",
    heroCtaUrl: "/tools",
    featuredCount: 8,
    showNewsletter: true,
  },
  smtp: {
    host: "", port: 587, username: "", password: "", fromName: "Vault of Tools", fromEmail: "no-reply@vaultoftools.com", secure: true,
  },
  social: { twitter: "", facebook: "", instagram: "", linkedin: "", github: "", youtube: "" },
  analytics: { googleAnalyticsId: "", googleTagManagerId: "", facebookPixelId: "", hotjarId: "" },
};

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("general");
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getSettings()
      .then(setSettings)
      .catch((err) => toast.error(err?.message || "Failed to load settings"));
  }, []);

  const setGroup = (group: keyof SettingsState, patch: Record<string, any>) => {
    setSettings((s) => (s ? { ...s, [group]: { ...(s[group] as any), ...patch } } : s));
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const groups: (keyof SettingsState)[] = ["general", "seo", "branding", "homepage", "smtp", "social", "analytics"];
      const patch: Partial<SettingsState> = {};
      for (const g of groups) patch[g] = settings[g];
      await adminApi.updateSettings(patch);
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const s = settings || DEFAULTS;

  const field = (group: keyof SettingsState, key: string, value: any) => ({
    value,
    onChange: (e: any) => {
      const next = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setGroup(group, { [key]: next });
    },
  });

  const tabContent = (() => {
    switch (tab) {
      case "general":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Site name"><Input value={s.general.siteName} onChange={field("general", "siteName", s.general.siteName).onChange} /></Field>
            <Field label="Tagline"><Input value={s.general.tagline} onChange={field("general", "tagline", s.general.tagline).onChange} /></Field>
            <Field label="Support email"><Input type="email" value={s.general.supportEmail} onChange={field("general", "supportEmail", s.general.supportEmail).onChange} /></Field>
            <Field label="Timezone"><Input value={s.general.timezone} onChange={field("general", "timezone", s.general.timezone).onChange} /></Field>
            <Field label="Items per page"><Input type="number" value={s.general.itemsPerPage} onChange={field("general", "itemsPerPage", s.general.itemsPerPage).onChange} /></Field>
            <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
              <input type="checkbox" checked={s.general.maintenanceMode} onChange={field("general", "maintenanceMode", s.general.maintenanceMode).onChange} />
              Enable maintenance mode
            </label>
          </div>
        );
      case "seo":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meta title" hint="Default page title shown in search results"><Input value={s.seo.metaTitle} onChange={field("seo", "metaTitle", s.seo.metaTitle).onChange} /></Field>
            <Field label="Meta description"><Textarea rows={2} value={s.seo.metaDescription} onChange={field("seo", "metaDescription", s.seo.metaDescription).onChange} /></Field>
            <Field label="Meta keywords"><Input value={s.seo.metaKeywords} onChange={field("seo", "metaKeywords", s.seo.metaKeywords).onChange} /></Field>
            <Field label="OG image URL"><Input value={s.seo.ogImageUrl} onChange={field("seo", "ogImageUrl", s.seo.ogImageUrl).onChange} /></Field>
            <Field label="Canonical URL"><Input value={s.seo.canonicalUrl} onChange={field("seo", "canonicalUrl", s.seo.canonicalUrl).onChange} /></Field>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={s.seo.robotsIndex} onChange={field("seo", "robotsIndex", s.seo.robotsIndex).onChange} />
              Allow search engines to index
            </label>
          </div>
        );
      case "branding":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo URL"><Input value={s.branding.logoUrl} onChange={field("branding", "logoUrl", s.branding.logoUrl).onChange} /></Field>
            <Field label="Favicon URL"><Input value={s.branding.faviconUrl} onChange={field("branding", "faviconUrl", s.branding.faviconUrl).onChange} /></Field>
            <Field label="Primary color"><Input type="color" className="h-9 w-full p-1" value={s.branding.primaryColor} onChange={field("branding", "primaryColor", s.branding.primaryColor).onChange} /></Field>
            <Field label="Accent color"><Input type="color" className="h-9 w-full p-1" value={s.branding.accentColor} onChange={field("branding", "accentColor", s.branding.accentColor).onChange} /></Field>
          </div>
        );
      case "homepage":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero title"><Input value={s.homepage.heroTitle} onChange={field("homepage", "heroTitle", s.homepage.heroTitle).onChange} /></Field>
            <Field label="Hero subtitle"><Textarea rows={2} value={s.homepage.heroSubtitle} onChange={field("homepage", "heroSubtitle", s.homepage.heroSubtitle).onChange} /></Field>
            <Field label="CTA label"><Input value={s.homepage.heroCtaLabel} onChange={field("homepage", "heroCtaLabel", s.homepage.heroCtaLabel).onChange} /></Field>
            <Field label="CTA URL"><Input value={s.homepage.heroCtaUrl} onChange={field("homepage", "heroCtaUrl", s.homepage.heroCtaUrl).onChange} /></Field>
            <Field label="Featured tools shown"><Input type="number" value={s.homepage.featuredCount} onChange={field("homepage", "featuredCount", s.homepage.featuredCount).onChange} /></Field>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={s.homepage.showNewsletter} onChange={field("homepage", "showNewsletter", s.homepage.showNewsletter).onChange} />
              Show newsletter signup on homepage
            </label>
          </div>
        );
      case "social":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {(["twitter", "facebook", "instagram", "linkedin", "github", "youtube"] as const).map((k) => (
              <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                <Input value={s.social[k]} onChange={field("social", k, s.social[k]).onChange} />
              </Field>
            ))}
          </div>
        );
      case "analytics":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Google Analytics ID"><Input value={s.analytics.googleAnalyticsId} onChange={field("analytics", "googleAnalyticsId", s.analytics.googleAnalyticsId).onChange} /></Field>
            <Field label="Google Tag Manager ID"><Input value={s.analytics.googleTagManagerId} onChange={field("analytics", "googleTagManagerId", s.analytics.googleTagManagerId).onChange} /></Field>
            <Field label="Facebook Pixel ID"><Input value={s.analytics.facebookPixelId} onChange={field("analytics", "facebookPixelId", s.analytics.facebookPixelId).onChange} /></Field>
            <Field label="Hotjar ID"><Input value={s.analytics.hotjarId} onChange={field("analytics", "hotjarId", s.analytics.hotjarId).onChange} /></Field>
          </div>
        );
    }
    return null;
  })();

  return (
    <div>
      <PageHeader
        title="Settings & SEO"
        description="Site-wide configuration — shared with the public site"
        actions={
          <Button onClick={save} disabled={saving || !settings}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      {!settings ? (
        <Spinner />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex gap-1 overflow-x-auto overscroll-x-contain border-b border-border px-3 pt-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition",
                  tab === t.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-6">{tabContent}</div>
        </div>
      )}
    </div>
  );
}
