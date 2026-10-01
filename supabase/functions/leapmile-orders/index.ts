const ALLOWED_FILTERS = new Set([
  "tray_status",
  "status",
  "list_status",
  "order_by_field",
  "order_by_type",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as { query?: Record<string, string> };
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(body.query ?? {})) {
      if (ALLOWED_FILTERS.has(key) && typeof value === "string") params.set(key, value);
    }

    const token = Deno.env.get("LEAPMILE_API_TOKEN");
    if (!token) throw new Error("LEAPMILE_API_TOKEN is not configured");

    const response = await fetch(
      `https://multirobot1.leapmile.com/nanostore/orders?${params.toString()}`,
      { headers: { accept: "application/json", Authorization: `Bearer ${token}` } },
    );
    const payload = await response.text();

    return new Response(payload, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Request failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});