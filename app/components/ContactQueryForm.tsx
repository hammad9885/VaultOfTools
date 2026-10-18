"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

const OFFICIAL_EMAIL = "vaultoftools@gmail.com";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

const labelClass = "text-sm font-semibold text-slate-900";

export function ContactQueryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim() || !message.trim()) {
      toast.error("Please provide your email and a message.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Unable to send your message right now.");
      }

      const { notifyAdminInbox } = await import("../lib/api");
      notifyAdminInbox(`New Contact Message from ${name.trim() || email.trim()}`, {
        event: "Contact Inquiry",
        name: name.trim() || "Anonymous User",
        email: email.trim(),
        subject: subject.trim() || "Website Inquiry",
        message: message.trim(),
      });

      toast.success("Message sent", {
        description: data?.message || `We will reply to you soon at ${OFFICIAL_EMAIL}.`,
      });

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error("Unable to send your message", {
        description: err instanceof Error ? err.message : "Please try again later.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[28px] border border-slate-200 bg-linear-to-br from-[#111827] via-[#1f2937] to-[#312e81] p-7 text-white shadow-xl sm:p-8">
          <h2 className="text-2xl font-black sm:text-3xl">Send us a query</h2>
          <p className="mt-3 text-sm leading-7 text-indigo-100">
            Every message is logged and delivered to our official inbox. Tool submissions,
            partnership requests, and platform questions all reach the same team.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-indigo-200">
                Official email
              </p>
              <a
                href={`mailto:${OFFICIAL_EMAIL}`}
                className="mt-1 block break-all text-base font-semibold text-white underline-offset-4 hover:underline"
              >
                {OFFICIAL_EMAIL}
              </a>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-indigo-100">
              Prefer to write directly? Use the address above or the button above — both reach
              the same inbox.
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className={`mt-1.5 ${inputClass}`}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Your email *</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                required
                className={`mt-1.5 ${inputClass}`}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className={labelClass}>Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tool submission, partnership, question…"
                className={`mt-1.5 ${inputClass}`}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className={labelClass}>Message *</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={4000}
                required
                placeholder="Tell us what you need…"
                className={`mt-1.5 resize-y ${inputClass}`}
              />
              <span className="mt-1 block text-xs text-slate-400">
                {message.length}/4000
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#4F46E5] to-[#7C3AED] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-px disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Send to {OFFICIAL_EMAIL}
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            Alerts for this message are routed to {OFFICIAL_EMAIL}.
          </p>
        </form>
      </div>
    </section>
  );
}