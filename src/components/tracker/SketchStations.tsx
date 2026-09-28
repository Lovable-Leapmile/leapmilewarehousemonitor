import type { TrackerList } from "@/lib/tracker-types";
import { cn } from "@/lib/utils";

/**
 * Station markers: a wrapping run of circled numbers, all rendered with a
 * single consistent size, weight and contrast for clear readability.
 */
const CIRCLE_SIZE = "size-[5.5rem]";
const CIRCLE_TEXT = "text-[2.5rem]";

export function SketchStations({
  stops,
  tone = "success",
  className,
}: {
  stops?: TrackerList["stops"];
  tone?: "success" | "warning";
  className?: string;
}) {
  // Keep the station and bin from the same tray record; never invent station numbers.
  const trays = stops ?? [];
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
      {trays.map((tray) => (
        <li key={tray.orderId} className="flex w-[10rem] shrink-0 flex-col items-center text-center">
          <span
            className={cn(
              "grid place-items-center rounded-full border-2 font-mono font-semibold tabular-nums opacity-100",
              circle,
              CIRCLE_SIZE,
              tray.stationName.length > 2 ? "text-[1.65rem]" : CIRCLE_TEXT,
              "whitespace-nowrap"
            )}
          >
            {tray.stationName}
          </span>
          {/* Shelf ID chip overlaps the circle it belongs to, so the pairing
              is unambiguous even when rows sit close together. */}
          <span
            className={cn(
              "-mt-3 rounded-md border-2 px-1.5 py-[0.05rem] font-mono text-[0.95rem] font-bold leading-tight tracking-tight tabular-nums shadow-sm",
              chip
            )}
          >
            {tray.binId === "—" ? "—" : tray.binId.slice(-5)}
          </span>
          <span className="mt-1 w-full min-w-0 break-all font-mono text-[0.82rem] font-semibold leading-tight text-foreground" title={tray.binId}>
            {tray.binId}
          </span>
        </li>
      ))}
    </ul>
  );
}
