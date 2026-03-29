import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BkashConfig {
  bkash_app_key: string;
  bkash_app_secret: string;
  bkash_username: string;
  bkash_password: string;
  bkash_sandbox: boolean;
  enabled: boolean;
}

function getBaseUrl(sandbox: boolean): string {
  return sandbox
    ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    : "https://tokenized.pay.bka.sh/v1.2.0-beta";
}

async function grantToken(config: BkashConfig): Promise<string> {
  const base = getBaseUrl(config.bkash_sandbox);
  const res = await fetch(`${base}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: config.bkash_username,
      password: config.bkash_password,
    },
    body: JSON.stringify({
      app_key: config.bkash_app_key,
      app_secret: config.bkash_app_secret,
    }),
  });
  const data = await res.json();
  if (!data.id_token) throw new Error(data.statusMessage || "Token grant failed");
  return data.id_token;
}

async function createPayment(config: BkashConfig, token: string, amount: string, orderId: string, callbackUrl: string) {
  const base = getBaseUrl(config.bkash_sandbox);
  const res = await fetch(`${base}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      "X-APP-Key": config.bkash_app_key,
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: orderId,
      callbackURL: callbackUrl,
      amount,
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: orderId.slice(0, 20),
    }),
  });
  return await res.json();
}

async function executePayment(config: BkashConfig, token: string, paymentID: string) {
  const base = getBaseUrl(config.bkash_sandbox);
  const res = await fetch(`${base}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      "X-APP-Key": config.bkash_app_key,
    },
    body: JSON.stringify({ paymentID }),
  });
  return await res.json();
}

async function queryPayment(config: BkashConfig, token: string, paymentID: string) {
  const base = getBaseUrl(config.bkash_sandbox);
  const res = await fetch(`${base}/tokenized/checkout/payment/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      "X-APP-Key": config.bkash_app_key,
    },
    body: JSON.stringify({ paymentID }),
  });
  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get bKash config from site_settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "payment_gateway")
      .single();

    if (!settingsData?.setting_value) {
      throw new Error("bKash gateway not configured");
    }

    const config = settingsData.setting_value as unknown as BkashConfig;
    if (!config.enabled) throw new Error("bKash gateway is disabled");

    const body = await req.json();
    const { action } = body;

    const token = await grantToken(config);

    let result;

    switch (action) {
      case "create": {
        const { amount, orderId, callbackUrl } = body;
        if (!amount || !orderId || !callbackUrl) throw new Error("Missing amount, orderId, or callbackUrl");
        result = await createPayment(config, token, String(amount), orderId, callbackUrl);
        break;
      }
      case "execute": {
        const { paymentID } = body;
        if (!paymentID) throw new Error("Missing paymentID");
        result = await executePayment(config, token, paymentID);

        // If payment successful, update order
        if (result.statusCode === "0000" && result.transactionStatus === "Completed") {
          const { orderId: oid } = body;
          if (oid) {
            await supabase.from("orders").update({
              transaction_id: result.trxID,
              status: "confirmed",
              payment_method: "bkash_pgw",
              notes: JSON.stringify({
                ...(await getExistingNotes(supabase, oid)),
                bkash_payment: {
                  paymentID: result.paymentID,
                  trxID: result.trxID,
                  amount: result.amount,
                  customerMsisdn: result.customerMsisdn,
                },
              }),
            }).eq("id", oid);
          }
        }
        break;
      }
      case "query": {
        const { paymentID } = body;
        if (!paymentID) throw new Error("Missing paymentID");
        result = await queryPayment(config, token, paymentID);
        break;
      }
      default:
        throw new Error("Invalid action. Use: create, execute, query");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("bKash error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getExistingNotes(supabase: any, orderId: string) {
  try {
    const { data } = await supabase.from("orders").select("notes").eq("id", orderId).single();
    return data?.notes ? JSON.parse(data.notes) : {};
  } catch {
    return {};
  }
}
