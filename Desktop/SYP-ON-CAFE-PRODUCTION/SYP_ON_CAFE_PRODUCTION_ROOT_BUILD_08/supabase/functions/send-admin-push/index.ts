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

  if (request.method !== "POST") {
    return Response.json(
      {
        ok: false,
        error: "Method not allowed",
      },
      {
        status: 405,
        headers: corsHeaders,
      },
    );
  }

  try {
    const payload = (await request.json()) as Payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Missing Supabase server environment variables.",
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const { data: tokens, error: tokenError } =
      await supabase
        .from("admin_push_tokens")
        .select("id, token")
        .eq("is_active", true);

    if (tokenError) throw tokenError;

    const record = payload.record || {};

    const orderNumber = String(
      record.order_number || "",
    );

    const orderType = String(
      record.order_type ||
        record.delivery_type ||
        "Order",
    );

    const customer = String(
      record.customer_name || "Guest",
    );

    const total = Number(
      record.total ||
        record.grand_total ||
        0,
    );

    const title = payload.test
      ? payload.title || "SYP ON CAFÉ Test Alert"
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

    const serviceAccountJson = Deno.env.get(
      "FIREBASE_SERVICE_ACCOUNT_JSON",
    );

    const projectId = Deno.env.get(
      "FIREBASE_PROJECT_ID",
    );

    if (!serviceAccountJson || !projectId) {
      throw new Error(
        "Missing Firebase Edge Function secrets.",
      );
    }

    const auth = new GoogleAuth({
      credentials: JSON.parse(serviceAccountJson),
      scopes: [
        "https://www.googleapis.com/auth/firebase.messaging",
      ],
    });

    const accessToken = await auth.getAccessToken();

    if (!accessToken) {
      throw new Error(
        "Unable to obtain Firebase access token.",
      );
    }

    let sent = 0;
    let failed = 0;
    const invalidTokenIds: string[] = [];

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
              notification: {
                title,
                body,
              },
              data: {
                url,
                order_number: orderNumber,
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
        sent += 1;
        continue;
      }

      failed += 1;

      const errorText = await response.text();

      console.error(
        "FCM send failed:",
        response.status,
        errorText,
      );

      if (
        errorText.includes("UNREGISTERED") ||
        errorText.includes(
          "registration-token-not-registered",
        )
      ) {
        invalidTokenIds.push(row.id);
      }
    }

    if (invalidTokenIds.length) {
      await supabase
        .from("admin_push_tokens")
        .update({
          is_active: false,
        })
        .in("id", invalidTokenIds);
    }

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
          customer,
          total,
        },
        sent_count: sent,
        failed_count: failed,
      });

    if (logError) {
      console.error(
        "Unable to save notification log:",
        logError,
      );
    }

    return Response.json(
      {
        ok: true,
        sent,
        failed,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error(
      "send-admin-push failed:",
      error,
    );

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