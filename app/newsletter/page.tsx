import { InfoPage } from "../components/ui/InfoPage";
import { Mail, TrendingUp, Zap } from "lucide-react";

export default function NewsletterPage() {
  return (
    <InfoPage
      eyebrow="Newsletter"
      title="Get weekly AI tools, trends, and launches in your inbox."
      description="Join VaultOfTools readers for a concise weekly update featuring the best new AI tools, product launches, trends worth watching, and practical productivity ideas."
      highlights={[
        "Weekly curated AI updates",
        "Handpicked tool launches",
        "Actionable trends and workflows",
      ]}
      features={[
        {
          title: "What you'll receive",
          description: "A practical roundup of standout tools, product releases, and categories that are gaining momentum across the AI landscape.",
          icon: <Mail className="h-5 w-5" />,
        },
        {
          title: "Curated for relevance",
          description: "We focus on updates that matter—new AI capabilities, pricing shifts, and workflows that save real time.",
          icon: <TrendingUp className="h-5 w-5" />,
        },
        {
          title: "Useful, not noisy",
          description: "Our digest is designed to be informative and easy to scan, so you can stay current without the clutter.",
          icon: <Zap className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "Weekly", label: "Digest" },
        { value: "2.5k+", label: "Subscribers" },
        { value: "1 click", label: "Easy signup" },
        { value: "No spam", label: "Only useful updates" },
      ]}
      ctaLabel="Browse tools"
      ctaHref="/discover"
      secondaryCtaLabel="Read blog"
      secondaryCtaHref="/blog"
    />
  );
}
