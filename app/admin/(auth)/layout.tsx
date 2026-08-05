"use client";

import { Toaster } from "sonner";

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-right" richColors />
      {children}
    </>
  );
}
