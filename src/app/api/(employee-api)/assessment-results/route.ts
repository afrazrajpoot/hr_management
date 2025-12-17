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

    // If user is not paid, return limited data including weakness and alignment score
    if (!user?.paid) {
      const minimalData = assessmentResults.map((result) => {
        const profileJson = result.geniusFactorProfileJson as any;
        const roleAnalysis = result.currentRoleAlignmentAnalysisJson as any;

        // Extract alignment score - assuming it's stored in currentRoleAlignmentAnalysisJson
        // You might need to adjust this based on your actual data structure
        const alignmentScore = roleAnalysis?.alignment_score ||
          roleAnalysis?.score ||
          roleAnalysis?.overall_score ||
          null;

        return {
          id: result.id,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          userId: result.userId,
          geniusFactorScore: result.geniusFactorScore,
          alignmentScore: alignmentScore, // Add alignment score here
          geniusFactorProfileJson: {
            primary_genius_factor: profileJson?.primary_genius_factor || "",
            secondary_genius_factor: profileJson?.secondary_genius_factor || "",
            key_strengths: profileJson?.key_strengths || [],
            weakness: profileJson?.weakness || profileJson?.weaknesses || [],
            description: profileJson?.description || "",
            secondary_description: profileJson?.secondary_description || "",
          },
          executiveSummary: result.executiveSummary,
        };
      });

      return NextResponse.json({
        data: minimalData,
        paid: false,
      });
    }

    // Return full data for paid users
    return NextResponse.json({
      data: assessmentResults,
      paid: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}