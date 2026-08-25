/** Resolve real brand logos. Avoid guessed *.com hosts and Simple Icons 404s. */

const DOMAIN_BY_NAME: Record<string, string> = {
  chatgpt: "chatgpt.com",
  "dall·e 3": "openai.com",
  "dall-e 3": "openai.com",
  openai: "openai.com",
  claude: "anthropic.com",
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
  "sourcegraph cody": "sourcegraph.com",
  "sentry ai": "sentry.io",
  sentry: "sentry.io",
  "datadog ai": "datadoghq.com",
  datadog: "datadoghq.com",
  "pagerduty ai": "pagerduty.com",
  "new relic ai": "newrelic.com",
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
  prowritingaid: "prowritingaid.com",
  tabnine: "tabnine.com",
  "replit ghostwriter": "replit.com",
  replit: "replit.com",
  codeium: "codeium.com",
  kubeflow: "kubeflow.org",
  datarobot: "datarobot.com",
};

/** Simple Icons slugs that actually exist (wrong slugs 404). */
const SIMPLEICON_BY_NAME: Record<string, string> = {
  chatgpt: "openai",
  openai: "openai",
  "dall·e 3": "openai",
  "dall-e 3": "openai",
  sora: "openai",
  claude: "anthropic",
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
  "replit ghostwriter": "replit",
  n8n: "n8n",
  cursor: "cursor",
};

function lookupMap(name: string, map: Record<string, string>): string | null {
  const key = name.toLowerCase().trim();
  if (map[key]) return map[key];
  const ranked = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [k, value] of ranked) {
    if (key === k || key.includes(k)) return value;
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
  return extractHostname(website) || lookupMap(name, DOMAIN_BY_NAME);
}

function isUsableLogoUrl(url?: string | null) {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  if (/simpleicons\.org/i.test(url)) return false;
  if (url.startsWith("data:")) return true;
  return true;
}

export function getToolLogoCandidates(
  name: string,
  existing?: string | null,
  website?: string | null
): string[] {
  const out: string[] = [];
  const domain = resolveToolDomain(name, website);
  const iconSlug = lookupMap(name, SIMPLEICON_BY_NAME);

  if (isUsableLogoUrl(existing)) out.push(existing!);

  if (iconSlug) {
    out.push(`https://cdn.simpleicons.org/${iconSlug}`);
  }

  if (domain) {
    out.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);
    out.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
    out.push(`https://logo.clearbit.com/${domain}`);
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
