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
  Star,
  Sparkles,
  TrendingDown,
  ChevronRight,
  Zap,
  Award,
  LineChart,
  Briefcase,
  Lightbulb,
  Clock,
  CheckCircle,
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
const mapJsonToDashboardData = (
  data: any,
  assessmentReports: any
): DashboardData => {
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
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.fastApiToken}`,
              },
            }
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
      <div className="p-6 space-y-8 gradient-bg-primary min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text-primary">
              Welcome back, {apiData?.data?.name || "User"}
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {currentDate}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              className="btn-gradient-primary text-primary-foreground px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <Link href="/employee-dashboard/assessment">
                <ClipboardList className="w-4 h-4 mr-2" />
                Continue Assessment
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Progress Card */}
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-wrapper-blue">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <Badge className="badge-blue">Progress</Badge>
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-2">
              {Number(dashboardData.assessmentProgress.percentage) > 100
                ? 100
                : dashboardData.assessmentProgress.percentage.toFixed(0)}
              %
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {dashboardData.assessmentProgress.current} of{" "}
              {dashboardData.assessmentProgress.total} questions
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="progress-bar-primary"
                style={{
                  width: `${dashboardData.assessmentProgress.percentage}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Completed Assessments */}
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-wrapper-green">
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <Badge className="badge-green">Achieved</Badge>
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-2">
              {dashboardData.completedAssessments}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Completed Assessments
            </p>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+3 from last month</span>
            </div>
          </div>

          {/* Average Score */}
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-wrapper-amber">
                <Star className="w-5 h-5 text-warning" />
              </div>
              <Badge className="badge-amber">Performance</Badge>
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-2">
              {dashboardData.averageScore}%
            </h3>
            <p className="text-sm text-muted-foreground mb-2">Average Score</p>
            <div className="flex items-center text-sm text-warning">
              {dashboardData.averageScore > 70 ? (
                <>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Excellent performance</span>
                </>
              ) : dashboardData.averageScore > 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span>Room for improvement</span>
                </>
              ) : (
                <span>No scores yet</span>
              )}
            </div>
          </div>

          {/* Career Matches */}
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-wrapper-purple">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <Badge className="badge-purple">Opportunities</Badge>
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-2">
              {dashboardData.careerMatches}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">Career Matches</p>
            <div className="flex items-center text-sm text-accent">
              <Sparkles className="w-4 h-4 mr-1" />
              <span>New recommendations available</span>
            </div>
          </div>
        </div>

        {/* AI Career Recommendation */}
        <div className="ai-recommendation-card">
          {/* Decorative elements */}
          <div className="decorative-gradient-blur-blue top-0 right-0 -translate-y-32 translate-x-32"></div>
          <div className="decorative-gradient-blur-purple bottom-0 left-0 translate-y-24 -translate-x-24"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="ai-recommendation-icon-wrapper">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">
                  AI Career Recommendation
                </h2>
                <p className="text-muted-foreground">
                  Personalized insights based on your assessment results
                </p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-input">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-2xl font-bold text-card-foreground mb-4"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-xl font-semibold text-card-foreground mt-6 mb-3"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-lg font-medium text-card-foreground mt-4 mb-2"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="text-muted-foreground leading-relaxed mb-4"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc list-outside pl-5 mb-4 text-muted-foreground space-y-2"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-base" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-primary" {...props} />
                  ),
                }}
              >
                {dashboardData.aiRecommendation}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Assessments */}
          <div id="recent-assessments" className="card-primary card-hover">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper-blue">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground">
                  Recent Assessments
                </h2>
              </div>
              <Badge className="badge-blue">
                {dashboardData.recentAssessments.length} total
              </Badge>
            </div>

            <div className="space-y-3">
              {paginatedAssessments.length > 0 ? (
                paginatedAssessments.map((assessment) => (
                  <div key={assessment.id} className="assessment-item group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-full ${
                            assessment.status === "Completed"
                              ? "bg-success/10"
                              : "bg-warning/10"
                          }`}
                        >
                          {assessment.status === "Completed" ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <Clock className="w-4 h-4 text-warning animate-pulse" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                            {assessment.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(assessment.date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {assessment.score && (
                          <div className="text-right">
                            <div className="text-lg font-bold gradient-text-primary">
                              {assessment.score}%
                            </div>
                            <Badge
                              className={`text-xs ${
                                assessment.score > 70
                                  ? "badge-green"
                                  : "badge-amber"
                              }`}
                            >
                              Score
                            </Badge>
                          </div>
                        )}
                        {assessment.status === "In Progress" && (
                          <Button
                            size="sm"
                            className="btn-gradient-primary text-primary-foreground border-0"
                            asChild
                          >
                            <Link href="/employee-dashboard/assessment">
                              Continue
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No assessments completed yet.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-input text-secondary-foreground hover:bg-secondary"
                    asChild
                  >
                    <Link href="/employee-dashboard/assessment">
                      Start Assessment
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={`${
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-secondary"
                        }`}
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
                          className={`${
                            currentPage === page
                              ? "btn-gradient-primary text-primary-foreground"
                              : "cursor-pointer hover:bg-secondary"
                          }`}
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
                        className={`${
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-secondary"
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-6 border-input text-secondary-foreground hover:bg-secondary"
              asChild
            >
              <Link href="/employee-dashboard/results">
                View All Results
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Career Recommendations */}
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper-purple">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground">
                  AI Career Recommendations
                </h2>
              </div>
              <Badge className="badge-purple">
                {dashboardData.recentRecommendations.length} matches
              </Badge>
            </div>

            <div className="space-y-4">
              {dashboardData.recentRecommendations.length > 0 ? (
                dashboardData.recentRecommendations.map((rec, index) => (
                  <div key={index} className="assessment-item group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-accent/10">
                        {rec.trending ? (
                          <TrendingUp className="w-4 h-4 text-accent" />
                        ) : (
                          <Briefcase className="w-4 h-4 text-accent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-card-foreground group-hover:text-accent transition-colors">
                            {rec.title}
                          </h4>
                          {rec.trending && (
                            <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 text-xs">
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
                        <div className="text-lg font-bold gradient-text-primary">
                          {rec.matchScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Match Score
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-input">
                      <span className="text-sm text-muted-foreground">
                        High compatibility with your skills
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No recommendations available yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete an assessment to get personalized recommendations
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mt-6 border-input text-secondary-foreground hover:bg-secondary"
              asChild
            >
              <Link href="/employee-dashboard/career-Pathways">
                Explore All Pathways
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Actions - Card version */}
        <Card className="card-primary card-hover border-dashed border-2 border-primary/20 dark:border-primary/30 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-wrapper-blue">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-card-foreground">
                  Quick Actions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Get started with these actions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Take Assessment */}
              <Link
                href="/employee-dashboard/assessment"
                className="group p-4 rounded-xl border border-input bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="icon-wrapper-blue group-hover:scale-110 transition-transform duration-300">
                    <ClipboardList className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                    Take Assessment
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Start new assessment
                  </p>
                </div>
              </Link>

              {/* View Results */}
              <Link
                href="/employee-dashboard/results"
                className="group p-4 rounded-xl border border-input bg-card hover:border-accent/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="icon-wrapper-green group-hover:scale-110 transition-transform duration-300">
                    <LineChart className="w-6 h-6 text-accent" />
                  </div>
                  <span className="font-medium text-card-foreground group-hover:text-accent transition-colors">
                    View Results
                  </span>
                  <p className="text-sm text-muted-foreground">
                    See your performance
                  </p>
                </div>
              </Link>

              {/* Career Paths */}
              <Link
                href="/employee-dashboard/career-pathways"
                className="group p-4 rounded-xl border border-input bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="icon-wrapper-purple group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <span className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                    Career Paths
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Explore opportunities
                  </p>
                </div>
              </Link>

              {/* Development */}
              <Link
                href="/employee-dashboard/development"
                className="group p-4 rounded-xl border border-input bg-card hover:border-warning/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="icon-wrapper-amber group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-6 h-6 text-warning" />
                  </div>
                  <span className="font-medium text-card-foreground group-hover:text-warning transition-colors">
                    Development
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Grow your skills
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
