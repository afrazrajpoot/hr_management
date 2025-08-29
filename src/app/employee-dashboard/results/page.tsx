"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Share2,
  TrendingUp,
  Brain,
  Target,
  Lightbulb,
  Award,
  BarChart3,
  Calendar,
  Users,
  Briefcase,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Sparkles,
  Globe,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useGetAssessmentResultsQuery } from "@/redux/employe-api";

interface GeniusFactorProfile {
  description: string;
  key_strengths: string[];
  energy_sources: string[];
  primary_genius_factor: string;
  secondary_description: string;
  secondary_genius_factor: string;
}

interface CurrentRoleAlignmentAnalysis {
  assessment: string;
  alignment_score: string;
  strengths_utilized: string[];
  retention_risk_level: string;
  underutilized_talents: string[];
}

interface CareerPathways {
  long_term: string;
  short_term: string;
}

interface TransitionTimeline {
  "1_year": string;
  "2_year": string;
  "6_month": string;
}

interface InternalCareerOpportunities {
  career_pathways: CareerPathways;
  primary_industry: string;
  secondary_industry: string;
  transition_timeline: TransitionTimeline;
  recommended_departments: string[];
  specific_role_suggestions: string[];
  required_skill_development: string[];
}

interface RetentionAndMobilityStrategies {
  development_support: string[];
  retention_strategies: string[];
  internal_mobility_recommendations: string[];
}

interface DevelopmentActionPlan {
  six_month_goals: string[];
  ninety_day_goals: string[];
  thirty_day_goals: string[];
  networking_strategy: string[];
}

interface PersonalizedResources {
  affirmations: string[];
  learning_resources: string[];
  reflection_questions: string[];
  mindfulness_practices: string[];
}

interface DataSourcesAndMethodology {
  methodology: string;
  data_sources: string[];
}

interface Assessment {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  executiveSummary: string;
  hrId: string;
  departement: string;
  geniusFactorScore: number;
  geniusFactorProfileJson: GeniusFactorProfile;
  currentRoleAlignmentAnalysisJson: CurrentRoleAlignmentAnalysis;
  internalCareerOpportunitiesJson: InternalCareerOpportunities;
  retentionAndMobilityStrategiesJson: RetentionAndMobilityStrategies;
  developmentActionPlanJson: DevelopmentActionPlan;
  personalizedResourcesJson: PersonalizedResources;
  dataSourcesAndMethodologyJson: DataSourcesAndMethodology;
}

export default function Results() {
  const { data: session, status } = useSession();
  const { data, isLoading, error } = useGetAssessmentResultsQuery<any>();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);

  useEffect(() => {
    if (data) {
      const assessmentsData = Array.isArray(data) ? data : data.data || [];
      if (!Array.isArray(assessmentsData)) {
        console.error("Invalid data format from RTK Query:", data);
        setAssessments([]);
        return;
      }

      const sortedAssessments = [...assessmentsData].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAssessments(sortedAssessments);
      setSelectedAssessment(sortedAssessments[0] || null);
    } else if (error) {
      console.error("Error from RTK Query:", error);
      setAssessments([]);
      setSelectedAssessment(null);
    }
  }, [data, error]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading assessments. Please try again later.</div>;
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Genius Factor Profile</h1>
            <p className="text-muted-foreground mt-1">
              {selectedAssessment
                ? `Assessment completed on ${new Date(
                    selectedAssessment.createdAt
                  ).toLocaleDateString()}`
                : "No assessments completed yet"}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" disabled={!selectedAssessment}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            <Button className="btn-gradient" disabled={!selectedAssessment}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {selectedAssessment ? (
          <>
            {/* Overall Score Card */}
            <Card className="card-elevated bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Overall Genius Score
                    </h2>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {selectedAssessment.geniusFactorScore}/100
                    </div>
                    <p className="text-muted-foreground">
                      Your strongest area is{" "}
                      <strong>
                        {
                          selectedAssessment.geniusFactorProfileJson
                            .primary_genius_factor
                        }
                      </strong>{" "}
                      with a score of {selectedAssessment.geniusFactorScore}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <Brain className="w-16 h-16 text-primary/20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Genius Factors Breakdown */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Genius Factor Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {
                          selectedAssessment.geniusFactorProfileJson
                            .primary_genius_factor
                        }
                      </span>
                      <span className="text-sm font-semibold">
                        {selectedAssessment.geniusFactorScore}/100
                      </span>
                    </div>
                    <Progress
                      value={selectedAssessment.geniusFactorScore}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {selectedAssessment.geniusFactorProfileJson.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Growth Areas */}
              <div className="space-y-6">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedAssessment.geniusFactorProfileJson.key_strengths.map(
                        (strength, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 rounded-lg bg-green-50/50 dark:bg-green-900/50 border border-green-200 dark:border-green-800"
                          >
                            <Target className="w-4 h-4 text-success mr-2" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Growth Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedAssessment.currentRoleAlignmentAnalysisJson.underutilized_talents.map(
                        (area, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800"
                          >
                            <Lightbulb className="w-4 h-4 text-warning mr-2" />
                            <span className="text-sm">{area}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Full Report Details */}
            <div className="space-y-6">
              {/* Executive Summary */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {selectedAssessment.executiveSummary}
                  </p>
                </CardContent>
              </Card>

              {/* Department and HR Info */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Department and HR Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>Department: {selectedAssessment.departement}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>HR ID: {selectedAssessment.hrId}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Energy Sources */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Energy Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {selectedAssessment.geniusFactorProfileJson.energy_sources.map(
                      (source, index) => (
                        <li key={index} className="text-sm">
                          {source}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Current Role Alignment Analysis */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Current Role Alignment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    {
                      selectedAssessment.currentRoleAlignmentAnalysisJson
                        .assessment
                    }
                  </p>
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span>
                      Alignment Score:{" "}
                      {
                        selectedAssessment.currentRoleAlignmentAnalysisJson
                          .alignment_score
                      }
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Strengths Utilized:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.currentRoleAlignmentAnalysisJson.strengths_utilized.map(
                        (strength, index) => (
                          <li key={index} className="text-sm">
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>
                      Retention Risk Level:{" "}
                      {
                        selectedAssessment.currentRoleAlignmentAnalysisJson
                          .retention_risk_level
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Internal Career Opportunities */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Internal Career Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Career Pathways:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        <span>
                          Short Term:{" "}
                          {
                            selectedAssessment.internalCareerOpportunitiesJson
                              .career_pathways.short_term
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        <span>
                          Long Term:{" "}
                          {
                            selectedAssessment.internalCareerOpportunitiesJson
                              .career_pathways.long_term
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>
                      Primary Industry:{" "}
                      {
                        selectedAssessment.internalCareerOpportunitiesJson
                          .primary_industry
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>
                      Secondary Industry:{" "}
                      {
                        selectedAssessment.internalCareerOpportunitiesJson
                          .secondary_industry
                      }
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Transition Timeline:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        6 Months:{" "}
                        {
                          selectedAssessment.internalCareerOpportunitiesJson
                            .transition_timeline["6_month"]
                        }
                      </li>
                      <li>
                        1 Year:{" "}
                        {
                          selectedAssessment.internalCareerOpportunitiesJson
                            .transition_timeline["1_year"]
                        }
                      </li>
                      <li>
                        2 Years:{" "}
                        {
                          selectedAssessment.internalCareerOpportunitiesJson
                            .transition_timeline["2_year"]
                        }
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Recommended Departments:
                    </h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.internalCareerOpportunitiesJson.recommended_departments.map(
                        (dept, index) => (
                          <li key={index} className="text-sm">
                            {dept}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Specific Role Suggestions:
                    </h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.internalCareerOpportunitiesJson.specific_role_suggestions.map(
                        (role, index) => (
                          <li key={index} className="text-sm">
                            {role}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Required Skill Development:
                    </h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.internalCareerOpportunitiesJson.required_skill_development.map(
                        (skill, index) => (
                          <li key={index} className="text-sm">
                            {skill}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Retention and Mobility Strategies */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Retention and Mobility Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Development Support:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.retentionAndMobilityStrategiesJson.development_support.map(
                        (item, index) => (
                          <li key={index} className="text-sm">
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Retention Strategies:
                    </h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.retentionAndMobilityStrategiesJson.retention_strategies.map(
                        (item, index) => (
                          <li key={index} className="text-sm">
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Internal Mobility Recommendations:
                    </h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.retentionAndMobilityStrategiesJson.internal_mobility_recommendations.map(
                        (item, index) => (
                          <li key={index} className="text-sm">
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Development Action Plan */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Development Action Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">30-Day Goals:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.developmentActionPlanJson.thirty_day_goals.map(
                        (goal, index) => (
                          <li key={index} className="text-sm">
                            {goal}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">90-Day Goals:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.developmentActionPlanJson.ninety_day_goals.map(
                        (goal, index) => (
                          <li key={index} className="text-sm">
                            {goal}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">6-Month Goals:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.developmentActionPlanJson.six_month_goals.map(
                        (goal, index) => (
                          <li key={index} className="text-sm">
                            {goal}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Networking Strategy:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.developmentActionPlanJson.networking_strategy.map(
                        (strategy, index) => (
                          <li key={index} className="text-sm">
                            {strategy}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Personalized Resources */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Personalized Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Affirmations:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.personalizedResourcesJson.affirmations.map(
                        (affirmation, index) => (
                          <li key={index} className="text-sm">
                            {affirmation}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Learning Resources:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.personalizedResourcesJson.learning_resources.map(
                        (resource, index) => (
                          <li key={index} className="text-sm">
                            {resource}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Reflection Questions:
                    </h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.personalizedResourcesJson.reflection_questions.map(
                        (question, index) => (
                          <li key={index} className="text-sm">
                            {question}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Mindfulness Practices:
                    </h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.personalizedResourcesJson.mindfulness_practices.map(
                        (practice, index) => (
                          <li key={index} className="text-sm">
                            {practice}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Data Sources and Methodology */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Data Sources and Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    {
                      selectedAssessment.dataSourcesAndMethodologyJson
                        .methodology
                    }
                  </p>
                  <div>
                    <h4 className="font-semibold mb-2">Data Sources:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedAssessment.dataSourcesAndMethodologyJson.data_sources.map(
                        (source, index) => (
                          <li key={index} className="text-sm">
                            {source}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                No assessments completed yet.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/assessment">Take an Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Assessment History */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Assessment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAssessment?.id === assessment.id
                        ? "bg-primary/10 border-primary"
                        : "bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <div>
                      <div className="font-medium">
                        Assessment ID: {assessment.id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {assessment.geniusFactorScore}/100
                      </div>
                      <Badge
                        variant={
                          assessment.geniusFactorScore >= 80
                            ? "default"
                            : "secondary"
                        }
                      >
                        {assessment.executiveSummary.substring(0, 50) + "..."}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No assessment history available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/career-pathways">
                  <TrendingUp className="w-6 h-6" />
                  <span>Explore Career Paths</span>
                  <span className="text-xs text-muted-foreground">
                    Based on your profile
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/development">
                  <Target className="w-6 h-6" />
                  <span>Skill Development</span>
                  <span className="text-xs text-muted-foreground">
                    Personalized roadmap
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/assessment">
                  <Brain className="w-6 h-6" />
                  <span>Retake Assessment</span>
                  <span className="text-xs text-muted-foreground">
                    Track your progress
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
