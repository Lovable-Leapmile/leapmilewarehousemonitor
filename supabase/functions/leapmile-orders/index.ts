const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const queries = {
  inprogress:
    "tray_status=inprogress&status=active&order_by_field=created_at&order_by_type=ASC",
  ready:
    "tray_status=tray_ready_to_use&status=active&order_by_field=updated_at&order_by_type=ASC",
  "pick-ready":
    "tray_status=completed&status=inactive&list_status=ready_to_pick&order_by_field=updated_at&order_by_type=ASC",
} as const;

type Feed = keyof typeof queries;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feed } = (await request.json()) as { feed?: Feed };
    if (!feed || !(feed in queries)) {
      return new Response(JSON.stringify({ message: "Invalid order feed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = Deno.env.get("LEAPMILE_API_TOKEN");
    if (!token) throw new Error("Warehouse API token is not configured");

    const response = await fetch(
      `https://multirobot1.leapmile.com/nanostore/orders?${queries[feed]}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const body = await response.text();

    // The warehouse API uses 404 to mean a valid, currently empty feed.
    // Normalize only that documented response so polling stays successful;
    // genuine upstream failures still retain their original status code.
    if (response.status === 404) {
      let payload: { message?: string; status?: string } | null = null;
      try {
        payload = JSON.parse(body) as { message?: string; status?: string };
      } catch {
        payload = null;
      }

      if (payload?.message?.toLowerCase() === "no records found") {
        return new Response(
          JSON.stringify({
            status: "success",
            status_code: 200,
            count: 0,
            records: [],
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    return new Response(body, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Order request failed";
    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});