import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STEADFAST_BASE = "https://portal.packzy.com/api/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });
    }

    let API_KEY = Deno.env.get("STEADFAST_API_KEY");
    let SECRET_KEY = Deno.env.get("STEADFAST_SECRET_KEY");

    try {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: settingsData } = await serviceClient
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "api_keys")
        .maybeSingle();

      if (settingsData?.setting_value?.steadfast_api_key) {
        API_KEY = settingsData.setting_value.steadfast_api_key;
      }
      if (settingsData?.setting_value?.steadfast_secret_key) {
        SECRET_KEY = settingsData.setting_value.steadfast_secret_key;
      }
    } catch (_) {}

    if (!API_KEY || !SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Steadfast API keys not configured." }), { status: 500, headers: corsHeaders });
    }

    const steadfastHeaders = {
      "Api-Key": API_KEY,
      "Secret-Key": SECRET_KEY,
      "Content-Type": "application/json",
    };

    const body = await req.json();
    const { action, ...params } = body;

    let result;

    switch (action) {
      case "create_order": {
        const response = await fetch(`${STEADFAST_BASE}/create_order`, {
          method: "POST",
          headers: steadfastHeaders,
          body: JSON.stringify({
            invoice: params.invoice,
            recipient_name: params.recipient_name,
            recipient_phone: params.recipient_phone,
            recipient_address: params.recipient_address,
            cod_amount: params.cod_amount,
            note: params.note || "",
            item_description: params.item_description || "",
          }),
        });
        result = await response.json();

        if (result.status === 200 && result.consignment) {
          const serviceClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          await serviceClient.from("orders").update({
            status: "shipped",
            notes: JSON.stringify({
              ...JSON.parse(params.original_notes || "{}"),
              courier: "steadfast",
              consignment_id: result.consignment.consignment_id,
              tracking_code: result.consignment.tracking_code,
              courier_status: result.consignment.status,
            }),
          }).eq("id", params.order_id);
        }
        break;
      }

      case "cancel_order": {
        // Cancel from Steadfast by consignment_id
        const response = await fetch(`${STEADFAST_BASE}/cancel_order`, {
          method: "POST",
          headers: steadfastHeaders,
          body: JSON.stringify({ consignment_id: params.consignment_id }),
        });
        result = await response.json();
        break;
      }

      case "check_status": {
        const endpoint = params.consignment_id
          ? `/status_by_cid/${params.consignment_id}`
          : params.tracking_code
          ? `/status_by_trackingcode/${params.tracking_code}`
          : `/status_by_invoice/${params.invoice}`;

        const response = await fetch(`${STEADFAST_BASE}${endpoint}`, {
          method: "GET",
          headers: steadfastHeaders,
        });
        result = await response.json();
        break;
      }

      case "get_balance": {
        const response = await fetch(`${STEADFAST_BASE}/get_balance`, {
          method: "GET",
          headers: steadfastHeaders,
        });
        result = await response.json();
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
