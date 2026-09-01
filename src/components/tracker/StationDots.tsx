import { STATIONS_PER_SIDE, type Side } from "@/lib/tracker-types";
import { cn } from "@/lib/utils";

export function StationDots({
  side,
  slots,
  color = "success",
}: {
  side: Side;
  slots: boolean[];
  color?: "success" | "warning";
}) {
  const reached =
    color === "warning"
      ? "bg-warning shadow-[0_0_10px_2px_color-mix(in_oklab,var(--warning)_55%,transparent)]"
      : "bg-success shadow-[0_0_10px_2px_color-mix(in_oklab,var(--success)_55%,transparent)]";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-lg border text-2xl font-black leading-none",
          color === "warning"
            ? "border-warning/50 bg-warning/10 text-warning"
            : "border-success/50 bg-success/10 text-success"
        )}
      >
        {side}
      </span>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-px overflow-hidden rounded-md border border-border/60 bg-black/25 px-1.5 py-1.5">
        {slots.map((on, i) => (
          <span
            key={`${side}-${STATIONS_PER_SIDE - i}`}
            aria-label={`Station ${String(STATIONS_PER_SIDE - i).padStart(2, "0")} ${
              on ? "shelf reached" : "waiting"
            }`}
            className={cn(
              "shrink-0 rounded-full transition-all duration-300",
              on ? `size-6 ${reached}` : "size-2 bg-dot-empty/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
