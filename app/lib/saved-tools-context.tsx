"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "./api";
import { useAuth } from "./auth-context";

export type SavableTool = {
  slug: string;
  name: string;
  desc?: string;
  logo?: string;
  category?: string;
  tags?: string[];
};

type SavedToolsContextValue = {
  savedSlugs: string[];
  isSaved: (slug: string) => boolean;
  isPending: (slug: string) => boolean;
  toggleSave: (tool: SavableTool) => Promise<void>;
};

const SavedToolsContext = createContext<SavedToolsContextValue>({
  savedSlugs: [],
  isSaved: () => false,
  isPending: () => false,
  toggleSave: async () => {},
});

export function SavedToolsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [pending, setPending] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setSavedSlugs([]);
      return;
    }
    let alive = true;
    api
      .getSavedTools()
      .then((data) => {
        if (alive) setSavedSlugs(data.slugs || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user]);

  const isSaved = useCallback(
    (slug: string) => savedSlugs.includes(slug),
    [savedSlugs]
  );

  const isPending = useCallback(
    (slug: string) => pending.includes(slug),
    [pending]
  );

  const toggleSave = useCallback(
    async (tool: SavableTool) => {
      if (!tool.slug) return;

      if (!user) {
        toast.error("Sign in to save tools", {
          description: "Your saved tools stay with your account.",
          action: { label: "Sign in", onClick: () => router.push("/login") },
        });
        return;
      }

      const wasSaved = savedSlugs.includes(tool.slug);
      setSavedSlugs((prev) =>
        wasSaved ? prev.filter((s) => s !== tool.slug) : [...prev, tool.slug]
      );
      setPending((prev) => [...prev, tool.slug]);

      try {
        const res = await api.toggleSavedTool(tool);
        setSavedSlugs((prev) => {
          const without = prev.filter((s) => s !== tool.slug);
          return res.saved ? [...without, tool.slug] : without;
        });
        toast.success(res.saved ? `Saved ${tool.name}` : `Removed ${tool.name}`, {
          action: res.saved
            ? { label: "View saved", onClick: () => router.push("/account/saved") }
            : undefined,
        });
      } catch (err) {
        setSavedSlugs((prev) =>
          wasSaved ? [...prev.filter((s) => s !== tool.slug), tool.slug] : prev.filter((s) => s !== tool.slug)
        );
        toast.error("Couldn't update saved tools", {
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setPending((prev) => prev.filter((s) => s !== tool.slug));
      }
    },
    [router, savedSlugs, user]
  );

  return (
    <SavedToolsContext.Provider
      value={{ savedSlugs, isSaved, isPending, toggleSave }}
    >
      {children}
    </SavedToolsContext.Provider>
  );
}

export function useSavedTools(): SavedToolsContextValue {
  return useContext(SavedToolsContext);
}
