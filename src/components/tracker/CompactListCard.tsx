import { cn } from "@/lib/utils";
import type { TrackerList } from "@/lib/tracker-types";

export function CompactListCard({
  list,
  className,
}: {
  list: TrackerList;
  className?: string;
}) {
  const head = list.listId.slice(0, -3);
  const tail = list.listId.slice(-3);

  return (
    <article
      className={cn(
        "relative flex shrink-0 min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-warning/50 bg-card/80 p-3 backdrop-blur",
        className
      )}
    >
      {/* status accent rail */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-warning"
      />

      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate font-mono text-2xl font-extrabold tracking-tight text-foreground/70">
          {list.operatorId}
        </span>
        <span className="shrink-0 font-sans text-3xl font-black leading-none text-foreground">
          {list.listLetter}
        </span>
      </div>

      <div className="my-1 h-px w-full bg-foreground/20" />

      <div className="flex flex-col items-center justify-center leading-none">
        <span className="font-mono text-3xl font-bold tracking-[0.2em] text-foreground">
          {head}
        </span>
        <span className="font-mono text-5xl font-black leading-[0.85] tracking-tight text-foreground">
          {tail}
        </span>
      </div>

    </article>
  );
}
