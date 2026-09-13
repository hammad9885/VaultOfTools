import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { SiteFooter, SiteNav } from "../../routes/index";

type Feature = {
  title: string;
  description: string;
  icon?: ReactNode;
};

type Stat = {
  value: string;
  label: string;
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  features: Feature[];
  stats?: Stat[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

export function InfoPage({
  eyebrow,
  title,
  description,
  highlights,
  features,
  stats,
  ctaLabel = "Explore Tools",
  ctaHref = "/discover",
  secondaryCtaLabel,
  secondaryCtaHref,
}: InfoPageProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      <SiteNav />

      <main className="overflow-x-hidden">
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_35%)]" />
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-size-[44px_44px]" />

          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 shadow-sm backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  {eyebrow}
                </span>

                <h1 className="mt-5 max-w-xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  {title}
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  {description}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={ctaHref}
                    className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#4F46E5] to-[#7C3AED] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-px"
                  >
                    {ctaLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>

                  {secondaryCtaLabel && secondaryCtaHref && (
                    <Link
                      href={secondaryCtaHref}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                      {secondaryCtaLabel}
                    </Link>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {highlights.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-600 shadow-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                  <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-violet-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                          VaultOfTools
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-slate-900">
                          Curated for smarter decisions
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-[#4F46E5] to-[#8B5CF6] text-lg font-black text-white">
                        V
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {stats && stats.length > 0 ? (
                        stats.map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="text-2xl font-black text-slate-950">{stat.value}</div>
                            <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                              {stat.label}
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-2xl font-black text-slate-950">2.5k+</div>
                            <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                              AI tools
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-2xl font-black text-slate-950">50k+</div>
                            <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                              readers
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-5 space-y-3">
                      {features.slice(0, 3).map((feature) => (
                        <div
                          key={feature.title}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                            {feature.icon ?? <Sparkles className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{feature.title}</div>
                            <div className="mt-1 text-sm leading-6 text-slate-600">
                              {feature.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-violet-100 text-indigo-600">
                  {feature.icon ?? <Sparkles className="h-5 w-5" />}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="rounded-[28px] border border-slate-200 bg-linear-to-r from-[#111827] via-[#1f2937] to-[#312e81] p-8 text-white shadow-xl sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
                  Ready to explore?
                </p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  Discover tools and insights that move your work forward.
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  {ctaLabel}
                </Link>

                {secondaryCtaLabel && secondaryCtaHref && (
                  <Link
                    href={secondaryCtaHref}
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {secondaryCtaLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
