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
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload = (await request.json()) as Payload;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tokens, error: tokenError } = await supabase
      .from("admin_push_tokens")
      .select("id, token")
      .eq("is_active", true);

    if (tokenError) throw tokenError;

    const record = payload.record || {};

    const orderNumber = String(record.order_number || "");
    const orderSource = String(
      record.order_source || "",
    ).toLowerCase();

    const rawOrderType = String(
      record.order_type ||
        record.delivery_type ||
        "order",
    ).toLowerCase();

    const isPosSale =
      orderSource === "pos" ||
      String(record.pos_receipt_no || "").trim() !== "" ||
      String(record.queue_no || "").trim() !== "";

    const isDelivery =
      !isPosSale && rawOrderType === "delivery";

    const isPickup =
      !isPosSale && rawOrderType === "pickup";

    const orderType = isPosSale
      ? "POS SALE"
      : isDelivery
        ? "DELIVERY"
        : isPickup
          ? "PICKUP"
          : "ORDER";

    const customer = String(
      record.customer_name || "Guest",
    );

    const total = Number(
      record.total || record.grand_total || 0,
    );

    const queueNo = String(record.queue_no || "");
    const cashier = String(record.cashier || "");
    const address = String(record.address || "");
    const landmark = String(record.landmark || "");

    const paymentMethod = String(
      record.payment_method || "",
    ).toUpperCase();

    const title = payload.test
      ? payload.title || "SYP ON CAFÉ Test Alert"
      : isDelivery
        ? "🚨 DELIVERY ORDER — RIDER NEEDED"
        : isPosSale
          ? "New POS Sale"
          : isPickup
            ? "New Pickup Order"
            : `New ${orderType} Order`;

    const body = payload.test
      ? payload.body || "Push notifications are working."
      : `${orderNumber || "New order"} • ${customer} • ₱${total.toLocaleString(
          "en-PH",
        )}`;

    const url =
      payload.url ||
      (orderNumber
        ? `/admin?order=${encodeURIComponent(orderNumber)}`
        : "/admin");

    // Firebase push notification
let sent = 0;
let failed = 0;
let firebaseError: string | null = null;

try {
  const firebaseServiceAccount =
    Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");

  const projectId =
    Deno.env.get("FIREBASE_PROJECT_ID");

  if (!firebaseServiceAccount) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_JSON secret.",
    );
  }

  if (!projectId) {
    throw new Error(
      "Missing FIREBASE_PROJECT_ID secret.",
    );
  }

  const auth = new GoogleAuth({
    credentials: JSON.parse(firebaseServiceAccount),
    scopes: [
      "https://www.googleapis.com/auth/firebase.messaging",
    ],
  });

  const accessToken = await auth.getAccessToken();

  if (!accessToken) {
    throw new Error(
      "Unable to generate Firebase access token.",
    );
  }

  for (const row of tokens ?? []) {
    try {
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
              notification: {
                title,
                body,
              },
              data: {
                url,
                order_number: orderNumber,
                order_type: orderType,
                order_source: orderSource,
                priority: payload.test
                  ? "normal"
                  : "high",
                tag:
                  orderNumber ||
                  `syp-${Date.now()}`,
              },
              webpush: {
                headers: {
                  Urgency: payload.test
                    ? "normal"
                    : "high",
                },
                fcm_options: {
                  link: url,
                },
                notification: {
                  icon:
                    "/brand/syp-logo-clean-v2.webp",
                  badge:
                    "/brand/syp-logo-clean-v2.webp",
                  requireInteraction: !payload.test,
                },
              },
            },
          }),
        },
      );

      if (response.ok) {
        sent++;
      } else {
        failed++;

        console.error(
          "Firebase push failed:",
          response.status,
          await response.text(),
        );
      }
    } catch (pushError) {
      failed++;

      console.error(
        "Individual Firebase push failed:",
        pushError,
      );
    }
  }
} catch (firebaseCause) {
  firebaseError =
    firebaseCause instanceof Error
      ? firebaseCause.message
      : "Unknown Firebase error";

  console.error(
    "Firebase notification skipped:",
    firebaseError,
  );

  // IMPORTANT:
  // Huwag mag-throw dito para magpatuloy sa Telegram.
}

    // Telegram notification
    const telegramBotToken = Deno.env.get(
      "TELEGRAM_BOT_TOKEN",
    );

    const telegramChatId = Deno.env.get(
      "TELEGRAM_CHAT_ID",
    );

    let telegramSent = false;
    let telegramError: string | null = null;

    if (telegramBotToken && telegramChatId) {
      const telegramText = payload.test
        ? [
            "🔔 SYP ON CAFÉ TEST ALERT",
            "",
            body,
          ].join("\n")
        : isDelivery
          ? [
              "🚨🚨🚨 RED ALERT: DELIVERY ORDER 🚨🚨🚨",
              "",
              `🧾 Order: ${orderNumber || "New order"}`,
              `👤 Customer: ${customer}`,
              `📍 Address: ${
                address || "No address provided"
              }`,
              landmark
                ? `📌 Landmark: ${landmark}`
                : "",
              paymentMethod
                ? `💳 Payment: ${paymentMethod}`
                : "",
              `💰 Total: ₱${total.toLocaleString(
                "en-PH",
              )}`,
              "",
              "🛵 RIDER NEEDED — CHECK AND ACCEPT ASAP",
              "",
              "👉 Open Admin Dashboard",
              "https://syponcafe.shop/admin",
            ]
              .filter(Boolean)
              .join("\n")
          : isPosSale
            ? [
                "🧾 NEW SYP ON CAFÉ POS SALE",
                "",
                `🧾 Receipt: ${
                  orderNumber || "New sale"
                }`,
                `👤 Customer: ${customer}`,
                queueNo
                  ? `🔢 Queue: ${queueNo}`
                  : "",
                cashier
                  ? `👨‍💼 Cashier: ${cashier}`
                  : "",
                paymentMethod
                  ? `💳 Payment: ${paymentMethod}`
                  : "",
                `💰 Total: ₱${total.toLocaleString(
                  "en-PH",
                )}`,
                "",
                "👉 Open Admin Dashboard",
                "https://syponcafe.shop/admin",
              ]
                .filter(Boolean)
                .join("\n")
            : [
                "🟡 NEW SYP ON CAFÉ PICKUP ORDER",
                "",
                `🧾 Order: ${
                  orderNumber || "New order"
                }`,
                `👤 Customer: ${customer}`,
                paymentMethod
                  ? `💳 Payment: ${paymentMethod}`
                  : "",
                `💰 Total: ₱${total.toLocaleString(
                  "en-PH",
                )}`,
                "",
                "👉 Open Admin Dashboard",
                "https://syponcafe.shop/admin",
              ]
                .filter(Boolean)
                .join("\n");

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        telegramError =
          await telegramResponse.text();

        console.error(
          "Telegram send failed:",
          telegramResponse.status,
          telegramError,
        );
      }
    }

    // Notification history
    const { error: logError } = await supabase
      .from("admin_notification_log")
      .insert({
        notification_type: payload.test
          ? "test"
          : "new_order",
        title,
        body,
        order_id:
          typeof record.id === "number"
            ? record.id
            : null,
        order_number: orderNumber || null,
        data: {
          url,
          order_type: orderType,
          order_source: orderSource,
          is_pos_sale: isPosSale,
          is_delivery: isDelivery,
          is_pickup: isPickup,
          pos_receipt_no: String(
            record.pos_receipt_no || "",
          ),
          queue_no: queueNo,
          cashier,
          customer,
          address,
          landmark,
          payment_method: paymentMethod,
          total,
          telegram_sent: telegramSent,
        },
        sent_count: sent,
        failed_count: failed,
      });

    if (logError) {
      console.error(
        "Notification log insert failed:",
        logError,
      );
    }

    return Response.json(
      {
        ok: true,
        sent,
        failed,
        firebase_error: firebaseError,
        telegram_sent: telegramSent,
        telegram_error: telegramError,
        order_type: orderType,
        order_source: orderSource,
        is_pos_sale: isPosSale,
        is_delivery: isDelivery,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("send-admin-push failed:", error);

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown push error",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});