"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Cpu,
  Workflow,
  Layers,
  TrendingUp,
  Star,
  Quote,
  Sparkles,
  Search,
  Shield,
  Clock,
  Target,
  RefreshCw,
  Zap,
  X,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import type { MotionProps } from "framer-motion";
import { SiteFooter, SiteNav } from "../routes";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Zap,
  Layers,
  TrendingUp,
  Star,
  Search,
  Shield,
  Clock,
  RefreshCw,
  Users,
  Workflow,
  Target,
};

function fadeUp(delay = 0): MotionProps {
  return {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: "easeOut", delay },
  };
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...fadeUp(0)} className="inline-block">
      <span className="inline-block rounded-full border border-[#E5E7EB] bg-white px-5 py-1.5 text-xs font-semibold tracking-wide text-[#4F46E5] shadow-sm">
        {children}
      </span>
    </motion.div>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      {...fadeUp(0.1)}
      className="mx-auto mt-4 max-w-2xl text-lg text-[#475569]"
    >
      {children}
    </motion.p>
  );
}

export default function ConsultingLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const [heroBadges, setHeroBadges] = useState([
    "100% Independent",
    "No Vendor Bias",
    "Expert Guidance",
    "ROI Focused",
  ]);

  const [services, setServices] = useState([
    {
      icon: Search,
      title: "AI Tool Selection",
      desc: "We evaluate hundreds of AI tools to find the perfect fit for your specific use case, budget, and technical requirements.",
      color: "#4F46E5",
      bg: "#EEF2FF",
    },
    {
      icon: Workflow,
      title: "Workflow Automation",
      desc: "Identify repetitive tasks and implement automation solutions that save your team hours every week.",
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
    {
      icon: Layers,
      title: "Software Stack Optimization",
      desc: "Audit your current tech stack, eliminate redundancies, and optimize licensing costs without sacrificing capability.",
      color: "#6366F1",
      bg: "#EEF2FF",
    },
    {
      icon: TrendingUp,
      title: "AI Adoption Strategy",
      desc: "Develop a phased roadmap for AI adoption that aligns with your business goals and team readiness.",
      color: "#4F46E5",
      bg: "#EEF2FF",
    },
  ]);

  const [processSteps, setProcessSteps] = useState([
    { step: "01", title: "Discovery Call" },
    { step: "02", title: "Business Analysis" },
    { step: "03", title: "Tool Recommendations" },
    { step: "04", title: "Implementation Plan" },
    { step: "05", title: "Ongoing Support" },
  ]);

  const [whyChooseUs, setWhyChooseUs] = useState([
    { icon: Shield, title: "Independent Recommendations", desc: "100% unbiased advice." },
    { icon: Search, title: "No Vendor Bias", desc: "We don't sell tools, we guide you." },
    { icon: Star, title: "Expert Analysis", desc: "AI + expert research." },
    { icon: Clock, title: "Time Saving", desc: "Save hours of research." },
    { icon: Target, title: "ROI Focused", desc: "Better investment decisions." },
    { icon: RefreshCw, title: "Ongoing Updates", desc: "Always updated." },
  ]);

  const [testimonial, setTestimonial] = useState({
    name: "Sarah Kim",
    role: "CTO, TechFlow Inc.",
    quote: "Vault of Tools completely transformed our tech stack. We cut costs by 40% and doubled our team's productivity within a month.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
  });

  const [stat, setStat] = useState("500+ Businesses Served");

  const [faqs, setFaqs] = useState([
    {
      q: "How much does consulting cost?",
      a: "Our initial discovery call is always free. For ongoing consulting, we offer flexible pricing starting at $2,500 for a strategy session, with monthly retainers available for larger engagements.",
    },
    {
      q: "Do you recommend free tools?",
      a: "Absolutely. We believe in recommending the best tool for your specific needs — whether it's free, freemium, or paid. We never push paid solutions when a free alternative is the right fit.",
    },
    {
      q: "Can you help small businesses?",
      a: "Yes, we work with businesses of all sizes, from early-stage startups to enterprise organizations. Our approach scales to fit your budget and goals.",
    },
    {
      q: "Do you provide implementation support?",
      a: "Yes, we offer full implementation support including integration, team training, and ongoing optimization to ensure you get maximum value from your tool stack.",
    },
    {
      q: "How long does the process take?",
      a: "A typical engagement runs 4-8 weeks from initial analysis to a finalized roadmap. Implementation support continues as long as you need it.",
    },
    {
      q: "Is the consultation really free?",
      a: "Yes, the initial 30-minute discovery call is completely free with no obligation. We'll discuss your needs and outline how we can help before any commitment.",
    },
  ]);

  const statValue = stat.split(" ")[0];
  const statLabel = stat.split(" ").slice(1).join(" ");

  useEffect(() => {
    api.getConsulting().then((data: any) => {
      if (data.heroBadges) setHeroBadges(data.heroBadges.map((b: any) => b.label));
      if (data.services) setServices(data.services.map((s: any) => ({ ...s, icon: iconMap[s.icon] || Cpu })));
      if (data.processSteps) setProcessSteps(data.processSteps);
      if (data.whyChooseUs) setWhyChooseUs(data.whyChooseUs.map((w: any) => ({ ...w, icon: iconMap[w.icon] || Star })));
      if (data.testimonial) setTestimonial(data.testimonial);
      if (data.stat) setStat(data.stat);
      if (data.faqs) setFaqs(data.faqs);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in required fields");
      return;
    }
    setSending(true);
    try {
      await api.createConsultation(form);
      toast.success("Request sent! We'll be in touch within 24 hours.");
      setShowModal(false);
      setForm({ name: "", email: "", company: "", message: "" });
    } catch (err: unknown) {
      toast.error("Something went wrong", {
        description:
          err instanceof Error ? err.message : "Please try again later",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <SiteNav />
      <main className="overflow-hidden font-sans">
        <section
          className="relative min-h-screen flex items-center overflow-hidden px-4 sm:px-6 lg:px-8"
          style={{
            background:
              "linear-gradient(135deg, #070B1F 0%, #111936 50%, #1A1454 100%)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#4F46E5]/20 blur-[120px]" />
            <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#7C3AED]/15 blur-[100px]" />
            <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#6366F1]/10 blur-[80px]" />
          </div>

          <div className="relative mx-auto w-full max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* ---------- Left ---------- */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/80 backdrop-blur-sm">
                  <Sparkles className="size-3.5 text-[#6366F1]" />
                  AI & Software Consulting
                </span>

                <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                  Find The Right{" "}
                  <span className="text-[#4F46E5]">AI Tools</span>
                  <br />
                  &amp; Software For
                  <br />
                  Your Business
                </h1>

                <p className="mt-6 max-w-lg text-base leading-relaxed text-[#94A3B8] sm:text-lg">
                  Stop wasting time and money on the wrong tools. Get expert
                  recommendations tailored to your business goals, workflow, and
                  budget.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <motion.button
                    onClick={() => setShowModal(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-shadow hover:shadow-[#4F46E5]/25 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #4F46E5, #6D5DF6)",
                    }}
                  >
                    Book Free Consultation
                    <ArrowRight className="size-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => setShowModal(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 cursor-pointer"
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path d="M15.5 12L10 8.5v7z" fill="currentColor" />
                    </svg>
                    Schedule Discovery Call
                  </motion.button>
                </div>

                {/* Feature badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[#94A3B8]"
                >
                  {heroBadges.map((badge) => (
                    <span key={badge} className="flex items-center gap-2">
                      <Check className="size-4 text-[#22C55E]" />
                      {badge}
                    </span>
                  ))}
                </motion.div>
              </motion.div>

              {/* ---------- Right (illustration) ---------- */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="relative hidden lg:flex items-center justify-center"
              >
                <div className="relative h-[500px] w-full">
                  {/* Central glass card */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 m-auto h-80 w-80 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                    style={{ boxShadow: "0 25px 80px rgba(79,70,229,0.25)" }}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#4F46E5]/40 text-xs text-white">
                          AI
                        </div>
                        <span className="text-xs font-medium text-white/70">
                          Analytics Dashboard
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded-full bg-white/10" />
                        <div className="h-2 w-3/4 rounded-full bg-white/10" />
                        <div className="flex gap-2">
                          <div className="h-8 w-8 rounded-lg bg-[#4F46E5]/30" />
                          <div className="h-8 w-8 rounded-lg bg-[#7C3AED]/30" />
                          <div className="h-8 w-8 rounded-lg bg-[#6366F1]/30" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">
                          98%
                        </span>
                        <span className="text-xs text-white/50">Accuracy</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-0 right-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
                    style={{ boxShadow: "0 10px 40px rgba(79,70,229,0.2)" }}
                  >
                    <Cpu className="size-6 text-[#6366F1]" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute bottom-10 left-0 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
                    style={{ boxShadow: "0 10px 40px rgba(124,58,237,0.2)" }}
                  >
                    <Zap className="size-6 text-[#7C3AED]" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                    className="absolute bottom-20 right-0 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
                    style={{ boxShadow: "0 10px 40px rgba(99,102,241,0.2)" }}
                  >
                    <Layers className="size-6 text-[#4F46E5]" />
                  </motion.div>

                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
                    viewBox="0 0 500 500"
                  >
                    <path
                      d="M250 100 L250 200 L350 200"
                      stroke="#6366F1"
                      strokeWidth="1"
                      fill="none"
                    />
                    <path
                      d="M150 300 L250 300 L250 400"
                      stroke="#7C3AED"
                      strokeWidth="1"
                      fill="none"
                    />
                    <circle cx="250" cy="100" r="3" fill="#6366F1" />
                    <circle cx="350" cy="200" r="3" fill="#6366F1" />
                    <circle cx="150" cy="300" r="3" fill="#7C3AED" />
                    <circle cx="250" cy="400" r="3" fill="#7C3AED" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/*  SERVICES                                                       */}
        {/* ================================================================ */}
        <section className="bg-[#F8FAFF] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <SectionTag>Services</SectionTag>
            <h3>How We Can Help You</h3>
            <SectionSubtitle>
              Customized solutions to help you choose, implement, and scale the
              right tools.
            </SectionSubtitle>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    y: -6,
                    boxShadow: "0 25px 60px rgba(79,70,229,0.15)",
                  }}
                  className="group rounded-3xl border border-[#E5E7EB] bg-white p-8 text-left transition-shadow"
                  style={{ boxShadow: "0 15px 40px rgba(15,23,42,0.08)" }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: s.bg, color: s.color }}
                  >
                    <s.icon className="size-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-[#0F172A]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#475569]">
                    {s.desc}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] transition-all group-hover:gap-2">
                    Learn More <ArrowRight className="size-3.5" />
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <SectionTag>Process</SectionTag>
            <h3>How It Works</h3>
            <SectionSubtitle>A simple and proven process.</SectionSubtitle>

            <div className="mt-14 flex flex-col items-center gap-0 lg:flex-row lg:gap-0">
              {processSteps.map((s, i) => (
                <div key={s.step} className="flex items-center lg:flex-col">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF] text-xl font-bold text-[#4F46E5]">
                      {s.step}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#0F172A]">
                      {s.title}
                    </p>
                  </motion.div>

                  {/* Arrow between steps */}
                  {i < 4 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
                      className="flex items-center justify-center px-2 text-[#94A3B8] lg:px-4"
                    >
                      <svg
                        className="hidden size-6 lg:block"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14m-6-6l6 6-6 6" />
                      </svg>
                      <svg
                        className="block size-5 lg:hidden"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14m-6-6l6 6 6-6" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto text-center">
            <h3>Why Choose Vault of Tools?</h3>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full max-w-7xl mx-auto">
              {whyChooseUs.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex-shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-[#0F172A]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#475569]">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div
            className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-16 sm:px-12 sm:py-20 lg:px-20"
            style={{
              background:
                "linear-gradient(135deg, #070B1F 0%, #111936 50%, #1A1454 100%)",
            }}
          >
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#4F46E5]/20 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -left-40 h-[300px] w-[300px] rounded-full bg-[#7C3AED]/15 blur-[100px]" />

            <div className="relative grid items-center gap-12 lg:grid-cols-3">
              {/* Testimonial card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:col-span-1"
              >
                <Quote className="size-8 text-[#4F46E5]/40" />
                <p className="mt-4 text-sm leading-relaxed text-[#94A3B8] italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="relative h-10 w-10">
                    {testimonial.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-xs font-bold text-white pointer-events-none">
                      {testimonial.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-[#94A3B8]">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>

              {/* Center stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-center lg:col-span-1"
              >
                <span className="text-6xl font-bold text-white sm:text-7xl">
                  {statValue}
                </span>
                <p className="mt-2 text-lg font-medium text-[#94A3B8]">
                  {statLabel}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="rounded-2xl p-8 text-center lg:col-span-1"
                style={{
                  background: "linear-gradient(135deg, #5B4CF6, #7C3AED)",
                }}
              >
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Ready To Build A Smarter Software Stack?
                </h3>
                <motion.button
                  onClick={() => setShowModal(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white px-7 py-3 text-sm font-semibold text-[#4F46E5] shadow-lg transition-shadow hover:shadow-white/25 cursor-pointer"
                >
                  Book Free Consultation
                  <ArrowRight className="size-4" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFF] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h3>Frequently Asked Questions</h3>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
                    style={{
                      boxShadow: "0 4px 16px rgba(15,23,42,0.05)",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-semibold text-[#0F172A] transition-colors hover:text-[#4F46E5] sm:text-base"
                    >
                      <span>{faq.q}</span>

                      <ChevronDown
                        className={`size-5 shrink-0 text-[#94A3B8] transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isOpen ? "auto" : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-[#E5E7EB] px-6 py-5 text-sm leading-relaxed text-[#475569]">
                        {faq.a}
                      </p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#0F172A]">
                    Book Free Consultation
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#F8FAFF] hover:text-[#0F172A] transition cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#0F172A]">
                      Name *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                      placeholder="John Doe"
                      className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#4F46E5]/50 focus:ring-4 focus:ring-[#4F46E5]/5 transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0F172A]">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                      placeholder="john@company.com"
                      className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#4F46E5]/50 focus:ring-4 focus:ring-[#4F46E5]/5 transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0F172A]">
                      Company
                    </label>
                    <input
                      value={form.company}
                      onChange={(e) =>
                        setForm({ ...form, company: e.target.value })
                      }
                      placeholder="Acme Inc."
                      className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#4F46E5]/50 focus:ring-4 focus:ring-[#4F46E5]/5 transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0F172A]">
                      Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      rows={4}
                      required
                      placeholder="Tell us about your project..."
                      className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#4F46E5]/50 focus:ring-4 focus:ring-[#4F46E5]/5 transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity disabled:opacity-50 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #4F46E5, #6D5DF6)",
                    }}
                  >
                    {sending ? "Sending\u2026" : "Send Request"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <SiteFooter />
    </>
  );
}
