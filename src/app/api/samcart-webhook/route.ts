// app/api/samcart-webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming prisma client is initialized here

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Log the SamCart webhook notification
    console.log("SamCart Webhook Received:", JSON.stringify(body, null, 2));

    const eventType = body.type || body.event;
    const customerEmail = body.customer?.email;

    if (eventType === "Order" && customerEmail) {
      const orderData = body.order;
      const products = body.products || [];
      const totalAmount = parseFloat(orderData?.total || "0");
      const planName = products[0]?.name || "Unknown Plan";

      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email: customerEmail },
      });

      if (user) {
        // Update user status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            paid: true,
            amount: (user.amount || 0) + totalAmount,
          },
        });

        // Store the order details
        await prisma.order.upsert({
          where: { samcartOrderId: String(orderData.id) },
          update: {
            status: "Completed",
            total: totalAmount,
            transactionId: orderData.transaction_id?.[0] || null,
          },
          create: {
            samcartOrderId: String(orderData.id),
            customerEmail: customerEmail,
            total: totalAmount,
            status: "Completed",
            planName: planName,
            processor: orderData.processor || "Unknown",
            transactionId: orderData.transaction_id?.[0] || null,
            userId: user.id,
          },
        });

        console.log(`[SamCart Webhook] Successfully processed order ${orderData.id} for ${customerEmail}`);
      } else {
        console.warn(`[SamCart Webhook] User not found for email: ${customerEmail}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook processing failed", message: error.message }, { status: 400 });
  }
}