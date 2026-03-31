import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { createOrder, getOrderList, OrderFlowError } from "@/lib/commerce";
import { checkoutSchema } from "@/lib/validators";
import {
  getDatabaseConfigurationMessage,
  isDatabaseConfigured,
} from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const internalProbe = req.headers.get("x-internal-probe") === "1";
    const mine = searchParams.get("mine") === "1";

    if (internalProbe) {
      if (!isDatabaseConfigured()) {
        return NextResponse.json({ available: false, error: "Database unavailable" }, { status: 503 });
      }

      return NextResponse.json({ available: true });
    }

    if (mine) {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json(await getOrderList({ userId: session.user.id }));
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
      return NextResponse.json(
        {
          success: false,
          code: "DATABASE_ERROR",
          message: getDatabaseConfigurationMessage(),
        },
        { status: 503 }
      );
    }

    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid order payload",
        },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const validItems = payload.items.filter(
      (item) => Number.isInteger(item.productId) && item.productId > 0 && Number.isInteger(item.quantity) && item.quantity > 0
    );

    if (validItems.length === 0) {
      return NextResponse.json(
        { success: false, code: "INVALID_CART", message: "Your cart is empty" },
        { status: 400 }
      );
    }

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
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Online orders must use Cash on Delivery, bKash, or Nagad.",
        },
        { status: 400 }
      );
    }

    const session =
      payload.source === "online"
        ? await auth.api.getSession({
            headers: req.headers,
          })
        : null;

    console.info("[ORDER_ATTEMPT]", {
      user: session?.user?.id ?? "guest",
      cartItems: validItems.length,
    });

    const order = await createOrder({
      customerName: payload.customerName,
      customerEmail: payload.customerEmail || undefined,
      phone: payload.phone,
      address: payload.address,
      paymentMethod: payload.paymentMethod,
      source: payload.source,
      notes: payload.notes,
      userId: session?.user?.id ?? null,
      items: validItems,
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.orderId,
        status: order.orderStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof OrderFlowError) {
      const details =
        error.details && typeof error.details === "object"
          ? (error.details as Record<string, unknown>)
          : {};
      const isReachabilityIssue = details.reachabilityIssue === true;
      const envLoaded =
        details.config
        && typeof details.config === "object"
        && (details.config as Record<string, unknown>).envLoaded === true;
      const formatValid =
        details.config
        && typeof details.config === "object"
        && (details.config as Record<string, unknown>).formatValid === true;

      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,
          ...details,
        },
        {
          status:
            error.code === "INSUFFICIENT_STOCK"
              ? 409
              : error.code === "INVALID_CART"
                ? 400
                : error.code === "VALIDATION_ERROR"
                  ? 400
                  : error.code === "DATABASE_ERROR" && (!envLoaded || !formatValid || isReachabilityIssue)
                    ? 503
                  : 500,
        }
      );
    }

    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        code: "DATABASE_ERROR",
        message: "Failed to create order",
      },
      { status: 500 }
    );
  }
}
