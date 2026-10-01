import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { fetchWithRetry, UpstreamUnavailableError } from "./request.ts";

const ALLOWED_FILTERS = new Set([
  "tray_status",
  "status",
  "list_status",
  "order_by_field",
  "order_by_type",
]);

const BodySchema = z.object({
  query: z.record(z.string()).optional().default({}),
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid order query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(parsed.data.query)) {
      if (ALLOWED_FILTERS.has(key)) params.set(key, value);
    }

    const token = Deno.env.get("LEAPMILE_API_TOKEN");
    if (!token) throw new Error("LEAPMILE_API_TOKEN is not configured");

    const response = await fetchWithRetry(
      `https://multirobot1.leapmile.com/nanostore/orders?${params.toString()}`,
      { headers: { accept: "application/json", Authorization: `Bearer ${token}` } },
    );
    const payload = await response.text();

    // Leapmile uses 404 to mean that this valid filter currently has no rows.
    // Return an empty successful feed so polling continues without a runtime error.
    if (response.status === 404) {
      return new Response(JSON.stringify({ status: "success", status_code: 200, count: 0, records: [] }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(payload, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const unavailable = error instanceof UpstreamUnavailableError;

    // A temporary upstream outage is a valid polling state, not a function
    // failure. Returning 200 lets the client retain its last successful feed
    // without the platform reporting a runtime error or blanking the board.
    if (unavailable) {
      return new Response(JSON.stringify({
        status: "degraded",
        status_code: 200,
        count: 0,
        records: [],
        unavailable: true,
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(JSON.stringify({
      error: "Request failed",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});