import type { ReactNode } from "react";
import { SiteFooter, SiteNav } from "../routes";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f5] text-[#1a1a1a] antialiased">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
