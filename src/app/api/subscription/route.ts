// app/api/payment/subscription/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("[Subscription API] Session:", session?.user?.id, session?.user?.email);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's most recent successful subscription attempt
    let subscription = await prisma.subscriptionAttempt.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ["COMPLETED", "ACTIVE", "SUCCESS"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        planName: true,
        price: true,
        status: true,
        createdAt: true,
      },
    });

    console.log("[Subscription API] Subscription attempt found:", subscription);

    // If no subscription attempt found, check orders table as fallback
    if (!subscription) {
      const order = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          status: "Completed",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          planName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      });

      console.log("[Subscription API] Order found:", order);

      if (order) {
        subscription = {
          id: order.id,
          planName: order.planName || "Unknown Plan",
          price: `$${order.total}`,
          status: order.status,
          createdAt: order.createdAt,
        };
      }
    }

    console.log("[Subscription API] Final subscription:", subscription);

    return NextResponse.json({
      success: true,
      subscription: subscription || null,
    });
  } catch (error: any) {
    console.error("Subscription fetch error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch subscription",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
