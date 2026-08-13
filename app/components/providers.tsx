"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "../lib/auth-context";
import { SavedToolsProvider } from "../lib/saved-tools-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SavedToolsProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </SavedToolsProvider>
    </AuthProvider>
  );
}
