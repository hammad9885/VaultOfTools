"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Grid3X3, Star, Users, TrendingUp, Zap } from "lucide-react";
import { api } from "../../lib/api";

const iconMap: Record<string, React.ElementType> = {
  Cpu: Bot,
  Layers: Grid3X3,
  Star,
  Users,
  TrendingUp,
  Zap,
};

const fallbackStats = [
  { value: 10, suffix: "K+", label: "AI Tools", icon: Bot },
  { value: 250, suffix: "+", label: "Categories", icon: Grid3X3 },
  { value: 50, suffix: "K+", label: "Reviews", icon: Star },
  { value: 2, suffix: "M+", label: "Users", icon: Users },
];

type Stat = { value: string; suffix: string; label: string; icon: string };

function useCountUp(end: number, enabled: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(end * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, enabled, duration]);

  return value;
}

function StatCard({
  value,
  suffix,
  label,
  icon: Icon,
  animate,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  animate: boolean;
}) {
  const display = useCountUp(value, animate);
  return (
    <div className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3 shadow-sm backdrop-blur-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <h3 className="text-lg font-bold text-foreground">
          {display.toLocaleString()}
          {suffix}
        </h3>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState(fallbackStats);
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .getHomeStats()
      .then((data: Stat[]) => {
        if (data.length > 0) {
          setStats(
            data.map((s) => ({
              value: parseInt(s.value, 10) || 0,
              suffix: s.suffix,
              label: s.label,
              icon: iconMap[s.icon] || Bot,
            })) as typeof fallbackStats
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-175 mx-auto">
      {stats.map((item, index) => (
        <StatCard
          key={index}
          value={item.value}
          suffix={item.suffix}
          label={item.label}
          icon={item.icon}
          animate={animate}
        />
      ))}
    </div>
  );
}
