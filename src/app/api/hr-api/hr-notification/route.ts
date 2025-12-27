// app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";

// Set max duration for this route (30 seconds)
export const maxDuration = 30;

export async function GET(req: Request) {
  try {
    // Get session (HR info)
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // HR id comes from session
    const hrId = session.user.id;

    // Fetch notifications for this HR
    const notifications = await prisma.notification.findMany({
      where: { hrId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}




export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: updatedNotification,
    });
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
