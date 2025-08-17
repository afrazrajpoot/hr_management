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
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface GeniusFactor {
  name: string;
  score: number;
  description: string;
}

interface AssessmentResult {
  geniusFactors: GeniusFactor[];
  strengths: string[];
  growthAreas: string[];
}

interface Assessment {
  id: string;
  results: AssessmentResult;
  overallScore: number;
  message: string;
  createdAt: string;
}

export default function Results() {
  const { data: session, status } = useSession();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (status === "authenticated" && session?.user?.id) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `http://localhost:8000/assessments?userId=${session.user.id}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Raw API response:", data); // Debugging

          // Handle both { assessments: [...] } and raw array response
          const assessmentsData = Array.isArray(data)
            ? data
            : data.assessments || [];
          if (!Array.isArray(assessmentsData)) {
            throw new Error("Invalid data format from API");
          }

          const sortedAssessments = [...assessmentsData].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setAssessments(sortedAssessments);
        } catch (error) {
          console.error("Error fetching assessments:", error);
          setAssessments([]); // Reset to empty array on error
        } finally {
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [session?.user?.id, status]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const latestAssessment = assessments[0]; // Most recent assessment
  const overallScore = latestAssessment
    ? Math.round(
        latestAssessment.results.geniusFactors.reduce(
          (sum, factor) => sum + factor.score,
          0
        ) / latestAssessment.results.geniusFactors.length
      )
    : 0;
  const topFactor = latestAssessment
    ? latestAssessment.results.geniusFactors.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      )
    : null;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Genius Factor Profile</h1>
            <p className="text-muted-foreground mt-1">
              {latestAssessment
                ? `Assessment completed on ${new Date(
                    latestAssessment.createdAt
                  ).toLocaleDateString()}`
                : "No assessments completed yet"}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" disabled={!latestAssessment}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            <Button className="btn-gradient" disabled={!latestAssessment}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {latestAssessment ? (
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
                      {overallScore}/100
                    </div>
                    <p className="text-muted-foreground">
                      Your strongest area is <strong>{topFactor?.name}</strong>{" "}
                      with a score of {topFactor?.score}
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
                  {latestAssessment.results.geniusFactors.map(
                    (factor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{factor.name}</span>
                          <span className="text-sm font-semibold">
                            {factor.score}/100
                          </span>
                        </div>
                        <Progress value={factor.score} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {factor.description}
                        </p>
                      </div>
                    )
                  )}
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
                      {latestAssessment.results.strengths.map(
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
                      {latestAssessment.results.growthAreas.map(
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
                assessments.map((assessment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 dark:bg-gray-800/50"
                  >
                    <div>
                      <div className="font-medium">Career Assessment</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {assessment.overallScore}/100
                      </div>
                      <Badge
                        variant={
                          assessment.overallScore >= 80
                            ? "default"
                            : "secondary"
                        }
                      >
                        {assessment.message}
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
