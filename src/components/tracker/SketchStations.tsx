import { STATIONS_PER_SIDE, SIDES, type Side } from "@/lib/tracker-types";
import { cn } from "@/lib/utils";

const OFFSET: Record<Side, number> = { A: 0, B: STATIONS_PER_SIDE };

function reachedStations(sides: Record<Side, boolean[]>) {
  const out: number[] = [];
  for (const side of SIDES) {
    const slots = sides[side];
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i] === true) out.push(STATIONS_PER_SIDE - i + OFFSET[side]);
    }
  }
  return out;
}

/**
 * Hand-drawn style station markers: a wrapping run of circled numbers.
 * Deliberately low-contrast between neighbours — sizes, weights, opacity and
 * baseline nudges vary subtly so the values need a closer look.
 */
const CIRCLE_SIZE = "size-20";
const CIRCLE_TEXT = "text-[2.05rem]";

export function SketchStations({
  sides,
  tone = "success",
  className,
}: {
  sides: Record<Side, boolean[]>;
  tone?: "success" | "warning";
  className?: string;
}) {
  const stations = reachedStations(sides);
  const circle =
    tone === "warning"
      ? "border-warning/70 bg-warning/10 text-warning"
      : "border-success/70 bg-success/10 text-success";

  return (
    <ul className={cn("flex flex-wrap content-center items-center gap-x-3 gap-y-2", className)}>
      {stations.map((n) => (
        <li
          key={n}
          className={cn(
            "grid shrink-0 place-items-center rounded-full border-2 font-mono font-semibold tabular-nums opacity-100",
            circle,
            CIRCLE_SIZE,
            CIRCLE_TEXT
          )}
        >
          {n}
        </li>
      ))}
    </ul>
  );
}
