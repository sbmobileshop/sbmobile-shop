import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function orderConfirmationHtml(order: any, items: any[], siteUrl: string): string {
  const itemRows = items.map((i: any) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${i.name}</td>
     <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px">${i.qty}</td>
     <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px">৳${(i.qty * i.price).toLocaleString()}</td></tr>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#1d3557,#457b9d);padding:28px 24px;text-align:center">
    <h1 style="color:#fff;font-size:22px;margin:0">SB Mobile Shop</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:6px 0 0">Order Confirmation</p>
  </div>
  <div style="padding:24px">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px">
      <p style="color:#16a34a;font-size:16px;font-weight:700;margin:0">✅ অর্ডার সফলভাবে রিসিভ হয়েছে!</p>
      <p style="color:#15803d;font-size:12px;margin:6px 0 0">আপনার পেমেন্ট যাচাই করা হচ্ছে</p>
    </div>
    <table style="width:100%;font-size:13px;margin-bottom:16px">
      <tr><td style="color:#888;padding:4px 0">Order ID</td><td style="font-weight:600;text-align:right">#${order.id.slice(0, 8).toUpperCase()}</td></tr>
      <tr><td style="color:#888;padding:4px 0">Date</td><td style="text-align:right">${new Date(order.created_at).toLocaleString("bn-BD")}</td></tr>
      <tr><td style="color:#888;padding:4px 0">Payment</td><td style="text-align:right;text-transform:uppercase">${order.payment_method}</td></tr>
      <tr><td style="color:#888;padding:4px 0">TrxID</td><td style="font-weight:600;text-align:right">${order.transaction_id}</td></tr>
      <tr><td style="color:#888;padding:4px 0">Phone</td><td style="text-align:right">${order.customer_phone}</td></tr>
      ${order.address ? `<tr><td style="color:#888;padding:4px 0">Address</td><td style="text-align:right">${order.address}</td></tr>` : ""}
    </table>
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      <thead><tr style="background:#f8f8f8">
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:#555">Product</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:#555">Qty</th>
        <th style="padding:8px 12px;text-align:right;font-size:12px;color:#555">Price</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    ${order.delivery_charge ? `<div style="display:flex;justify-content:space-between;padding:8px 12px;font-size:13px"><span style="color:#888">Delivery</span><span>৳${order.delivery_charge}</span></div>` : ""}
    ${order.discount ? `<div style="display:flex;justify-content:space-between;padding:8px 12px;font-size:13px;color:#16a34a"><span>Discount</span><span>-৳${order.discount}</span></div>` : ""}
    <div style="border-top:2px solid #e2136e;margin-top:8px;padding:12px;display:flex;justify-content:space-between;font-weight:700;font-size:16px">
      <span>Total</span><span style="color:#e2136e">৳${order.amount.toLocaleString()}</span>
    </div>
    <div style="margin-top:20px;text-align:center">
      <a href="${siteUrl}/order-success?id=${order.id}" style="display:inline-block;background:#e2136e;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        📦 Track Order
      </a>
    </div>
  </div>
  <div style="background:#f8f8f8;padding:16px;text-align:center;font-size:11px;color:#999">
    <p style="margin:0">Thank you for shopping with SB Mobile Shop</p>
    <p style="margin:4px 0 0">📞 01773243748</p>
  </div>
</div></body></html>`;
}

function incompleteOrderHtml(order: any, siteUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:28px 24px;text-align:center">
    <h1 style="color:#fff;font-size:22px;margin:0">SB Mobile Shop</h1>
    <p style="color:rgba(255,255,255,0.9);font-size:12px;margin:6px 0 0">Order Reminder</p>
  </div>
  <div style="padding:24px">
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px">
      <p style="color:#d97706;font-size:18px;margin:0">⏰ আপনার অর্ডারটি অসম্পূর্ণ!</p>
      <p style="color:#92400e;font-size:13px;margin:8px 0 0">Order #${order.id.slice(0, 8).toUpperCase()} এখনও পেন্ডিং আছে</p>
    </div>
    <p style="font-size:14px;color:#444;line-height:1.6;margin-bottom:16px">
      প্রিয় ${order.customer_name},<br><br>
      আপনার ৳${order.amount.toLocaleString()} এর অর্ডারটি এখনও confirmed হয়নি। 
      যদি পেমেন্ট করে থাকেন, দয়া করে TrxID জানান। 
      অন্যথায়, অর্ডারটি সম্পন্ন করুন।
    </p>
    <div style="text-align:center;margin-top:20px">
      <a href="${siteUrl}/order-success?id=${order.id}" style="display:inline-block;background:#d97706;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        🔄 অর্ডার দেখুন
      </a>
    </div>
    <p style="font-size:12px;color:#888;text-align:center;margin-top:16px">
      কোনো সমস্যা? 📞 01773243748 এ কল করুন
    </p>
  </div>
</div></body></html>`;
}

function trackingEmailHtml(order: any, trackingCode: string, siteUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:28px 24px;text-align:center">
    <h1 style="color:#fff;font-size:22px;margin:0">SB Mobile Shop</h1>
    <p style="color:rgba(255,255,255,0.9);font-size:12px;margin:6px 0 0">Shipping Update</p>
  </div>
  <div style="padding:24px">
    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px">
      <p style="color:#7c3aed;font-size:18px;font-weight:700;margin:0">🚚 আপনার অর্ডার শিপ হয়েছে!</p>
    </div>
    <p style="font-size:14px;color:#444;line-height:1.6">
      প্রিয় ${order.customer_name},<br><br>
      আপনার অর্ডার #${order.id.slice(0, 8).toUpperCase()} কুরিয়ারে হস্তান্তর করা হয়েছে।
    </p>
    <div style="background:#f8f8f8;border-radius:12px;padding:16px;margin:16px 0;text-align:center">
      <p style="color:#888;font-size:12px;margin:0 0 6px">Tracking Code</p>
      <p style="font-size:20px;font-weight:800;color:#7c3aed;margin:0;letter-spacing:2px">${trackingCode}</p>
    </div>
    <div style="text-align:center;margin-top:20px">
      <a href="https://steadfast.com.bd/t/${trackingCode}" target="_blank" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-right:8px">
        🔍 Track Shipment
      </a>
      <a href="${siteUrl}/order-success?id=${order.id}" style="display:inline-block;background:#e2136e;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px">
        📦 Order Details
      </a>
    </div>
  </div>
  <div style="background:#f8f8f8;padding:16px;text-align:center;font-size:11px;color:#999">
    <p style="margin:0">SB Mobile Shop | 📞 01773243748</p>
  </div>
</div></body></html>`;
}

function digitalDeliveryHtml(order: any, digitalItems: any[], template: any, siteUrl: string): string {
  const t = template || {};
  const heading = (t.heading || "ডিজিটাল প্রোডাক্ট ডেলিভারি")
    .replace(/{order_id}/g, order.id.slice(0, 8).toUpperCase())
    .replace(/{customer_name}/g, order.customer_name);
  const bodyText = (t.body_text || "প্রিয় {customer_name},\n\nআপনার পেমেন্ট সফলভাবে ভেরিফাই হয়েছে!")
    .replace(/{customer_name}/g, order.customer_name)
    .replace(/{order_id}/g, order.id.slice(0, 8).toUpperCase())
    .replace(/\n/g, "<br>");
  const buttonText = t.button_text || "ডাউনলোড করুন";
  const footerText = (t.footer_text || "ধন্যবাদ!")
    .replace(/{customer_name}/g, order.customer_name);

  const digitalItemsHtml = digitalItems.map((item: any) => {
    const productName = item.product_name || item.name || "Digital Product";
    const fileUrl = item.digital_file_url || "";
    const note = item.digital_note || "";
    return `
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px;margin-bottom:12px">
        <h3 style="margin:0 0 8px;font-size:15px;color:#0369a1">📦 ${productName}</h3>
        ${note ? `<div style="background:#fff;border-radius:8px;padding:12px;margin-bottom:10px;font-size:13px;color:#444;white-space:pre-wrap;border:1px solid #e0e7ff">${note}</div>` : ""}
        ${fileUrl ? `<a href="${fileUrl}" target="_blank" style="display:inline-block;background:#0284c7;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px">📥 ${buttonText}</a>` : ""}
      </div>
    `;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#0369a1,#0ea5e9);padding:28px 24px;text-align:center">
    <h1 style="color:#fff;font-size:22px;margin:0">SB Mobile Shop</h1>
    <p style="color:rgba(255,255,255,0.9);font-size:12px;margin:6px 0 0">${heading}</p>
  </div>
  <div style="padding:24px">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px">
      <p style="color:#16a34a;font-size:18px;font-weight:700;margin:0">✅ পেমেন্ট ভেরিফাইড!</p>
    </div>
    <p style="font-size:14px;color:#444;line-height:1.6;margin-bottom:16px">${bodyText}</p>
    ${digitalItemsHtml}
    <div style="margin-top:16px;padding:12px;background:#fefce8;border:1px solid #fde68a;border-radius:8px;text-align:center;font-size:12px;color:#92400e">
      ${footerText}
    </div>
    <div style="margin-top:20px;text-align:center">
      <a href="${siteUrl}/order-success?id=${order.id}" style="display:inline-block;background:#e2136e;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        📋 Order Details
      </a>
    </div>
  </div>
  <div style="background:#f8f8f8;padding:16px;text-align:center;font-size:11px;color:#999">
    <p style="margin:0">SB Mobile Shop | 📞 01773243748</p>
  </div>
</div></body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    const { action, orderId, siteUrl } = await req.json();
    if (!orderId) throw new Error("orderId required");

    const { data: order, error: orderErr } = await supabase
      .from("orders").select("*").eq("id", orderId).single();
    if (orderErr || !order) throw new Error("Order not found");

    const email = order.customer_email;
    if (!email) {
      return new Response(JSON.stringify({ success: false, message: "No email on order" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let items: any[] = [];
    try {
      const parsed = order.notes ? JSON.parse(order.notes as string) : {};
      items = parsed.items || [];
    } catch {}

    if (items.length === 0 && order.items_data) {
      try {
        items = Array.isArray(order.items_data) ? order.items_data : [];
      } catch {}
    }

    const baseUrl = siteUrl || "https://id-preview--997585a9-4ed8-48ac-9b7c-64572765ed75.lovable.app";
    let subject = "";
    let html = "";

    switch (action) {
      case "order_confirmation": {
        subject = `✅ Order Confirmed — #${order.id.slice(0, 8).toUpperCase()} | SB Mobile Shop`;
        html = orderConfirmationHtml(order, items, baseUrl);
        break;
      }
      case "incomplete_reminder": {
        subject = `⏰ অর্ডার অসম্পূর্ণ — #${order.id.slice(0, 8).toUpperCase()} | SB Mobile Shop`;
        html = incompleteOrderHtml(order, baseUrl);
        break;
      }
      case "tracking_update": {
        let trackingCode = "";
        try {
          const parsed = order.notes ? JSON.parse(order.notes as string) : {};
          trackingCode = parsed.tracking_code || "";
        } catch {}
        if (!trackingCode) throw new Error("No tracking code found");
        subject = `🚚 অর্ডার শিপ হয়েছে — #${order.id.slice(0, 8).toUpperCase()} | SB Mobile Shop`;
        html = trackingEmailHtml(order, trackingCode, baseUrl);
        break;
      }
      case "digital_delivery": {
        // Fetch digital product info for items in this order
        const { data: orderItems } = await supabase
          .from("order_items").select("product_id, product_name, quantity, price").eq("order_id", orderId);
        
        let digitalItems: any[] = [];
        if (orderItems && orderItems.length > 0) {
          const productIds = orderItems.filter(oi => oi.product_id).map(oi => oi.product_id);
          if (productIds.length > 0) {
            const { data: products } = await supabase
              .from("products").select("id, name, product_type, digital_file_url, digital_note").in("id", productIds);
            if (products) {
              digitalItems = products
                .filter((p: any) => p.product_type === "digital")
                .map((p: any) => ({
                  product_name: p.name,
                  digital_file_url: p.digital_file_url,
                  digital_note: p.digital_note,
                }));
            }
          }
        }

        // Also check items_data for digital info
        if (digitalItems.length === 0 && items.length > 0) {
          digitalItems = items.filter((i: any) => i.digital_file_url || i.digital_note).map((i: any) => ({
            product_name: i.name,
            digital_file_url: i.digital_file_url || "",
            digital_note: i.digital_note || "",
          }));
        }

        // Fetch email template from settings
        let template = null;
        const { data: templateData } = await supabase
          .from("site_settings").select("setting_value").eq("setting_key", "digital_email_template").maybeSingle();
        if (templateData?.setting_value) template = templateData.setting_value;

        const tpl = template as any || {};
        subject = (tpl.subject || `🎉 ডিজিটাল প্রোডাক্ট রেডি! — Order #{order_id}`)
          .replace(/{order_id}/g, order.id.slice(0, 8).toUpperCase())
          .replace(/{customer_name}/g, order.customer_name);
        html = digitalDeliveryHtml(order, digitalItems, template, baseUrl);
        break;
      }
      default:
        throw new Error("Invalid action: use order_confirmation, incomplete_reminder, tracking_update, digital_delivery");
    }

    if (LOVABLE_API_KEY) {
      const emailRes = await fetch("https://api.lovable.dev/v1/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          to: email,
          subject,
          html,
          from: "SB Mobile Shop <noreply@sbmobile.shop>",
        }),
      });

      if (!emailRes.ok) {
        console.log(`Email send attempted for ${email}, status: ${emailRes.status}`);
        await supabase.from("site_settings").upsert({
          setting_key: `email_log_${orderId}_${action}`,
          setting_value: { to: email, subject, action, status: "attempted", timestamp: new Date().toISOString() } as any,
        }, { onConflict: "setting_key" });
      }
    } else {
      console.log(`No LOVABLE_API_KEY, email for ${email} logged only`);
      await supabase.from("site_settings").upsert({
        setting_key: `email_log_${orderId}_${action}`,
        setting_value: { to: email, subject, action, status: "no_api_key", timestamp: new Date().toISOString() } as any,
      }, { onConflict: "setting_key" });
    }

    return new Response(JSON.stringify({ success: true, message: `Email ${action} sent to ${email}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Order email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
