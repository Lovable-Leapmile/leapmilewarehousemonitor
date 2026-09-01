import { Fragment } from "react";
import { STATIONS_PER_SIDE, SIDES, type Side } from "@/lib/tracker-types";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning";

/** Side A covers stations 01-24, side B continues 25-48. */
const OFFSET: Record<Side, number> = { A: 0, B: STATIONS_PER_SIDE };

/** Every station on a side, ascending, with whether a shelf has reached it. */
function stationRow(slots: boolean[], offset: number) {
  const out: { n: number; reached: boolean }[] = [];
  for (let i = slots.length - 1; i >= 0; i--) {
    out.push({ n: STATIONS_PER_SIDE - i + offset, reached: slots[i] === true });
  }
  return out;
}

/** Cap per card so the large numbers always fit without scrolling. */
const MAX_MARKERS = 8;

/**
 * Reached stations for a list, laid out as one horizontal run of large
 * numbered circles connected by thin lines. Pending stations show nothing.
 */
export function StationLadder({
  sides,
  tone = "success",
  className,
}: {
  sides: Record<Side, boolean[]>;
  tone?: Tone;
  className?: string;
}) {
  const circle =
    tone === "warning"
      ? "border-warning bg-warning/15 text-warning shadow-[0_0_16px_-2px_color-mix(in_oklab,var(--warning)_60%,transparent)]"
      : "border-success bg-success/15 text-success shadow-[0_0_16px_-2px_color-mix(in_oklab,var(--success)_60%,transparent)]";

  const reached = SIDES.flatMap((side) =>
    stationRow(sides[side], OFFSET[side]).filter((s) => s.reached)
  ).slice(0, MAX_MARKERS);

  return (
    <div className={cn("flex min-w-0 items-center", className)}>
      {reached.map(({ n }, i) => (
        <Fragment key={n}>
          {i > 0 && (
            <span
              aria-hidden
              className="h-0.5 min-w-1.5 flex-1 rounded-full bg-foreground/25"
            />
          )}
          <span
            aria-label={`Station ${String(n).padStart(2, "0")} shelf reached`}
            className={cn(
              "grid size-[clamp(2.75rem,5vh,4.5rem)] shrink-0 place-items-center rounded-full border-4 font-mono text-[clamp(1.4rem,2.6vh,2.4rem)] font-black leading-none tabular-nums",
              circle
            )}
          >
            {n}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
