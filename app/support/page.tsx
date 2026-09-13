import { InfoPage } from "../components/ui/InfoPage";
import { Headphones, MessageCircle, ShieldCheck } from "lucide-react";

export default function SupportPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Need help with VaultOfTools or a submission?"
      description="Our support page is designed to help you find answers quickly, whether you need help with a tool listing, a partnership inquiry, or general platform questions."
      highlights={[
        "Submission help",
        "Editorial and partnership inquiries",
        "Platform guidance",
      ]}
      features={[
        {
          title: "Submit or update a listing",
          description: "If you’re a tool founder or team, you can use the submission flow to share your product for review.",
          icon: <MessageCircle className="h-5 w-5" />,
        },
        {
          title: "Contact the team",
          description: "Reach out for questions about listings, partnerships, collaboration opportunities, or general support.",
          icon: <Headphones className="h-5 w-5" />,
        },
        {
          title: "Safe and transparent",
          description: "We make sure submissions and platform communications follow a clear, respectful process.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "48 hrs", label: "Response goal" },
        { value: "24/7", label: "Platform access" },
        { value: "1", label: "Clear process" },
        { value: "Supportive", label: "Editorial team" },
      ]}
      ctaLabel="Submit a tool"
      ctaHref="/submit"
      secondaryCtaLabel="Contact us"
      secondaryCtaHref="/contact"
    />
  );
}
