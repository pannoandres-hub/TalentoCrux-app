const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { to, subject, html } = await req.json();

    // Use Resend or similar email service
    // For now, we log and return success — email service can be configured later
    const apiKey = Deno.env.get("RESEND_API_KEY");

    if (apiKey) {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TalentoCrux <noreply@cruxtalento.com>",
          to: [to],
          subject,
          html,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Email send failed:", errText);
      }
    } else {
      console.log("[send-email] No RESEND_API_KEY configured. Email would send to:", to, "subject:", subject);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
