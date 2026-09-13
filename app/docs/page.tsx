import { InfoPage } from "../components/ui/InfoPage";
import { BookText, Code2, Database } from "lucide-react";

export default function DocsPage() {
  return (
    <InfoPage
      eyebrow="API Docs"
      title="Developer-friendly API documentation for integrations and automation."
      description="VaultOfTools API Docs help developers understand the platform’s public data structure, discover core endpoints, and build integrations with clarity and confidence."
      highlights={[
        "Clean endpoint reference",
        "Structured data access",
        "Useful integration patterns",
      ]}
      features={[
        {
          title: "Explore endpoints",
          description: "Understand how tools, categories, reviews, submissions, and blog content are organized for programmatic access.",
          icon: <Code2 className="h-5 w-5" />,
        },
        {
          title: "Integration-ready structure",
          description: "Use consistent data formats and predictable patterns to build dashboards, feeds, internal tools, and AI workflows.",
          icon: <Database className="h-5 w-5" />,
        },
        {
          title: "Developer reference",
          description: "This documentation is designed to help engineers move quickly, test confidently, and connect systems more effectively.",
          icon: <BookText className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "REST", label: "API style" },
        { value: "JSON", label: "Responses" },
        { value: "Guided", label: "Examples" },
        { value: "Reliable", label: "Access" },
      ]}
      ctaLabel="Browse tools"
      ctaHref="/discover"
      secondaryCtaLabel="Read blog"
      secondaryCtaHref="/blog"
    />
  );
}
