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

const AssessmentDetailsModal = ({ assessment, isOpen, onClose }: any) => {
  if (!assessment) return null;
  console.log("assessment", assessment);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto rounded-lg p-0 bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-gray-700 scrollbar-hide">
        {/* Header Section */}
        <DialogHeader className="bg-gray-800 dark:bg-gray-900 text-white p-8 rounded-t-lg border-b border-gray-700">
          <DialogTitle className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-700 dark:bg-gray-600 rounded-lg flex items-center justify-center shadow-lg border border-gray-600 dark:border-gray-500">
              <span className="text-3xl font-bold text-white">
                {assessment.avatar}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-4xl font-bold text-white mb-2">
                {assessment.employee}
              </div>
              <div className="text-lg text-gray-300 font-medium flex items-center gap-2">
                <span>{assessment.position}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{assessment.department}</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-4 text-lg">
            Comprehensive assessment insights and personalized career roadmap
          </DialogDescription>
        </DialogHeader>

        {/* Content Section */}
        <div className="p-8 space-y-8">
          {/* Assessment Summary */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Assessment Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-2">
                    Status
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {assessment.status}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-2">
                    Completion
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {assessment.completionRate}%
                  </div>
                </div>
                {assessment.status === "Completed" && (
                  <>
                    <div className="bg-gray-100 dark:bg-gray-600 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-500">
                      <div className="text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 font-semibold mb-2">
                        Genius Score
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {assessment.currentRoleAlignment.alignment_score}/100
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-2">
                        Completed
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {assessment.dateCompleted}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-3">
                  Executive Summary
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base">
                  {assessment.executiveSummary}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Genius Factor Profile */}
          {assessment.status === "Completed" && (
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Genius Factor Profile
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Your unique cognitive strengths and natural talents
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-3">
                        Primary Genius Factor
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {assessment.geniusFactorProfile.primary_genius_factor}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {assessment.geniusFactorProfile.description}
                      </p>
                    </div>

                    {assessment.geniusFactorProfile.secondary_genius_factor && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-3">
                          Secondary Genius Factor
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                          {
                            assessment.geniusFactorProfile
                              .secondary_genius_factor
                          }
                        </div>
                        {assessment.geniusFactorProfile
                          .secondary_description && (
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
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
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                        Key Strengths
                      </div>
                      <div className="space-y-3">
                        {assessment.geniusFactorProfile.key_strengths.map(
                          (strength: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300">
                                {strength}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                        Energy Sources
                      </div>
                      <div className="space-y-3">
                        {assessment.geniusFactorProfile.energy_sources.map(
                          (source: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300">
                                {source}
                              </span>
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Current Role Alignment
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  How well your current role matches your genius factor
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-3">
                        Assessment Overview
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {assessment.currentRoleAlignment.assessment}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                          Strengths Utilized
                        </div>
                        <div className="space-y-2">
                          {assessment.currentRoleAlignment.strengths_utilized.map(
                            (strength: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                  {strength}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                          Underutilized Talents
                        </div>
                        <div className="space-y-2">
                          {assessment.currentRoleAlignment.underutilized_talents.map(
                            (talent: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                  {talent}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-100 dark:bg-gray-600 p-6 rounded-lg border-2 border-gray-300 dark:border-gray-500 text-center">
                      <div className="text-sm uppercase tracking-wide text-gray-700 dark:text-gray-300 font-semibold mb-2">
                        Alignment Score
                      </div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {assessment.currentRoleAlignment.alignment_score}
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gray-700 dark:bg-gray-400 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${assessment.currentRoleAlignment.alignment_score}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-3">
                        Retention Risk Level
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Career Opportunities
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Strategic pathways for professional growth
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                        Career Pathways
                      </div>
                      <div className="space-y-4">
                        {Object.entries(
                          assessment.careerOpportunities.career_pathways
                        ).map(([track, path]: any, index) => (
                          <div key={index}>
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-1">
                              {track.toUpperCase()}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {path}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-2">
                          Primary Industry
                        </div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {assessment.careerOpportunities.primary_industry}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-2">
                          Secondary Industry
                        </div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {assessment.careerOpportunities.secondary_industry}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                        Transition Timeline
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-700 dark:bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full min-w-[60px] text-center">
                            6M
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {
                              assessment.careerOpportunities
                                .transition_timeline["6_months"]
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-700 dark:bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full min-w-[60px] text-center">
                            1Y
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {
                              assessment.careerOpportunities
                                .transition_timeline["1_year"]
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-700 dark:bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full min-w-[60px] text-center">
                            2Y
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {
                              assessment.careerOpportunities
                                .transition_timeline["2_years"]
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                      Recommended Departments
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assessment.careerOpportunities.recommended_departments.map(
                        (dept: any, index: any) => (
                          <span
                            key={index}
                            className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-500"
                          >
                            {dept}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                      Role Suggestions
                    </div>
                    <div className="space-y-2">
                      {assessment.careerOpportunities.specific_role_suggestions.map(
                        (role: any, index: any) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {role}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                    Required Skill Development
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {assessment.careerOpportunities.required_skill_development.map(
                      (skill: any, index: any) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-300 dark:border-gray-500"
                        >
                          <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                            {skill}
                          </span>
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Retention & Mobility Strategies
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Strategies to maximize engagement and growth
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                      Development Support
                    </div>
                    <div className="space-y-3">
                      {assessment.retentionStrategies.development_support.map(
                        (support: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {support}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                      Retention Strategies
                    </div>
                    <div className="space-y-3">
                      {assessment.retentionStrategies.retention_strategies.map(
                        (strategy: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {strategy}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                      Mobility Recommendations
                    </div>
                    <div className="space-y-3">
                      {assessment.retentionStrategies.internal_mobility_recommendations.map(
                        (recommendation: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {recommendation}
                            </span>
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Development Action Plan
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Your personalized roadmap to success
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-700 dark:bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          30
                        </div>
                        <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold">
                          Day Goals
                        </div>
                      </div>
                      <div className="space-y-3">
                        {assessment.developmentPlan.thirty_day_goals.map(
                          (goal: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {goal}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-700 dark:bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          90
                        </div>
                        <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold">
                          Day Goals
                        </div>
                      </div>
                      <div className="space-y-3">
                        {assessment.developmentPlan.ninety_day_goals.map(
                          (goal: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {goal}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-700 dark:bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          6M
                        </div>
                        <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold">
                          Month Goals
                        </div>
                      </div>
                      <div className="space-y-3">
                        {assessment.developmentPlan.six_month_goals.map(
                          (goal: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {goal}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                        Networking Strategy
                      </div>
                      <div className="space-y-3">
                        {assessment.developmentPlan.networking_strategy.map(
                          (strategy: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {strategy}
                              </span>
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Personalized Resources
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Tools and practices to support your growth journey
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                        Daily Affirmations
                      </div>
                      <div className="space-y-3">
                        {assessment.personalizedResources.affirmations.map(
                          (affirmation: string, index: number) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-300 dark:border-gray-500"
                            >
                              <span className="text-gray-700 dark:text-gray-300 text-sm italic">
                                "{affirmation}"
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                        Learning Resources
                      </div>
                      <div className="space-y-3">
                        {assessment.personalizedResources.learning_resources.map(
                          (resource: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-500"
                            >
                              <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {resource}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                        Reflection Questions
                      </div>
                      <div className="space-y-3">
                        {assessment.personalizedResources.reflection_questions.map(
                          (question: string, index: number) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-600 p-4 rounded-lg border border-gray-300 dark:border-gray-500"
                            >
                              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                {question}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                        Mindfulness Practices
                      </div>
                      <div className="space-y-3">
                        {assessment.personalizedResources.mindfulness_practices.map(
                          (practice: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-500"
                            >
                              <div className="w-8 h-8 bg-gray-700 dark:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {practice}
                              </span>
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
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Assessment Methodology
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Technical details and data sources used in this assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                      Assessment Methodology
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {assessment.dataSources.methodology}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-4">
                      Data Sources
                    </div>
                    <div className="space-y-3">
                      {assessment.dataSources.data_sources.map(
                        (source: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {source}
                            </span>
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
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Assessment completed with advanced AI-powered analytics
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
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
