"use client";

export default function Home() {
  const categories = [
    {
      icon: "ti-writing",
      name: "Writing",
      count: "312 tools",
      color: "bg-violet-50 text-violet-600",
    },
    {
      icon: "ti-photo-ai",
      name: "Image Gen",
      count: "248 tools",
      color: "bg-pink-50 text-pink-600",
    },
    {
      icon: "ti-code",
      name: "Coding",
      count: "195 tools",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: "ti-video",
      name: "Video AI",
      count: "167 tools",
      color: "bg-red-50 text-red-600",
    },
    {
      icon: "ti-chart-bar",
      name: "Analytics",
      count: "143 tools",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: "ti-microphone",
      name: "Voice & Audio",
      count: "121 tools",
      color: "bg-teal-50 text-teal-600",
    },
    {
      icon: "ti-users",
      name: "Sales & CRM",
      count: "98 tools",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: "ti-gavel",
      name: "Legal AI",
      count: "74 tools",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: "ti-heart-rate-monitor",
      name: "Healthcare",
      count: "63 tools",
      color: "bg-rose-50 text-rose-600",
    },
    {
      icon: "ti-school",
      name: "Education",
      count: "118 tools",
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      icon: "ti-speakerphone",
      name: "Marketing",
      count: "204 tools",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: "ti-robot",
      name: "Agents & Auto",
      count: "89 tools",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const featuredTools = [
    {
      icon: "ti-message-chatbot",
      iconBg: "bg-emerald-100 text-emerald-600",
      name: "Claude",
      tagline: "AI assistant by Anthropic",
      desc: "Next-generation AI for complex reasoning, analysis, coding, and nuanced conversation.",
      tags: ["Chat", "Coding"],
      pricing: "Freemium",
      pricingClass: "bg-blue-50 text-blue-600 border border-blue-200",
      rating: 4.9,
      reviews: "2.1k",
      updated: "Updated today",
      sponsored: true,
      stars: 5,
    },
    {
      icon: "ti-brush",
      iconBg: "bg-blue-100 text-blue-600",
      name: "Midjourney",
      tagline: "AI image generation",
      desc: "Create stunning artwork from text prompts. Industry-leading quality for designers and creators.",
      tags: ["Images", "Design"],
      pricing: "Paid",
      pricingClass: "bg-purple-50 text-purple-600 border border-purple-200",
      rating: 4.7,
      reviews: "8.3k",
      updated: "Updated 2d ago",
      sponsored: false,
      stars: 4,
    },
    {
      icon: "ti-brand-vscode",
      iconBg: "bg-violet-100 text-violet-600",
      name: "Cursor AI",
      tagline: "AI-first code editor",
      desc: "The VS Code fork that understands your entire codebase. Ship 10x faster with AI pair programming.",
      tags: ["Coding", "IDE"],
      pricing: "Freemium",
      pricingClass: "bg-blue-50 text-blue-600 border border-blue-200",
      rating: 4.8,
      reviews: "5.7k",
      updated: "Updated today",
      sponsored: false,
      stars: 5,
    },
    {
      icon: "ti-search",
      iconBg: "bg-amber-100 text-amber-600",
      name: "Perplexity AI",
      tagline: "AI-powered search engine",
      desc: "Real-time AI search with citations. Research faster than ever with source-backed answers.",
      tags: ["Search", "Research"],
      pricing: "Free",
      pricingClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      rating: 4.6,
      reviews: "4.2k",
      updated: "Pricing updated",
      sponsored: false,
      stars: 4,
    },
  ];

  const trending = [
    {
      rank: 1,
      icon: "ti-message-chatbot",
      name: "Claude",
      change: "↑ 24%",
      bg: "bg-emerald-100 text-emerald-600",
      up: true,
    },
    {
      rank: 2,
      icon: "ti-brand-vscode",
      name: "Cursor AI",
      change: "↑ 18%",
      bg: "bg-blue-100 text-blue-600",
      up: true,
    },
    {
      rank: 3,
      icon: "ti-video",
      name: "Sora 2",
      change: "↑ 311%",
      bg: "bg-amber-100 text-amber-600",
      up: true,
    },
    {
      rank: 4,
      icon: "ti-writing",
      name: "Notion AI",
      change: "↑ 9%",
      bg: "bg-violet-100 text-violet-600",
      up: true,
    },
    {
      rank: 5,
      icon: "ti-microphone",
      name: "ElevenLabs",
      change: "↑ 15%",
      bg: "bg-rose-100 text-rose-600",
      up: true,
    },
    {
      rank: 6,
      icon: "ti-chart-bar",
      name: "Julius AI",
      change: "↑ 7%",
      bg: "bg-sky-100 text-sky-600",
      up: true,
    },
    {
      rank: 7,
      icon: "ti-photo-ai",
      name: "Adobe Firefly",
      change: "↓ 3%",
      bg: "bg-teal-100 text-teal-600",
      up: false,
    },
    {
      rank: 8,
      icon: "ti-users",
      name: "HubSpot AI",
      change: "↑ 12%",
      bg: "bg-yellow-100 text-yellow-600",
      up: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <section className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-white via-slate-50 to-slate-100 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-87.5 bg-linear-to-br from-emerald-200/50 via-teal-100/40 to-sky-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            3,200+ AI Tools Tracked in Real-time
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight max-w-2xl mx-auto mb-5">
            The <span className="text-emerald-600">Smartest Way</span> to{" "}
            <span className="text-slate-400">Discover AI Tools</span>
          </h1>
          <p className="text-slate-500 text-base max-w-md mx-auto mb-8 leading-relaxed font-light">
            Find, compare and track the best AI tools across every category.
            Updated daily with live pricing and alternatives.
          </p>
          <div className="flex items-center max-w-xl mx-auto mb-5 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-400 transition-all">
            <i
              className="ti ti-search text-slate-400 text-lg px-4"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Try: 'AI tools for legal research'..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 py-3.5 placeholder:text-slate-400"
            />
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2 m-1.5 rounded-lg transition-colors">
              Search
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[
              { icon: "ti-writing", label: "Writing" },
              { icon: "ti-photo-ai", label: "Image Gen" },
              { icon: "ti-code", label: "Coding" },
              { icon: "ti-video", label: "Video" },
              { icon: "ti-microphone", label: "Voice AI" },
              { icon: "ti-chart-bar", label: "Data" },
              { icon: "ti-users", label: "Sales" },
              { icon: "ti-gavel", label: "Legal" },
            ].map((t) => (
              <button
                key={t.label}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-full transition-all"
              >
                <i className={`ti ${t.icon} text-sm`} aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-8">
            {[
              { num: "3,247", lbl: "AI Tools" },
              { num: "89", lbl: "Categories" },
              { num: "Daily", lbl: "Updates" },
              { num: "Free", lbl: "Forever" },
            ].map((s, i) => (
              <div key={s.lbl} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-800">
                    {s.num}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.lbl}</div>
                </div>
                {i < 3 && <div className="w-px h-8 bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">
            Browse Categories
          </h2>
          <a
            href="#"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-600 transition-colors"
          >
            All 89 categories{" "}
            <i className="ti ti-arrow-right text-sm" aria-hidden="true" />
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col gap-2 p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.color.split(" ").slice(0, 1).join(" ")} shrink-0`}
              >
                <i
                  className={`ti ${cat.icon} text-lg ${cat.color.split(" ").slice(1).join(" ")}`}
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-semibold text-slate-700 leading-tight">
                {cat.name}
              </span>
              <span className="text-xs text-slate-400">{cat.count}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Featured Tools
              </h2>
              <a
                href="#"
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-600 transition-colors"
              >
                View all{" "}
                <i className="ti ti-arrow-right text-sm" aria-hidden="true" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuredTools.map((tool) => (
                <div
                  key={tool.name}
                  className="relative flex flex-col gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 overflow-hidden"
                >
                  {tool.sponsored && (
                    <span className="absolute top-3 right-3 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full tracking-wide">
                      Sponsored
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tool.iconBg}`}
                    >
                      <i
                        className={`ti ${tool.icon} text-2xl`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-800">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {tool.tagline}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {tool.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${tool.pricingClass}`}
                    >
                      {tool.pricing}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i
                          key={s}
                          className={`ti ti-star-filled text-xs ${s <= tool.stars ? "text-amber-400" : "text-slate-200"}`}
                          aria-hidden="true"
                        />
                      ))}
                      <span className="text-xs text-slate-400 ml-1.5">
                        {tool.rating} ({tool.reviews})
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {tool.updated}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i
                  className="ti ti-trending-up text-orange-500"
                  aria-hidden="true"
                />
                Trending
              </h2>
              <a
                href="#"
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-600 transition-colors"
              >
                More{" "}
                <i className="ti ti-arrow-right text-sm" aria-hidden="true" />
              </a>
            </div>
            <div className="flex flex-col gap-2">
              {trending.map((t) => (
                <div
                  key={t.rank}
                  className="flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm cursor-pointer transition-all"
                >
                  <span
                    className={`text-sm font-bold min-w-4.5 ${t.rank <= 2 ? "text-emerald-500" : "text-slate-300"}`}
                  >
                    {t.rank}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.bg}`}
                  >
                    <i
                      className={`ti ${t.icon} text-base`}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 flex-1">
                    {t.name}
                  </span>
                  <span
                    className={`text-xs font-medium ${t.up ? "text-emerald-500" : "text-red-400"}`}
                  >
                    {t.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="mx-6 mb-10">
        <div className="relative bg-white border border-slate-200 rounded-2xl px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-emerald-50/80 to-transparent pointer-events-none" />
          <div className="relative">
            <h3 className="text-xl font-bold text-slate-800 mb-1.5 flex items-center gap-2">
              <i
                className="ti ti-rocket text-emerald-500 text-xl"
                aria-hidden="true"
              />
              Built something amazing?
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Submit your AI tool to reach 180,000+ monthly visitors. Get listed
              in 24 hours. Free forever, or go sponsored for premium placement.
            </p>
          </div>
          <div className="relative flex gap-2.5 shrink-0">
            <button className="text-sm text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg transition-all">
              Learn more
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-lg transition-colors shadow-sm shadow-emerald-200">
              <i className="ti ti-send text-sm" aria-hidden="true" />
              Submit Your Tool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
