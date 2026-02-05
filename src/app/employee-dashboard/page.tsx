"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Clock,
  CheckCircle,
  Zap,
  LineChart,
  Award,
  Play,
  Video,
  PlayCircle,
  Info,
  ChevronRight,
  Share2,
  Download,
  Bookmark,
  Maximize2,
  X,
  Search,
  Filter,
  ChevronLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ProfessionalVideoPlayer } from "@/components/employee/ProfessionalVideoPlayer";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";
import { useGetDashboardDataQuery } from "@/redux/employe-api";
import { useGetEmployeeDashboardAnalyticsQuery } from "@/redux/employee-python-api/employee-python-api";
import ReactMarkdown from "react-markdown";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";

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
  const recentAssessments = assessmentReports.map((report: any) => ({
    id: report.id.toString(),
    name: `Genius Factor Assessment ${report.id}`,
    status: report.geniusFactorScore ? "Completed" : "In Progress",
    date: report.createdAt,
    score: report.geniusFactorScore,
  }));

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

  const result = {
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

  return result;
};

const mediaItems = [
  {
    id: "1",
    title: "Leadership & Team Growth",
    description: "Our comprehensive corporate training series on leadership development and team building strategies.",
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53815d1e?w=800&q=80", // Using a high-quality placeholder for now as I can't serve local generated images directly from here
    duration: "15:45",
    category: "Leadership",
    status: "Completed",
    src: "/api/videos/video1.mp4",
  },
  {
    id: "2",
    title: "Workplace Compliance: Policy Essentials",
    description: "Essential training on workplace security, policy compliance, and professional standards.",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    duration: "22:15",
    category: "Compliance",
    status: "In Progress",
    src: "/api/videos/video2.mp4",
  }
];

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
  const { data: session } = useSession();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const { data: apiData, isLoading: isAnalyticsLoading } = useGetEmployeeDashboardAnalyticsQuery(
    session?.user?.id || "",
    { skip: !session?.user?.id }
  );

  useEffect(() => {
    if (apiData && !isLoading) {
      const assessmentReports = assessmentData?.assessmentReports || [];
      const mappedData = mapJsonToDashboardData(apiData, assessmentReports);
      setDashboardData(mappedData);
    }
  }, [apiData, isLoading, assessmentData]);

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

  if (isLoading || isAnalyticsLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  return (
    <>
      {/* Inline styles for bubble animation - no external file needed */}
      <style>{`
        @keyframes gentle-bubble {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1) translate(0, 0);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.15) translate(8px, -8px);
          }
        }
        .bubble-glow {
          animation: gentle-bubble 12s ease-in-out infinite;
        }
      `}</style>

      <AppLayout>
        <div className="min-h-screen bg-layout-purple p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient-purple">
                Welcome back, {apiData?.data?.name || "User"}
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {currentDate}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                className="btn-purple px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                asChild
              >
                <Link href="/employee-dashboard/assessment">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Continue Assessment
                </Link>
              </Button>
            </div>
          </div>

          {/* Key Metrics with bubble effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Progress Card */}
            <div className="card-purple hover-lift min-w-0 overflow-hidden relative">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/12 dark:bg-blue-600/10 rounded-full blur-3xl -z-10 bubble-glow pointer-events-none"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                    Progress
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {Math.min(dashboardData.assessmentProgress.percentage, 100).toFixed(0)}%
                </h3>

                <p className="text-sm text-muted-foreground mb-4 truncate">
                  {dashboardData.assessmentProgress.current} of {dashboardData.assessmentProgress.total} questions
                </p>

                <div className="w-full bg-gray-100 dark:bg-matte-gray-light rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{
                      width: `${Math.min(dashboardData.assessmentProgress.percentage, 100)}%`,
                      background: "var(--purple-gradient)",
                      backgroundSize: "200% 100%",
                      animation: "gradient-shift 2s ease infinite"
                    }}
                  >
                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-white">
                      {Math.min(dashboardData.assessmentProgress.percentage, 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Completed Assessments */}
            <div className="card-purple hover-lift min-w-0 overflow-hidden relative">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-green-500/12 dark:bg-green-600/10 rounded-full blur-3xl -z-10 bubble-glow pointer-events-none"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-xl">
                    <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs px-3 py-1 rounded-full">
                    Achieved
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {dashboardData.completedAssessments}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Completed Assessments
                </p>
                <div className="flex items-center text-sm text-green-600 dark:text-green-400 truncate">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+3 from last month</span>
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div className="card-purple hover-lift min-w-0 overflow-hidden relative">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-yellow-500/15 dark:bg-amber-600/12 rounded-full blur-3xl -z-10 bubble-glow pointer-events-none"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-xl">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs px-3 py-1 rounded-full">
                    Performance
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {typeof dashboardData.averageScore === 'number' ? dashboardData.averageScore.toFixed(2) : '0.00'}%
                </h3>
                <p className="text-sm text-muted-foreground mb-2">Average Score</p>
                <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 truncate">
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
            </div>

            {/* Career Matches */}
            <div className="card-purple hover-lift min-w-0 overflow-hidden relative">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500/12 dark:bg-purple-600/10 rounded-full blur-3xl -z-10 bubble-glow pointer-events-none"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-xl">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs px-3 py-1 rounded-full">
                    Opportunities
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {dashboardData.careerMatches}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">Career Matches</p>
                <div className="flex items-center text-sm text-purple-600 dark:text-purple-400 truncate">
                  <Sparkles className="w-4 h-4 mr-1" />
                  <span>New recommendations available</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Career Recommendation */}
          <div className="card-purple relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>

            <div className="relative z-10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-xl">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    AI Career Recommendation
                  </h2>
                  <p className="text-muted-foreground">
                    Personalized insights based on your assessment results
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-matte-gray-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-matte-gray-subtle">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-muted-foreground leading-relaxed mb-4" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-outside pl-5 mb-4 text-muted-foreground space-y-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="text-base" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold text-purple-600 dark:text-purple-400" {...props} />
                    ),
                  }}
                >
                  {dashboardData.aiRecommendation}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Recent Assessments */}
          <div id="recent-assessments" className="card-purple hover-lift">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Recent Assessments
                  </h2>
                </div>
                <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                  {dashboardData.recentAssessments.length} total
                </span>
              </div>

              <div className="space-y-3">
                {paginatedAssessments.length > 0 ? (
                  paginatedAssessments.map((assessment) => (
                    <Link
                      key={assessment.id}
                      href={`/employee-dashboard/results?id=${assessment.id}`}
                      className="group block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all duration-300 cursor-pointer border border-transparent hover:border-purple-500/20 dark:hover:border-purple-500/30 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-full ${assessment.status === "Completed"
                              ? "bg-green-100 dark:bg-green-900/20"
                              : "bg-yellow-100 dark:bg-yellow-900/20"
                              }`}
                          >
                            {assessment.status === "Completed" ? (
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {assessment.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(assessment.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {assessment.score && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-gradient-purple">
                                {assessment.score}%
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${assessment.score > 70
                                  ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                                  : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                                  }`}
                              >
                                Score
                              </span>
                            </div>
                          )}
                          {assessment.status === "In Progress" && (
                            <Button
                              size="sm"
                              className="btn-purple text-white border-0"
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = "/employee-dashboard/assessment";
                              }}
                            >
                              Continue
                            </Button>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No assessments completed yet.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 border-gray-300 dark:border-matte-gray-subtle text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-matte-gray-light"
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
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-matte-gray-light"
                            } text-gray-700 dark:text-gray-300`}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className={`${currentPage === page
                              ? "btn-purple text-white"
                              : "cursor-pointer hover:bg-gray-100 dark:hover:bg-matte-gray-light text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-matte-gray-light"
                            } text-gray-700 dark:text-gray-300`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="group w-52 mx-auto mt-6 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                  asChild
                >
                  <Link href="/employee-dashboard/results" className="flex items-center justify-center">
                    <span className="font-medium">View All Results</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Training Videos Section - Premium Streaming UI */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-matte-gray-medium rounded-2xl shadow-lg border border-gray-200 dark:border-matte-gray-subtle overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 dark:border-matte-gray-subtle flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Training Library
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Expert-led courses for professional growth
                    </p>
                  </div>
                </div>
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-0 px-3 py-1">
                  {mediaItems.length} Available
                </Badge>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative cursor-pointer pt-2 px-1 pb-1"
                      onClick={() => setSelectedVideo(item)}
                    >
                      <div className="relative bg-white dark:bg-matte-gray-dark border border-gray-200 dark:border-matte-gray-subtle rounded-2xl overflow-hidden transition-all duration-500 ease-out group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backface-hidden">
                        {/* Video Recap (Autoplay Preview) */}
                        <div className="relative aspect-video overflow-hidden bg-black flex items-center justify-center">
                          <video
                            src={item.src}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                          />


                          {/* Hover Overlay with Play Icon */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 transform scale-50 group-hover:scale-100 transition-transform duration-500">
                              <Play className="w-8 h-8 text-white fill-current" />
                            </div>
                          </div>

                          {/* Badges Overlay */}
                          <div className="absolute top-4 left-4 z-30">
                            <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                              {item.category}
                            </Badge>
                          </div>

                          <div className="absolute bottom-4 right-4 z-30">
                            <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded border border-white/5 uppercase tracking-wider">
                              {item.duration}
                            </div>
                          </div>
                        </div>

                        {/* Info Area */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                              {item.title}
                            </h4>
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-6">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-matte-gray-subtle">
                            <div className="flex items-center gap-2">
                              {item.status === "In Progress" ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                  <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">In Progress</span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.status}</span>
                              )}
                            </div>
                            <div className="flex items-center text-purple-600 dark:text-purple-400 font-bold text-xs group-hover:underline">
                              Watch Course <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-black border-0">
              {selectedVideo && (
                <div className="flex flex-col h-full max-h-[90vh]">
                  <div className="relative w-full">
                    <ProfessionalVideoPlayer
                      src={selectedVideo.src}
                    />
                  </div>
                  <div className="p-8 bg-white dark:bg-matte-gray-dark border-t border-gray-100 dark:border-matte-gray-subtle">
                    <DialogHeader className="border-0 mb-6 pb-0 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-0">
                          {selectedVideo.category}
                        </Badge>
                        <span className="text-muted-foreground text-sm">{selectedVideo.duration}</span>
                      </div>
                      <DialogTitle className="text-3xl font-bold mb-2">
                        {selectedVideo.title}
                      </DialogTitle>
                      <DialogDescription className="text-base text-muted-foreground">
                        {selectedVideo.description}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-4 py-4 border-t border-gray-100 dark:border-matte-gray-subtle mt-4">
                      <Button className="ml-auto btn-purple px-8">
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Quick Actions */}
          <div className="card-purple border-dashed border-2 border-purple-300 dark:border-purple-700 overflow-hidden hover-lift">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-xl">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Quick Actions
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Get started with these actions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/employee-dashboard/assessment"
                  className="group p-4 rounded-xl border border-gray-200 dark:border-matte-gray-subtle bg-white dark:bg-matte-gray-dark hover:border-purple-600/50 hover:shadow-lg transition-all duration-300 hover-lift"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Take Assessment
                    </span>
                    <p className="text-sm text-muted-foreground">Start new assessment</p>
                  </div>
                </Link>

                <Link
                  href="/employee-dashboard/results"
                  className="group p-4 rounded-xl border border-gray-200 dark:border-matte-gray-subtle bg-white dark:bg-matte-gray-dark hover:border-green-600/50 hover:shadow-lg transition-all duration-300 hover-lift"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <LineChart className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      View Results
                    </span>
                    <p className="text-sm text-muted-foreground">See your performance</p>
                  </div>
                </Link>

                <Link
                  href="/employee-dashboard/career-pathways"
                  className="group p-4 rounded-xl border border-gray-200 dark:border-matte-gray-subtle bg-white dark:bg-matte-gray-dark hover:border-purple-600/50 hover:shadow-lg transition-all duration-300 hover-lift"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Career Paths
                    </span>
                    <p className="text-sm text-muted-foreground">Explore opportunities</p>
                  </div>
                </Link>

                <Link
                  href="/employee-dashboard/development"
                  className="group p-4 rounded-xl border border-gray-200 dark:border-matte-gray-subtle bg-white dark:bg-matte-gray-dark hover:border-yellow-600/50 hover:shadow-lg transition-all duration-300 hover-lift"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                      Development
                    </span>
                    <p className="text-sm text-muted-foreground">Grow your skills</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AppLayout >
    </>
  );
}