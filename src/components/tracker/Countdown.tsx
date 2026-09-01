import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Tier = "safe" | "soon" | "urgent" | "overdue";

function tierFor(remainingSec: number): Tier {
  if (remainingSec <= 0) return "overdue";
  if (remainingSec <= 60) return "urgent";
  if (remainingSec <= 120) return "soon";
  return "safe";
}

function format(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

const TIER_TEXT: Record<Tier, string> = {
  safe: "text-success",
  soon: "text-warning",
  urgent: "text-destructive",
  overdue: "text-destructive",
};

/**
 * Live ticking countdown toward an absolute deadline (epoch ms).
 * Urgency escalates: green -> amber -> red -> overdue pulse.
 * `now` is null until mount to avoid SSR hydration mismatch.
 */
export function Countdown({
  deadline,
  size = "text-2xl",
  label = "Complete in",
  className,
}: {
  deadline: number;
  size?: string;
  label?: string;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingSec = now == null ? Infinity : (deadline - now) / 1000;
  const tier = tierFor(remainingSec);
  const overdue = tier === "overdue";
  const display = now == null ? "--:--" : format(remainingSec);

  return (
    <div className={cn("flex flex-col items-center gap-0.5 text-center", className)}>
      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {overdue ? "Overdue" : label}
      </span>
      <span
        className={cn(
          "font-mono font-extrabold leading-none tabular-nums",
          size,
          TIER_TEXT[tier],
          overdue && "animate-pulse"
        )}
      >
        {display}
      </span>
    </div>
  );
}
