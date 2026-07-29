import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleAuth } from "npm:google-auth-library@9";

type Payload = {
  test?: boolean;
  title?: string;
  body?: string;
  url?: string;
  record?: Record<string, unknown>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const payload = (await request.json()) as Payload;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tokens, error } = await supabase
      .from("admin_push_tokens")
      .select("id, token")
      .eq("is_active", true);

    if (error) throw error;

    const record = payload.record || {};
    const orderNumber = String(record.order_number || "");
    const orderType = String(
      record.order_type || record.delivery_type || "Order",
    );
    const customer = String(record.customer_name || "Guest");
    const total = Number(record.total || record.grand_total || 0);

    const title = payload.test
      ? payload.title || "SYP ON CAFÉ Test Alert"
      : `New ${orderType} Order`;

    const body = payload.test
      ? payload.body || "Push notifications are working."
      : `${orderNumber || "New order"} • ${customer} • ₱${total.toLocaleString("en-PH")}`;

    const url =
      payload.url ||
      (orderNumber
        ? `/admin?order=${encodeURIComponent(orderNumber)}`
        : "/admin");

    // Firebase push
    const auth = new GoogleAuth({
      credentials: JSON.parse(
        Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON")!,
      ),
      scopes: [
        "https://www.googleapis.com/auth/firebase.messaging",
      ],
    });

    const accessToken = await auth.getAccessToken();
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID")!;

    let sent = 0;
    let failed = 0;

    for (const row of tokens ?? []) {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token: row.token,
              notification: { title, body },
              data: {
                url,
                order_number: orderNumber,
                priority: payload.test ? "normal" : "high",
                tag: orderNumber || `syp-${Date.now()}`,
              },
              webpush: {
                headers: {
                  Urgency: payload.test ? "normal" : "high",
                },
                fcm_options: { link: url },
                notification: {
                  icon: "/brand/syp-logo-clean-v2.webp",
                  badge: "/brand/syp-logo-clean-v2.webp",
                  requireInteraction: !payload.test,
                },
              },
            },
          }),
        },
      );

      response.ok ? sent++ : failed++;
    }

    // Telegram group chat
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");

    let telegramSent = false;
    let telegramError: string | null = null;

    if (telegramBotToken && telegramChatId) {
      const telegramText = payload.test
        ? ["🔔 SYP ON CAFÉ TEST ALERT", "", body].join("\n")
        : [
            "☕ NEW SYP ON CAFÉ ORDER",
            "",
            `🧾 Order: ${orderNumber || "New order"}`,
            `👤 Customer: ${customer}`,
            `🚚 Type: ${orderType}`,
            `💰 Total: ₱${total.toLocaleString("en-PH")}`,
            "",
            "👉 Open Admin Dashboard",
            "https://syponcafe.shop/admin",
          ].join("\n");

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramText,
            disable_web_page_preview: true,
          }),
        },
      );

      if (telegramResponse.ok) {
        telegramSent = true;
      } else {
        telegramError = await telegramResponse.text();
        console.error(
          "Telegram send failed:",
          telegramResponse.status,
          telegramError,
        );
      }
    }

    await supabase.from("admin_notification_log").insert({
      notification_type: payload.test ? "test" : "new_order",
      title,
      body,
      order_id: typeof record.id === "number" ? record.id : null,
      order_number: orderNumber || null,
      data: {
        url,
        order_type: orderType,
        customer,
        total,
        telegram_sent: telegramSent,
      },
      sent_count: sent,
      failed_count: failed,
    });

    return Response.json(
      {
        ok: true,
        sent,
        failed,
        telegram_sent: telegramSent,
        telegram_error: telegramError,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown push error",
      },
      { status: 500, headers: corsHeaders },
    );
  }
});