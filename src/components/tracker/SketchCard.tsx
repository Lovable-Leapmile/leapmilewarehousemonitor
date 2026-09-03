import { cn } from "@/lib/utils";
import type { TrackerList } from "@/lib/tracker-types";
import { SketchStations } from "./SketchStations";
import { LetterBadge } from "./LetterBadge";

/**
 * Card modelled on the hand-drawn sketch: ID block on the left, circled
 * station numbers on the right — styled with the board's neon theme.
 */
export function SketchCard({
  list,
  letter,
  className,
}: {
  list: TrackerList;
  letter?: string;
  className?: string;
}) {
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

      <div className="relative ml-1 flex w-[11rem] shrink-0 flex-col items-center justify-center border-r border-foreground/20 px-3 text-center leading-none sm:w-[15.5rem]">
        {/* letter badge sits centered on the vertical rule */}
        <LetterBadge
          letter={letter ?? list.listLetter}
          className="absolute -right-[1.65rem] top-1/2 -translate-y-1/2 size-[3.25rem]"
          textClassName="text-3xl"
        />

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
      </div>

      <SketchStations
        sides={list.sides}
        tone={ready ? "success" : "warning"}
        className="min-w-0 flex-1 pl-9 sm:pl-12"
      />
    </article>
  );
}

