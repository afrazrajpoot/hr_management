import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return existing token if still valid
    if (user.fastApiToken && user.fastApiTokenExpiry && user.fastApiTokenExpiry > new Date()) {
      return NextResponse.json({ token: user.fastApiToken });
    }

    // Generate new FastAPI token
    const fastApiUrl = process.env.NEXT_PUBLIC_PYTHON_URL;
    const fastApiResponse = await fetch(`${fastApiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email,
        role: user.role,
        hr_id: user.hrId,
        first_name: user.firstName,
        last_name: user.lastName,
      }),
    });

    if (!fastApiResponse.ok) {
      console.error("FastAPI login failed:", await fastApiResponse.text());
      return NextResponse.json({ error: "FastAPI unavailable" }, { status: 502 });
    }

    const { token } = await fastApiResponse.json();

    // Store the new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        fastApiToken: token,
        fastApiTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating FastAPI token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { fastApiToken: true, fastApiTokenExpiry: true },
    });

    if (!user?.fastApiToken || !user.fastApiTokenExpiry || user.fastApiTokenExpiry < new Date()) {
      return NextResponse.json({ token: null, expired: true });
    }

    return NextResponse.json({ token: user.fastApiToken, expired: false });
  } catch (error) {
    console.error("Error fetching FastAPI token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
