import { STATIONS_PER_SIDE, type Side, type TrackerList } from "./tracker-types";

export type { Side, TrackerList };

const API_BASE = "https://testpod.leapmile.com/nanostore/orders";
const FALLBACK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkzNTg5Mzk2OX0.dLn79HF199ETJQ3-GHHLcC3UkE31wt7CT_V7FjhKxrg";

type OrderMetadata = {
  qty?: number | null;
  badge?: string | null;
  item_id?: string | null;
  list_id?: string | null;
  list_status?: string | null;
  operator_id?: string | null;
};

export type OrderRecord = {
  metadata?: OrderMetadata | null;
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

async function getOrders(query: string): Promise<OrderRecord[]> {
  try {
    const token = process.env["LEAPMILE_API_TOKEN"] ?? FALLBACK_TOKEN;
    const res = await fetch(`${API_BASE}?${query}`, {
      headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { records?: OrderRecord[] };
    return json.records ?? [];
  } catch {
    return [];
  }
}

/** Trays still travelling — their lists are IN PROGRESS. */
export function fetchInProgressOrders() {
  return getOrders(
    "tray_status=inprogress&status=active&order_by_field=created_at&order_by_type=ASC"
  );
}

/** Trays that arrived at a station (e.g. "S-01") — READY candidates. */
export function fetchReadyOrders() {
  return getOrders(
    "tray_status=tray_ready_to_use&status=active&order_by_field=updated_at&order_by_type=ASC"
  );
}

/** "S-01" / "S-1-1-2-1" -> { side, station } */
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

/** Last 4 characters of the tray/shelf id, shown as "00-12". */
function shelfLabel(trayId: string | null): string {
  const raw = (trayId ?? "").replace(/[^A-Za-z0-9]/g, "").slice(-4).padStart(4, "0");
  return `${raw.slice(0, 2)}-${raw.slice(2)}`;
}

function listKey(order: OrderRecord) {
  return (
    order.metadata?.list_id ?? order.comment?.[0] ?? String(order.user_id ?? order.id)
  );
}

/**
 * Groups both feeds by list id. A list is READY only when none of its trays
 * are still in progress; otherwise it is IN PROGRESS.
 */
export function buildLists(
  inProgress: OrderRecord[],
  ready: OrderRecord[]
): TrackerList[] {
  const groups = new Map<string, { pending: OrderRecord[]; arrived: OrderRecord[] }>();

  const bucket = (key: string) => {
    let g = groups.get(key);
    if (!g) {
      g = { pending: [], arrived: [] };
      groups.set(key, g);
    }
    return g;
  };

  for (const o of inProgress) bucket(listKey(o)).pending.push(o);
  for (const o of ready) bucket(listKey(o)).arrived.push(o);

  const lists: TrackerList[] = [];

  for (const [key, group] of groups) {
    const all = [...group.arrived, ...group.pending];
    const first = all[0];
    if (!first) continue;

    const sides = emptySides();
    const stops: { station: number; shelf: string }[] = [];
    let station: string | null = null;

    for (const order of group.arrived) {
      const spot = locate(order);
      if (!spot) continue;
      sides[spot.side][slotIndex(spot.station)] = true;
      station ??= order.station_friendly_name ?? null;
      stops.push({
        station: spot.side === "A" ? spot.station : spot.station + STATIONS_PER_SIDE,
        shelf: shelfLabel(order.tray_id),
      });
    }

    const reached = group.arrived.length;
    const total = all.length;
    const isReady = group.pending.length === 0 && reached > 0;

    const budgetMin = all.find((o) => o.auto_complete_time != null)?.auto_complete_time ?? 5;
    let baseMs = 0;
    for (const o of all) {
      const t = Date.parse(o.updated_at ?? "");
      if (Number.isFinite(t) && t > baseMs) baseMs = t;
    }
    const deadline = isReady ? (baseMs > 0 ? baseMs : Date.now()) + budgetMin * 60_000 : null;

    const anchorId = all.reduce((min, o) => Math.min(min, o.id), Number.MAX_SAFE_INTEGER);

    lists.push({
      id: `list-${key}`,
      listId: first.metadata?.list_id ?? first.comment?.[0] ?? String(anchorId).padStart(9, "0"),
      listLetter: first.metadata?.badge ?? "A",
      operatorId: first.metadata?.operator_id ?? first.comment?.[1] ?? "",
      kind: anchorId % 2 === 0 ? "pick" : "put",
      status: isReady ? "ready" : "inprogress",
      deadline,
      station,
      reached,
      total,
      sides,
      stops: stops.sort((a, b) => a.station - b.station),
    });
  }

  return lists.sort((a, b) => {
    if (a.status !== b.status) return a.status === "ready" ? -1 : 1;
    return b.listId.localeCompare(a.listId);
  });
}
