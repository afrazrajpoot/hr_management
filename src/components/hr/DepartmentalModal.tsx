"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  X,
  Mail,
  DollarSign,
  User,
  Briefcase,
  Building2,
  BarChart2,
  Target,
  TrendingUp,
  Shield,
  Calendar,
  BookOpen,
} from "lucide-react";

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

export default function DepartmentalModal({
  isOpen,
  onClose,
  employee,
}: EmployeeDetailModalProps) {
  if (!employee) return null;

  const hasReport = employee.reports?.length > 0;
  const report = hasReport ? employee.reports[0] : null;

  // Prepare radar chart data for employees with reports
  const radarData = hasReport
    ? [
        {
          subject: "Empathy",
          score: parseFloat(
            report.geniusFactorProfileJson?.primary_genius_factor?.match(
              /(\d+)%/
            )?.[1] || "0"
          ),
          fullMark: 100,
        },
        {
          subject: "Leadership",
          score: parseFloat(
            report.currentRoleAlignmentAnalysisJson?.alignment_score?.split(
              "/"
            )[0] || "0"
          ),
          fullMark: 100,
        },
        {
          subject: "Communication",
          score: Math.min(
            parseFloat(
              report.geniusFactorProfileJson?.primary_genius_factor?.match(
                /(\d+)%/
              )?.[1] || "0"
            ) + 10,
            100
          ),
          fullMark: 100,
        },
        {
          subject: "Purpose-Driven",
          score: Math.min(
            parseFloat(
              report.geniusFactorProfileJson?.primary_genius_factor?.match(
                /(\d+)%/
              )?.[1] || "0"
            ) + 5,
            100
          ),
          fullMark: 100,
        },
      ]
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Employee Details</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{employee.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {employee.position}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {employee.department}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salary</p>
                <p className="font-medium flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {employee.salaryFormatted}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Assessment Status
                </p>
                <Badge
                  variant={
                    employee.status === "Completed" ? "default" : "secondary"
                  }
                >
                  {employee.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retention Risk</p>
                <Badge
                  className={(() => {
                    switch (employee.risk) {
                      case "Low":
                        return "bg-success text-success-foreground";
                      case "Moderate":
                        return "bg-warning text-warning-foreground";
                      case "High":
                        return "bg-destructive text-destructive-foreground";
                      default:
                        return "bg-muted text-muted-foreground";
                    }
                  })()}
                >
                  {employee.risk}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Skills Profile (Radar Chart) */}
          {hasReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Skills Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Skills"
                      dataKey="score"
                      stroke="hsl(var(--hr-chart-1))"
                      fill="hsl(var(--hr-chart-1))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Genius Factor Profile */}
          {hasReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Genius Factor Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Primary Genius Factor
                  </p>
                  <p className="font-medium">
                    {report.geniusFactorProfileJson?.primary_genius_factor ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">
                    {report.geniusFactorProfileJson?.description || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Key Strengths</p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.geniusFactorProfileJson?.key_strengths?.map(
                      (strength: string, index: number) => (
                        <li key={index}>{strength}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Energy Sources
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.geniusFactorProfileJson?.energy_sources?.map(
                      (source: string, index: number) => (
                        <li key={index}>{source}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Secondary Genius Factor
                  </p>
                  <p className="font-medium">
                    {report.geniusFactorProfileJson?.secondary_genius_factor ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Secondary Description
                  </p>
                  <p className="text-sm">
                    {report.geniusFactorProfileJson?.secondary_description ||
                      "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Role Alignment Analysis */}
          {hasReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Current Role Alignment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assessment</p>
                  <p className="text-sm">
                    {report.currentRoleAlignmentAnalysisJson?.assessment ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Alignment Score
                  </p>
                  <p className="font-medium">
                    {report.currentRoleAlignmentAnalysisJson?.alignment_score ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Strengths Utilized
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.currentRoleAlignmentAnalysisJson?.strengths_utilized?.map(
                      (strength: string, index: number) => (
                        <li key={index}>{strength}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Underutilized Talents
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.currentRoleAlignmentAnalysisJson?.underutilized_talents?.map(
                      (talent: string, index: number) => (
                        <li key={index}>{talent}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internal Career Opportunities */}
          {hasReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Internal Career Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Short-Term Career Pathways
                  </p>
                  <p className="font-medium">
                    {report.internalCareerOpportunitiesJson?.career_pathways
                      ?.short_term || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Long-Term Career Pathways
                  </p>
                  <p className="font-medium">
                    {report.internalCareerOpportunitiesJson?.career_pathways
                      ?.long_term || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Recommended Departments
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.internalCareerOpportunitiesJson?.recommended_departments?.map(
                      (dept: string, index: number) => (
                        <li key={index}>{dept}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Specific Role Suggestions
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.internalCareerOpportunitiesJson?.specific_role_suggestions?.map(
                      (role: string, index: number) => (
                        <li key={index}>{role}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Required Skill Development
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.internalCareerOpportunitiesJson?.required_skill_development?.map(
                      (skill: string, index: number) => (
                        <li key={index}>{skill}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Retention and Mobility Strategies */}
          {hasReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Retention and Mobility Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Development Support
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.retentionAndMobilityStrategiesJson?.development_support?.map(
                      (support: string, index: number) => (
                        <li key={index}>{support}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Retention Strategies
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.retentionAndMobilityStrategiesJson?.retention_strategies?.map(
                      (strategy: string, index: number) => (
                        <li key={index}>{strategy}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Internal Mobility Recommendations
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.retentionAndMobilityStrategiesJson?.internal_mobility_recommendations?.map(
                      (rec: string, index: number) => <li key={index}>{rec}</li>
                    ) || <li>N/A</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Development Action Plan */}
          {hasReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Development Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">30-Day Goals</p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.developmentActionPlanJson?.thirty_day_goals?.map(
                      (goal: string, index: number) => (
                        <li key={index}>{goal}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">90-Day Goals</p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.developmentActionPlanJson?.ninety_day_goals?.map(
                      (goal: string, index: number) => (
                        <li key={index}>{goal}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Six-Month Goals
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.developmentActionPlanJson?.six_month_goals?.map(
                      (goal: string, index: number) => (
                        <li key={index}>{goal}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Networking Strategy
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.developmentActionPlanJson?.networking_strategy?.map(
                      (strategy: string, index: number) => (
                        <li key={index}>{strategy}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personalized Resources */}
          {hasReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Personalized Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Affirmations</p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.personalizedResourcesJson?.affirmations?.map(
                      (affirmation: string, index: number) => (
                        <li key={index}>{affirmation}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Learning Resources
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.personalizedResourcesJson?.learning_resources?.map(
                      (resource: string, index: number) => (
                        <li key={index}>{resource}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Reflection Questions
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.personalizedResourcesJson?.reflection_questions?.map(
                      (question: string, index: number) => (
                        <li key={index}>{question}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Mindfulness Practices
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {report.personalizedResourcesJson?.mindfulness_practices?.map(
                      (practice: string, index: number) => (
                        <li key={index}>{practice}</li>
                      )
                    ) || <li>N/A</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Report Message */}
          {!hasReport && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  No report data available for this employee.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
