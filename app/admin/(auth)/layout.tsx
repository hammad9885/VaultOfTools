"use client";

import { Toaster } from "sonner";
import { useEffect, useState } from "react";

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <Toaster position="top-right" richColors />
      {mounted ? (
        children
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      )}
    </>
  );
}