/** Resolve reliable logo URLs for AI tools (simpleicons often 404). */

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
  "zoho desk zia": "zoho.com",
  "tidio ai": "tidio.com",
  "crisp ai": "crisp.chat",
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
  "prowritingaid": "prowritingaid.com",
  "tabnine": "tabnine.com",
  "replit ghostwriter": "replit.com",
  replit: "replit.com",
  "codeium": "codeium.com",
};

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

export function resolveToolDomain(name: string): string | null {
  const key = name.toLowerCase().trim();
  if (DOMAIN_BY_NAME[key]) return DOMAIN_BY_NAME[key];
  // fuzzy contains match
  for (const [k, domain] of Object.entries(DOMAIN_BY_NAME)) {
    if (key.includes(k) || k.includes(key)) return domain;
  }
  // last resort: treat cleaned name as hostname guess (often fails → initials)
  const slug = slugifyName(name);
  return slug ? `${slug}.com` : null;
}

export function getToolLogoCandidates(name: string, existing?: string | null): string[] {
  const out: string[] = [];
  const domain = resolveToolDomain(name);

  if (existing && /^https?:\/\//i.test(existing) && !existing.includes("simpleicons.org")) {
    out.push(existing);
  }

  if (domain) {
    out.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);
    out.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }

  if (existing && existing.includes("simpleicons.org")) {
    out.push(existing);
  }

  // deterministic colored avatar as last network attempt before initials
  out.push(
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366F1&color=fff&size=128&bold=true`
  );

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

export function withResolvedLogo<T extends { name: string; logo?: string }>(tool: T): T {
  const candidates = getToolLogoCandidates(tool.name, tool.logo);
  return { ...tool, logo: candidates[0] || tool.logo };
}
