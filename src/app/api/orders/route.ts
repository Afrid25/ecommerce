import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { createOrder, getOrderList } from "@/lib/commerce";
import { checkoutSchema } from "@/lib/validators";
import { isDatabaseConfigured } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const internalProbe = req.headers.get("x-internal-probe") === "1";

    if (internalProbe) {
      if (!isDatabaseConfigured()) {
        return NextResponse.json({ available: false, error: "Database unavailable" }, { status: 503 });
      }

      return NextResponse.json({ available: true });
    }

    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    const status = searchParams.get("status") || undefined;
    const source = searchParams.get("source") || undefined;

    return NextResponse.json(await getOrderList({ status, source }));
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid order payload" },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    if (payload.source === "manual") {
      const { response } = await requireAdmin();
      if (response) {
        return response;
      }
    }

    if (
      payload.source === "online" &&
      !["cod", "bkash", "nagad"].includes(payload.paymentMethod)
    ) {
      return NextResponse.json(
        { error: "Online orders must use Cash on Delivery, bKash, or Nagad." },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customerName: payload.customerName,
      customerEmail: payload.customerEmail || undefined,
      phone: payload.phone,
      address: payload.address,
      paymentMethod: payload.paymentMethod,
      source: payload.source,
      notes: payload.notes,
      items: payload.items,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("PRODUCT_NOT_FOUND:")) {
      const productId = error.message.split(":")[1];
      return NextResponse.json(
        { error: `Product with ID ${productId} was not found.` },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const [, productName, stock] = error.message.split(":");
      return NextResponse.json(
        { error: `${productName} does not have enough stock. Only ${stock} left.` },
        { status: 409 }
      );
    }

    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
