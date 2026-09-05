import { queryOptions } from "@tanstack/react-query";
import { getTrackerLists } from "./tracker.functions";

export const trackerListsQuery = queryOptions({
  queryKey: ["tracker", "lists"],
  queryFn: () => getTrackerLists(),
  refetchInterval: 3_000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  staleTime: 0,
  gcTime: 60_000,
});
