import { InfoPage } from "../components/ui/InfoPage";
import { ArrowUpRight, Mail, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Let’s connect about tools, partnerships, and collaborations."
      description="Whether you're looking to submit a tool, discuss a partnership, or ask a platform question, we’d love to hear from you."
      highlights={[
        "Partnerships and collaborations",
        "Tool submissions and updates",
        "General questions and feedback",
      ]}
      features={[
        {
          title: "Email us",
          description: "Use the contact channel to send questions, suggestions, and partnership ideas to the VaultOfTools team.",
          icon: <Mail className="h-5 w-5" />,
        },
        {
          title: "Share a submission",
          description: "If you’re representing an AI product, you can submit it through our tool review flow for editorial consideration.",
          icon: <Send className="h-5 w-5" />,
        },
        {
          title: "Collaborate with us",
          description: "We’re open to partnerships, co-marketing, and meaningful collaborations with teams building in AI.",
          icon: <ArrowUpRight className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "Email", label: "Response" },
        { value: "Partnerships", label: "Open" },
        { value: "Fast", label: "Response" },
        { value: "Helpful", label: "Team" },
      ]}
      ctaLabel="Submit a tool"
      ctaHref="/submit"
      secondaryCtaLabel="Explore directory"
      secondaryCtaHref="/discover"
    />
  );
}
