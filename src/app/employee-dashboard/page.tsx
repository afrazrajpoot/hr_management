"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  TrendingUp,
  Calendar,
  Target,
  Users,
  BookOpen,
  ArrowRight,
  Trophy,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";
import { useGetDashboardDataQuery } from "@/redux/employe-api";
import ReactMarkdown from "react-markdown";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";
import axios from "axios";

// Define the DashboardData interface
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
  monthlyStats: any[];
  aiRecommendation: string;
}

// Function to map JSON data to DashboardData interface
const mapJsonToDashboardData = (data: any, assessmentReports: any): DashboardData => {
  // Map recent assessments from assessmentReports
  const recentAssessments = assessmentReports.map((report: any) => ({
    id: report.id.toString(),
    name: `Genius Factor Assessment ${report.id}`,
    status: report.geniusFactorScore ? "Completed" : "In Progress",
    date: report.createdAt,
    score: report.geniusFactorScore,
  }));

  // Map recent recommendations from internalCareerOpportunitiesJson
  const recentRecommendations =
    assessmentReports[0]?.internalCareerOpportunitiesJson?.specific_role_suggestions?.map(
      (role: string, index: number) => ({
        title: role.split(":")[0],
        industry:
          assessmentReports[0]?.internalCareerOpportunitiesJson
            ?.primary_industry || "Unknown",
        matchScore: 80 + index * 5,
        trending: index === 0,
      })
    ) || [];

  return {
    recentAssessments,
    assessmentProgress: {
      current: parseInt(data.assessmentProgress) || 0,
      total: 68,
      percentage: parseInt(data.assessmentProgress) || 0,
    },
    completedAssessments: data.completedAssessments || 0,
    averageScore: data.averageGeniusFactorScore || 0,
    careerMatches:
      assessmentReports[0]?.internalCareerOpportunitiesJson
        ?.specific_role_suggestions?.length || 0,
    recentRecommendations,
    monthlyStats: [],
    aiRecommendation:
      data.careerRecommendation || "No recommendation available yet.",
  };
};

export default function Dashboard() {
  const { data: assessmentData, isLoading } = useGetDashboardDataQuery<any>();
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
  const [currentPage, setCurrentPage] = useState(1);
  const assessmentsPerPage = 5;
  const { data: session, status } = useSession();
  const [isFetching, setIsFetching] = useState(false);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchDashboardData = async () => {
        setIsFetching(true);
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/employee_dashboard/dashboard-data`,
            { employeeId: session.user.id },
            { headers: { "Content-Type": "application/json" } }
          );
          setApiData(res.data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsFetching(false);
        }
      };
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (apiData && !isLoading) {
      const assessmenReport: any = assessmentData.assessmentReports;
      const mappedData = mapJsonToDashboardData(apiData, assessmenReport);
      setDashboardData(mappedData);
    }
  }, [apiData, isLoading]);

  // Pagination logic
  const totalPages = Math.ceil(
    dashboardData.recentAssessments.length / assessmentsPerPage
  );
  const paginatedAssessments = dashboardData.recentAssessments.slice(
    (currentPage - 1) * assessmentsPerPage,
    currentPage * assessmentsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of Recent Assessments section
    const assessmentsSection = document.getElementById("recent-assessments");
    if (assessmentsSection) {
      assessmentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isLoading || isFetching) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="p-6 space-y-6 bg-[#081229]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {apiData?.data?.name || "User"}
            </h1>
            <p className="text-muted-foreground mt-1">{currentDate}</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button asChild className="btn-gradient">
              <Link href="/employee-dashboard/assessment">
                <ClipboardList className="w-4 h-4 mr-2" />
                Continue Assessment
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-elevated bg-gray-800 border-gray-700">
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

          <Card className="card-elevated bg-gray-800 border-gray-700">
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

          <Card className="card-elevated bg-gray-800 border-gray-700">
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

          <Card className="card-elevated bg-gray-800 border-gray-700">
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
        <Card className="card-elevated bg-gray-800 border-gray-700 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-2xl font-semibold text-gray-800 dark:text-gray-100">
              <BookOpen className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
              AI Career Recommendation
            </CardTitle>
            <div className="h-px bg-gray-200 dark:bg-gray-600 mt-2"></div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-200">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc list-outside pl-5 mb-4 text-gray-600 dark:text-gray-400"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-2 text-base" {...props} />
                  ),
                }}
              >
                {dashboardData.aiRecommendation}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Assessments */}
          <Card className="bg-gray-800 border-gray-700" id="recent-assessments">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Assessments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paginatedAssessments.length > 0 ? (
                paginatedAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-3 rounded-lg border transition-colors"
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
                          <Link href="/employee-dashboard/assessment">
                            Continue
                          </Link>
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
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className={
                            currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : "cursor-pointer"
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/employee-dashboard/results">
                  View All Results
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Career Recommendations */}
          <Card className="bg-gray-800 border-gray-700">
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
                    className="card-interactive p-4 rounded-lg transition-colors"
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
                <Link href="/employee-dashboard/career-Pathways">
                  Explore All Pathways
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="card-elevated bg-gray-800 border-gray-700">
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
                <Link href="/employee-dashboard/career-pathways">
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
