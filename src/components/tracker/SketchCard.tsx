import { cn } from "@/lib/utils";
import type { TrackerList } from "@/lib/tracker-types";
import { SketchStations } from "./SketchStations";

/**
 * Card modelled on the hand-drawn sketch: ID block on the left, circled
 * station numbers on the right, thin ruled dividers throughout.
 */
export function SketchCard({ list, className }: { list: TrackerList; className?: string }) {
  const head = list.listId.slice(0, -3);
  const tail = list.listId.slice(-3);

  return (
    <article
      className={cn(
        "relative flex min-h-0 min-w-0 items-stretch gap-3 rounded-md border border-foreground/25 bg-card/40 p-3 sm:gap-4 sm:p-4",
        className
      )}
    >
      <div className="relative flex w-[7.5rem] shrink-0 flex-col justify-center border-r border-foreground/20 pr-3 leading-none sm:w-32">
        <span className="font-mono text-sm tracking-[0.12em] text-foreground/85">{head}</span>
        <span className="font-mono text-3xl font-bold tracking-tight text-foreground">{tail}</span>
        <div className="my-2 h-px w-full bg-foreground/20" />
        <span className="font-mono text-sm text-foreground/85">{list.operatorId}</span>

        {/* letter badge, straddling the divider like in the sketch */}
        <span className="absolute -right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full border border-foreground/40 bg-background font-mono text-[0.7rem] font-semibold text-foreground">
          {list.listLetter}
        </span>
      </div>

      <SketchStations sides={list.sides} className="min-w-0 flex-1" />
    </article>
  );
}
