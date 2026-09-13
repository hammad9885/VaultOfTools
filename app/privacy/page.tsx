import { InfoPage } from "../components/ui/InfoPage";
import { FileText, ShieldCheck, Sparkles } from "lucide-react";

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy Policy"
      title="Your privacy matters to us."
      description="This privacy policy explains how VaultOfTools handles information collected through the website, including submissions, account activity, analytics, and communications."
      highlights={[
        "Transparent data practices",
        "Protection of user information",
        "Clear privacy commitments",
      ]}
      features={[
        {
          title: "What we collect",
          description: "We may collect information you provide when submitting a tool, creating an account, subscribing, or contacting the team.",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "How we use it",
          description: "Collected information helps us operate the platform, improve content and recommendations, and support users effectively.",
          icon: <Sparkles className="h-5 w-5" />,
        },
        {
          title: "How we protect it",
          description: "We use reasonable safeguards and privacy-conscious practices to protect personal information and reduce misuse.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "Transparent", label: "Data use" },
        { value: "Secure", label: "Practices" },
        { value: "Minimized", label: "Collection" },
        { value: "User-first", label: "Approach" },
      ]}
      ctaLabel="Back to home"
      ctaHref="/"
      secondaryCtaLabel="Explore tools"
      secondaryCtaHref="/discover"
    />
  );
}
