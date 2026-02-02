import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * Improved executive summary extraction
 */
function extractExecutiveSummary(summary: string | null): string {
  if (!summary) return "";

  try {
    // Check if it's already a string that looks like plain text
    if (!summary.includes('"') && !summary.includes("'") && summary.length > 50) {
      return summary;
    }

    // Try to parse as JSON first (it might be a JSON string)
    try {
      const parsed = JSON.parse(summary);
      if (typeof parsed === 'string') {
        return parsed;
      }
      if (typeof parsed === 'object' && parsed !== null) {
        // If it's an object, try to extract key text
        const values = Object.values(parsed).filter(v => typeof v === 'string');
        if (values.length > 0) {
          return values.join('\n\n');
        }
      }
    } catch {
      // Not JSON, continue with regex parsing
    }

    // Try multiple regex patterns to extract content
    const patterns = [
      // Pattern 1: Key-value pairs with quotes
      /['"]([^'"]+)['"]\s*:\s*['"]([\s\S]*?)['"](?=,\s*['"]|}$)/g,
      // Pattern 2: Key-value pairs without quotes on values
      /['"]([^'"]+)['"]\s*:\s*([^,}]+)(?=,|})/g,
      // Pattern 3: Direct text extraction (looks for paragraphs)
      /(['"])?executive_summary\1?\s*:\s*['"]([\s\S]*?)['"](?=,|$)/i,
      /(['"])?summary\1?\s*:\s*['"]([\s\S]*?)['"](?=,|$)/i
    ];

    for (const pattern of patterns) {
      pattern.lastIndex = 0; // Reset regex

      if (pattern.toString().includes('executive_summary') ||
        pattern.toString().includes('summary')) {
        const match = pattern.exec(summary);
        if (match && match[2]) {
          return match[2].trim();
        }
      } else {
        // For key-value extraction patterns
        let matches: string[] = [];
        let match;
        while ((match = pattern.exec(summary)) !== null) {
          const key = match[1];
          const value = match[2];

          // Look for executive summary related keys
          if (key.toLowerCase().includes('executive') ||
            key.toLowerCase().includes('summary')) {
            return value.trim();
          }

          // Collect all values as backup
          if (value && value.trim()) {
            matches.push(value.trim());
          }
        }

        if (matches.length > 0) {
          return matches.join('\n\n');
        }
      }
    }

    // If no pattern matched, return the raw text (cleaned up)
    return summary
      .replace(/['"{}\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  } catch (error) {
    console.error('Error extracting executive summary:', error);
    return summary || "";
  }
}

/**
 * Format JSON data to match Pydantic model structure
 */
const parseJsonField = (field: any) => {
  if (!field) return null;
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
};

function formatReportData(report: any) {

  const geniusFactorProfileJson = parseJsonField(report.geniusFactorProfileJson);
  const currentRoleAlignmentAnalysisJson = parseJsonField(report.currentRoleAlignmentAnalysisJson);
  const internalCareerOpportunitiesJson = parseJsonField(report.internalCareerOpportunitiesJson);
  const retentionAndMobilityStrategiesJson = parseJsonField(report.retentionAndMobilityStrategiesJson);
  const developmentActionPlanJson = parseJsonField(report.developmentActionPlanJson);
  const personalizedResourcesJson = parseJsonField(report.personalizedResourcesJson);
  const dataSourcesAndMethodologyJson = parseJsonField(report.dataSourcesAndMethodologyJson);
  const riskAnalysis = parseJsonField(report.risk_analysis);

  // Extract the executive summary properly
  const executiveSummary = extractExecutiveSummary(report.executiveSummary);

  // Create the report structure matching ProfessionalAssessmentReport Pydantic model
  const formattedReport = {
    id: report.id,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    userId: report.userId,
    hrId: report.hrId,
    departement: report.departement,

    // Executive summary (properly extracted)
    executive_summary: executiveSummary,

    // Core Scores - extracted from JSON fields
    genius_factor_score: report.geniusFactorScore,
    retention_risk_score: riskAnalysis?.scores?.retention_risk_score ||
      (currentRoleAlignmentAnalysisJson?.retention_risk_score !== undefined ?
        currentRoleAlignmentAnalysisJson.retention_risk_score : 50),
    mobility_opportunity_score: riskAnalysis?.scores?.mobility_opportunity_score ||
      (internalCareerOpportunitiesJson?.mobility_opportunity_score !== undefined ?
        internalCareerOpportunitiesJson.mobility_opportunity_score : 50),

    // Detailed Sections - structured to match Pydantic model
    genius_factor_profile: {
      primary_genius_factor: geniusFactorProfileJson?.primary_genius_factor || '',
      secondary_genius_factor: geniusFactorProfileJson?.secondary_genius_factor || null,
      key_strengths: geniusFactorProfileJson?.key_strengths || [],
      energy_sources: geniusFactorProfileJson?.energy_sources ||
        geniusFactorProfileJson?.energySources || [],
      development_areas: geniusFactorProfileJson?.development_areas || [],
      description: geniusFactorProfileJson?.description || ''
    },

    current_role_alignment_analysis: {
      alignment_score:
        currentRoleAlignmentAnalysisJson?.alignment_score ||
        currentRoleAlignmentAnalysisJson?.score ||
        50,
      retention_risk_level:
        currentRoleAlignmentAnalysisJson?.retention_risk_level ||
        riskAnalysis?.trends?.retention_trends ||
        "",
      strengths_utilized:
        currentRoleAlignmentAnalysisJson?.strengths_utilized || [],
      underutilized_talents:
        currentRoleAlignmentAnalysisJson?.underutilized_talents || [],
      retention_risk_factors:
        currentRoleAlignmentAnalysisJson?.retention_risk_factors || [],
      immediate_actions:
        currentRoleAlignmentAnalysisJson?.immediate_actions || [],
    },

    internal_career_opportunities: {
      primary_industries: internalCareerOpportunitiesJson?.primary_industries || [],
      secondary_industries: internalCareerOpportunitiesJson?.secondary_industries || [],
      recommended_departments: internalCareerOpportunitiesJson?.recommended_departments || [],
      role_suggestions: internalCareerOpportunitiesJson?.role_suggestions || [],
      transition_strategy: internalCareerOpportunitiesJson?.transition_strategy || ''
    },

    retention_and_mobility_strategies: {
      retention_strategies: retentionAndMobilityStrategiesJson?.retention_strategies || [],
      mobility_recommendations: retentionAndMobilityStrategiesJson?.mobility_recommendations || [],
      development_support_needed: retentionAndMobilityStrategiesJson?.development_support_needed || [],
      expected_outcomes: retentionAndMobilityStrategiesJson?.expected_outcomes || []
    },

    development_action_plan: {
      thirty_day_goals: developmentActionPlanJson?.thirty_day_goals || [],
      ninety_day_goals: developmentActionPlanJson?.ninety_day_goals || [],
      six_month_goals: developmentActionPlanJson?.six_month_goals || [],
      networking_strategy: developmentActionPlanJson?.networking_strategy || {}
    },

    personalized_resources: {
      affirmations: personalizedResourcesJson?.affirmations || [],
      learning_resources: personalizedResourcesJson?.learning_resources || [],
      reflection_questions: personalizedResourcesJson?.reflection_questions || [],
      mindfulness_practices: personalizedResourcesJson?.mindfulness_practices || []
    },

    data_sources_and_methodology: {
      assessment_data_used: dataSourcesAndMethodologyJson?.assessment_data_used || true,
      user_data_used: dataSourcesAndMethodologyJson?.user_data_used || true,
      static_context_used: dataSourcesAndMethodologyJson?.static_context_used || true,
      score_calculation_method: dataSourcesAndMethodologyJson?.score_calculation_method || ''
    },

    // Additional metadata
    generated_at: report.createdAt,
    report_version: "1.0",

    // Risk analysis from separate field
    risk_analysis: riskAnalysis || {}
  };

  return formattedReport;
}

export async function GET() {
  try {
    const session: any | null = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check paid status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { paid: true },
    });

    const assessmentResults = await prisma.individualEmployeeReport.findMany({
      where: { userId: session.user.id },
      // Explicitly select all fields for paid users
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        executiveSummary: true, // This is the field we need to extract from
        hrId: true,
        departement: true,
        geniusFactorScore: true,
        geniusFactorProfileJson: true,
        currentRoleAlignmentAnalysisJson: true,
        internalCareerOpportunitiesJson: true,
        retentionAndMobilityStrategiesJson: true,
        developmentActionPlanJson: true,
        personalizedResourcesJson: true,
        dataSourcesAndMethodologyJson: true,
        risk_analysis: true,
      },
    });

    // Debug: Log what we're getting from the database
    console.log('Database results:', {
      count: assessmentResults.length,
      firstResult: assessmentResults[0] ? {
        hasExecutiveSummary: !!assessmentResults[0].executiveSummary,
        summaryType: typeof assessmentResults[0].executiveSummary,
        summaryLength: assessmentResults[0].executiveSummary?.length,
        summaryPreview: assessmentResults[0].executiveSummary?.substring(0, 200)
      } : 'No results'
    });

    // 🔒 UNPAID USERS → LIMITED DATA (still formatted for Pydantic)
    if (!user?.paid) {
      const limitedData = assessmentResults.map((result) => {
        const profileJson = parseJsonField(result.geniusFactorProfileJson);
        const roleAnalysis = parseJsonField(
          result.currentRoleAlignmentAnalysisJson,
        );
        const internalCareerJson = parseJsonField(
          result.internalCareerOpportunitiesJson,
        );
        const riskAnalysis = parseJsonField(result.risk_analysis);

        return {
          id: result.id,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          userId: result.userId,
          hrId: result.hrId,
          departement: result.departement,

          // Core Scores (NOW REAL SCORES EVEN IF UNPAID)
          genius_factor_score: result.geniusFactorScore,
          retention_risk_score:
            riskAnalysis?.scores?.retention_risk_score ||
            (roleAnalysis?.retention_risk_score !== undefined
              ? roleAnalysis.retention_risk_score
              : roleAnalysis?.alignment_score || 50),
          mobility_opportunity_score:
            riskAnalysis?.scores?.mobility_opportunity_score ||
            (internalCareerJson?.mobility_opportunity_score !== undefined
              ? internalCareerJson.mobility_opportunity_score
              : 50),

          // Limited profile data
          genius_factor_profile: {
            primary_genius_factor: profileJson?.primary_genius_factor || "",
            secondary_genius_factor: profileJson?.secondary_genius_factor || null,
            key_strengths: profileJson?.key_strengths || [],
            energy_sources: [],
            development_areas: profileJson?.development_areas || [],
            description: ""
          },

          // Limited role alignment
          current_role_alignment_analysis: {
            alignment_score: roleAnalysis?.alignment_score || 50,
            retention_risk_level:
              roleAnalysis?.retention_risk_level ||
              riskAnalysis?.trends?.retention_trends ||
              "",
            strengths_utilized: [],
            underutilized_talents: [],
            retention_risk_factors: [],
            immediate_actions: [],
          },

          // Executive summary
          executive_summary: extractExecutiveSummary(result.executiveSummary),

          // Metadata
          generated_at: result.createdAt,
          report_version: "1.0",

          // Limited indicator
          _limited_access: true
        };
      });

      return NextResponse.json({
        reports: limitedData,
        paid: false,
        count: limitedData.length
      });
    }

    // 💎 PAID USERS → FULL DATA (formatted for Pydantic parser)
    const fullData = assessmentResults.map((result) =>
      formatReportData(result)
    );

    return NextResponse.json({
      reports: fullData,
      paid: true,
      count: fullData.length
    });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}