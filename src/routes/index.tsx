import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trackerListsQuery } from "@/lib/tracker.queries";
import { SketchCard } from "@/components/tracker/SketchCard";
import { LetterBadge } from "@/components/tracker/LetterBadge";
import { DUMMY_LISTS } from "@/lib/tracker-dummy";
import { cn } from "@/lib/utils";
import type { TrackerList } from "@/lib/tracker-types";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leapmile List Tracker — Shelves at Stations" },
      {
        name: "description",
        content:
          "Live Leapmile list tracker: pick-list status, operator assignment, and shelf arrivals across 24 stations on each side of the aisle.",
      },
      { property: "og:title", content: "Leapmile List Tracker — Shelves at Stations" },
      {
        property: "og:description",
        content:
          "Real-time pick-list board showing READY and IN PROGRESS lists with shelf arrivals at every station.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trackerListsQuery),
  component: ListTracker,
});

const READY_SLOTS = 5;

function placeSlots(
  slots: (string | null)[],
  candidates: TrackerList[],
  byId: Map<string, TrackerList>,
) {
  const candIds = new Set(candidates.map((l) => l.id));
  // Free slots whose list is gone or has switched rows.
  for (let i = 0; i < READY_SLOTS; i++) {
    const id = slots[i];
    if (id && !candIds.has(id)) slots[i] = null;
  }
  const placed = new Set(slots.filter(Boolean) as string[]);
  for (const list of candidates) {
    if (placed.has(list.id)) continue;
    const free = slots.indexOf(null);
    if (free === -1) break;
    slots[free] = list.id;
    placed.add(list.id);
  }
  return slots.map((id) => (id ? byId.get(id) ?? null : null));
}

const PIGEON_LETTERS = "ABCDEFGHIJKL".split("");

/** Pigeon-hole row: collected lists waiting for the picker, 8 in one row. */
function PigeonRow({ lists }: { lists: TrackerList[] }) {
  const shown = lists.slice(0, 8);

  return (
    <section className="shrink-0 rounded-2xl border-2 border-success/25 bg-background/70 p-3 backdrop-blur [box-shadow:inset_0_2px_10px_-4px_oklch(0_0_0/80%)] sm:p-4">
      <div className="grid grid-cols-4 gap-3 sm:gap-4 md:grid-cols-8">
        {shown.map((list, i) => {
          const head = list.listId.slice(0, -3);
          const tail = list.listId.slice(-3);
          return (
            /* outer frame = pigeon-hole wall, inner = recessed compartment */
            <div
              key={`pigeon-${list.id}`}
              className="rounded-xl border border-foreground/15 p-[3px] [background:linear-gradient(180deg,oklch(1_0_0/10%),transparent_45%,oklch(0_0_0/45%))] [box-shadow:0_1px_0_0_oklch(1_0_0/12%),0_14px_26px_-16px_oklch(0_0_0/90%)]"
            >
              <div className="relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-success/20 px-2 py-5 text-center leading-none [background:linear-gradient(165deg,color-mix(in_oklab,var(--card)_90%,var(--success)_6%),color-mix(in_oklab,var(--background)_82%,black))] [box-shadow:inset_8px_8px_14px_-8px_oklch(0_0_0/85%),inset_-6px_-6px_12px_-8px_oklch(1_0_0/10%),inset_0_-2px_0_0_color-mix(in_oklab,var(--success)_28%,transparent)]">
                {/* shelf lip for depth */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2.5 rounded-b-lg bg-[linear-gradient(to_bottom,oklch(1_0_0/10%),transparent)]"
                />
                <LetterBadge
                  letter={PIGEON_LETTERS[i] ?? "A"}
                  className="mx-auto size-9"
                  textClassName="text-xl"
                />
                <span className="mt-2 w-full truncate font-mono text-sm tracking-[0.12em] text-foreground/80">
                  {head}
                </span>
                <span className="w-full truncate font-mono text-4xl font-black tracking-tight text-success">
                  {tail}
                </span>
                <div className="my-1 h-px w-2/3 bg-foreground/20" />
                <span className="w-full truncate font-mono text-lg tracking-[0.06em] text-foreground/90">
                  {list.operatorId}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );


}


const READY_LETTERS = "GHIJK".split("");

function ListTracker() {
  const initialData = Route.useLoaderData();
  const { data } = useQuery({ ...trackerListsQuery, initialData });

  const live = data?.lists ?? [];
  const incoming = [...live, ...DUMMY_LISTS];
  const byId = new Map(incoming.map((l) => [l.id, l]));

  const ready = incoming.filter((l) => l.status === "ready");
  const pending = incoming.filter((l) => l.status === "inprogress");

  // Fixed slots in the ready view: a card keeps its slot for its lifetime;
  // when it disappears the slot frees up for the next ready list.
  const slotsRef = useRef<(string | null)[]>(Array(READY_SLOTS).fill(null));
  const readySlots = placeSlots(slotsRef.current, ready, byId);

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-background p-2 sm:p-3">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:64px_64px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 size-[70vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand)_22%,transparent),transparent_65%)] blur-3xl"
      />
      <h1 className="sr-only">Warehouse task monitoring dashboard</h1>

      {/* outer bordered container, as in the sketch */}
      <div className="relative mx-auto flex min-h-0 w-full flex-1 flex-col gap-2 rounded-2xl border-2 border-border/60 bg-card/40 p-2 backdrop-blur sm:gap-3 sm:p-3">
        {/* 2×3 grid of ready cards */}
        <section className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2 sm:gap-3">
          {readySlots.map((list, i) =>
            list ? (
              <SketchCard
                key={list.id}
                list={list}
                letter={READY_LETTERS[i] ?? list.listLetter}
                className={cn("h-full", i === 0 && "col-span-2")}
              />
            ) : (
              <div
                key={i}
                className={cn(
                  "h-full min-h-0 rounded-2xl border-2 border-dashed border-border/40 bg-card/20",
                  i === 0 && "col-span-2"
                )}
              />
            )
          )}
        </section>


        <div className="border-t border-foreground/20" />

        <PigeonRow lists={ready.length >= 8 ? ready : [...ready, ...pending]} />
      </div>
    </main>
  );
}


