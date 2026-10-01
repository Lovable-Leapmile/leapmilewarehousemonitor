import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import { fetchWithRetry, UpstreamUnavailableError } from "./request.ts";

const noSleep = async () => undefined;

Deno.test("returns a successful order response without retrying", async () => {
  let calls = 0;
  const response = await fetchWithRetry("https://orders.example", {}, {
    fetchFn: async () => {
      calls += 1;
      return new Response(JSON.stringify({ records: [{ id: 1 }] }), { status: 200 });
    },
    sleepFn: noSleep,
  });

  assertEquals(response.status, 200);
  assertEquals(calls, 1);
});

Deno.test("passes through an empty 404 response without retrying", async () => {
  let calls = 0;
  const response = await fetchWithRetry("https://orders.example", {}, {
    fetchFn: async () => {
      calls += 1;
      return new Response(JSON.stringify({ message: "no records found" }), { status: 404 });
    },
    sleepFn: noSleep,
  });

  assertEquals(response.status, 404);
  assertEquals(calls, 1);
});

Deno.test("recovers after a transient connection failure", async () => {
  let calls = 0;
  const response = await fetchWithRetry("https://orders.example", {}, {
    fetchFn: async () => {
      calls += 1;
      if (calls === 1) throw new TypeError("connection reset");
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    },
    sleepFn: noSleep,
  });

  assertEquals(response.status, 200);
  assertEquals(calls, 2);
});

Deno.test("reports unavailable after the retry budget is exhausted", async () => {
  let calls = 0;

  await assertRejects(
    () => fetchWithRetry("https://orders.example", {}, {
      fetchFn: async () => {
        calls += 1;
        return new Response("temporary failure", { status: 503 });
      },
      sleepFn: noSleep,
    }),
    UpstreamUnavailableError,
  );

  assertEquals(calls, 3);
});