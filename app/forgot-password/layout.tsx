import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Vault of Tools",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
