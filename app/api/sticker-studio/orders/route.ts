
import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSupabase,
  hasStickerSession,
} from "@/lib/sticker-studio-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await hasStickerSession())) {
    return NextResponse.json(
      { error: "Please sign in to Sticker Studio." },
      { status: 401 }
    );
  }

  const search = (request.nextUrl.searchParams.get("q") ?? "")
    .trim()
    .slice(0, 100);

  const limit = 30;
  const supabase = getAdminSupabase();

  let query = supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      total,
      created_at,
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
    .eq("order_source", "pos")
    .eq("status", "completed")
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,customer_name.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Sticker order search failed:", error.message);

    return NextResponse.json(
      { error: "Unable to load POS orders." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    orders: (data ?? []).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name ?? "",
      total: Number(order.total ?? 0),
      createdAt: order.created_at,
      items: (order.order_items ?? []).map((item) => ({
        id: item.id,
        drink: item.product_name,
        size: item.size ?? "",
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? 0),
        lineTotal: Number(item.line_total ?? 0),
        temperature: item.temperature ?? "",
      })),
    })),
  });
}
