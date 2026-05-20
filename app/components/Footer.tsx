"use client";

function Footer() {
  const explore = [
    { label: "All Categories" },
    { label: "New Tools" },
    { label: "Trending", isNew: true },
    { label: "Top Rated" },
    { label: "Free Tools" },
    { label: "Compare Tools" },
  ];

  const resources = [
    { label: "Blog" },
    { label: "Newsletter" },
    { label: "AI Guides" },
    { label: "API Docs" },
    { label: "Changelog" },
  ];

  const company = [
    { label: "About Us" },
    { label: "Submit Tool" },
    { label: "Advertise" },
    { label: "Contact" },
    { label: "Privacy" },
    { label: "Terms" },
  ];

  const socials = [
    { icon: "ti-brand-twitter" },
    { icon: "ti-brand-linkedin" },
    { icon: "ti-brand-github" },
    { icon: "ti-rss" },
  ];

  return (
    <footer className="bg-white border-t border-slate-200 px-8 pt-12 pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
        <div>
          <div
            className="text-[17px] font-bold text-slate-800 mb-2.5 flex items-center gap-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
              <i className="ti ti-shield-bolt text-white text-sm" aria-hidden="true" />
            </div>
            VaultOfTools
          </div>
          <p className="text-[13px] text-slate-500 leading-relaxed max-w-60">
            The most comprehensive, real-time AI tool directory. Trusted by developers, founders, and makers worldwide.
          </p>
          <div className="flex gap-2 mt-4">
            {socials.map((s) => (
              <button
                key={s.icon}
                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <i className={`ti ${s.icon} text-[15px]`} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4
            className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Explore
          </h4>
          <ul className="flex flex-col gap-2 list-none">
            {explore.map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 no-underline transition-colors"
                >
                  {item.label}
                  {item.isNew && (
                    <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      new
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4
            className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Resources
          </h4>
          <ul className="flex flex-col gap-2 list-none">
            {resources.map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className="text-[13px] text-slate-500 hover:text-slate-900 no-underline transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4
            className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Company
          </h4>
          <ul className="flex flex-col gap-2 list-none">
            {company.map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className="text-[13px] text-slate-500 hover:text-slate-900 no-underline transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-slate-200">
        <p className="text-[12.5px] text-slate-400">
          © 2026{" "}
          <span className="text-emerald-600 font-medium">VaultOfTools.com</span>
          {" "}· Made with ☕ for the AI community
        </p>
        <div className="flex gap-4">
          {["Privacy Policy", "Terms of Service", "Sitemap"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[12.5px] text-slate-400 hover:text-slate-700 no-underline transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;