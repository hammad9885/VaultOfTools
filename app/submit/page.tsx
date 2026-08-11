"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SiteNav, SiteFooter } from "../routes/index";
import { api } from "../lib/api";
import { useAuth } from "../hooks/use-auth";

export default function SubmitPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to submit a tool");
      router.push("/login");
      return;
    }

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
      category: (form.elements.namedItem("category") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLInputElement).value,
      founderName: (form.elements.namedItem("founderName") as HTMLInputElement)?.value,
      companyName: (form.elements.namedItem("companyName") as HTMLInputElement)?.value,
      launchYear: (form.elements.namedItem("launchYear") as HTMLInputElement)?.value,
      pricing: (form.elements.namedItem("pricing") as HTMLInputElement)?.value,
      email: (form.elements.namedItem("email") as HTMLInputElement)?.value,
    };

    setBusy(true);
    try {
      await api.createSubmission(data);
      setDone(true);
      toast.success("Submission received!");
    } catch (err: any) {
      toast.error("Couldn't submit", {
        description: err.message,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Submit an AI tool
          </h1>
          <p className="mt-3 text-muted-foreground">
            We review every submission within 48 hours. Make sure the link goes
            live and screenshots are recent.
          </p>
        </header>

        {done ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-bold text-foreground">
              Thanks — we received your submission.
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              You hear back from our editorial team within 48 hours.
            </p>
            <button
              onClick={() => setDone(false)}
              className="mt-6 text-sm text-primary hover:underline"
            >
              Submit another
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-5"
          >
            <Field label="Tool name" name="name" placeholder="e.g. Flux Studio" required />
            <Field label="Website URL" name="website" placeholder="https://" type="url" required />
            <Field label="Category" name="category" placeholder="e.g. Image Generation" required />
            <Field label="Founder Name" name="founderName" placeholder="John Doe" />
            <Field label="Company Name" name="companyName" placeholder="Acme AI" />
            <Field label="Launch Year" name="launchYear" placeholder="2025" type="number" />
            <Field label="Pricing" name="pricing" placeholder="Free / Freemium / Paid" />
            <Field label="Your Email" name="email" placeholder="you@example.com" type="email" required />

            <div className="lg:col-span-2">
              <Field
                label="Short description"
                name="description"
                placeholder="What does it do?"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </form>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
      />
    </label>
  );
}
