// app/api/payment/create-order/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planName, price, checkoutUrl, email, firstName, lastName } = body;

    if (!checkoutUrl || !planName) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    // Build checkout URL with prefilled customer data
    const url = new URL(checkoutUrl);
    
    // Add customer information as query parameters
    if (email) {
      url.searchParams.append("email", email);
    }
    if (firstName) {
      url.searchParams.append("first_name", firstName);
    }
    if (lastName) {
      url.searchParams.append("last_name", lastName);
    }

    // Save to database for tracking
    const attempt = await prisma.subscriptionAttempt.create({
      data: {
        userId: session.user.id,
        planName,
        price: price || "$117.99",
        status: "INITIATED",
        metadata: {
          email: session.user.email,
          checkoutUrl: url.toString(),
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: url.toString(),
      attemptId: attempt.id,
    });

  } catch (error: any) {
    console.error("Payment initialization error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to initialize payment",
        message: error.message,
      }, 
      { status: 500 }
    );
  }
}