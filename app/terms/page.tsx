import { InfoPage } from "../components/ui/InfoPage";
import { BookCheck, Scale, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms of Service"
      title="Terms for using VaultOfTools responsibly."
      description="These terms outline the basic rules for using the VaultOfTools website, tools, and related services. By using the platform, you agree to follow these terms and use the content responsibly."
      highlights={[
        "Clear usage expectations",
        "Respectful and lawful use",
        "Platform integrity and transparency",
      ]}
      features={[
        {
          title: "Use the platform responsibly",
          description: "We ask that users comply with applicable laws and respect the rights of others while using the site or its content.",
          icon: <Scale className="h-5 w-5" />,
        },
        {
          title: "Content and listings",
          description: "Listings, views, reviews, and resources provided on the platform are intended for informational and discovery purposes.",
          icon: <BookCheck className="h-5 w-5" />,
        },
        {
          title: "Platform integrity",
          description: "We reserve the right to review, update, or remove content that does not meet our standards or violates platform policies.",
          icon: <ShieldAlert className="h-5 w-5" />,
        },
      ]}
      stats={[
        { value: "Clear", label: "Terms" },
        { value: "Responsible", label: "Use" },
        { value: "Fair", label: "Policies" },
        { value: "Updated", label: "Regularly" },
      ]}
      ctaLabel="Start exploring"
      ctaHref="/discover"
      secondaryCtaLabel="Read privacy policy"
      secondaryCtaHref="/privacy"
    />
  );
}
