import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";

        if (!query) {
            return NextResponse.json({ suggestions: [] });
        }

        const role = session.user.role;
        let suggestions = [];

        if (role === "HR") {
            // HR searches for their employees
            suggestions = await prisma.user.findMany({
                where: {
                    hrId: session.user.id,
                    OR: [
                        { firstName: { contains: query, mode: "insensitive" } },
                        { lastName: { contains: query, mode: "insensitive" } },
                        { email: { contains: query, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
                take: 5,
            });
        } else if (role === "Admin") {
            // Admin searches for HR users
            suggestions = await prisma.user.findMany({
                where: {
                    role: "HR",
                    OR: [
                        { firstName: { contains: query, mode: "insensitive" } },
                        { lastName: { contains: query, mode: "insensitive" } },
                        { email: { contains: query, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
                take: 5,
            });
        }

        return NextResponse.json({ suggestions });
    } catch (error: any) {
        console.error("Error fetching search suggestions:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
