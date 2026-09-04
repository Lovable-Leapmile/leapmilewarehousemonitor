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
 * Station markers: a wrapping run of circled numbers, all rendered with a
 * single consistent size, weight and contrast for clear readability.
 */
const CIRCLE_SIZE = "size-[5.5rem]";
const CIRCLE_TEXT = "text-[2.5rem]";

/**
 * Last 4 digits of the shelf ID, formatted "00-12". Shelf IDs are unrelated to
 * the station number, so the value is scrambled deterministically (stable per
 * station, never simply mirroring the dot number).
 */
function shelfLabel(station: number) {
  const h = (station * 2654435761) % 9973;
  const raw = String(h % 10000).padStart(4, "0");
  return `${raw.slice(0, 2)}-${raw.slice(2)}`;
}

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

  const chip =
    tone === "warning"
      ? "border-warning bg-warning text-background"
      : "border-success bg-success text-background";

  return (
    <ul className={cn("flex flex-wrap content-center items-start gap-x-1 gap-y-2", className)}>
      {stations.map((n) => (
        <li key={n} className="flex shrink-0 flex-col items-center">
          <span
            className={cn(
              "grid place-items-center rounded-full border-2 font-mono font-semibold tabular-nums opacity-100",
              circle,
              CIRCLE_SIZE,
              CIRCLE_TEXT
            )}
          >
            {n}
          </span>
          {/* Shelf ID chip overlaps the circle it belongs to, so the pairing
              is unambiguous even when rows sit close together. */}
          <span
            className={cn(
              "-mt-3 rounded-md border-2 px-1.5 py-[0.05rem] font-mono text-[0.95rem] font-bold leading-tight tracking-tight tabular-nums shadow-sm",
              chip
            )}
          >
            {shelfLabel(n)}
          </span>
        </li>
      ))}
    </ul>
  );
}
