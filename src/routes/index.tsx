import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trackerListsQuery } from "@/lib/tracker.queries";
import { SketchCard } from "@/components/tracker/SketchCard";
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

const READY_SLOTS = 4;

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

function PendingStrip({ lists }: { lists: TrackerList[] }) {
  const shown = lists.slice(0, 8);

  return (
    <section className="shrink-0 overflow-hidden rounded-2xl border-2 border-warning/40 bg-card/60 backdrop-blur">
      <div className="grid grid-cols-4 divide-foreground/15 sm:grid-cols-8 sm:divide-x">
        {shown.map((list) => (
          <div key={list.id} className="flex min-w-0 flex-col justify-center px-2 py-2 leading-tight">
            <span className="w-full truncate font-mono text-sm text-muted-foreground">
              {list.operatorId}
            </span>
            <span className="w-full truncate font-mono text-xl font-black text-warning">
              {list.listId}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}


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
    <main className="relative min-h-screen overflow-hidden bg-background p-3 sm:p-5">
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
      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-3 rounded-2xl border-2 border-border/60 bg-card/40 p-3 backdrop-blur sm:gap-4 sm:p-4">
        {/* 2×2 grid of ready cards (A–D) */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {readySlots.map((list, i) =>
            list ? (
              <SketchCard key={list.id} list={list} />
            ) : (
              <div
                key={i}
                className={cn(
                  "min-h-[6rem] rounded-2xl border-2 border-dashed border-border/40 bg-card/20"
                )}
              />
            )
          )}
        </section>


        <div className="border-t border-foreground/20" />

        <PendingStrip lists={pending} />
      </div>
    </main>
  );
}

