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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {assessment.avatar}
              </span>
            </div>
            <div>
              <div className="text-xl">{assessment.employee}</div>
              <div className="text-sm text-muted-foreground">
                {assessment.position} • {assessment.department}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete assessment details and career recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Assessment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <p className="font-semibold">{assessment.status}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Completion Rate
                  </span>
                  <p className="font-semibold">{assessment.completionRate}%</p>
                </div>
                {assessment.status === "Completed" && (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Genius Factor Score
                      </span>
                      <p className="font-semibold text-primary text-lg">
                        {assessment.geniusScore}/100
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Date Completed
                      </span>
                      <p className="font-semibold">
                        {assessment.dateCompleted}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Executive Summary
                </span>
                <p className="text-sm">{assessment.executiveSummary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Genius Factor Profile */}
          {assessment.status === "Completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Genius Factor Profile</CardTitle>
                <CardDescription>
                  Detailed breakdown of Genius Factor assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Primary Genius Factor
                  </span>
                  <p className="font-semibold">
                    {assessment.geniusFactorProfile.primary_genius_factor}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Description
                  </span>
                  <p className="text-sm">
                    {assessment.geniusFactorProfile.description}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Key Strengths
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.geniusFactorProfile.key_strengths.map(
                      (strength: string, index: number) => (
                        <li key={index}>{strength}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Energy Sources
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.geniusFactorProfile.energy_sources.map(
                      (source: string, index: number) => (
                        <li key={index}>{source}</li>
                      )
                    )}
                  </ul>
                </div>
                {assessment.geniusFactorProfile.secondary_genius_factor && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Secondary Genius Factor
                    </span>
                    <p className="font-semibold">
                      {assessment.geniusFactorProfile.secondary_genius_factor}
                    </p>
                  </div>
                )}
                {assessment.geniusFactorProfile.secondary_description && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Secondary Description
                    </span>
                    <p className="text-sm">
                      {assessment.geniusFactorProfile.secondary_description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Role Alignment */}
          {assessment.status === "Completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Current Role Alignment</CardTitle>
                <CardDescription>
                  Analysis of role alignment with Genius Factor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Assessment
                  </span>
                  <p className="text-sm">
                    {assessment.currentRoleAlignment.assessment}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Alignment Score
                  </span>
                  <p className="font-semibold">
                    {assessment.currentRoleAlignment.alignment_score}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Strengths Utilized
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.currentRoleAlignment.strengths_utilized.map(
                      (strength: string, index: number) => (
                        <li key={index}>{strength}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Underutilized Talents
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.currentRoleAlignment.underutilized_talents.map(
                      (talent: string, index: number) => (
                        <li key={index}>{talent}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Retention Risk Level
                  </span>
                  <p className="font-semibold">
                    {assessment.currentRoleAlignment.retention_risk_level}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internal Career Opportunities */}
          {assessment.status === "Completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Career Opportunities</CardTitle>
                <CardDescription>
                  Suggested career paths and opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Career Pathways
                  </span>
                  <p className="text-sm">
                    Short Term:{" "}
                    {assessment.careerOpportunities.career_pathways.short_term}
                  </p>
                  <p className="text-sm">
                    Long Term:{" "}
                    {assessment.careerOpportunities.career_pathways.long_term}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Primary Industry
                  </span>
                  <p className="font-semibold">
                    {assessment.careerOpportunities.primary_industry}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Secondary Industry
                  </span>
                  <p className="font-semibold">
                    {assessment.careerOpportunities.secondary_industry}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Transition Timeline
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    <li>
                      Six Months:{" "}
                      {
                        assessment.careerOpportunities.transition_timeline
                          .six_month
                      }
                    </li>
                    <li>
                      One Year:{" "}
                      {
                        assessment.careerOpportunities.transition_timeline
                          .one_year
                      }
                    </li>
                    <li>
                      Two Years:{" "}
                      {
                        assessment.careerOpportunities.transition_timeline
                          .two_years
                      }
                    </li>
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Recommended Departments
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.careerOpportunities.recommended_departments.map(
                      (dept: string, index: number) => (
                        <li key={index}>{dept}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Specific Role Suggestions
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.careerOpportunities.specific_role_suggestions.map(
                      (role: string, index: number) => (
                        <li key={index}>{role}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Required Skill Development
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.careerOpportunities.required_skill_development.map(
                      (skill: string, index: number) => (
                        <li key={index}>{skill}</li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Retention and Mobility Strategies */}
          {assessment.status === "Completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Retention and Mobility Strategies</CardTitle>
                <CardDescription>
                  Strategies to retain talent and promote internal mobility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Development Support
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.retentionStrategies.development_support.map(
                      (support: string, index: number) => (
                        <li key={index}>{support}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Retention Strategies
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.retentionStrategies.retention_strategies.map(
                      (strategy: string, index: number) => (
                        <li key={index}>{strategy}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Internal Mobility Recommendations
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.retentionStrategies.internal_mobility_recommendations.map(
                      (recommendation: string, index: number) => (
                        <li key={index}>{recommendation}</li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Development Action Plan */}
          {assessment.status === "Completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Development Action Plan</CardTitle>
                <CardDescription>
                  Actionable steps for career development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Thirty Day Goals
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.developmentPlan.thirty_day_goals.map(
                      (goal: string, index: number) => (
                        <li key={index}>{goal}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Ninety Day Goals
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.developmentPlan.ninety_day_goals.map(
                      (goal: string, index: number) => (
                        <li key={index}>{goal}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Six Month Goals
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.developmentPlan.six_month_goals.map(
                      (goal: string, index: number) => (
                        <li key={index}>{goal}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Networking Strategy
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.developmentPlan.networking_strategy.map(
                      (strategy: string, index: number) => (
                        <li key={index}>{strategy}</li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personalized Resources */}
          {assessment.status === "Completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Personalized Resources</CardTitle>
                <CardDescription>
                  Resources to support career growth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Affirmations
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.personalizedResources.affirmations.map(
                      (affirmation: string, index: number) => (
                        <li key={index}>{affirmation}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Learning Resources
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.personalizedResources.learning_resources.map(
                      (resource: string, index: number) => (
                        <li key={index}>{resource}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Reflection Questions
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.personalizedResources.reflection_questions.map(
                      (question: string, index: number) => (
                        <li key={index}>{question}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Mindfulness Practices
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.personalizedResources.mindfulness_practices.map(
                      (practice: string, index: number) => (
                        <li key={index}>{practice}</li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Sources and Methodology */}
          {assessment.status === "Completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Data Sources and Methodology</CardTitle>
                <CardDescription>
                  Information on data sources and assessment methodology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Methodology
                  </span>
                  <p className="text-sm">
                    {assessment.dataSources.methodology}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Data Sources
                  </span>
                  <ul className="text-sm list-disc list-inside">
                    {assessment.dataSources.data_sources.map(
                      (source: string, index: number) => (
                        <li key={index}>{source}</li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsModal;
