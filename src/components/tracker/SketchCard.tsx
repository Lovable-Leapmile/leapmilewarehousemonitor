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

      <div className="relative ml-1 flex w-[10rem] shrink-0 flex-col items-center justify-center border-r border-foreground/20 px-3 text-center leading-none sm:w-[14rem]">
        <span className="font-mono text-xl tracking-[0.12em] text-foreground/85 sm:text-2xl">
          {head}
        </span>
        <span
          className={cn(
            "font-mono text-7xl font-black tracking-tight sm:text-8xl",
            ready ? "text-success" : "text-foreground"
          )}
        >
          {tail}
        </span>
        {/* divider — the letter badge sits where it meets the vertical rule */}
        <div className="relative my-3 h-px w-full bg-foreground/20">
          <span
            className={cn(
              "absolute -right-[2.35rem] top-1/2 grid size-[3.25rem] -translate-y-1/2 rotate-45 place-items-center rounded-md border-2 shadow-lg",
              "border-brand bg-brand text-background"
            )}
          >
            <span className="-rotate-45 font-sans text-3xl font-black uppercase tracking-tight">
              {list.listLetter}
            </span>
          </span>
        </div>
        <span className="font-mono text-2xl text-foreground/90 sm:text-3xl">{list.operatorId}</span>
      </div>

      <SketchStations
        sides={list.sides}
        tone={ready ? "success" : "warning"}
        className="min-w-0 flex-1 pl-9 sm:pl-12"
      />
    </article>
  );
}
