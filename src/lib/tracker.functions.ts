import { createServerFn } from "@tanstack/react-start";
import {
  buildLists,
  buildPigeonHoles,
  fetchInProgressOrders,
  fetchPickReadyOrders,
  fetchReadyOrders,
} from "./tracker.server";

export const getTrackerLists = createServerFn({ method: "GET" }).handler(async () => {
  const [inProgress, ready, pickReady] = await Promise.all([
    fetchInProgressOrders(),
    fetchReadyOrders(),
    fetchPickReadyOrders(),
  ]);
  const lists = buildLists(inProgress, ready);
  const pigeonHoles = buildPigeonHoles(pickReady);
  return { lists, pigeonHoles, live: lists.length > 0 || pigeonHoles.length > 0 };
});
