"use client";
// import { AppLayout } from "@/components/layout/AppLayout";
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
  Clock,
  ClipboardList,
} from "lucide-react";
// import { Link } from "react-router-dom";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";

// Mock data
const recentAssessments = [
  {
    id: 1,
    name: "Career Aptitude Test",
    date: "2025-08-01",
    status: "Completed",
    score: 85,
    type: "Primary",
  },
  {
    id: 2,
    name: "Leadership Potential",
    date: "2025-08-08",
    status: "In Progress",
    score: null,
    type: "Secondary",
  },
  {
    id: 3,
    name: "Technical Skills Assessment",
    date: "2025-07-25",
    status: "Completed",
    score: 92,
    type: "Skills",
  },
];

const assessmentProgress = {
  current: 42,
  total: 68,
  percentage: 62,
};

const recentRecommendations = [
  {
    title: "Data Analyst Role",
    matchScore: 88,
    industry: "Technology",
    link: "/career-pathways",
    trending: true,
  },
  {
    title: "Product Manager",
    matchScore: 75,
    industry: "Business",
    link: "/career-pathways",
    trending: false,
  },
  {
    title: "UX Designer",
    matchScore: 82,
    industry: "Design",
    link: "/career-pathways",
    trending: true,
  },
];

const monthlyStats = [
  { month: "Jan", completed: 3 },
  { month: "Feb", completed: 4 },
  { month: "Mar", completed: 2 },
  { month: "Apr", completed: 5 },
  { month: "May", completed: 3 },
  { month: "Jun", completed: 6 },
];

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, Sarah</h1>
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
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assessment Progress
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessmentProgress.percentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                {assessmentProgress.current} of {assessmentProgress.total}{" "}
                questions
              </p>
              <Progress
                value={assessmentProgress.percentage}
                className="mt-3"
              />
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Assessments
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
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
              <div className="text-2xl font-bold">84%</div>
              <p className="text-xs text-success">+5% improvement</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Career Matches
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                New recommendations available
              </p>
            </CardContent>
          </Card>
        </div>

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
              {recentAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-accent/5 hover:bg-accent/10 transition-colors"
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
              ))}
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
              {recentRecommendations.map((rec, index) => (
                <div key={index} className="card-interactive p-4 rounded-lg">
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
              ))}
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
        <Card className="card-elevated">
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
                <Link href="/assessment">
                  <ClipboardList className="w-6 h-6" />
                  <span>Take Assessment</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/results">
                  <TrendingUp className="w-6 h-6" />
                  <span>View Results</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/career-pathways">
                  <Users className="w-6 h-6" />
                  <span>Career Paths</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/development">
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
