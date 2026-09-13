import { InfoPage } from "../components/ui/InfoPage";
import { Compass, Lightbulb, NotebookPen } from "lucide-react";

export default function GuidesPage() {
  return (
    <InfoPage
      eyebrow="AI Guides"
      title="Practical guides to help you use AI tools with confidence."
      description="From choosing the right tool to building smarter workflows, our guides break down AI use cases into simple, actionable steps for teams and individuals."
      highlights={[
        "Use-case driven learning",
        "Workflows for startups and teams",
        "Clear recommendations and examples",
      ]}
      features={[
        {
          title: "Beginner-friendly explanations",
          description: "Understand the basics, compare options, and learn where AI fits into your existing process.",
          icon: <NotebookPen className="h-5 w-5" />,
        },
        {
          title: "Actionable insights",
          description: "Each guide focuses on practical outcomes, helping you adopt tools in ways that improve speed and quality.",
          icon: <Lightbulb className="h-5 w-5" />,
        },
        {
          title: "Explore by workflow",
          description: "Discover guides organized around writing, research, coding, marketing, productivity, and more.",
          icon: <Compass className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "40+", label: "Guides" },
        { value: "12", label: "Categories" },
        { value: "Actionable", label: "Playbooks" },
        { value: "Fresh", label: "Updates" },
      ]}
      ctaLabel="Explore guides"
      ctaHref="/blog"
      secondaryCtaLabel="Discover tools"
      secondaryCtaHref="/discover"
    />
  );
}
