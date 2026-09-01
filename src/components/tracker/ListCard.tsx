import { cn } from "@/lib/utils";
import type { TrackerList } from "@/lib/tracker-types";
import { StationLadder } from "./StationLadder";

export function ListCard({ list, className }: { list: TrackerList; className?: string }) {
  const ready = list.status === "ready";
  const tone: "success" | "warning" = ready ? "success" : "warning";

  const head = list.listId.slice(0, -3);
  const tail = list.listId.slice(-3);

  return (
    <article
      className={cn(
        "relative flex min-h-0 min-w-0 items-stretch gap-4 overflow-hidden rounded-2xl border-2 bg-card/80 px-4 py-2 backdrop-blur",
        ready ? "border-success/55" : "border-warning/50",
        className
      )}
    >
      {/* status accent rail */}
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", ready ? "bg-success" : "bg-warning")}
      />

      {/* List ID */}
      <div className="flex shrink-0 flex-col justify-center leading-none">
        <span className="font-mono text-[clamp(0.9rem,1.8vh,1.5rem)] font-bold tracking-[0.18em] text-foreground">
          {head}
        </span>
        <span
          className={cn(
            "font-mono text-[clamp(2rem,5vh,4rem)] font-black leading-[0.9] tracking-tight",
            ready ? "text-success" : "text-foreground"
          )}
        >
          {tail}
        </span>
      </div>

      <div aria-hidden className="w-px shrink-0 self-stretch bg-foreground/20" />

      {/* Operator + assigned letter */}
      <div className="flex shrink-0 flex-col items-center justify-center leading-none">
        <span className="font-mono text-[clamp(1rem,2.2vh,1.75rem)] font-extrabold tracking-tight text-foreground">
          {list.operatorId}
        </span>
        <div className="my-1 h-px w-full bg-foreground/20" />
        <span className="font-sans text-[clamp(1.75rem,4vh,3.25rem)] font-black leading-none text-foreground">
          {list.listLetter}
        </span>
      </div>

      <div aria-hidden className="w-px shrink-0 self-stretch bg-foreground/20" />

      {/* Station markers, horizontal */}
      <StationLadder sides={list.sides} tone={tone} className="min-w-0 flex-1" />
    </article>
  );
}
