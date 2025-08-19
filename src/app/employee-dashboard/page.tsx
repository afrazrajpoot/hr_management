"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Calendar,
  Target,
  Users,
  BookOpen,
  ArrowRight,
  Trophy,
  ClipboardList,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Assessment {
  id: string;
  name: string;
  status: string;
  date: string;
  score?: number;
}

interface Recommendation {
  title: string;
  industry: string;
  matchScore: number;
  trending?: boolean;
}

interface DashboardData {
  recentAssessments: Assessment[];
  assessmentProgress: {
    current: number;
    total: number;
    percentage: number;
  };
  completedAssessments: number;
  averageScore: number;
  careerMatches: number;
  recentRecommendations: Recommendation[];
  monthlyStats: any[]; // Adjust based on actual API data
  aiRecommendation: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    recentAssessments: [],
    assessmentProgress: { current: 0, total: 68, percentage: 0 },
    completedAssessments: 0,
    averageScore: 0,
    careerMatches: 0,
    recentRecommendations: [],
    monthlyStats: [],
    aiRecommendation: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (session?.user?.id) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `http://localhost:8000/employee_dashboard?userId=${session.user.id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch dashboard data");
          }
          const data = await response.json();
          setDashboardData(data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [session?.user?.id]);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {session?.user?.name || "User"}
            </h1>
            <p className="text-muted-foreground mt-1">{currentDate}</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button asChild className="btn-gradient">
              <Link href="/assessment">
                <ClipboardList className="w-4 h-4 mr-2" />
                Continue Assessment
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-elevated ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assessment Progress
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.assessmentProgress.percentage.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.assessmentProgress.current} of{" "}
                {dashboardData.assessmentProgress.total} questions
              </p>
              <Progress
                value={dashboardData.assessmentProgress.percentage}
                className="mt-3"
              />
            </CardContent>
          </Card>

          <Card className="card-elevated ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Assessments
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.completedAssessments}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.completedAssessments > 0
                  ? "+3 from last month"
                  : "No assessments yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.averageScore}%
              </div>
              <p className="text-xs text-success">
                {dashboardData.averageScore > 0
                  ? "+5% improvement"
                  : "No scores yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Career Matches
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.careerMatches}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.careerMatches > 0
                  ? "New recommendations available"
                  : "Complete an assessment"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Career Recommendation */}
        <Card className="card-elevated ">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              AI Career Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {dashboardData.aiRecommendation}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Assessments */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Assessments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentAssessments.length > 0 ? (
                dashboardData.recentAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-3 rounded-lg border  transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{assessment.name}</h4>
                        <Badge
                          variant={
                            assessment.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {assessment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(assessment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {assessment.score && (
                        <div className="text-lg font-semibold text-primary">
                          {assessment.score}%
                        </div>
                      )}
                      {assessment.status === "In Progress" && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/assessment">Continue</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No assessments completed yet.
                </p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/results">
                  View All Results
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Career Recommendations */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                AI Career Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentRecommendations.length > 0 ? (
                dashboardData.recentRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="card-interactive p-4 rounded-lg  transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          {rec.trending && (
                            <Badge variant="secondary" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rec.industry}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          {rec.matchScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recommendations available yet.
                </p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/career-pathways">
                  Explore All Pathways
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="card-elevated ">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/employee-dashboard/assessment">
                  <ClipboardList className="w-6 h-6" />
                  <span>Take Assessment</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/employee-dashboard/results">
                  <TrendingUp className="w-6 h-6" />
                  <span>View Results</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/employee-dashboard/career-Pathways">
                  <Users className="w-6 h-6" />
                  <span>Career Paths</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/employee-dashboard/development">
                  <BookOpen className="w-6 h-6" />
                  <span>Development</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
