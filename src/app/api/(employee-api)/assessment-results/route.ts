import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session: any | null = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user to check paid status
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        paid: true,
      },
    });

    const assessmentResults = await prisma.individualEmployeeReport.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // If user is not paid, return minimal data
    if (!user?.paid) {
      const minimalData = assessmentResults.map((result) => ({
        id: result.id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        userId: result.userId,
        geniusFactorScore: result.geniusFactorScore,
        geniusFactorProfileJson: {
          primary_genius_factor: (result.geniusFactorProfileJson as any)?.primary_genius_factor || "",
          secondary_genius_factor: (result.geniusFactorProfileJson as any)?.secondary_genius_factor || "",
          key_strengths: (result.geniusFactorProfileJson as any)?.key_strengths || [],
          description: (result.geniusFactorProfileJson as any)?.description || "",
          secondary_description: (result.geniusFactorProfileJson as any)?.secondary_description || "",
        },
        executiveSummary: result.executiveSummary,
      }));

      return NextResponse.json({
        data: minimalData,
      });
    }

    // Return full data for paid users
    return NextResponse.json({
      data: assessmentResults,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
