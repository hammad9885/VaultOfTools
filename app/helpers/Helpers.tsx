
export function splitColor(color: string): { bg: string; text: string } {
  const parts = color.split(" ");
  return { bg: parts[0], text: parts.slice(1).join(" ") };
}

export function rankColor(rank: number): string {
  return rank <= 2 ? "text-emerald-500" : "text-slate-300";
}

export function buildStars(
  filled: number,
  total = 5
): { filled: boolean; index: number }[] {
  return Array.from({ length: total }, (_, i) => ({
    index: i + 1,
    filled: i + 1 <= filled,
  }));
}