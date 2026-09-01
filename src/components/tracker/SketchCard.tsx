import { cn } from "@/lib/utils";
import type { TrackerList } from "@/lib/tracker-types";
import { SketchStations } from "./SketchStations";

/**
 * Card modelled on the hand-drawn sketch: ID block on the left, circled
 * station numbers on the right — styled with the board's neon theme.
 */
export function SketchCard({ list, className }: { list: TrackerList; className?: string }) {
  const ready = list.status === "ready";
  const head = list.listId.slice(0, -3);
  const tail = list.listId.slice(-3);

  return (
    <article
      className={cn(
        "relative flex min-h-0 min-w-0 items-stretch gap-3 overflow-hidden rounded-2xl border-2 bg-card/80 p-3 backdrop-blur sm:gap-4 sm:p-4",
        ready ? "border-success/55" : "border-warning/50",
        className
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", ready ? "bg-success" : "bg-warning")}
      />

      <div className="relative ml-1 flex w-[7.5rem] shrink-0 flex-col justify-center border-r border-foreground/20 pr-3 leading-none sm:w-32">
        <span className="font-mono text-sm tracking-[0.12em] text-foreground/85">{head}</span>
        <span
          className={cn(
            "font-mono text-3xl font-black tracking-tight",
            ready ? "text-success" : "text-foreground"
          )}
        >
          {tail}
        </span>
        <div className="my-2 h-px w-full bg-foreground/20" />
        <span className="font-mono text-sm text-foreground/85">{list.operatorId}</span>

        {/* letter badge, straddling the divider like in the sketch */}
        <span
          className={cn(
            "absolute -right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full border bg-background font-mono text-[0.7rem] font-black",
            ready ? "border-success/70 text-success" : "border-warning/70 text-warning"
          )}
        >
          {list.listLetter}
        </span>
      </div>

      <SketchStations
        sides={list.sides}
        tone={ready ? "success" : "warning"}
        className="min-w-0 flex-1"
      />
    </article>
  );
}
