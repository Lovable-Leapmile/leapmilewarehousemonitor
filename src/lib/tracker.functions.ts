import { createServerFn } from "@tanstack/react-start";
import { buildLists, fetchOrders } from "./tracker.server";

export const getTrackerLists = createServerFn({ method: "GET" }).handler(async () => {
  const records = await fetchOrders();
  const lists = buildLists(records);
  lists.sort((a, b) => {
    if (a.status !== b.status) return a.status === "ready" ? -1 : 1;
    return b.listId.localeCompare(a.listId);
  });
  return { lists, live: lists.length > 0 };
});
