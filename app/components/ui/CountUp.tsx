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
  { value: 10, suffix: "+", label: "AI Tools", icon: Bot },
  { value: 10, suffix: "+", label: "Categories", icon: Grid3X3 },
  { value: 50, suffix: "+", label: "Reviews", icon: Star },
  { value: 1000, suffix: "+", label: "Monthly Traffic", icon: Users },
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
    <div className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-border bg-card/60 p-2.5 shadow-sm backdrop-blur-md sm:gap-3 sm:px-4 sm:py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-10">
        <Icon className="size-4 sm:size-5" />
      </div>
      <div className="min-w-0 leading-tight">
        <h3 className="truncate text-sm font-bold text-foreground sm:text-lg">
          {display.toLocaleString()}
          {suffix}
        </h3>
        <p className="truncate text-[10.5px] text-muted-foreground sm:text-xs">{label}</p>
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
    <div ref={ref} className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-2 sm:mt-10 sm:gap-4 lg:grid-cols-4">
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
