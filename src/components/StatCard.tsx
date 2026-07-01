import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  detail,
  tone = "leaf",
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  detail?: string;
  tone?: "leaf" | "spice" | "brass" | "ink";
}) {
  const toneClass = {
    leaf: "bg-leaf/10 text-leaf",
    spice: "bg-spice/10 text-spice",
    brass: "bg-brass/15 text-[#7a5b15]",
    ink: "bg-ink/5 text-ink",
  }[tone];

  return (
    <section className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label truncate">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {detail ? <p className="mt-3 text-sm text-ink/60">{detail}</p> : null}
    </section>
  );
}
