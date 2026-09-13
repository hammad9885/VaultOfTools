import { InfoPage } from "../components/ui/InfoPage";
import { Cookie, ShieldCheck, Sparkles } from "lucide-react";

export default function CookiesPage() {
  return (
    <InfoPage
      eyebrow="Cookie Policy"
      title="How VaultOfTools uses cookies and similar technologies."
      description="This cookie policy explains how we use cookies, analytics tools, and similar technologies to improve site performance, understand usage, and provide a smoother experience."
      highlights={[
        "Transparent cookie usage",
        "Better site experience",
        "User control and clarity",
      ]}
      features={[
        {
          title: "What cookies do",
          description: "Cookies help us remember preferences, support basic site functionality, and understand how visitors use the platform.",
          icon: <Cookie className="h-5 w-5" />,
        },
        {
          title: "Analytics and performance",
          description: "We may use analytics cookies to measure traffic, understand content performance, and improve the site over time.",
          icon: <Sparkles className="h-5 w-5" />,
        },
        {
          title: "Your control",
          description: "You can control or disable cookies through browser settings, although some parts of the site may not function optimally without them.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "Session", label: "Cookies" },
        { value: "Analytics", label: "Insights" },
        { value: "User choice", label: "Controls" },
        { value: "Privacy-first", label: "Approach" },
      ]}
      ctaLabel="Browse tools"
      ctaHref="/discover"
      secondaryCtaLabel="Terms of service"
      secondaryCtaHref="/terms"
    />
  );
}
