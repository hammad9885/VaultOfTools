"use client";

import {
  Bar,
  BarChart as ReBar,
  CartesianGrid,
  Cell,
  Line,
  LineChart as ReLine,
  Pie,
  PieChart as RePie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  fontSize: "12px",
  color: "var(--card-foreground)",
};

export function BarChart({ data, dataKey, nameKey = "name", color = "var(--primary)", height = 260 }: {
  data: Record<string, any>[];
  dataKey: string;
  nameKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
      <ReBar data={data} margin={{ top: 8, right: 4, left: -8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey={nameKey}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={8}
        />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </ReBar>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({ data, dataKey, nameKey = "name", color = "var(--primary)", height = 260 }: {
  data: Record<string, any>[];
  dataKey: string;
  nameKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
      <ReLine data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={nameKey} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
      </ReLine>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function DonutChart({ data, dataKey, nameKey = "name", height = 200 }: {
  data: Record<string, any>[];
  dataKey: string;
  nameKey?: string;
  height?: number;
}) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[260px]" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
      <RePie>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={40}
          outerRadius={70}
          paddingAngle={3}
          stroke="var(--card)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </RePie>
      </ResponsiveContainer>
    </div>
  );
}
