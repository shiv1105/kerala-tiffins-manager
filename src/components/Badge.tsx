import type { ReactNode } from "react";

type BadgeTone = "green" | "amber" | "red" | "neutral" | "blue";

const tones: Record<BadgeTone, string> = {
  green: "bg-leaf/10 text-leaf border-leaf/20",
  amber: "bg-brass/15 text-[#7a5b15] border-brass/30",
  red: "bg-spice/10 text-spice border-spice/25",
  neutral: "bg-ink/5 text-ink/70 border-black/10",
  blue: "bg-sky-100 text-sky-800 border-sky-200",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
