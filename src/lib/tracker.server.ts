import { STATIONS_PER_SIDE, type Side, type TrackerList } from "./tracker-types";

export type { Side, TrackerList };


const API_BASE = "https://testpod.leapmile.com/nanostore/orders";
const FALLBACK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkzNTg5Mzk2OX0.dLn79HF199ETJQ3-GHHLcC3UkE31wt7CT_V7FjhKxrg";

type OrderRecord = {
  comment?: string[] | null;
  id: number;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: number | null;
  tray_id: string | null;
  tray_status: string | null;
  station_id: string | null;
  station_friendly_name: string | null;
  auto_complete_time: number | null;
};

const REACHED_STATUSES = new Set(["tray_ready_to_use", "completed", "at_station"]);

/** Assigned list letter pool — deterministic per list so it never shuffles. */
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


export async function fetchOrders(): Promise<OrderRecord[]> {
  try {
    const token = process.env["LEAPMILE_API_TOKEN"] ?? FALLBACK_TOKEN;
    const res = await fetch(`${API_BASE}?order_by_field=created_at&order_by_type=DESC`, {
      headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { records?: OrderRecord[] };
    return json.records ?? [];
  } catch {
    return [];
  }
}

/**
 * `station_friendly_name` (e.g. "S-03") is the station on side A.
 * Falls back to `station_id` (`S-1-<bank>-<number>-1`, bank 1 -> side B).
 */
function locate(order: OrderRecord): { side: Side; station: number } | null {
  const m = /(\d{1,2})/.exec(order.station_friendly_name ?? "");
  if (m) {
    const n = Number(m[1]);
    if (n >= 1 && n <= STATIONS_PER_SIDE) return { side: "A", station: n };
  }
  const parts = (order.station_id ?? "").split("-");
  if (parts.length >= 4) {
    const bank = Number(parts[2]);
    const station = Number(parts[3]);
    if (Number.isFinite(bank) && Number.isFinite(station)) {
      const side: Side = bank === 0 ? "A" : "B";
      const n = station === 0 ? 1 : station;
      if (n >= 1 && n <= STATIONS_PER_SIDE) return { side, station: n };
    }
  }
  return null;
}


function emptySides(): Record<Side, boolean[]> {
  return {
    A: Array.from({ length: STATIONS_PER_SIDE }, () => false),
    B: Array.from({ length: STATIONS_PER_SIDE }, () => false),
  };
}

/** Station 24 is rendered first, station 01 last. */
function slotIndex(station: number) {
  return STATIONS_PER_SIDE - station;
}

/**
 * Absolute deadline (epoch ms) for a ready list: the moment the last shelf
 * arrived (latest `updated_at` among its orders) plus the auto-complete
 * budget in minutes. The client ticks this down live. When the feed has no
 * usable timestamp, the budget is counted from now so the timer still runs.
 */
function computeDeadline(
  orders: OrderRecord[],
  budgetMin: number
): number {
  let baseMs = 0;
  for (const o of orders) {
    const t = Date.parse(o.updated_at ?? "");
    if (Number.isFinite(t) && t > baseMs) baseMs = t;
  }
  const base = baseMs > 0 ? baseMs : Date.now();
  return base + budgetMin * 60_000;
}

/** Real lists carry a numeric list id in comment[0] (ad-hoc/manual rows do not). */
function isListRecord(r: OrderRecord): boolean {
  const id = r.comment?.[0] ?? "";
  return /^\d{6,}$/.test(id);
}

export function buildLists(records: OrderRecord[]): TrackerList[] {
  const relevant = records.filter(isListRecord);
  const groups = new Map<string, OrderRecord[]>();

  for (const r of relevant) {
    const key = r.comment?.[0] ?? String(r.user_id ?? "0");
    const bucket = groups.get(key);
    if (bucket) bucket.push(r);
    else groups.set(key, [r]);
  }

  const lists: TrackerList[] = [];

  for (const [key, orders] of groups) {
    const sides = emptySides();
    let reached = 0;
    let station: string | null = null;

    for (const order of orders) {
      if (!REACHED_STATUSES.has(order.tray_status ?? "")) continue;
      const spot = locate(order);
      if (!spot) continue;
      sides[spot.side][slotIndex(spot.station)] = true;
      station ??= order.station_friendly_name ?? null;
      reached += 1;
    }

    const total = orders.length;
    const isReady = total > 0 && reached >= total;
    const autoComplete = orders.find((o) => o.auto_complete_time != null)?.auto_complete_time;
    const budgetMin = autoComplete ?? 5;
    const deadline = isReady ? computeDeadline(orders, budgetMin) : null;

    const anchorId = orders.reduce((min, o) => Math.min(min, o.id), Number.MAX_SAFE_INTEGER);
    const first = orders[0];
    const listId = first?.comment?.[0] ?? String(anchorId).padStart(9, "0");
    const operatorId =
      first?.comment?.[1] ?? `Ca.${String(first?.user_id ?? key).padStart(7, "0")}`;

    lists.push({
      id: `list-${key}-${anchorId}`,
      listId,
      listLetter: LETTERS[anchorId % LETTERS.length] ?? "A",
      operatorId,

      kind: anchorId % 2 === 0 ? "pick" : "put",
      status: isReady ? "ready" : "inprogress",
      deadline,
      station,
      reached,
      total,
      sides,
    });
  }

  return lists.sort((a, b) => {
    if (a.status !== b.status) return a.status === "ready" ? -1 : 1;
    return b.listId.localeCompare(a.listId);
  });
}
