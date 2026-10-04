import { InfoPage } from "../components/ui/InfoPage";
import { ContactQueryForm } from "../components/ContactQueryForm";
import { ArrowUpRight, Mail, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact & Inquiries"
      title="Let’s connect about tools, partnerships, and collaborations."
      description="Whether you're looking to submit a tool, discuss a partnership, or ask a platform question, reach our team directly at vaultoftools@gmail.com."
      highlights={[
        "Official: vaultoftools@gmail.com",
        "Partnerships & collaborations",
        "Fast response within 24 hours",
      ]}
      features={[
        {
          title: "Official Email",
          description: "Reach our core team directly at vaultoftools@gmail.com for partnerships, platform queries, and editorial updates.",
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
        { value: "vaultoftools@gmail.com", label: "Official Email" },
        { value: "< 24h", label: "Response Time" },
        { value: "Open", label: "Partnerships" },
        { value: "Helpful", label: "Support Team" },
      ]}
      ctaLabel="Email Us Directly"
      ctaHref="mailto:vaultoftools@gmail.com"
      secondaryCtaLabel="Explore directory"
      secondaryCtaHref="/discover"
    >
      <ContactQueryForm />
    </InfoPage>
  );
}
