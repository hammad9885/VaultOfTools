import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In / Register | Vault of Tools",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
