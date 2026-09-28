export const STATIONS_PER_SIDE = 24;
export const SIDES = ["A", "B"] as const;
export type Side = (typeof SIDES)[number];

export type ListKind = "pick" | "put";

export const LIST_KIND_LABEL: Record<ListKind, string> = {
  pick: "Picklist",
  put: "Putlist",
};

export type TrackerList = {
  id: string;
  listId: string;
  operatorId: string;
  /** Assigned list letter shown large on the card, e.g. "A", "B", "C" */
  listLetter: string;
  /** Picklist vs Putlist — placeholder until the feed exposes a type field */
  kind: ListKind;
  status: "ready" | "inprogress";

  /** absolute deadline epoch-ms — only for status "ready" */
  deadline: number | null;
  /** station friendly name where the shelf arrived, e.g. "S-03" */
  station: string | null;
  /** shelves that already reached a station — only for status "inprogress" */
  reached: number;
  total: number;
  /** length 24 per side, index 0 = station 24 … index 23 = station 01 */
  sides: Record<Side, boolean[]>;
  /** One entry per arrived tray; preserve its own station label and bin ID. */
  stops?: { orderId: number; station: number | null; stationName: string; binId: string }[];
};

export type PigeonHole = { letter: string; listIds: string[] };
