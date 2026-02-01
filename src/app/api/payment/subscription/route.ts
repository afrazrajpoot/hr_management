// app/api/payment/subscription/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's most recent successful subscription attempt
    const subscription = await prisma.subscriptionAttempt.findFirst({
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
