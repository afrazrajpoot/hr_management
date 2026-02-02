"use client";
import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  Rocket,
  Zap,
  Star,
  TargetIcon,
  Shield,
  BookMarked,
  FileText,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  BarChart,
  Award as AwardIcon,
  Building,
  BriefcaseBusiness,
  Target as TargetIcon2,
  Book,
  Heart,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

import PDFReport from "@/components/employee/PDFReport";
import Loader from "@/components/Loader";
import { useGetAssessmentResultsQuery } from "@/redux/employe-api";
import { useSession } from "next-auth/react";

interface Assessment {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  hrId: string;
  departement: string;

  // New structure from API
  executive_summary: string;
  genius_factor_score: number;
  retention_risk_score: number;
  mobility_opportunity_score: number;

  // Nested objects - may be undefined for unpaid users
  genius_factor_profile?: {
    primary_genius_factor: string;
    secondary_genius_factor: string | null;
    key_strengths: string[];
    energy_sources: string[];
    development_areas: string[];
    description: string;
  };

  current_role_alignment_analysis?: {
    alignment_score: number;
    strengths_utilized: string[];
    underutilized_talents: string[];
    retention_risk_factors: string[];
    immediate_actions: string[];
  };

  internal_career_opportunities?: {
    primary_industries: string[];
    secondary_industries: string[];
    recommended_departments: string[];
    role_suggestions: Array<{
      role_title: string;
      department: string;
      match_score: number;
      required_skills: string[];
      timeline: string;
      salary_impact: string;
    }>;
    transition_strategy: string;
  };

  retention_and_mobility_strategies?: {
    retention_strategies: string[];
    mobility_recommendations: string[];
    development_support_needed: string[];
    expected_outcomes: string[];
  };

  development_action_plan?: {
    thirty_day_goals: string[];
    ninety_day_goals: string[];
    six_month_goals: string[];
    networking_strategy: Record<string, string[]>;
  };

  personalized_resources?: {
    affirmations: string[];
    learning_resources: Array<{
      type: string;
      title: string;
      provider?: string;
      author?: string;
    }>;
    reflection_questions: string[];
    mindfulness_practices: string[];
  };

  data_sources_and_methodology?: {
    assessment_data_used: boolean;
    user_data_used: boolean;
    static_context_used: boolean;
    score_calculation_method: string;
  };

  generated_at: string;
  report_version: string;

  risk_analysis?: {
    scores: {
      genius_factor_score: number;
      retention_risk_score: number;
      mobility_opportunity_score: number;
    };
    trends: {
      risk_factors: string[];
      mobility_trends: string;
      retention_trends: string;
    };
    company: string;
    genius_factors: string[];
    recommendations: string[];
    analysis_summary: string;
  };

  // Legacy field for compatibility
  _limited_access?: boolean;
}

// Helper function to safely extract array values
const safeArray = (value: any): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
};

// Helper function to safely extract text from learning resources
const getLearningResourceText = (resource: any): string => {
  if (typeof resource === "string") return resource;
  if (typeof resource === "object") {
    if (resource.title) return resource.title;
    if (resource.name) return resource.name;
    return JSON.stringify(resource);
  }
  return String(resource);
};

// Safe access helper for nested objects
const safeGet = <T,>(obj: any, path: string, defaultValue: T): T => {
  if (!obj) return defaultValue;

  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
};

// Executive Summary Display Component
const ExecutiveSummaryDisplay = ({ summary }: { summary: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  try {
    const MAX_LENGTH = 300;
    const displayText = isExpanded ? summary : summary.slice(0, MAX_LENGTH);
    const needsExpansion = summary.length > MAX_LENGTH;

    return (
      <div>
        <p className="text-sm text-subtle leading-relaxed whitespace-pre-line">
          {displayText}
          {!isExpanded && needsExpansion && "..."}
        </p>
        {needsExpansion && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
          >
            {isExpanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    );
  } catch {
    return <p className="text-sm text-subtle leading-relaxed">{summary}</p>;
  }
};

// Score Display Component
const ScoreDisplay = ({
  score,
  label,
  icon,
  color = "primary",
}: {
  score: number;
  label: string;
  icon: React.ReactNode;
  color?: string;
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-purple-600 dark:text-purple-400";
    if (score >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 dark:bg-emerald-900/20";
    if (score >= 60) return "bg-purple-50 dark:bg-purple-900/20";
    if (score >= 40) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500 dark:bg-emerald-400";
    if (score >= 60) return "bg-purple-600 dark:bg-purple-500";
    if (score >= 40) return "bg-amber-500 dark:bg-amber-400";
    return "bg-red-500 dark:bg-red-400";
  };

  const scoreTextColor = getScoreColor(score);
  const scoreBgColor = getScoreBg(score);
  const progressColor = getProgressColor(score);

  return (
    <Card className="card-purple relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Light Bubble Effect in Corner */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 ${progressColor}`}
      />
      <div
        className={`absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-10 ${progressColor}`}
      />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${scoreBgColor}`}>{icon}</div>
          <Badge
            variant="outline"
            className={`${scoreBgColor} ${scoreTextColor} border-0`}
          >
            {score >= 80
              ? "Excellent"
              : score >= 60
                ? "Good"
                : score >= 40
                  ? "Fair"
                  : "Poor"}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold flex items-baseline gap-1">
            {score}
            <span className="text-sm font-normal text-muted-foreground">
              /100
            </span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {label}
          </div>
        </div>

        <div className="mt-4">
          <Progress
            value={score}
            className="h-2 bg-gray-100"
            indicatorClassName={progressColor}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Premium Section Component
const PremiumSection = ({
  title,
  icon,
  description,
  content,
  isPaid,
  showAllContent,
  onTogglePreview,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  content: React.ReactNode;
  isPaid: boolean;
  showAllContent: boolean;
  onTogglePreview: () => void;
}) => {
  const shouldBlur = !isPaid && !showAllContent;

  return (
    <Card className="card-purple relative overflow-hidden transition-all duration-200 hover:shadow-lg">
      {shouldBlur && (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/50 dark:bg-black/50">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4 shadow-sm">
              <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Premium Content
            </h3>
            <p className="text-subtle mb-6 max-w-md">
              Upgrade to unlock full Genius Factor analysis
            </p>
            <Button onClick={onTogglePreview} className="btn-purple shadow-lg">
              <Eye className="w-4 h-4 mr-2" />
              Preview Content
            </Button>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${shouldBlur ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"}`}
            >
              {icon}
            </div>
            <div>
              <div className="text-lg font-semibold flex items-center gap-2">
                {title}
                {shouldBlur && (
                  <Badge
                    variant="outline"
                    className="border-amber-200 text-amber-700 bg-amber-50"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
          </div>
          {shouldBlur && showAllContent && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-amber-50"
              onClick={onTogglePreview}
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Hide
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">{content}</div>
      </CardContent>
    </Card>
  );
};

// Marketing Blur Boxes Component
const MarketingBlurBoxes = ({
  isPaid,
  onUpgradeClick,
}: {
  isPaid: boolean;
  onUpgradeClick: () => void;
}) => {
  const marketingFeatures = [
    {
      icon: <BarChart className="w-6 h-6 text-primary" />,
      title: "Advanced Career Analytics",
      description: "Detailed breakdown of your career path potential",
    },
    {
      icon: <TrendingUpIcon className="w-6 h-6 text-success" />,
      title: "Personalized Growth Plan",
      description: "Custom 90-day action plan with milestone tracking",
    },
    {
      icon: <UsersIcon className="w-6 h-6 text-accent" />,
      title: "Mentor Matching",
      description: "Connect with industry experts in your field",
    },
    {
      icon: <AwardIcon className="w-6 h-6 text-warning" />,
      title: "Skill Certification",
      description: "Get certified in your identified genius areas",
    },
  ];

  if (isPaid) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {marketingFeatures.map((feature, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-xl border border-input bg-card"
        >
          <div className="absolute inset-0 z-10 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <Lock className="w-8 h-8 text-primary mb-2" />
              <p className="text-sm font-medium">Premium Feature</p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <div className="w-12 h-12 flex items-center justify-center mb-3">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <Button
              onClick={onUpgradeClick}
              size="sm"
              className="w-full btn-purple"
            >
              Unlock Feature
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

function ResultsContent() {
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetAssessmentResultsQuery<any>();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [showAllContent, setShowAllContent] = useState(false);
  const assessmentsPerPage = 5;

  useEffect(() => {
    if (apiResponse) {
      console.log("API Data received:", apiResponse);

      // Check paid status
      if (apiResponse.paid !== undefined) {
        setIsPaid(apiResponse.paid);
      }

      // Extract assessments data
      let assessmentsData: Assessment[] = [];
      if (apiResponse.reports && Array.isArray(apiResponse.reports)) {
        assessmentsData = apiResponse.reports;
      }

      if (assessmentsData.length > 0) {
        const sortedAssessments = [...assessmentsData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setAssessments(sortedAssessments);
        // Don't set selectedAssessment here - let the next useEffect handle it
      } else {
        setAssessments([]);
        setSelectedAssessment(null);
      }
    } else if (error) {
      console.error("Error loading data:", error);
      setAssessments([]);
      setSelectedAssessment(null);
    }
  }, [apiResponse, error]);

  // Handle URL parameter to select specific assessment
  useEffect(() => {
    if (assessments.length > 0) {
      const assessmentId = searchParams.get("id");

      if (assessmentId) {
        // Find the assessment with the matching ID
        const targetAssessment = assessments.find(
          (assessment) => assessment.id.toString() === assessmentId,
        );

        if (targetAssessment) {
          setSelectedAssessment(targetAssessment);
          // Scroll to top when assessment is selected via URL
          setTimeout(() => {
            const resultsHeader = document.getElementById("results-header");
            if (resultsHeader) {
              resultsHeader.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 100);
        } else {
          // If assessment not found, select the most recent one
          setSelectedAssessment(assessments[0]);
        }
      } else {
        // If no ID parameter, select the most recent assessment
        setSelectedAssessment(assessments[0]);
      }
    }
  }, [assessments, searchParams]);

  const handleAssessmentClick = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    const resultsHeader = document.getElementById("results-header");
    if (resultsHeader) {
      resultsHeader.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const totalPages = Math.ceil(assessments.length / assessmentsPerPage);
  const paginatedAssessments = assessments.slice(
    (currentPage - 1) * assessmentsPerPage,
    currentPage * assessmentsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const historySection = document.getElementById("assessment-history");
    if (historySection) {
      historySection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToUpgrade = () => {
    const header = document.getElementById("results-header");
    if (header) {
      header.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-layout-purple p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="card-purple border-destructive/20 bg-destructive/5">
              <CardContent className="pt-8 pb-6 text-center space-y-6">
                <div className="mx-auto">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">Error Loading Results</h2>
                  <p className="text-muted-foreground">
                    Unable to load your assessment results. Please try again
                    later.
                  </p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-input"
                >
                  Refresh Page
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-layout-purple p-4 md:p-6">
        {/* Payment Status Banner */}
        {!isPaid && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Lock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-amber-900">
                        Unlock Your Full Potential
                      </h3>
                      <p className="text-amber-700 text-sm">
                        Upgrade to access complete career insights, detailed
                        analysis, and personalized recommendations.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className=""
                  >
                    <Button className="btn-purple shadow-lg hover:shadow-xl transition-all duration-300">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div
            id="results-header"
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Your Genius Factor Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                {selectedAssessment
                  ? `Assessment completed on ${new Date(
                    selectedAssessment.createdAt,
                  ).toLocaleDateString()}`
                  : "No assessments completed yet"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedAssessment && (
                <>
                  <PDFReport
                    assessment={selectedAssessment}
                    employee={
                      session?.user?.firstName + " " + session?.user?.lastName
                    }
                    genius_factor_score={selectedAssessment.genius_factor_score}
                  />
                  <Button variant="outline" className="border-input">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>

          <MarketingBlurBoxes
            isPaid={isPaid}
            onUpgradeClick={scrollToUpgrade}
          />

          {selectedAssessment ? (
            <div id="assessment-report-content" className="space-y-8">
              {/* Genius Score Hero Card */}
              <Card className="card-purple-gradient border-0">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 text-white">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">
                          Overall Genius Score
                        </h2>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <div className="text-5xl lg:text-6xl font-bold">
                          {selectedAssessment.genius_factor_score}
                          <span className="text-2xl lg:text-3xl text-white/70">
                            /100
                          </span>
                        </div>
                        <Badge
                          className={`text-lg border-0 ${selectedAssessment.genius_factor_score >= 80
                            ? "bg-emerald-500 text-white"
                            : selectedAssessment.genius_factor_score >= 60
                              ? "bg-purple-500 text-white"
                              : selectedAssessment.genius_factor_score >= 40
                                ? "bg-amber-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          {selectedAssessment.genius_factor_score >= 80
                            ? "Exceptional"
                            : selectedAssessment.genius_factor_score >= 60
                              ? "Strong"
                              : selectedAssessment.genius_factor_score >= 40
                                ? "Developing"
                                : "Emerging"}
                        </Badge>
                      </div>
                      <p className="text-white/80 max-w-2xl">
                        {selectedAssessment.genius_factor_profile
                          ?.primary_genius_factor ? (
                          <>
                            Your strongest area is{" "}
                            <strong className="text-white">
                              {
                                selectedAssessment.genius_factor_profile
                                  .primary_genius_factor
                              }
                            </strong>
                            <br />
                            Your Genius Factor score reflects your
                            talent-passion alignment. Having a primary &
                            secondary genius may impact the score.
                          </>
                        ) : (
                          "Complete assessment to see your genius factors"
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-40 h-40">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-white">
                              {selectedAssessment.genius_factor_score}
                            </div>
                            <div className="text-sm text-white/70">Score</div>
                          </div>
                        </div>
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="white"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${(selectedAssessment.genius_factor_score / 100) *
                              283
                              } 283`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Scores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScoreDisplay
                  score={selectedAssessment.retention_risk_score}
                  label="Retention Risk Score"
                  icon={<Shield className="w-5 h-5" />}
                  color="warning"
                />
                <ScoreDisplay
                  score={selectedAssessment.mobility_opportunity_score}
                  label="Mobility Opportunity Score"
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="success"
                />
                <ScoreDisplay
                  score={safeGet(
                    selectedAssessment.current_role_alignment_analysis,
                    "alignment_score",
                    50,
                  )}
                  label="Role Alignment Score"
                  icon={<Target className="w-5 h-5" />}
                  color="primary"
                />
              </div>

              {/* Genius Factors Grid */}
              {selectedAssessment.genius_factor_profile && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Primary Genius Factor */}
                  <Card className="card-purple hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            Primary Genius Factor
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Your dominant talent
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedAssessment.genius_factor_profile
                            .primary_genius_factor || "Not identified"}
                        </span>
                        <Badge className="bg-purple-600 hover:bg-purple-700">
                          <Zap className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      </div>

                      {selectedAssessment.genius_factor_profile.description && (
                        <p className="text-sm text-muted-foreground">
                          {selectedAssessment.genius_factor_profile.description}
                        </p>
                      )}

                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium">
                            Key Strengths
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {safeArray(
                            selectedAssessment.genius_factor_profile
                              .key_strengths,
                          ).map((strength, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/20"
                            >
                              <CheckCircle className="w-4 h-4 text-success" />
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedAssessment.genius_factor_profile
                        .energy_sources &&
                        selectedAssessment.genius_factor_profile.energy_sources
                          .length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-warning" />
                              <span className="text-sm font-medium">
                                Energy Sources
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {safeArray(
                                selectedAssessment.genius_factor_profile
                                  .energy_sources,
                              ).map((source, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="border-warning/20 text-warning whitespace-normal break-words text-left"
                                >
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>

                  {/* Secondary Genius Factor */}
                  {selectedAssessment.genius_factor_profile
                    .secondary_genius_factor && (
                      <Card className="card-purple hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                              <TargetIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold">
                                Secondary Genius Factor
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Supporting talents
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                              {selectedAssessment.genius_factor_profile
                                .secondary_genius_factor || "Not identified"}
                            </span>
                            <Badge className="bg-purple-600 hover:bg-purple-700">
                              <Zap className="w-3 h-3 mr-1" />
                              Secondary
                            </Badge>
                          </div>

                          {selectedAssessment.genius_factor_profile
                            .development_areas &&
                            selectedAssessment.genius_factor_profile
                              .development_areas.length > 0 && (
                              <div className="mt-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Lightbulb className="w-4 h-4 text-warning" />
                                  <span className="text-sm font-medium">
                                    Development Areas
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {safeArray(
                                    selectedAssessment.genius_factor_profile
                                      .development_areas,
                                  ).map((area, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20"
                                    >
                                      <TrendingUp className="w-4 h-4 text-warning" />
                                      <span className="text-sm">{area}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    )}
                </div>
              )}

              {/* Executive Summary */}
              <Card className="card-purple hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        Executive Summary
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Overview of your genius profile
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExecutiveSummaryDisplay
                    summary={selectedAssessment.executive_summary}
                  />
                </CardContent>
              </Card>

              {/* Current Role Alignment Analysis - Only for paid users */}
              {selectedAssessment.current_role_alignment_analysis && (
                <PremiumSection
                  title="Current Role Alignment"
                  icon={<BarChart3 className="w-5 h-5 text-warning" />}
                  description="How well your current role fits your genius factors"
                  isPaid={isPaid}
                  showAllContent={showAllContent}
                  onTogglePreview={() => setShowAllContent(!showAllContent)}
                  content={
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-success" />
                            Strengths Utilized
                          </h4>
                          <div className="space-y-2">
                            {safeArray(
                              selectedAssessment.current_role_alignment_analysis
                                .strengths_utilized,
                            ).map((strength, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-success/5 border border-success/20"
                              >
                                <div className="font-medium text-success">
                                  {strength}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-warning" />
                            Underutilized Talents
                          </h4>
                          <div className="space-y-2">
                            {safeArray(
                              selectedAssessment.current_role_alignment_analysis
                                .underutilized_talents,
                            ).map((talent, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-warning/5 border border-warning/20"
                              >
                                <div className="font-medium text-warning">
                                  {talent}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-destructive" />
                            Retention Risk Factors
                          </h4>
                          <div className="space-y-2">
                            {safeArray(
                              selectedAssessment.current_role_alignment_analysis
                                .retention_risk_factors,
                            ).map((risk, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                              >
                                <div className="font-medium text-destructive">
                                  {risk}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-primary" />
                            Immediate Actions
                          </h4>
                          <div className="space-y-2">
                            {safeArray(
                              selectedAssessment.current_role_alignment_analysis
                                .immediate_actions,
                            ).map((action, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-primary/5 border border-primary/20"
                              >
                                <div className="font-medium text-primary">
                                  {action}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                />
              )}

              {/* Career Opportunities - Only for paid users */}
              {selectedAssessment.internal_career_opportunities && (
                <PremiumSection
                  title="Career Opportunities"
                  icon={
                    <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  }
                  description="Internal pathways and suggestions"
                  isPaid={isPaid}
                  showAllContent={showAllContent}
                  onTogglePreview={() => setShowAllContent(!showAllContent)}
                  content={
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <div className="icon-brand w-8 h-8 flex items-center justify-center p-0">
                              <Building className="w-4 h-4" />
                            </div>
                            Primary Industries
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {safeArray(
                              selectedAssessment.internal_career_opportunities
                                .primary_industries,
                            ).map((industry, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="badge-brand"
                              >
                                {industry}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <div className="icon-info w-8 h-8 flex items-center justify-center p-0">
                              <BriefcaseBusiness className="w-4 h-4" />
                            </div>
                            Secondary Industries
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {safeArray(
                              selectedAssessment.internal_career_opportunities
                                .secondary_industries,
                            ).map((industry, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="badge-info"
                              >
                                {industry}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {selectedAssessment.internal_career_opportunities
                        .role_suggestions &&
                        selectedAssessment.internal_career_opportunities
                          .role_suggestions.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                              <div className="icon-success w-8 h-8 flex items-center justify-center p-0">
                                <TargetIcon2 className="w-4 h-4" />
                              </div>
                              Role Suggestions
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {safeArray(
                                selectedAssessment.internal_career_opportunities
                                  .role_suggestions,
                              ).map((role, index) => (
                                <Card
                                  key={index}
                                  className="border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 transition-colors"
                                >
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                          {role.role_title}
                                        </h5>
                                        <Badge className="badge-success border-0">
                                          {role.match_score}% Match
                                        </Badge>
                                      </div>

                                      <div className="text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                          <Briefcase className="w-3 h-3" />
                                          {role.department}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Calendar className="w-3 h-3" />
                                          {role.timeline}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <TrendingUp className="w-3 h-3" />
                                          {role.salary_impact}
                                        </div>
                                      </div>

                                      <div className="pt-2">
                                        <h6 className="text-sm font-semibold mb-1">
                                          Required Skills:
                                        </h6>
                                        <div className="flex flex-wrap gap-1">
                                          {safeArray(role.required_skills).map(
                                            (skill, skillIndex) => (
                                              <Badge
                                                key={skillIndex}
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {skill}
                                              </Badge>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                      {selectedAssessment.internal_career_opportunities
                        .transition_strategy && (
                          <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                              <div className="icon-warning w-8 h-8 flex items-center justify-center p-0">
                                <MapPin className="w-4 h-4" />
                              </div>
                              Transition Strategy
                            </h4>
                            <Card className="bg-status-warning dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30">
                              <CardContent className="p-4">
                                <p className="text-sm leading-relaxed text-yellow-800 dark:text-yellow-200">
                                  {
                                    selectedAssessment
                                      .internal_career_opportunities
                                      .transition_strategy
                                  }
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                    </div>
                  }
                />
              )}

              {/* Action Plan & Resources Grid - Only for paid users */}
              {(selectedAssessment.development_action_plan ||
                selectedAssessment.personalized_resources) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Development Action Plan */}
                    {selectedAssessment.development_action_plan && (
                      <PremiumSection
                        title="Development Plan"
                        icon={<Target className="w-5 h-5 text-success" />}
                        description="Short-term to long-term goals"
                        isPaid={isPaid}
                        showAllContent={showAllContent}
                        onTogglePreview={() => setShowAllContent(!showAllContent)}
                        content={
                          <div className="space-y-6">
                            {selectedAssessment.development_action_plan
                              .thirty_day_goals &&
                              selectedAssessment.development_action_plan
                                .thirty_day_goals.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    30-Day Goals
                                  </h4>
                                  <ul className="space-y-2">
                                    {safeArray(
                                      selectedAssessment.development_action_plan
                                        .thirty_day_goals,
                                    ).map((goal, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start gap-2 text-sm"
                                      >
                                        <div className="p-1 mt-0.5">
                                          <CheckCircle className="w-3 h-3 text-primary" />
                                        </div>
                                        <span>{goal}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {selectedAssessment.development_action_plan
                              .ninety_day_goals &&
                              selectedAssessment.development_action_plan
                                .ninety_day_goals.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-warning" />
                                    90-Day Goals
                                  </h4>
                                  <ul className="space-y-2">
                                    {safeArray(
                                      selectedAssessment.development_action_plan
                                        .ninety_day_goals,
                                    ).map((goal, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start gap-2 text-sm"
                                      >
                                        <div className="p-1 mt-0.5">
                                          <Target className="w-3 h-3 text-warning" />
                                        </div>
                                        <span>{goal}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {selectedAssessment.development_action_plan
                              .six_month_goals &&
                              selectedAssessment.development_action_plan
                                .six_month_goals.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-success" />
                                    6-Month Goals
                                  </h4>
                                  <ul className="space-y-2">
                                    {safeArray(
                                      selectedAssessment.development_action_plan
                                        .six_month_goals,
                                    ).map((goal, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start gap-2 text-sm"
                                      >
                                        <div className="p-1 mt-0.5">
                                          <Rocket className="w-3 h-3 text-success" />
                                        </div>
                                        <span>{goal}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        }
                      />
                    )}

                    {/* Personalized Resources */}
                    {selectedAssessment.personalized_resources && (
                      <PremiumSection
                        title="Personalized Resources"
                        icon={<BookMarked className="w-5 h-5 text-accent" />}
                        description="Tools for your growth journey"
                        isPaid={isPaid}
                        showAllContent={showAllContent}
                        onTogglePreview={() => setShowAllContent(!showAllContent)}
                        content={
                          <div className="space-y-6">
                            {selectedAssessment.personalized_resources
                              .learning_resources &&
                              selectedAssessment.personalized_resources
                                .learning_resources.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Book className="w-4 h-4 text-success" />
                                    Learning Resources
                                  </h4>
                                  <div className="space-y-2">
                                    {safeArray(
                                      selectedAssessment.personalized_resources
                                        .learning_resources,
                                    ).map((resource, index) => (
                                      <Card
                                        key={index}
                                        className="border-success/20"
                                      >
                                        <CardContent className="p-3">
                                          <div className="flex items-start gap-3">
                                            <BookOpen className="w-5 h-5 text-success mt-0.5" />
                                            <div className="flex-1">
                                              <div className="font-medium">
                                                {resource.title}
                                              </div>
                                              <div className="text-xs text-muted-foreground">
                                                {resource.type} •{" "}
                                                {resource.provider ||
                                                  resource.author ||
                                                  "Various"}
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {selectedAssessment.personalized_resources
                              .affirmations &&
                              selectedAssessment.personalized_resources
                                .affirmations.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Affirmations
                                  </h4>
                                  <div className="space-y-2">
                                    {safeArray(
                                      selectedAssessment.personalized_resources
                                        .affirmations,
                                    ).map((affirmation, index) => (
                                      <div
                                        key={index}
                                        className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm italic"
                                      >
                                        "{affirmation}"
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {selectedAssessment.personalized_resources
                              .mindfulness_practices &&
                              selectedAssessment.personalized_resources
                                .mindfulness_practices.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-warning" />
                                    Mindfulness Practices
                                  </h4>
                                  <div className="space-y-2">
                                    {safeArray(
                                      selectedAssessment.personalized_resources
                                        .mindfulness_practices,
                                    ).map((practice, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start gap-2 p-2 text-sm"
                                      >
                                        <div className="icon-wrapper-amber p-1 mt-0.5">
                                          <Sparkles className="w-3 h-3 text-warning" />
                                        </div>
                                        <span>{practice}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        }
                      />
                    )}
                  </div>
                )}
            </div>
          ) : (
            <Card className="card-purple">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="mx-auto mb-6 p-4">
                  <Brain className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  No Assessments Completed
                </h3>
                <p className="text-muted-foreground mb-6">
                  Complete an assessment to unlock your Genius Factor profile
                </p>
                <Button className="btn-purple" asChild>
                  <Link href="/employee-dashboard/assessment">
                    <Target className="w-4 h-4 mr-2" />
                    Take Assessment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Assessment History */}
          {assessments.length > 0 && (
            <Card className="card-purple" id="assessment-history">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      Assessment History
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Your previous assessments
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paginatedAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className={`group p-4 rounded-xl border cursor-pointer transition-all duration-300 ${selectedAssessment?.id === assessment.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                        : "border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
                        }`}
                      onClick={() => handleAssessmentClick(assessment)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${selectedAssessment?.id === assessment.id
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-400/20 dark:text-purple-300"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                            >
                              <Brain className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold">
                                Genius Factor Assessment #{assessment.id}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(
                                  assessment.createdAt,
                                ).toLocaleDateString()}{" "}
                                •{" "}
                                {assessment.genius_factor_profile
                                  ?.primary_genius_factor || "Pending Analysis"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold">
                              {assessment.genius_factor_score}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              /100
                            </div>
                          </div>
                          <Badge>
                            {assessment.genius_factor_score >= 80
                              ? "Exceptional"
                              : assessment.genius_factor_score >= 60
                                ? "Strong"
                                : assessment.genius_factor_score >= 40
                                  ? "Developing"
                                  : "Emerging"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-muted"
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1,
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className={
                              currentPage === page
                                ? "bg-primary text-primary-foreground"
                                : "cursor-pointer hover:bg-muted"
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
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-muted"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<Loader />}>
      <ResultsContent />
    </Suspense>
  );
}
