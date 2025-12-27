// app/api/generate-report/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Set max duration for report generation (60 seconds)
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();


    const {
      executive_summary,
      genius_factor_profile,
      current_role_alignment_analysis,
      internal_career_opportunities,
      retention_and_mobility_strategies,
      development_action_plan,
      personalized_resources,
      data_sources_and_methodology,
      genius_factor_score,
    } = body?.report || {};
    const report = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: body.userId },
      });

      return await tx.individualEmployeeReport.create({
        data: {
          userId: body.userId,
          hrId: user?.hrId,
          departement: user?.department?.at(-1) || "General",
          executiveSummary: executive_summary,
          geniusFactorProfileJson: genius_factor_profile,
          currentRoleAlignmentAnalysisJson: current_role_alignment_analysis,
          internalCareerOpportunitiesJson: internal_career_opportunities,
          retentionAndMobilityStrategiesJson: retention_and_mobility_strategies,
          developmentActionPlanJson: development_action_plan,
          personalizedResourcesJson: personalized_resources,
          dataSourcesAndMethodologyJson: data_sources_and_methodology,
          geniusFactorScore: genius_factor_score,
          risk_analysis: body.risk_analysis || {},
        },
      });
    });



    return NextResponse.json({ status: "success", report });
  } catch (error: any) {
    console.error("Error saving report:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
