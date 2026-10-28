import mongoose from "mongoose";
import { connectDB, isDBConnected } from "../config/db";
import { isFirestore } from "../config/provider";
import { createFirestoreModel } from "../firestore/model";
import { AdminSettings } from "./types";

export interface ISettings extends mongoose.Document {
  key: string;
  general: {
    siteName: string;
    tagline: string;
    supportEmail: string;
    timezone: string;
    itemsPerPage: number;
    maintenanceMode: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImageUrl: string;
    canonicalUrl: string;
    robotsIndex: boolean;
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    accentColor: string;
  };
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    heroCtaLabel: string;
    heroCtaUrl: string;
    featuredCount: number;
    showNewsletter: boolean;
  };
  smtp: {
    host: string;
    port: number;
    username: string;
    password: string;
    fromName: string;
    fromEmail: string;
    secure: boolean;
  };
  social: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    github: string;
    youtube: string;
  };
  analytics: {
    googleAnalyticsId: string;
    googleTagManagerId: string;
    facebookPixelId: string;
    hotjarId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new mongoose.Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, default: "site" },
    general: {
      siteName: { type: String, default: "Vault of Tools" },
      tagline: { type: String, default: "Discover the best tools for your workflow" },
      supportEmail: { type: String, default: "vaultoftools@gmail.com" },
      timezone: { type: String, default: "UTC" },
      itemsPerPage: { type: Number, default: 12 },
      maintenanceMode: { type: Boolean, default: false },
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      metaKeywords: { type: String, default: "" },
      ogImageUrl: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
      robotsIndex: { type: Boolean, default: true },
    },
    branding: {
      logoUrl: { type: String, default: "" },
      faviconUrl: { type: String, default: "" },
      primaryColor: { type: String, default: "#6366f1" },
      accentColor: { type: String, default: "#8b5cf6" },
    },
    homepage: {
      heroTitle: { type: String, default: "Find the perfect tool for the job" },
      heroSubtitle: { type: String, default: "A curated directory of the tools professionals love." },
      heroCtaLabel: { type: String, default: "Explore Tools" },
      heroCtaUrl: { type: String, default: "/tools" },
      featuredCount: { type: Number, default: 8 },
      showNewsletter: { type: Boolean, default: true },
    },
    smtp: {
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      username: { type: String, default: "" },
      password: { type: String, default: "" },
      fromName: { type: String, default: "Vault of Tools" },
      fromEmail: { type: String, default: "vaultoftools@gmail.com" },
      secure: { type: Boolean, default: true },
    },
    social: {
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    analytics: {
      googleAnalyticsId: { type: String, default: "" },
      googleTagManagerId: { type: String, default: "" },
      facebookPixelId: { type: String, default: "" },
      hotjarId: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const MongoSettings =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", settingsSchema);

const FirestoreSettings = createFirestoreModel("settings", {
  preSave: async (data: any) => {
    if (!data.key) data.key = "site";
  },
});

const Settings = isFirestore() ? FirestoreSettings : MongoSettings;
export default Settings;

const DEFAULTS = {
  general: {
    siteName: "Vault of Tools",
    tagline: "Discover the best tools for your workflow",
    supportEmail: "vaultoftools@gmail.com",
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
  branding: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#6366f1",
    accentColor: "#8b5cf6",
  },
  homepage: {
    heroTitle: "Find the perfect tool for the job",
    heroSubtitle: "A curated directory of the tools professionals love.",
    heroCtaLabel: "Explore Tools",
    heroCtaUrl: "/tools",
    featuredCount: 8,
    showNewsletter: true,
  },
  smtp: {
    host: "",
    port: 587,
    username: "",
    password: "",
    fromName: "Vault of Tools",
    fromEmail: "vaultoftools@gmail.com",
    secure: true,
  },
  social: {
    twitter: "https://x.com/vaultoftools",
    facebook: "https://www.facebook.com/share/1Ecj2ytCKZ/",
    instagram: "https://www.instagram.com/vaultoftools?stkn=MWNxdzQ3NThudWZ5eA==",
    linkedin: "",
    github: "",
    youtube: "https://www.youtube.com/@VaultOfTools",
  },
  analytics: {
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    hotjarId: "",
  },
};

type SettingsPayload = AdminSettings & { smtp: any };

function memorySettings(): SettingsPayload {
  const g = globalThis as any;
  if (!g.__votAdminSettings) {
    g.__votAdminSettings = {
      general: { ...DEFAULTS.general },
      seo: { ...DEFAULTS.seo },
      branding: { ...DEFAULTS.branding },
      homepage: { ...DEFAULTS.homepage },
      smtp: { ...DEFAULTS.smtp },
      social: { ...DEFAULTS.social },
      analytics: { ...DEFAULTS.analytics },
    } as SettingsPayload;
  }
  return g.__votAdminSettings as SettingsPayload;
}

function shapeFromDoc(doc: any): SettingsPayload {
  return {
    general: { ...DEFAULTS.general, ...(doc?.general || {}) },
    seo: { ...DEFAULTS.seo, ...(doc?.seo || {}) },
    branding: { ...DEFAULTS.branding, ...(doc?.branding || {}) },
    homepage: { ...DEFAULTS.homepage, ...(doc?.homepage || {}) },
    smtp: { ...DEFAULTS.smtp, ...(doc?.smtp || {}) },
    social: { ...DEFAULTS.social, ...(doc?.social || {}) },
    analytics: { ...DEFAULTS.analytics, ...(doc?.analytics || {}) },
  };
}

function deepMergeGroup(current: any, patch: any) {
  if (!patch || typeof patch !== "object") return current;
  return { ...current, ...patch };
}

export async function getSettings(): Promise<SettingsPayload> {
  await connectDB();

  if (!isDBConnected()) {
    return { ...memorySettings() };
  }

  try {
    let doc = await Settings.findOne({ key: "site" });
    if (!doc) {
      doc = await Settings.create({ key: "site" });
    }
    const shaped = shapeFromDoc(doc);
    Object.assign(memorySettings(), shaped);
    return shaped;
  } catch (err: any) {
    console.warn("getSettings Mongo failed, using memory:", err?.message || err);
    return { ...memorySettings() };
  }
}

export function sanitizeSettingsForClient(settings: SettingsPayload): SettingsPayload {
  const safe: any = JSON.parse(JSON.stringify(settings));
  if (safe.smtp) {
    safe.smtp.smtpConfigured = Boolean(settings.smtp?.password);
    safe.smtp.password = ""; // Never expose SMTP password to client (VOT-SEC-008)
  }
  return safe;
}

export async function updateSettings(patch: Partial<AdminSettings> & { smtp?: any }): Promise<SettingsPayload> {
  await connectDB();

  // If smtp password is not supplied or empty, preserve existing password
  const currentSettings = await getSettings();
  if (patch.smtp && typeof patch.smtp === "object") {
    if (!patch.smtp.password && currentSettings.smtp?.password) {
      patch.smtp.password = currentSettings.smtp.password;
    }
  }

  const applyMemoryPatch = () => {
    const mem = memorySettings();
    for (const key of Object.keys(patch) as (keyof AdminSettings)[]) {
      if (patch[key] && typeof patch[key] === "object") {
        (mem as any)[key] = deepMergeGroup((mem as any)[key], patch[key]);
      }
    }
    return { ...mem };
  };

  if (!isDBConnected()) {
    return applyMemoryPatch();
  }

  try {
    const doc = await Settings.findOneAndUpdate(
      { key: "site" },
      { $set: patch },
      { new: true, upsert: true, runValidators: false }
    );
    const shaped = shapeFromDoc(doc);
    Object.assign(memorySettings(), shaped);
    return shaped;
  } catch (err: any) {
    console.warn("updateSettings Mongo failed, using memory:", err?.message || err);
    return applyMemoryPatch();
  }
}
