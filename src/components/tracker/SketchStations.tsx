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
const SIZES = ["size-16", "size-[4.25rem]", "size-[4.1rem]", "size-[3.9rem]"];
const TEXTS = ["text-[1.6rem]", "text-[1.7rem]", "text-[1.55rem]", "text-[1.65rem]"];
const WEIGHTS = ["font-medium", "font-semibold", "font-normal", "font-medium"];
const FADES = ["opacity-90", "opacity-75", "opacity-100", "opacity-80"];
const NUDGES = ["translate-y-0", "translate-y-[1px]", "-translate-y-[1px]", "translate-y-0"];
const BORDERS = ["border", "border-[1.5px]", "border", "border-[1.25px]"];

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
    <ul className={cn("flex flex-wrap content-start items-center gap-x-2 gap-y-2", className)}>
      {stations.map((n, i) => (
        <li
          key={n}
          className={cn(
            "grid shrink-0 place-items-center rounded-full font-mono tabular-nums",
            circle,
            SIZES[i % SIZES.length],
            TEXTS[i % TEXTS.length],
            WEIGHTS[i % WEIGHTS.length],
            FADES[i % FADES.length],
            NUDGES[i % NUDGES.length],
            BORDERS[i % BORDERS.length]
          )}
        >
          {n}
        </li>
      ))}
    </ul>
  );
}
