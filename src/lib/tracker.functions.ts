import { createServerFn } from "@tanstack/react-start";
import { buildLists, fetchInProgressOrders, fetchReadyOrders } from "./tracker.server";

export const getTrackerLists = createServerFn({ method: "GET" }).handler(async () => {
  const [inProgress, ready] = await Promise.all([
    fetchInProgressOrders(),
    fetchReadyOrders(),
  ]);
  const lists = buildLists(inProgress, ready);
  return { lists, live: lists.length > 0 };
});
