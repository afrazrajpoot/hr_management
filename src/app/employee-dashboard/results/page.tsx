"use client";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import PDFReport from "@/components/employee/PDFReport";
import Loader from "@/components/Loader";
import { useGetAssessmentResultsQuery } from "@/redux/employe-api";
import { useSession } from "next-auth/react";

// ... (keep all your existing interfaces as they are)

const isValid = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    return (
      lower !== "" &&
      lower !== "not specified" &&
      lower !== "none identified" &&
      lower !== "n/a"
    );
  }
  if (Array.isArray(value)) {
    return value.length > 0 && value.some((item) => isValid(item));
  }
  if (typeof value === "object") {
    return (
      Object.keys(value).length > 0 &&
      Object.values(value).some((item) => isValid(item))
    );
  }
  return true;
};

export default function Results() {
  const { data, isLoading, error } = useGetAssessmentResultsQuery<any>();
  const { data: session } = useSession();
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaid, setIsPaid] = useState(true); // Assume paid by default
  const [showAllContent, setShowAllContent] = useState(false); // For preview mode
  const assessmentsPerPage = 5;

  useEffect(() => {
    if (data) {
      const assessmentsData = Array.isArray(data) ? data : data.data || [];
      if (!Array.isArray(assessmentsData)) {
        console.error("Invalid data format from RTK Query:", data);
        setAssessments([]);
        return;
      }

      // Check if user has access to full data by checking if any assessment has complete data
      const hasFullAccess = assessmentsData.some(
        (assessment: Assessment) => 
          assessment.currentRoleAlignmentAnalysisJson || 
          assessment.internalCareerOpportunitiesJson ||
          assessment.retentionAndMobilityStrategiesJson
      );
      
      setIsPaid(hasFullAccess);
      
      const sortedAssessments = [...assessmentsData].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAssessments(sortedAssessments);
      setSelectedAssessment(sortedAssessments[0] || null);
      setCurrentPage(1);
    } else if (error) {
      console.error("Error from RTK Query:", error);
      setAssessments([]);
      setSelectedAssessment(null);
      setIsPaid(true); // Default to paid on error
    }
  }, [data, error]);

  const handleAssessmentClick = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    const resultsHeader = document.getElementById("results-header");
    if (resultsHeader) {
      resultsHeader.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "primary";
    if (score >= 40) return "warning";
    return "destructive";
  };

  const totalPages = Math.ceil(assessments.length / assessmentsPerPage);
  const paginatedAssessments = assessments.slice(
    (currentPage - 1) * assessmentsPerPage,
    currentPage * assessmentsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const historySection = document.getElementById("assessment-history");
    if (historySection) {
      historySection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Render section with blur effect for unpaid users
  const renderSection = (
    title: string,
    icon: React.ReactNode,
    description: string,
    content: React.ReactNode,
    isPremium: boolean = false,
    showBlur: boolean = false
  ) => {
    const shouldBlur = !isPaid && isPremium;
    const isVisible = isPaid || showAllContent || !shouldBlur;
    
    return (
      <Card className="card-primary card-hover relative overflow-hidden">
        {shouldBlur && (
          <div className={`absolute inset-0 z-10 backdrop-blur-sm transition-all duration-300 ${isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Lock className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Content</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Unlock your full Genius Factor analysis including detailed career insights, alignment scores, and personalized development plans.
              </p>
              <Button
                onClick={() => setShowAllContent(true)}
                className="btn-gradient-primary"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Full Analysis
              </Button>
            </div>
          </div>
        )}
        
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`icon-wrapper-${shouldBlur ? 'amber' : 'blue'} p-2`}>
                {icon}
              </div>
              <div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  {title}
                  {shouldBlur && (
                    <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                      <Lock className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {description}
                </div>
              </div>
            </div>
            {shouldBlur && isVisible && (
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-amber-50"
                onClick={() => setShowAllContent(false)}
              >
                <EyeOff className="w-3 h-3 mr-1" />
                Hide
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
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
        <div className="min-h-screen gradient-bg-primary p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="card-primary border-destructive/20 bg-destructive/5">
              <CardContent className="pt-8 pb-6 text-center space-y-6">
                <div className="icon-wrapper-blue mx-auto">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold gradient-text-primary">
                    Error Loading Results
                  </h2>
                  <p className="text-muted-foreground">
                    Unable to load your assessment results. Please try again later.
                  </p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-input"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
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
      <div className="min-h-screen gradient-bg-primary p-4 md:p-6">
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
                        Upgrade to access complete career insights, detailed analysis, and personalized recommendations.
                      </p>
                    </div>
                  </div>
                  <Button className="btn-gradient-primary whitespace-nowrap">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 decorative-gradient-blur-blue opacity-15" />
          <div className="absolute bottom-20 right-10 decorative-gradient-blur-purple opacity-15" />
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div
            id="results-header"
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary">
                Your Genius Factor Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                {selectedAssessment
                  ? `Assessment completed on ${new Date(
                      selectedAssessment.createdAt
                    ).toLocaleDateString()}`
                  : "No assessments completed yet"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isPaid ? (
                <>
                  <PDFReport
                    assessment={selectedAssessment}
                    employee={
                      session?.user?.firstName + " " + session?.user?.lastName
                    }
                    genius_factor_score={selectedAssessment?.geniusFactorScore}
                  />
                  <Button variant="outline" className="border-input">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="border-input" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Report (Upgrade Required)
                </Button>
              )}
            </div>
          </div>

          {selectedAssessment ? (
            <>
              {/* Genius Score Hero Card - Always visible */}
              <Card className="card-primary border-0 gradient-bg-primary">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="ai-recommendation-icon-wrapper">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold gradient-text-primary">
                          Overall Genius Score
                        </h2>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">
                          {selectedAssessment.geniusFactorScore}
                          <span className="text-2xl lg:text-3xl text-muted-foreground">
                            /100
                          </span>
                        </div>
                        <Badge
                          className={`badge-${getScoreColor(
                            selectedAssessment.geniusFactorScore
                          )} text-lg`}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          {selectedAssessment.geniusFactorScore >= 80
                            ? "Exceptional"
                            : selectedAssessment.geniusFactorScore >= 60
                            ? "Strong"
                            : selectedAssessment.geniusFactorScore >= 40
                            ? "Developing"
                            : "Emerging"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground max-w-2xl">
                        Your strongest area is{" "}
                        <strong className="text-primary">
                          {
                            selectedAssessment.geniusFactorProfileJson
                              .primary_genius_factor
                          }
                        </strong>{" "}
                        with a score of {selectedAssessment.geniusFactorScore}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-40 h-40">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold">
                              {selectedAssessment.geniusFactorScore}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Score
                            </div>
                          </div>
                        </div>
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={`hsl(var(--${getScoreColor(
                              selectedAssessment.geniusFactorScore
                            )}))`}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${
                              (selectedAssessment.geniusFactorScore / 100) * 283
                            } 283`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Genius Factors Grid - Always visible */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary Genius Factor */}
                <Card className="card-primary card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="icon-wrapper-blue p-2">
                        <Target className="w-5 h-5 text-primary" />
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
                      <span className="text-xl font-bold text-primary">
                        {
                          selectedAssessment.geniusFactorProfileJson
                            .primary_genius_factor
                        }
                      </span>
                      <Badge className="badge-blue">
                        <Zap className="w-3 h-3 mr-1" />
                        Primary
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedAssessment.geniusFactorProfileJson.description}
                    </p>
                    {selectedAssessment.geniusFactorProfileJson
                      ?.energy_sources &&
                      isValid(
                        selectedAssessment.geniusFactorProfileJson
                          .energy_sources
                      ) && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-warning" />
                            <span className="text-sm font-medium">
                              Energy Sources
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedAssessment.geniusFactorProfileJson.energy_sources.map(
                              (source, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="border-warning/20 text-warning whitespace-normal break-words text-left"
                                >
                                  {source}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Secondary Genius Factor */}
                <Card className="card-primary card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="icon-wrapper-purple p-2">
                        <TargetIcon className="w-5 h-5 text-accent" />
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
                      <span className="text-xl font-bold text-accent">
                        {selectedAssessment.geniusFactorProfileJson
                          .secondary_genius_factor === "None Identified"
                          ? "Primary Focus"
                          : selectedAssessment.geniusFactorProfileJson
                              .secondary_genius_factor}
                      </span>
                      <Badge className="badge-purple">
                        <Star className="w-3 h-3 mr-1" />
                        Secondary
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedAssessment.geniusFactorProfileJson
                        .secondary_description ||
                        "Your primary genius factor is highly dominant, indicating focused expertise in this area."}
                    </p>
                    {selectedAssessment.geniusFactorProfileJson
                      ?.key_strengths &&
                      isValid(
                        selectedAssessment.geniusFactorProfileJson.key_strengths
                      ) && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium">
                              Key Strengths
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedAssessment.geniusFactorProfileJson.key_strengths.map(
                              (strength, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/20"
                                >
                                  <CheckCircle className="w-4 h-4 text-success" />
                                  <span className="text-sm">{strength}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>

              {/* Executive Summary - Always visible */}
              <Card className="card-primary card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="icon-wrapper-green p-2">
                      <BookOpen className="w-5 h-5 text-success" />
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
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                    <p className="leading-relaxed">
                      {selectedAssessment.executiveSummary}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Current Role Alignment - Premium */}
              {renderSection(
                "Current Role Alignment",
                <BarChart3 className="w-5 h-5 text-warning" />,
                "Fit with your current position",
                selectedAssessment.currentRoleAlignmentAnalysisJson ? (
                  <div className="space-y-6">
                    {selectedAssessment.currentRoleAlignmentAnalysisJson
                      ?.alignment_score && (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20">
                        <div>
                          <div className="text-sm font-medium text-warning">
                            Alignment Score
                          </div>
                          <div className="text-2xl font-bold">
                            {
                              selectedAssessment
                                .currentRoleAlignmentAnalysisJson
                                .alignment_score
                            }
                          </div>
                        </div>
                        <Badge
                          className={`badge-${
                            selectedAssessment.currentRoleAlignmentAnalysisJson.retention_risk_level
                              ?.toLowerCase()
                              .includes("low")
                              ? "green"
                              : "amber"
                          }`}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {
                            selectedAssessment.currentRoleAlignmentAnalysisJson
                              .retention_risk_level
                          }
                        </Badge>
                      </div>
                    )}

                    {selectedAssessment.currentRoleAlignmentAnalysisJson
                      ?.strengths_utilized && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          Strengths Being Utilized
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedAssessment.currentRoleAlignmentAnalysisJson.strengths_utilized.map(
                            (strength, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/20"
                              >
                                <Target className="w-4 h-4 text-success" />
                                <span className="text-sm">{strength}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {selectedAssessment.currentRoleAlignmentAnalysisJson
                      ?.underutilized_talents && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-warning" />
                          Growth Opportunities
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedAssessment.currentRoleAlignmentAnalysisJson.underutilized_talents.map(
                            (talent, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20"
                              >
                                <TrendingUp className="w-4 h-4 text-warning" />
                                <span className="text-sm">{talent}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No alignment data available</p>
                  </div>
                ),
                true,
                true
              )}

              {/* Internal Career Opportunities - Premium */}
              {renderSection(
                "Career Opportunities",
                <Globe className="w-5 h-5 text-accent" />,
                "Internal pathways and suggestions",
                selectedAssessment.internalCareerOpportunitiesJson ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          Primary Industry
                        </h4>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="text-lg font-semibold text-primary">
                            {
                              selectedAssessment.internalCareerOpportunitiesJson
                                .primary_industry
                            }
                          </div>
                        </div>

                        {selectedAssessment.internalCareerOpportunitiesJson
                          .secondary_industry && (
                          <>
                            <h4 className="font-semibold flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-accent" />
                              Secondary Industry
                            </h4>
                            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                              <div className="text-lg font-semibold text-accent">
                                {
                                  selectedAssessment
                                    .internalCareerOpportunitiesJson
                                    .secondary_industry
                                }
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-success" />
                          Transition Timeline
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(
                            selectedAssessment.internalCareerOpportunitiesJson
                              .transition_timeline || {}
                          ).map(([key, value], index) => (
                            <div
                              key={index}
                              className="flex flex-col gap-1 p-2 rounded-lg bg-success/5 border border-success/20"
                            >
                              <span className="text-sm font-medium capitalize">
                                {key.replace("_", " ")}
                              </span>
                              <Badge className="badge-green whitespace-normal break-words">
                                {value}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedAssessment.internalCareerOpportunitiesJson
                      .recommended_departments && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-primary" />
                          Recommended Departments
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAssessment.internalCareerOpportunitiesJson.recommended_departments.map(
                            (dept, index) => (
                              <Badge key={index} className="badge-blue">
                                {dept}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {selectedAssessment.internalCareerOpportunitiesJson
                      .specific_role_suggestions && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-accent" />
                          Role Suggestions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedAssessment.internalCareerOpportunitiesJson.specific_role_suggestions.map(
                            (role, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 rounded-lg bg-accent/5 border border-accent/20"
                              >
                                <Sparkles className="w-4 h-4 text-accent" />
                                <span className="text-sm">{role}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No career opportunity data available</p>
                  </div>
                ),
                true,
                true
              )}

              {/* Action Plan & Resources Grid - Premium */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Development Action Plan - Premium */}
                {renderSection(
                  "Development Plan",
                  <Target className="w-5 h-5 text-success" />,
                  "Short-term to long-term goals",
                  selectedAssessment.developmentActionPlanJson ? (
                    <div className="space-y-4">
                      {selectedAssessment.developmentActionPlanJson
                        .thirty_day_goals && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            30-Day Goals
                          </h4>
                          <ul className="space-y-2">
                            {selectedAssessment.developmentActionPlanJson.thirty_day_goals.map(
                              (goal, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <div className="icon-wrapper-blue p-1 mt-0.5">
                                    <CheckCircle className="w-3 h-3 text-primary" />
                                  </div>
                                  {goal}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {selectedAssessment.developmentActionPlanJson
                        .ninety_day_goals && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-warning" />
                            90-Day Goals
                          </h4>
                          <ul className="space-y-2">
                            {selectedAssessment.developmentActionPlanJson.ninety_day_goals.map(
                              (goal, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <div className="icon-wrapper-amber p-1 mt-0.5">
                                    <Target className="w-3 h-3 text-warning" />
                                  </div>
                                  {goal}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No development plan available</p>
                    </div>
                  ),
                  true,
                  true
                )}

                {/* Personalized Resources - Premium */}
                {renderSection(
                  "Personalized Resources",
                  <BookMarked className="w-5 h-5 text-accent" />,
                  "Tools for your growth journey",
                  selectedAssessment.personalizedResourcesJson ? (
                    <div className="space-y-4">
                      {selectedAssessment.personalizedResourcesJson
                        .learning_resources && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-success" />
                            Learning Resources
                          </h4>
                          <ul className="space-y-2">
                            {selectedAssessment.personalizedResourcesJson.learning_resources.map(
                              (resource, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <div className="icon-wrapper-green p-1 mt-0.5">
                                    <Sparkles className="w-3 h-3 text-success" />
                                  </div>
                                  {resource}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {selectedAssessment.personalizedResourcesJson
                        .affirmations && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Affirmations
                          </h4>
                          <div className="space-y-2">
                            {selectedAssessment.personalizedResourcesJson.affirmations.map(
                              (affirmation, index) => (
                                <div
                                  key={index}
                                  className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-sm italic"
                                >
                                  "{affirmation}"
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookMarked className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No personalized resources available</p>
                    </div>
                  ),
                  true,
                  true
                )}
              </div>

              {/* Additional Sections - Premium */}
              {selectedAssessment.retentionAndMobilityStrategiesJson &&
                renderSection(
                  "Retention Strategies",
                  <Shield className="w-5 h-5 text-primary" />,
                  "Organizational support recommendations",
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedAssessment.retentionAndMobilityStrategiesJson
                      .retention_strategies && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">
                          Retention Focus
                        </h4>
                        <ul className="space-y-1">
                          {selectedAssessment.retentionAndMobilityStrategiesJson.retention_strategies
                            .slice(0, 3)
                            .map((strategy, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-center gap-2"
                              >
                                <CheckCircle className="w-3 h-3 text-primary" />
                                {strategy}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {selectedAssessment.retentionAndMobilityStrategiesJson
                      .development_support && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">
                          Development Support
                        </h4>
                        <ul className="space-y-1">
                          {selectedAssessment.retentionAndMobilityStrategiesJson.development_support
                            .slice(0, 3)
                            .map((support, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-center gap-2"
                              >
                                <TrendingUp className="w-3 h-3 text-success" />
                                {support}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {selectedAssessment.retentionAndMobilityStrategiesJson
                      .internal_mobility_recommendations && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">
                          Mobility Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {selectedAssessment.retentionAndMobilityStrategiesJson.internal_mobility_recommendations
                            .slice(0, 3)
                            .map((rec, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-center gap-2"
                              >
                                <Globe className="w-3 h-3 text-accent" />
                                {rec}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>,
                  true,
                  true
                )}
            </>
          ) : (
            <Card className="card-primary">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="icon-wrapper-purple mx-auto mb-6 p-4">
                  <Brain className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-2xl font-bold gradient-text-primary mb-4">
                  No Assessments Completed
                </h3>
                <p className="text-muted-foreground mb-6">
                  Complete an assessment to unlock your Genius Factor profile
                </p>
                <Button className="btn-gradient-primary" asChild>
                  <Link href="/employee-dashboard/assessment">
                    <Target className="w-4 h-4 mr-2" />
                    Take Assessment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Assessment History - Always visible */}
          <Card className="card-primary" id="assessment-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="icon-wrapper-blue p-2">
                  <FileText className="w-5 h-5 text-primary" />
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
                {paginatedAssessments.length > 0 ? (
                  paginatedAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className={`group p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        selectedAssessment?.id === assessment.id
                          ? "border-primary bg-primary/5"
                          : "border-input hover:border-primary/50 hover:bg-primary/3"
                      }`}
                      onClick={() => handleAssessmentClick(assessment)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                selectedAssessment?.id === assessment.id
                                  ? "bg-primary/20"
                                  : "bg-muted"
                              }`}
                            >
                              <Brain className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">
                                Genius Factor Assessment #{assessment.id}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(
                                  assessment.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2 ml-11">
                            {assessment.executiveSummary.substring(0, 100)}...
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold">
                              {assessment.geniusFactorScore}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              /100
                            </div>
                          </div>
                          <Badge
                            className={`badge-${getScoreColor(
                              assessment.geniusFactorScore
                            )}`}
                          >
                            {assessment.geniusFactorScore >= 80
                              ? "Exceptional"
                              : assessment.geniusFactorScore >= 60
                              ? "Strong"
                              : assessment.geniusFactorScore >= 40
                              ? "Developing"
                              : "Emerging"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="icon-wrapper-blue mx-auto mb-4 p-3">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">
                      No assessment history available
                    </p>
                  </div>
                )}
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
                      (_, index) => index + 1
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
                            Math.min(totalPages, currentPage + 1)
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

          {/* Recommended Actions */}
          <Card className="ai-recommendation-card">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="ai-recommendation-icon-wrapper">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Recommended Next Steps
                  </h3>
                  <p className="text-white/80">
                    Personalized actions based on your profile
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/employee-dashboard/career-Pathways">
                  <div className="quick-action-item group cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="icon-wrapper-blue">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Explore Career Paths
                        </h4>
                        <p className="text-sm text-white/80">
                          Based on your profile
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                      Discover roles that match your genius factor
                    </div>
                  </div>
                </Link>

                <Link href="/employee-dashboard/development">
                  <div className="quick-action-item group cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="icon-wrapper-green">
                        <Target className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Skill Development
                        </h4>
                        <p className="text-sm text-white/80">
                          Personalized roadmap
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                      Build skills aligned with your strengths
                    </div>
                  </div>
                </Link>

                {!isPaid ? (
                  <div 
                    className="quick-action-item group cursor-pointer"
                    onClick={() => {
                      // Scroll to upgrade section or show modal
                      document.getElementById('results-header')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="icon-wrapper-purple">
                        <Lock className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Unlock Full Analysis
                        </h4>
                        <p className="text-sm text-white/80">
                          Premium features
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                      Access complete career insights
                    </div>
                  </div>
                ) : (
                  <Link href="/employee-dashboard/assessment">
                    <div className="quick-action-item group cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="icon-wrapper-purple">
                          <Brain className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            Track Progress
                          </h4>
                          <p className="text-sm text-white/80">
                            Retake assessment
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                        Monitor your development over time
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

// Add missing imports
import { RefreshCw } from "lucide-react";