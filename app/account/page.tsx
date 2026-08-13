"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import { api } from "../lib/api";
import Link from "next/link";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      try {
        const data = await api.getProfile();
        setDisplayName(data.user.displayName ?? "");
        setBio(data.user.bio ?? "");
        setWebsite(data.user.website ?? "");
        setLocation(data.user.location ?? "");
        setCompany(data.user.company ?? "");
      } catch {
        toast.error("Could not load profile");
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await api.updateProfile({
        displayName: displayName.trim().slice(0, 80),
        bio: bio.trim().slice(0, 500),
        website: website.trim().slice(0, 200),
        location: location.trim().slice(0, 100),
        company: company.trim().slice(0, 100),
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Couldn't save", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  const showProfile = pathname === "/account";

  return (
    <div className="bg-background font-sans text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your account</h1>

        <nav className="mt-6 flex gap-4 overflow-x-auto border-b border-border text-sm font-medium sm:gap-6">
          <Link
            href="/account"
            className={`pb-3 -mb-px shrink-0 border-b-2 transition-colors ${
              showProfile
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Profile
          </Link>
          <Link
            href="/account/saved"
            className="pb-3 -mb-px shrink-0 border-b-2 border-transparent text-muted-foreground transition-colors hover:text-foreground"
          >
            Saved tools
          </Link>
          <Link
            href="/account/submissions"
            className={`pb-3 -mb-px shrink-0 border-b-2 transition-colors ${
              !showProfile
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My submissions
          </Link>
        </nav>

        <div className="mt-8">
          {profileLoading ? (
            <p className="text-sm text-muted-foreground">Loading profile…</p>
          ) : (
            <form
              onSubmit={save}
              className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6"
            >
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  value={user.email ?? ""}
                  disabled
                  className="mt-1.5 w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Display name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={80}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Company</span>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. Acme Inc."
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Website</span>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  maxLength={200}
                  placeholder="https://example.com"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Location</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. San Francisco, CA"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </label>

              <div className="flex gap-3">
                <button
                  disabled={saving}
                  className="w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
