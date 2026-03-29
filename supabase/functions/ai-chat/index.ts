import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, language, shop_name } = await req.json();

    const systemPrompt = `You are a helpful AI assistant for ${shop_name || "SB Mobile Shop"}, a mobile phone and accessories shop in Bangladesh. 
You help customers with:
- Product inquiries (phones, accessories, gadgets)
- Order status questions
- Pricing information
- General support

Rules:
- Be friendly and professional
- ${language === "bn" ? "Reply in Bangla (বাংলা)" : "Reply in English"}
- Keep responses concise (under 100 words)
- If you don't know something specific, suggest they contact support via WhatsApp or live chat
- Never make up product prices or availability`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    // Use Lovable AI proxy
    const response = await fetch("https://lovable.dev/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(
      JSON.stringify({ reply: "Sorry, something went wrong. Please try again." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
