"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp } from "lucide-react";

interface ReportModalProps {
  reports: any[];
  firstName: string;
  lastName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal = ({
  reports,
  firstName,
  lastName,
  isOpen,
  onClose,
}: ReportModalProps) => {
  const fullName = `${firstName}${lastName ? ` ${lastName}` : ""}`;
  const heading = `Reports for ${fullName}${reports.length > 0 ? ` (${reports.length})` : ""
    }`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            {heading}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {reports.length > 0 ? (
              reports.map((report: any) => (
                <div
                  key={report.id}
                  className="p-4 bg-muted/50 rounded-lg mb-4 last:mb-0 border border-border"
                >
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-base">
                        Report #{report.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created:{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-sm">Executive Summary</p>
                      <p className="text-sm">
                        {report.executiveSummary || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        Genius Factor Profile
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">Description:</span>{" "}
                          {report.geniusFactorProfileJson?.description || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Primary Genius Factor:
                          </span>{" "}
                          {report.geniusFactorProfileJson
                            ?.primary_genius_factor || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Key Strengths:</span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.geniusFactorProfileJson?.key_strengths || []
                          ).map((strength: string, i: number) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">Energy Sources:</span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.geniusFactorProfileJson?.energy_sources || []
                          ).map((source: string, i: number) => (
                            <li key={i}>{source}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Secondary Description:
                          </span>{" "}
                          {report.geniusFactorProfileJson
                            ?.secondary_description || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Secondary Genius Factor:
                          </span>{" "}
                          {report.geniusFactorProfileJson
                            ?.secondary_genius_factor === 'None Identified' ? "The primary genius factor is more dominant, as response did not indicate a secondary genius factor." : report.geniusFactorProfileJson.secondary_genius_factor || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        Current Role Alignment Analysis
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">Assessment:</span>{" "}
                          {report.currentRoleAlignmentAnalysisJson
                            ?.assessment || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Alignment Score:
                          </span>{" "}
                          {report.currentRoleAlignmentAnalysisJson
                            ?.alignment_score || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Strengths Utilized:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.currentRoleAlignmentAnalysisJson
                              ?.strengths_utilized || []
                          ).map((strength: string, i: number) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Underutilized Talents:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.currentRoleAlignmentAnalysisJson
                              ?.underutilized_talents || []
                          ).map((talent: string, i: number) => (
                            <li key={i}>{talent}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Retention Risk Level:
                          </span>{" "}
                          {report.currentRoleAlignmentAnalysisJson
                            ?.alignment_score || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        Internal Career Opportunities
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">
                            Short-Term Pathway:
                          </span>{" "}
                          {report.internalCareerOpportunitiesJson
                            ?.career_pathways?.short_term || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Long-Term Pathway:
                          </span>{" "}
                          {report.internalCareerOpportunitiesJson
                            ?.career_pathways?.long_term || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Primary Industry:
                          </span>{" "}
                          {report.internalCareerOpportunitiesJson
                            ?.primary_industry || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Secondary Industry:
                          </span>{" "}
                          {report.internalCareerOpportunitiesJson
                            ?.secondary_industry || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Transition Timeline:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          <li>
                            6 Months:{" "}
                            {report.internalCareerOpportunitiesJson
                              ?.transition_timeline?.six_month || "N/A"}
                          </li>
                          <li>
                            1 Year:{" "}
                            {report.internalCareerOpportunitiesJson
                              ?.transition_timeline?.one_year || "N/A"}
                          </li>
                          <li>
                            2 Years:{" "}
                            {report.internalCareerOpportunitiesJson
                              ?.transition_timeline?.two_years || "N/A"}
                          </li>
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Recommended Departments:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.internalCareerOpportunitiesJson
                              ?.recommended_departments || []
                          ).map((dept: string, i: number) => (
                            <li key={i}>{dept}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Specific Role Suggestions:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.internalCareerOpportunitiesJson
                              ?.specific_role_suggestions || []
                          ).map((role: string, i: number) => (
                            <li key={i}>{role}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Required Skill Development:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.internalCareerOpportunitiesJson
                              ?.required_skill_development || []
                          ).map((skill: string, i: number) => (
                            <li key={i}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        Retention and Mobility Strategies
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">
                            Development Support:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.retentionAndMobilityStrategiesJson
                              ?.development_support || []
                          ).map((support: string, i: number) => (
                            <li key={i}>{support}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Retention Strategies:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.retentionAndMobilityStrategiesJson
                              ?.retention_strategies || []
                          ).map((strategy: string, i: number) => (
                            <li key={i}>{strategy}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Internal Mobility Recommendations:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.retentionAndMobilityStrategiesJson
                              ?.internal_mobility_recommendations || []
                          ).map((recommendation: string, i: number) => (
                            <li key={i}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        Development Action Plan
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">30-Day Goals:</span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.developmentActionPlanJson
                              ?.thirty_day_goals || []
                          ).map((goal: string, i: number) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">90-Day Goals:</span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.developmentActionPlanJson
                              ?.ninety_day_goals || []
                          ).map((goal: string, i: number) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">6-Month Goals:</span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.developmentActionPlanJson?.six_month_goals ||
                            []
                          ).map((goal: string, i: number) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Networking Strategy:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.developmentActionPlanJson
                              ?.networking_strategy || []
                          ).map((strategy: string, i: number) => (
                            <li key={i}>{strategy}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        Personalized Resources
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">Affirmations:</span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.personalizedResourcesJson?.affirmations || []
                          ).map((affirmation: string, i: number) => (
                            <li key={i}>{affirmation}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Learning Resources:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.personalizedResourcesJson
                              ?.learning_resources || []
                          ).map((resource: string, i: number) => (
                            <li key={i}>{resource}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Reflection Questions:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.personalizedResourcesJson
                              ?.reflection_questions || []
                          ).map((question: string, i: number) => (
                            <li key={i}>{question}</li>
                          ))}
                        </ul>
                        <p>
                          <span className="font-semibold">
                            Mindfulness Practices:
                          </span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.personalizedResourcesJson
                              ?.mindfulness_practices || []
                          ).map((practice: string, i: number) => (
                            <li key={i}>{practice}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        Data Sources and Methodology
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">Methodology:</span>{" "}
                          {report.dataSourcesAndMethodologyJson?.methodology ||
                            "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Data Sources:</span>
                        </p>
                        <ul className="list-disc pl-5">
                          {(
                            report.dataSourcesAndMethodologyJson
                              ?.data_sources || []
                          ).map((source: string, i: number) => (
                            <li key={i}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No reports available.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
