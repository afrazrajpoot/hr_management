import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PDFReport from "../employee/PDFReport";

const AssessmentDetailsModal = ({ assessment, isOpen, onClose }: any) => {
  if (!assessment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto rounded-lg p-0 card scrollbar-hide card">
        {/* Header Section */}
        <DialogHeader className="card p-8 rounded-t-lg">
          <DialogTitle className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-lg flex items-center justify-center shadow-lg border">
              <span className="text-3xl font-bold">{assessment.avatar}</span>
            </div>
            <div className="flex-1">
              <div className="text-4xl font-bold mb-2">
                <p>{assessment.employee}</p>
              </div>
              <div className="text-lg font-medium flex items-center gap-2">
                <span>{assessment.position}</span>
                <span className="w-1 h-1 rounded-full"></span>
                <span>{assessment.department}</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="mt-4 text-lg">
            Comprehensive assessment insights and personalized career roadmap
          </DialogDescription>
          <div className="w-full max-w-[10vw]">
            <PDFReport assessment={assessment.report} />
          </div>
        </DialogHeader>

        {/* Content Section */}
        <div className="p-8 space-y-8">
          {/* Assessment Summary */}
          <Card className="card shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="card border-b p-6">
              <CardTitle className="text-2xl font-bold">
                <p> Assessment Overview</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-4 rounded-lg border">
                  <div className="text-xs uppercase tracking-wide font-semibold mb-2">
                    Status
                  </div>
                  <div className="text-lg font-bold">{assessment.status}</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-xs uppercase tracking-wide font-semibold mb-2">
                    Completion
                  </div>
                  <div className="text-lg font-bold">
                    {assessment.completionRate}%
                  </div>
                </div>
                {assessment.status === "Completed" && (
                  <>
                    <div className="p-4 rounded-lg border-2">
                      <div className="text-xs uppercase tracking-wide font-semibold mb-2">
                        Genius Score
                      </div>
                      <div className="text-2xl font-bold">
                        {assessment?.genius_factor_score}
                        /100
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="text-xs uppercase tracking-wide font-semibold mb-2">
                        Completed
                      </div>
                      <div className="text-lg font-bold">
                        {assessment.dateCompleted}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 rounded-lg border">
                <div className="text-sm uppercase tracking-wide font-semibold mb-3">
                  Executive Summary
                </div>
                <p>{assessment.executiveSummary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Genius Factor Profile */}
          {assessment.status === "Completed" && (
            <Card className="shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold">
                  <p> Genius Factor Profile</p>
                </CardTitle>
                <CardDescription>
                  <p> Your unique cognitive strengths and natural talents</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border">
                      <p className="text-sm uppercase tracking-wide font-semibold mb-3">
                        Primary Genius Factor
                      </p>
                      <p className="text-xl font-bold mb-4">
                        {assessment.geniusFactorProfile.primary_genius_factor}
                      </p>
                      <p className="leading-relaxed">
                        {assessment.geniusFactorProfile.description}
                      </p>
                    </div>

                    {assessment.geniusFactorProfile.secondary_genius_factor && (
                      <div className="p-6 rounded-lg border">
                        <p className="text-sm uppercase tracking-wide font-semibold mb-3">
                          Secondary Genius Factor
                        </p>
                        <div className="text-lg font-bold mb-3">
                          {
                            assessment.geniusFactorProfile
                              .secondary_genius_factor === 'None Identified' ? "The primary genius factor is more dominant, as response did not indicate a secondary genius factor." : assessment.geniusFactorProfile.secondary_genius_factor
                          }
                        </div>
                        {assessment.geniusFactorProfile
                          .secondary_description && (
                            <p className="leading-relaxed">
                              {
                                assessment.geniusFactorProfile
                                  .secondary_description
                              }
                            </p>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border">
                      <p className="text-sm uppercase tracking-wide font-semibold mb-4">
                        Key Strengths
                      </p>
                      <div className="space-y-3">
                        {assessment.geniusFactorProfile.key_strengths.map(
                          (strength: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
                              <span>
                                <p> {strength}</p>
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                        Energy Sources
                      </div>
                      <div className="space-y-3">
                        {assessment.geniusFactorProfile.energy_sources.map(
                          (source: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{source}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Role Alignment */}
          {assessment.status === "Completed" && (
            <Card className="border shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="border-b p-6">
                <CardTitle className="text-2xl font-bold">
                  Current Role Alignment
                </CardTitle>
                <CardDescription>
                  How well your current role matches your genius factor
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-3">
                        Assessment Overview
                      </div>
                      <p className="leading-relaxed">
                        {assessment.currentRoleAlignment.assessment}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-lg border">
                        <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                          Strengths Utilized
                        </div>
                        <div className="space-y-2">
                          {assessment.currentRoleAlignment.strengths_utilized.map(
                            (strength: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                                <span className="text-sm">{strength}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="p-6 rounded-lg border">
                        <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                          Underutilized Talents
                        </div>
                        <div className="space-y-2">
                          {assessment.currentRoleAlignment.underutilized_talents.map(
                            (talent: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                                <span className="text-sm">{talent}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border-2 text-center">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-2">
                        Alignment Score
                      </div>
                      <div className="text-4xl font-bold mb-2">
                        {assessment.currentRoleAlignment.alignment_score}%
                      </div>
                      <div className="w-full rounded-full h-3 bg-opacity-30">
                        <div
                          className="h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${assessment.currentRoleAlignment.alignment_score}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-3">
                        Retention Risk Level
                      </div>
                      <div className="text-lg font-bold">
                        {assessment.currentRoleAlignment.retention_risk_level}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Career Opportunities */}
          {assessment.status === "Completed" && (
            <Card className="border shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="border-b p-6">
                <CardTitle className="text-2xl font-bold">
                  Career Opportunities
                </CardTitle>
                <CardDescription>
                  Strategic pathways for professional growth
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                        Career Pathways
                      </div>
                      <div className="space-y-4">
                        {Object.entries(
                          assessment.careerOpportunities.career_pathways
                        ).map(([track, path]: any, index) => (
                          <div key={index}>
                            <div className="text-xs font-medium mb-1">
                              {track.toUpperCase()}
                            </div>
                            <p>{path}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border">
                        <div className="text-xs uppercase tracking-wide font-semibold mb-2">
                          Primary Industry
                        </div>
                        <div className="font-bold">
                          {assessment.careerOpportunities.primary_industry}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border">
                        <div className="text-xs uppercase tracking-wide font-semibold mb-2">
                          Secondary Industry
                        </div>
                        <div className="font-bold">
                          {assessment.careerOpportunities.secondary_industry}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="space-y-6">
                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                        Transition Timeline
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="text-xs font-bold px-3 py-1 rounded-full min-w-[60px] text-center">
                            6M
                          </div>
                          <p className="text-sm">
                            {
                              assessment.careerOpportunities
                                .transition_timeline["6_months"]
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="text-xs font-bold px-3 py-1 rounded-full min-w-[60px] text-center">
                            1Y
                          </div>
                          <p className="text-sm">
                            {
                              assessment.careerOpportunities
                                .transition_timeline["1_year"]
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="text-xs font-bold px-3 py-1 rounded-full min-w-[60px] text-center">
                            2Y
                          </div>
                          <p className="text-sm">
                            {
                              assessment.careerOpportunities
                                .transition_timeline["2_years"]
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-lg border">
                    <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                      Recommended Departments
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assessment.careerOpportunities.recommended_departments.map(
                        (dept: any, index: any) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-sm font-medium border"
                          >
                            {dept}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border">
                    <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                      Role Suggestions
                    </div>
                    <div className="space-y-2">
                      {assessment.careerOpportunities.specific_role_suggestions.map(
                        (role: any, index: any) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                            <span className="text-sm">{role}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border">
                  <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                    Required Skill Development
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {assessment.careerOpportunities.required_skill_development.map(
                      (skill: any, index: any) => (
                        <div key={index} className="p-3 rounded-lg border">
                          <span className="text-sm font-medium">{skill}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Retention Strategies */}
          {assessment.status === "Completed" && (
            <Card className="border shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="border-b p-6">
                <CardTitle className="text-2xl font-bold">
                  Retention & Mobility Strategies
                </CardTitle>
                <CardDescription>
                  Strategies to maximize engagement and growth
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-6 rounded-lg border">
                    <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                      Development Support
                    </div>
                    <div className="space-y-3">
                      {assessment.retentionStrategies.development_support.map(
                        (support: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                            <span className="text-sm">{support}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border">
                    <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                      Retention Strategies
                    </div>
                    <div className="space-y-3">
                      {assessment.retentionStrategies.retention_strategies.map(
                        (strategy: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                            <span className="text-sm">{strategy}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border">
                    <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                      Mobility Recommendations
                    </div>
                    <div className="space-y-3">
                      {assessment.retentionStrategies.internal_mobility_recommendations.map(
                        (recommendation: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                            <span className="text-sm">{recommendation}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Development Action Plan */}
          {assessment.status === "Completed" && (
            <Card className="border shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="border-b p-6">
                <CardTitle className="text-2xl font-bold">
                  Development Action Plan
                </CardTitle>
                <CardDescription>
                  Your personalized roadmap to success
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold bg-opacity-80">
                          30
                        </div>
                        <div className="text-sm uppercase tracking-wide font-semibold">
                          Day Goals
                        </div>
                      </div>
                      <div className="space-y-3">
                        {assessment.developmentPlan.thirty_day_goals.map(
                          (goal: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                              <span className="text-sm">{goal}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold bg-opacity-80">
                          90
                        </div>
                        <div className="text-sm uppercase tracking-wide font-semibold">
                          Day Goals
                        </div>
                      </div>
                      <div className="space-y-3">
                        {assessment.developmentPlan.ninety_day_goals.map(
                          (goal: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                              <span className="text-sm">{goal}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold bg-opacity-80">
                          6M
                        </div>
                        <div className="text-sm uppercase tracking-wide font-semibold">
                          Month Goals
                        </div>
                      </div>
                      <div className="space-y-3">
                        {assessment.developmentPlan.six_month_goals.map(
                          (goal: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                              <span className="text-sm">{goal}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                        Networking Strategy
                      </div>
                      <div className="space-y-3">
                        {assessment.developmentPlan.networking_strategy.map(
                          (strategy: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"></div>
                              <span className="text-sm">{strategy}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personalized Resources */}
          {assessment.status === "Completed" && (
            <Card className="border shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="border-b p-6">
                <CardTitle className="text-2xl font-bold">
                  Personalized Resources
                </CardTitle>
                <CardDescription>
                  Tools and practices to support your growth journey
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                        Daily Affirmations
                      </div>
                      <div className="space-y-3">
                        {assessment.personalizedResources.affirmations.map(
                          (affirmation: string, index: number) => (
                            <div key={index} className="p-3 rounded-lg border">
                              <span className="text-sm italic">
                                "{affirmation}"
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                        Learning Resources
                      </div>
                      <div className="space-y-3">
                        {assessment.personalizedResources.learning_resources.map(
                          (resource: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{resource}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                        Reflection Questions
                      </div>
                      <div className="space-y-3">
                        {assessment.personalizedResources.reflection_questions.map(
                          (question: string, index: number) => (
                            <div key={index} className="p-4 rounded-lg border">
                              <span className="text-sm font-medium">
                                {question}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border">
                      <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                        Mindfulness Practices
                      </div>
                      <div className="space-y-3">
                        {assessment.personalizedResources.mindfulness_practices.map(
                          (practice: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                              <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-opacity-80">
                                {index + 1}
                              </div>
                              <span className="text-sm">{practice}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Sources and Methodology */}
          {assessment.status === "Completed" && (
            <Card className="border shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="border-b p-6">
                <CardTitle className="text-2xl font-bold">
                  Assessment Methodology
                </CardTitle>
                <CardDescription>
                  Technical details and data sources used in this assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-6 rounded-lg border">
                    <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                      Assessment Methodology
                    </div>
                    <p className="leading-relaxed">
                      {assessment.dataSources.methodology}
                    </p>
                  </div>

                  <div className="p-6 rounded-lg border">
                    <div className="text-sm uppercase tracking-wide font-semibold mb-4">
                      Data Sources
                    </div>
                    <div className="space-y-3">
                      {assessment.dataSources.data_sources.map(
                        (source: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{source}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <div className="p-6 rounded-lg border">
            <div className="text-center">
              <div className="text-sm mb-2">
                Assessment completed with advanced AI-powered analytics
              </div>
              <div className="text-xs">
                This comprehensive analysis combines multiple data points to
                provide actionable insights for career development
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsModal;
