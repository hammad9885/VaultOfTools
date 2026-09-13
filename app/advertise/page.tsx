import { InfoPage } from "../components/ui/InfoPage";
import { BadgeDollarSign, Megaphone, Sparkles } from "lucide-react";

export default function AdvertisePage() {
  return (
    <InfoPage
      eyebrow="Advertise"
      title="Reach a highly engaged audience of AI builders and decision-makers."
      description="VaultOfTools gives brands the opportunity to connect with audiences actively discovering AI products, comparing options, and looking for the next tool to adopt."
      highlights={[
        "High-intent AI audience",
        "Brand visibility in a trusted directory",
        "Flexible campaign opportunities",
      ]}
      features={[
        {
          title: "Audience fit",
          description: "Reach creators, founders, developers, marketers, and teams looking for AI tools and solutions across categories.",
          icon: <Sparkles className="h-5 w-5" />,
        },
        {
          title: "Brand visibility",
          description: "Promote your product or message in an environment designed for discovery, trust, and practical evaluation.",
          icon: <Megaphone className="h-5 w-5" />,
        },
        {
          title: "Flexible opportunities",
          description: "Whether you want visibility, sponsorship, or co-branded campaigns, the platform is built for meaningful exposure.",
          icon: <BadgeDollarSign className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "High intent", label: "Audience" },
        { value: "Brand-safe", label: "Placement" },
        { value: "Flexible", label: "Campaigns" },
        { value: "Trusted", label: "Environment" },
      ]}
      ctaLabel="Explore directory"
      ctaHref="/discover"
      secondaryCtaLabel="Contact us"
      secondaryCtaHref="/contact"
    />
  );
}
