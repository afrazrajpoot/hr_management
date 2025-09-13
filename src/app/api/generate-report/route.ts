// app/api/generate-report/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("====================================");
    console.log(body, "request body");
    console.log("====================================");
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
    const user = await prisma.user.findUnique({
      where: {
        id: body.userId,
      },
    });

    console.log("====================================");
    console.log(user, "user");
    console.log("====================================");

    const report = await prisma.individualEmployeeReport.create({
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

    console.log("====================================");
    console.log(report, "saved report");
    console.log("====================================");

    return NextResponse.json({ status: "success", report });
  } catch (error: any) {
    console.error("Error saving report:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
