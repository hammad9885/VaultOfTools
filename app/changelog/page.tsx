import { InfoPage } from "../components/ui/InfoPage";
import { History, Rocket, Sparkles } from "lucide-react";

export default function ChangelogPage() {
  return (
    <InfoPage
      eyebrow="Changelog"
      title="See what’s new across VaultOfTools."
      description="Our changelog tracks updates across the platform, including new tools, improved discovery flows, editorial enhancements, and product improvements designed to make the experience better."
      highlights={[
        "Regular product updates",
        "Feature rollouts",
        "Platform and content improvements",
      ]}
      features={[
        {
          title: "Fresh platform improvements",
          description: "We continuously improve the product experience, from search and browsing to content quality and navigation.",
          icon: <Rocket className="h-5 w-5" />,
        },
        {
          title: "More tools and categories",
          description: "Our directory keeps expanding so users can discover and compare even more AI products across the ecosystem.",
          icon: <Sparkles className="h-5 w-5" />,
        },
        {
          title: "Change history",
          description: "The changelog gives users visibility into how the platform evolves over time and what improvements are most recent.",
          icon: <History className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "Weekly", label: "Updates" },
        { value: "Always", label: "Improving" },
        { value: "Fresh", label: "Features" },
        { value: "Visible", label: "Changes" },
      ]}
      ctaLabel="Explore tools"
      ctaHref="/discover"
      secondaryCtaLabel="Read blog"
      secondaryCtaHref="/blog"
    />
  );
}
