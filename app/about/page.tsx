import { InfoPage } from "../components/ui/InfoPage";
import { BookOpen, Sparkles, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="The trusted AI tools directory for builders, creators, and teams."
      description="VaultOfTools helps people discover, compare, and evaluate AI products with clarity. We curate tools for developers, marketers, founders, and everyday users who want practical recommendations backed by real-world use cases."
      highlights={[
        "Curated AI tool discovery",
        "Practical comparisons and reviews",
        "New tools and updates added regularly",
      ]}
      features={[
        {
          title: "Curated with intent",
          description: "We organize the AI ecosystem into clear categories so you can quickly find tools that match your workflow.",
          icon: <Sparkles className="h-5 w-5" />,
        },
        {
          title: "Built for real-world decisions",
          description: "Every recommendation is meant to help you compare options, reduce guesswork, and choose faster.",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Useful learning resources",
          description: "Beyond listings, we share guides, reviews, and editorial insights to keep you informed about the latest shifts in AI.",
          icon: <BookOpen className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "2.5k+", label: "AI Tools" },
        { value: "50k+", label: "Readership" },
        { value: "120+", label: "Categories" },
        { value: "Weekly", label: "Updates" },
      ]}
      ctaLabel="Explore the directory"
      ctaHref="/discover"
      secondaryCtaLabel="See blog"
      secondaryCtaHref="/blog"
    />
  );
}
