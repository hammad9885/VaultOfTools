/** Resolve real brand logos via curated local SVGs and official domains. */

export const STATIC_BRAND_LOGOS: Record<string, string> = {
  chatgpt: "/logos/chatgpt.svg",
  "chatgpt-4o": "/logos/chatgpt.svg",
  "chatgpt 4o": "/logos/chatgpt.svg",
  "chatgpt-4": "/logos/chatgpt.svg",
  "chatgpt 4": "/logos/chatgpt.svg",
  claude: "/logos/claude.svg",
  "claude 3.5 sonnet": "/logos/claude.svg",
  "claude 3.5": "/logos/claude.svg",
  "claude-3.5-sonnet": "/logos/claude.svg",
  "claude 3": "/logos/claude.svg",
  "claude 3 sonnet": "/logos/claude.svg",
  "claude 3 opus": "/logos/claude.svg",
  "claude 3 haiku": "/logos/claude.svg",
  gemini: "/logos/gemini.svg",
  "google gemini": "/logos/gemini.svg",
  perplexity: "/logos/perplexity.svg",
  cursor: "/logos/cursor.svg",
  "github copilot": "/logos/copilot.svg",
  copilot: "/logos/copilot.svg",
  notion: "/logos/notion.svg",
  "notion ai": "/logos/notion.svg",
};

const DOMAIN_BY_NAME: Record<string, string> = {
  chatgpt: "chatgpt.com",
  "chatgpt-4o": "chatgpt.com",
  "chatgpt 4o": "chatgpt.com",
  "dall·e 3": "openai.com",
  "dall-e 3": "openai.com",
  openai: "openai.com",
  claude: "claude.ai",
  "claude 3.5 sonnet": "claude.ai",
  "claude-3.5-sonnet": "claude.ai",
  "claude 3.5": "claude.ai",
  anthropic: "anthropic.com",
  midjourney: "midjourney.com",
  perplexity: "perplexity.ai",
  "google gemini": "gemini.google.com",
  gemini: "gemini.google.com",
  hubspot: "hubspot.com",
  "hubspot service hub": "hubspot.com",
  "hubspot sales hub": "hubspot.com",
  "hubspot marketing hub": "hubspot.com",
  "notion ai": "notion.so",
  notion: "notion.so",
  "github copilot": "github.com",
  github: "github.com",
  runway: "runwayml.com",
  elevenlabs: "elevenlabs.io",
  cursor: "cursor.com",
  "bolt.new": "bolt.new",
  sora: "openai.com",
  grok: "x.ai",
  mistral: "mistral.ai",
  "kling ai": "klingai.com",
  lovable: "lovable.dev",
  ideogram: "ideogram.ai",
  "pika labs": "pika.art",
  pika: "pika.art",
  "v0 by vercel": "v0.dev",
  v0: "v0.dev",
  windsurf: "codeium.com",
  "luma dream machine": "lumalabs.ai",
  supabase: "supabase.com",
  gamma: "gamma.app",
  jasper: "jasper.ai",
  "jasper ai": "jasper.ai",
  canva: "canva.com",
  "canva ai": "canva.com",
  figma: "figma.com",
  "figma ai": "figma.com",
  zapier: "zapier.com",
  "zapier ai": "zapier.com",
  make: "make.com",
  n8n: "n8n.io",
  retool: "retool.com",
  grammarly: "grammarly.com",
  "copy.ai": "copy.ai",
  copyai: "copy.ai",
  writesonic: "writesonic.com",
  "stable diffusion": "stability.ai",
  "adobe firefly": "adobe.com",
  adobe: "adobe.com",
  tensorflow: "tensorflow.org",
  pytorch: "pytorch.org",
  "hugging face": "huggingface.co",
  langchain: "langchain.com",
  "weights & biases": "wandb.ai",
  databricks: "databricks.com",
  "databricks ai": "databricks.com",
  "vertex ai": "cloud.google.com",
  sagemaker: "aws.amazon.com",
  zendesk: "zendesk.com",
  "zendesk ai": "zendesk.com",
  "intercom fin": "intercom.com",
  intercom: "intercom.com",
  "freshdesk freddy": "freshdesk.com",
  freshdesk: "freshdesk.com",
  "zoho desk zia": "zoho.com",
  zoho: "zoho.com",
  "tidio ai": "tidio.com",
  tidio: "tidio.com",
  "crisp ai": "crisp.chat",
  crisp: "crisp.chat",
  ada: "ada.cx",
  "salesforce einstein": "salesforce.com",
  salesforce: "salesforce.com",
  outreach: "outreach.io",
  gong: "gong.io",
  clari: "clari.com",
  lusha: "lusha.com",
  "apollo ai": "apollo.io",
  apollo: "apollo.io",
  zoominfo: "zoominfo.com",
  "people.ai": "people.ai",
  uipath: "uipath.com",
  "automation anywhere": "automationanywhere.com",
  asana: "asana.com",
  "asana intelligence": "asana.com",
  "monday ai": "monday.com",
  monday: "monday.com",
  "clickup ai": "clickup.com",
  clickup: "clickup.com",
  "quickbooks ai": "quickbooks.intuit.com",
  quickbooks: "quickbooks.intuit.com",
  "xero ai": "xero.com",
  xero: "xero.com",
  semrush: "semrush.com",
  "semrush ai": "semrush.com",
  "ahrefs ai": "ahrefs.com",
  ahrefs: "ahrefs.com",
  marketo: "marketo.com",
  "mailchimp ai": "mailchimp.com",
  mailchimp: "mailchimp.com",
  klaviyo: "klaviyo.com",
  "amazon codewhisperer": "aws.amazon.com",
  codewhisperer: "aws.amazon.com",
  codewhisper: "aws.amazon.com",
  "sourcegraph cody": "sourcegraph.com",
  sourcegraph: "sourcegraph.com",
  cody: "sourcegraph.com",
  "sentry ai": "sentry.io",
  sentry: "sentry.io",
  "datadog ai": "datadoghq.com",
  datadog: "datadoghq.com",
  "pagerduty ai": "pagerduty.com",
  pagerduty: "pagerduty.com",
  "new relic ai": "newrelic.com",
  "new relic": "newrelic.com",
  airflow: "airflow.apache.org",
  bubble: "bubble.io",
  "airtable ai": "airtable.com",
  airtable: "airtable.com",
  "linear ai": "linear.app",
  linear: "linear.app",
  deepl: "deepl.com",
  "deepl write": "deepl.com",
  forethought: "forethought.ai",
  rytr: "rytr.me",
  sudowrite: "sudowrite.com",
  "hemingway editor": "hemingwayapp.com",
  hemingway: "hemingwayapp.com",
  prowritingaid: "prowritingaid.com",
  tabnine: "tabnine.com",
  "replit ghostwriter": "replit.com",
  "replit ai": "replit.com",
  replit: "replit.com",
  codeium: "codeium.com",
  kubeflow: "kubeflow.org",
  datarobot: "datarobot.com",
  "leonardo ai": "leonardo.ai",
  leonardo: "leonardo.ai",
  descript: "descript.com",
  "flux studio": "blackforestlabs.ai",
  flux: "blackforestlabs.ai",
  motionflow: "runwayml.com",
  synthflow: "elevenlabs.io",
  "lumina script": "sudowrite.com",
  lumina: "sudowrite.com",
  insightlayer: "tableau.com",
  tableau: "tableau.com",
  stability: "stability.ai",
  "stability ai": "stability.ai",
};

/** Curated Simple Icons — only known-good brand SVGs. */
const SIMPLEICON_BY_NAME: Record<string, string> = {
  claude: "claude",
  "claude 3.5 sonnet": "claude",
  "claude-3.5-sonnet": "claude",
  "claude 3.5": "claude",
  anthropic: "anthropic",
  "github copilot": "github",
  github: "github",
  "notion ai": "notion",
  notion: "notion",
  "google gemini": "google",
  gemini: "google",
  "vertex ai": "googlecloud",
  canva: "canva",
  "canva ai": "canva",
  figma: "figma",
  "figma ai": "figma",
  zapier: "zapier",
  "zapier ai": "zapier",
  make: "make",
  grammarly: "grammarly",
  tensorflow: "tensorflow",
  pytorch: "pytorch",
  "hugging face": "huggingface",
  "salesforce einstein": "salesforce",
  salesforce: "salesforce",
  hubspot: "hubspot",
  "hubspot service hub": "hubspot",
  "hubspot sales hub": "hubspot",
  "hubspot marketing hub": "hubspot",
  zendesk: "zendesk",
  "zendesk ai": "zendesk",
  intercom: "intercom",
  "intercom fin": "intercom",
  asana: "asana",
  "asana intelligence": "asana",
  "monday ai": "mondaydotcom",
  monday: "mondaydotcom",
  clickup: "clickup",
  "clickup ai": "clickup",
  mailchimp: "mailchimp",
  "mailchimp ai": "mailchimp",
  klaviyo: "klaviyo",
  deepl: "deepl",
  "deepl write": "deepl",
  uipath: "uipath",
  xero: "xero",
  "xero ai": "xero",
  semrush: "semrush",
  "semrush ai": "semrush",
  ahrefs: "ahrefs",
  "ahrefs ai": "ahrefs",
  "adobe firefly": "adobe",
  sagemaker: "amazonaws",
  "amazon codewhisperer": "amazonaws",
  codewhisper: "amazonaws",
  databricks: "databricks",
  "databricks ai": "databricks",
  linear: "linear",
  "linear ai": "linear",
  airtable: "airtable",
  "airtable ai": "airtable",
  sentry: "sentry",
  "sentry ai": "sentry",
  datadog: "datadog",
  "datadog ai": "datadog",
  replit: "replit",
  "replit ai": "replit",
  "replit ghostwriter": "replit",
  n8n: "n8n",
  cursor: "cursor",
  midjourney: "midjourney",
  perplexity: "perplexity",
  runway: "runway",
  motionflow: "runway",
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Exact / prefix match only — avoids "make" matching "marketo". */
function lookupMap(name: string, map: Record<string, string>): string | null {
  const key = name.toLowerCase().trim();
  if (map[key]) return map[key];

  const ranked = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [k, value] of ranked) {
    if (key === k) return value;
    const re = new RegExp(`^${escapeRegExp(k)}([\\s·\\-_/]|$)`, "i");
    if (re.test(key)) return value;
  }
  return null;
}

export function extractHostname(url?: string | null): string | null {
  if (!url) return null;
  try {
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const host = new URL(href).hostname.replace(/^www\./i, "");
    if (!host || host === "localhost") return null;
    return host;
  } catch {
    return null;
  }
}

export function resolveToolDomain(name: string, website?: string | null): string | null {
  // Prefer curated brand domains so fake/demo websites don't win.
  return lookupMap(name, DOMAIN_BY_NAME) || extractHostname(website);
}

function isUsableLogoUrl(url?: string | null) {
  if (!url) return false;
  if (url.startsWith("data:") || url.startsWith("/") || url.startsWith("blob:")) return true;
  if (!/^https?:\/\//i.test(url)) return false;
  if (/simpleicons\.org/i.test(url)) return false;
  return true;
}

function faviconCandidates(domain: string): string[] {
  const d = encodeURIComponent(domain);
  return [
    `https://www.google.com/s2/favicons?domain=${d}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://icon.horse/icon/${domain}`,
  ];
}

export function getToolLogoCandidates(
  name: string,
  existing?: string | null,
  website?: string | null
): string[] {
  const out: string[] = [];

  // 1. Highest priority: Curated local high-res SVGs (zero network lag, 100% reliable)
  const staticSvg = lookupMap(name, STATIC_BRAND_LOGOS);
  if (staticSvg) {
    out.push(staticSvg);
  }

  const mappedDomain = lookupMap(name, DOMAIN_BY_NAME);
  const websiteDomain = extractHostname(website);
  const iconSlug = lookupMap(name, SIMPLEICON_BY_NAME);

  // 2. Real brand favicons (curated domain, then website)
  if (mappedDomain) {
    out.push(...faviconCandidates(mappedDomain));
  }
  if (websiteDomain && websiteDomain !== mappedDomain) {
    out.push(...faviconCandidates(websiteDomain));
  }

  // 3. Any existing usable asset (uploaded / local), skip broken Simple Icons
  if (isUsableLogoUrl(existing) && !/simpleicons\.org/i.test(existing || "")) {
    out.push(existing!);
  }

  // 4. Optional SVG brand mark when we know the Simple Icons slug exists
  if (iconSlug) {
    out.push(`https://cdn.simpleicons.org/${iconSlug}`);
  }

  return Array.from(new Set(out));
}

export function toolInitials(name: string) {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function toolAccent(name: string) {
  const hues = [239, 262, 200, 160, 320, 20, 45];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * (i + 1)) % 997;
  const hue = hues[hash % hues.length];
  return `hsl(${hue} 70% 48%)`;
}

export function withResolvedLogo<T extends { name: string; logo?: string; website?: string; url?: string }>(
  tool: T
): T {
  const candidates = getToolLogoCandidates(tool.name, tool.logo, tool.website || tool.url);
  return { ...tool, logo: candidates[0] || tool.logo };
}
