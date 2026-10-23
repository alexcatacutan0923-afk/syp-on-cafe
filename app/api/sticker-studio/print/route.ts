
import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSupabase,
  hasStickerSession,
} from "@/lib/sticker-studio-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBusinessDay() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  let year = Number(value.year);
  let month = Number(value.month);
  let day = Number(value.day);

  // Business day starts at 5:00 PM Manila time.
  if (Number(value.hour) < 17) {
    const previous = new Date(Date.UTC(year, month - 1, day - 1));
    year = previous.getUTCFullYear();
    month = previous.getUTCMonth() + 1;
    day = previous.getUTCDate();
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

export async function POST(request: NextRequest) {
  if (!(await hasStickerSession())) {
    return NextResponse.json(
      { error: "Please sign in to Sticker Studio." },
      { status: 401 }
    );
  }

  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const source = body?.source;
  const key =
    typeof body?.printJobKey === "string"
      ? body.printJobKey.trim()
      : "";
  const quantity = Number(body?.quantity ?? 1);

  if (
    !key ||
    key.length > 100 ||
    !["pos_order", "manual"].includes(source) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 200
  ) {
    return NextResponse.json(
      { error: "Invalid print job details." },
      { status: 400 }
    );
  }

  const supabase = getAdminSupabase();

  let orderId: number | null = null;
  let orderNumber: string | null = null;
  let customerName = "";
  let orderTotal: number | null = null;
  let items: any[] = [];

  if (source === "pos_order") {
    const id = Number(body?.orderId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "A valid POS order is required." },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        total,
        order_source,
        status,
        payment_status,
        order_items (
          id,
          product_name,
          size,
          quantity,
          price,
          line_total,
          temperature
        )
      `)
      .eq("id", id)
      .eq("order_source", "pos")
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .maybeSingle();

    if (error) {
      console.error("Sticker order lookup failed:", error.message);

      return NextResponse.json(
        { error: "Unable to verify the POS order." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Paid POS order not found." },
        { status: 404 }
      );
    }

    orderId = order.id;
    orderNumber = order.order_number;
    customerName = order.customer_name ?? "";
    orderTotal = Number(order.total ?? 0);
    items = (order.order_items ?? []).map((item) => ({
      drink: item.product_name,
      size: item.size ?? "",
      quantity: Number(item.quantity ?? 1),
      price: Number(item.price ?? 0),
      lineTotal: Number(item.line_total ?? 0),
      temperature: item.temperature ?? "",
    }));
  } else {
    // Manual sticker: keep only bounded, printable fields.
    const suppliedItems = Array.isArray(body?.items)
      ? body.items.slice(0, 50)
      : [];

    items = suppliedItems.map((item: any) => ({
      drink: String(item?.drink ?? "").slice(0, 100),
      size: String(item?.size ?? "").slice(0, 40),
      quantity: Math.max(
        1,
        Math.min(200, Number(item?.quantity) || 1)
      ),
      price: Math.max(0, Number(item?.price) || 0),
    }));

    customerName = String(body?.customerName ?? "").slice(0, 100);
    orderNumber = null;
    orderTotal = null;
  }

  // Keep the same key when retrying a request for the same print job.
  const { data: existing, error: existingError } = await supabase
    .from("pos_sticker_print_jobs")
    .select("id,reprint_count,quantity")
    .eq("print_job_key", key)
    .maybeSingle();

  if (existingError) {
    console.error("Sticker print lookup failed:", existingError.message);

    return NextResponse.json(
      { error: "Unable to check print history." },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();

  if (existing) {
    const { error } = await supabase
      .from("pos_sticker_print_jobs")
      .update({
        status: "requested",
        reprint_count: Number(existing.reprint_count ?? 0) + 1,
        quantity,
        last_print_requested_at: now,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Sticker reprint update failed:", error.message);

      return NextResponse.json(
        { error: "Unable to record reprint." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      printJobId: existing.id,
      reprint: true,
    });
  }

  const { data: inserted, error } = await supabase
    .from("pos_sticker_print_jobs")
    .insert({
      print_job_key: key,
      order_id: orderId,
      order_number: orderNumber,
      source,
      customer_name: customerName,
      items,
      order_total: orderTotal,
      business_day: getBusinessDay(),
      status: "requested",
      quantity,
      reprint_count: 0,
      last_print_requested_at: now,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Sticker print insert failed:", error.message);

    return NextResponse.json(
      { error: "Unable to record print job." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    printJobId: inserted.id,
    reprint: false,
  });
}
