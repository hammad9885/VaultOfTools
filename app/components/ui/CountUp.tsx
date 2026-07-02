"use client";

import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Bot, Grid3X3, Star, Users, Cpu, Layers, TrendingUp, Zap } from "lucide-react";
import { api } from "../../lib/api";

const iconMap: Record<string, React.ElementType> = { Cpu: Bot, Layers: Grid3X3, Star, Users, TrendingUp, Zap };

const fallbackStats = [
  { value: 10, suffix: "K+", label: "AI Tools", icon: Bot },
  { value: 250, suffix: "+", label: "Categories", icon: Grid3X3 },
  { value: 50, suffix: "K+", label: "Reviews", icon: Star },
  { value: 2, suffix: "M+", label: "Users", icon: Users },
];

type Stat = { value: string; suffix: string; label: string; icon: string };

export default function StatsSection() {
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    api.getHomeStats()
      .then((data: Stat[]) => {
        if (data.length > 0) {
          setStats(data.map((s) => ({
            value: parseInt(s.value) || 0,
            suffix: s.suffix,
            label: s.label,
            icon: iconMap[s.icon] || Bot,
          })) as any);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-175 mx-auto">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3 shadow-sm backdrop-blur-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h3 className="text-lg font-bold text-foreground">
                <CountUp start={0} end={item.value} duration={2.2} separator="," suffix={item.suffix} />
              </h3>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
