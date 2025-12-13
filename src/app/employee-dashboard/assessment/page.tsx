"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  CreditCard,
  Building,
  Mail,
  Calendar,
  MapPin,
  UserCheck,
  RefreshCw,
  Brain,
  Target,
  BarChart3,
  Sparkles,
  Shield,
  Rocket,
  Award,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  fetchAssessmentQuestions,
  submitAssessment,
  generateCareerRecommendation,
} from "@/lib/assessment-api";
import type {
  AssessmentAnalysisResult,
  PartWithQuestions,
} from "@/types/assessment-types";
import { useSession } from "next-auth/react";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

const STORAGE_KEY = "assessment_progress";

export default function Assessment() {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useRouter();
  const [analysisResults, setAnalysisResults] = useState<
    AssessmentAnalysisResult[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionsByPart, setQuestionsByPart] = useState<PartWithQuestions[]>(
    []
  );
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(true);

  // States for handling guideline responses
  const [guidelineType, setGuidelineType] = useState<
    | "unauthorized"
    | "notFound"
    | "subscription"
    | "profileIncomplete"
    | "noProfile"
    | null
  >(null);
  const [guidelineMessage, setGuidelineMessage] = useState<string>("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [hasExistingReport, setHasExistingReport] = useState(false);
  const [userStatus, setUserStatus] = useState<{
    paid: boolean;
    hasEmployeeProfile: boolean;
    isProfileComplete: boolean;
  } | null>(null);

  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();

  // Network connection check
  const checkNetworkConnection = () => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  };

  // Fetch questions on mount - now properly handles guideline responses
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsFetchingQuestions(true);
        setError(null);
        setGuidelineType(null);
        setGuidelineMessage("");
        setMissingFields([]);
        setHasExistingReport(false);
        setUserStatus(null);

        // Check network connection
        if (!checkNetworkConnection()) {
          throw new Error(
            "No internet connection. Please check your network and try again."
          );
        }

        const response = await fetchAssessmentQuestions();

        if (!response.success) {
          // Handle guideline responses based on the API structure
          if (response.error === "Unauthorized") {
            setGuidelineType("unauthorized");
            setGuidelineMessage(
              "You need to sign in to access the assessment."
            );
          } else if (response.error === "User not found") {
            setGuidelineType("notFound");
            setGuidelineMessage(
              "Your account could not be found. Please contact support."
            );
          } else if (response.needsSubscription) {
            setGuidelineType("subscription");
            setGuidelineMessage(
              response.message ||
                "Subscribe to attempt the assessment multiple times."
            );
            setHasExistingReport(response.hasExistingReport || false);
          } else if (response.isProfileComplete === false) {
            setGuidelineType("profileIncomplete");
            setGuidelineMessage(
              response.message ||
                "Complete your profile before taking the assessment."
            );
            setMissingFields(response.missingFields || []);
          } else if (response.hasEmployeeProfile === false) {
            setGuidelineType("noProfile");
            setGuidelineMessage(
              response.message ||
                "Employee profile not found. Please complete your profile setup."
            );
          } else {
            // Fallback to generic error
            throw new Error(
              response.error ||
                response.message ||
                "Failed to load assessment questions."
            );
          }
          return;
        }

        // Success case
        setQuestionsByPart(response.data || []);
        setUserStatus(response.userStatus || null);
      } catch (err: any) {
        console.error("Failed to load questions:", err);

        // Extract error message safely
        let errorMessage =
          "Failed to load assessment questions. Please try refreshing the page.";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        } else if (err?.message) {
          errorMessage = err.message;
        } else if (err?.error) {
          errorMessage = err.error;
        }

        setError(errorMessage);
      } finally {
        setIsFetchingQuestions(false);
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Load progress from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        setAnswers(parsedProgress.answers || {});
        setCurrentPartIndex(parsedProgress.currentPartIndex || 0);
        setCurrentQuestionIndex(parsedProgress.currentQuestionIndex || 0);
        setTimeSpent(parsedProgress.timeSpent || 0);
        setHasSavedProgress(true);
      } catch (error) {
        console.error("Failed to load saved progress:", error);
        localStorage.removeItem(STORAGE_KEY);
        setHasSavedProgress(false);
      }
    } else {
      setHasSavedProgress(false);
    }
    setIsLoading(false);
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isLoading ||
      isFetchingQuestions ||
      guidelineType
    )
      return;

    // Don't save if we have analysis results (assessment is complete)
    if (analysisResults) {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedProgress(false);
      return;
    }

    // Don't save empty progress on initial load
    if (
      Object.keys(answers).length === 0 &&
      timeSpent === 0 &&
      currentPartIndex === 0 &&
      currentQuestionIndex === 0
    ) {
      return;
    }

    const progressData = {
      answers,
      currentPartIndex,
      currentQuestionIndex,
      timeSpent,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    setHasSavedProgress(true);
  }, [
    answers,
    currentPartIndex,
    currentQuestionIndex,
    timeSpent,
    analysisResults,
    isLoading,
    isFetchingQuestions,
    guidelineType, // Prevent saving if guideline is shown
  ]);

  const visibleQuestions = questionsByPart;

  const currentPart = visibleQuestions[currentPartIndex];

  // Guard against invalid index if user status changes or state is stale
  useEffect(() => {
    if (
      !currentPart &&
      visibleQuestions.length > 0 &&
      !isLoading &&
      !isFetchingQuestions &&
      !guidelineType
    ) {
      setCurrentPartIndex(0);
      setCurrentQuestionIndex(0);
    }
  }, [
    currentPart,
    visibleQuestions.length,
    isLoading,
    isFetchingQuestions,
    guidelineType,
  ]);

  const currentPartQuestions = currentPart?.questions || [];
  const totalQuestionsInPart = currentPartQuestions.length;
  const currentQ = currentPartQuestions[currentQuestionIndex];

  const progress =
    totalQuestionsInPart > 0
      ? ((currentQuestionIndex + 1) / totalQuestionsInPart) * 100
      : 0;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate network connection
      if (!checkNetworkConnection()) {
        throw new Error(
          "No internet connection. Please check your network and try again."
        );
      }

      // Validate that all questions are answered before submitting
      const unansweredQuestions = visibleQuestions.flatMap((part) =>
        part.questions.filter((q) => !answers[q.id])
      );

      if (unansweredQuestions.length > 0) {
        throw new Error(
          `Please answer all ${unansweredQuestions.length} remaining questions before submitting.`
        );
      }

      const partsData = visibleQuestions.map((part) => {
        const optionCounts: Record<string, number> = {};
        part.questions.forEach((q) => {
          if (answers[q.id]) {
            // Extract the letter from the API option (e.g., "C)" -> "C")
            const match = answers[q.id].match(/^([A-Z])\)/);
            const optionLetter = match ? match[1] : answers[q.id].charAt(0);
            optionCounts[optionLetter] = (optionCounts[optionLetter] || 0) + 1;
          }
        });
        return {
          part: part.part,
          optionCounts,
        };
      });

      const allAnswers = visibleQuestions.flatMap((part) =>
        part.questions.map((q) => ({
          id: q.id,
          part: part.part,
          section: q.section,
          question: q.question,
          selectedOption: answers[q.id] || null,
        }))
      );

      // Validate user session
      if (!session?.user?.id) {
        throw new Error("Session expired. Please sign in again.");
      }

      const result = await submitAssessment(
        {
          data: partsData,
          userId: session.user.id,
          hrId: session?.user?.hrId || "individual_user",
          departement: session?.user?.department?.at(-1) || "Healthcare",
          employeeName: session.user.name || "",
          employeeEmail: session.user.email || "",
          is_paid: session?.user.paid || false,
          allAnswers,
        },
        session?.user?.fastApiToken || ""
      );

      // Log for debugging
      console.log("Raw API Response:", result);
      console.log("Response type:", typeof result);
      console.log("Is array?", Array.isArray(result));
      console.log("Response length:", result?.length);

      // More flexible parsing
      let analysisData: AssessmentAnalysisResult[] | null = null;
      if (result) {
        if (Array.isArray(result)) {
          analysisData = result.length > 0 ? result : null;
        } else if (result.data && Array.isArray(result.data)) {
          analysisData = result.data.length > 0 ? result.data : null;
        } else if (result.analysis && Array.isArray(result.analysis)) {
          analysisData = result.analysis.length > 0 ? result.analysis : null;
        }

        // Check for errors in wrapped response
        if (
          result.error ||
          (result.message && result.message.toLowerCase().includes("error"))
        ) {
          throw new Error(
            result.error || result.message || "API reported an error"
          );
        }
        if (!result.success && typeof result.success !== "undefined") {
          throw new Error(result.message || "API submission failed");
        }
      }

      if (!analysisData) {
        throw new Error("Invalid response from API - no valid data received");
      }

      // Set results only if validation passes
      setAnalysisResults(analysisData);
      setError(null);

      // Generate career recommendation (fire and forget - don't block submission)
      try {
        await generateCareerRecommendation(
          session.user.id,
          session?.user?.fastApiToken || ""
        );
      } catch (recError) {
        console.warn("Career recommendation generation failed:", recError);
        // Don't throw - this shouldn't block the assessment submission
      }

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedProgress(false);

      toast.success("Assessment submitted successfully!", {
        description: "Your results have been analyzed.",
      });

      // Emit socket event if needed
      if (socket && isConnected && session?.user?.hrId) {
        socket.emit("hr_dashboard", { hrId: session.user.hrId });
      }

      // Navigate to results after a brief delay
      setTimeout(() => {
        navigate.push("/employee-dashboard/results");
      }, 2000);
    } catch (err: any) {
      console.error("Submission error details:", err); // Log full error

      // Safe error message extraction
      let errorMessage = "Failed to submit assessment";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.toString) {
        errorMessage = err.toString();
      }

      // Customize message based on common issues
      if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        errorMessage += ". Please check your internet connection.";
      } else if (
        errorMessage.includes("token") ||
        errorMessage.includes("auth")
      ) {
        errorMessage +=
          ". Your session may have expired – try signing in again.";
      }

      setError(`Failed to analyze assessment: ${errorMessage}`);
      setAnalysisResults(null);

      toast.error("Failed to submit assessment", {
        description: errorMessage,
        duration: 5000, // Longer duration for error messages
      });

      // Don't navigate on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const retrySubmission = async () => {
    setError(null);
    await handleSubmit();
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestionsInPart - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentPartIndex < visibleQuestions.length - 1) {
      setCurrentPartIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentPartIndex > 0) {
      const prevPart = visibleQuestions[currentPartIndex - 1];
      setCurrentPartIndex(currentPartIndex - 1);
      setCurrentQuestionIndex(prevPart.questions.length - 1);
    }
  };

  const resetProgress = () => {
    if (typeof window === "undefined") return;
    if (
      confirm(
        "Are you sure you want to restart the assessment? Your current progress will be lost."
      )
    ) {
      setAnswers({});
      setCurrentPartIndex(0);
      setCurrentQuestionIndex(0);
      setTimeSpent(0);
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedProgress(false);
      toast.success("Assessment restarted successfully!");
    }
  };

  const reloadQuestions = async () => {
    setIsFetchingQuestions(true);
    setError(null);
    try {
      const response = await fetchAssessmentQuestions();

      if (!response.success) {
        throw new Error(
          response.error || response.message || "Failed to load questions"
        );
      }

      setQuestionsByPart(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to reload questions. Please try again.");
    } finally {
      setIsFetchingQuestions(false);
    }
  };

  const isAnswered = !!answers[currentQ?.id];
  const isPartComplete = currentPartQuestions.every((q) => !!answers[q.id]);
  const isAllComplete = visibleQuestions.every((part) =>
    part.questions.every((q) => !!answers[q.id])
  );

  const isLastQuestionInPart =
    currentQuestionIndex === totalQuestionsInPart - 1;
  const isLastPart = currentPartIndex === visibleQuestions.length - 1;

  // Helper to get icon for guideline type
  const getGuidelineIcon = (type: typeof guidelineType) => {
    switch (type) {
      case "unauthorized":
        return <User className="w-10 h-10 text-destructive" />;
      case "subscription":
        return <CreditCard className="w-10 h-10 text-warning" />;
      case "profileIncomplete":
        return <UserCheck className="w-10 h-10 text-primary" />;
      case "noProfile":
        return <Building className="w-10 h-10 text-secondary" />;
      case "notFound":
        return <AlertCircle className="w-10 h-10 text-destructive" />;
      default:
        return <AlertCircle className="w-10 h-10 text-destructive" />;
    }
  };

  // Helper to get primary action button for guideline
  const getGuidelineAction = () => {
    switch (guidelineType) {
      case "unauthorized":
        return (
          <Button
            onClick={() => navigate.push("/api/auth/signin")}
            className="mt-4 btn-gradient-primary"
          >
            Sign In
          </Button>
        );

      case "profileIncomplete":
      case "noProfile":
        return (
          <Button
            onClick={() => navigate.push("/employee-dashboard/profile")}
            className="mt-4 btn-gradient-primary"
          >
            Complete Profile
          </Button>
        );
      case "notFound":
        return (
          <Button
            onClick={() => (window.location.href = "/support")}
            variant="outline"
            className="mt-4"
          >
            Contact Support
          </Button>
        );
      default:
        return (
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        );
    }
  };

  // Show loading state while checking localStorage or fetching questions
  if (isLoading || isFetchingQuestions) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen gradient-bg-primary p-6">
        <div className="max-w-6xl mx-auto">
          {/* Decorative Background Elements */}
          <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-20 left-10 decorative-gradient-blur-blue opacity-20" />
            <div className="absolute bottom-20 right-10 decorative-gradient-blur-purple opacity-20" />
          </div>

          {error && !analysisResults && !guidelineType ? (
            <div className="max-w-2xl mx-auto">
              <Card className="border-destructive/20 bg-destructive/5 dark:bg-destructive/10 card-primary">
                <CardContent className="pt-8 pb-6 text-center space-y-6">
                  <div className="icon-wrapper-blue mx-auto">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-foreground">
                      Submission Failed
                    </h2>
                    <p className="text-muted-foreground text-lg">{error}</p>
                    {error.includes("API") ||
                    error.includes("connection") ||
                    error.includes("server") ? (
                      <p className="text-sm text-muted-foreground mt-2">
                        Please check your internet connection and try again. If
                        the problem persists, contact support.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="border-input"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Page
                    </Button>
                    <Button
                      onClick={retrySubmission}
                      className="btn-gradient-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader size="sm" className="mr-2" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Try Again
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : guidelineType ? (
            // Guideline message UI - styled as a helpful box, not an error
            <div className="max-w-2xl mx-auto">
              <Card className="card-primary">
                <CardContent className="pt-8 pb-6 text-center space-y-6">
                  <div className="icon-wrapper-blue mx-auto">
                    {getGuidelineIcon(guidelineType)}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold gradient-text-primary">
                      {guidelineType === "subscription"
                        ? "Upgrade Required"
                        : guidelineType === "profileIncomplete" ||
                          guidelineType === "noProfile"
                        ? "Profile Setup Needed"
                        : guidelineType === "unauthorized"
                        ? "Sign In Required"
                        : "Account Issue"}
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      {guidelineMessage}
                    </p>
                  </div>

                  {/* Show missing fields if applicable */}
                  {guidelineType === "profileIncomplete" &&
                    missingFields.length > 0 && (
                      <Card className="w-full border-input">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            Missing Profile Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {missingFields.map((field) => (
                              <li
                                key={field}
                                className="flex items-center gap-2"
                              >
                                {field === "firstName" && (
                                  <User className="w-4 h-4 flex-shrink-0" />
                                )}
                                {field === "lastName" && (
                                  <User className="w-4 h-4 flex-shrink-0" />
                                )}
                                {field === "dateOfBirth" && (
                                  <Calendar className="w-4 h-4 flex-shrink-0" />
                                )}
                                {field === "hireDate" && (
                                  <Calendar className="w-4 h-4 flex-shrink-0" />
                                )}
                                {field === "address" && (
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                )}
                                <span>
                                  {field
                                    .replace(/([A-Z])/g, " $1")
                                    .trim()
                                    .toLowerCase()
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                  {/* Additional info for subscription */}
                  {guidelineType === "subscription" && hasExistingReport && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                      <p className="text-sm text-warning-foreground">
                        You've already completed this assessment once. Subscribe
                        to unlock unlimited attempts and advanced insights.
                      </p>
                    </div>
                  )}

                  {getGuidelineAction()}
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {isSubmitting && <Loader />}
              {analysisResults ? (
                <div className="max-w-3xl mx-auto">
                  <Card className="ai-recommendation-card">
                    <CardContent className="pt-8 pb-6 text-center space-y-8">
                      <div className="flex justify-center">
                        <div className="ai-recommendation-icon-wrapper">
                          <CheckCircle className="w-14 h-14 text-white" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-3xl font-bold gradient-text-primary">
                          Assessment Complete! 🎉
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                          Your answers have been analyzed by our AI system to
                          uncover your unique career potential.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="quick-action-item text-center p-4">
                          <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
                          <h4 className="font-semibold mb-1">
                            AI Analysis Complete
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Your unique Genius Factor calculated
                          </p>
                        </div>
                        <div className="quick-action-item text-center p-4">
                          <TrendingUp className="w-8 h-8 text-success mx-auto mb-3" />
                          <h4 className="font-semibold mb-1">
                            Career Paths Generated
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Personalized recommendations ready
                          </p>
                        </div>
                        <div className="quick-action-item text-center p-4">
                          <Award className="w-8 h-8 text-warning mx-auto mb-3" />
                          <h4 className="font-semibold mb-1">
                            Strengths Identified
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Key abilities and talents mapped
                          </p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          onClick={() =>
                            navigate.push("/employee-dashboard/results")
                          }
                          className="btn-gradient-primary min-w-[240px] h-12 text-lg"
                        >
                          <Rocket className="w-5 h-5 mr-2" />
                          View Detailed Results
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                        <p className="text-sm text-muted-foreground mt-3">
                          You will be redirected in 2 seconds...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <>
                  {/* Hero Header */}
                  <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h1 className="text-4xl font-bold gradient-text-primary mb-2">
                          Career Assessment
                        </h1>
                        <p className="text-lg text-muted-foreground">
                          Discover your ideal career path through AI-powered
                          analysis
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <div className="flex items-center text-sm bg-card px-4 py-2 rounded-lg border">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          <span className="font-semibold">
                            {Math.floor(timeSpent / 60)}:
                            {(timeSpent % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                        {hasSavedProgress && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetProgress}
                            className="border-input"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Restart
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Section */}
                    <Card className="card-primary mb-6">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">
                              {currentPart?.part}
                            </h3>
                            <p className="text-muted-foreground">
                              Question {currentQuestionIndex + 1} of{" "}
                              {totalQuestionsInPart}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className="badge-blue">
                              Part {currentPartIndex + 1} of{" "}
                              {visibleQuestions.length}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-semibold">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3">
                            <div
                              className="progress-bar-primary rounded-full h-3 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Question Card - Takes 2/3 width on large screens */}
                    <div className="lg:col-span-2">
                      {currentQ && visibleQuestions.length > 0 ? (
                        <Card className="card-primary card-hover h-full">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-2xl flex items-center gap-2">
                                <div className="icon-wrapper-blue p-2">
                                  <Target className="w-5 h-5 text-primary" />
                                </div>
                                <span>Your Question</span>
                              </CardTitle>
                              <span className="badge-purple text-xs">
                                Multiple Choice
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-8">
                            {/* Category and Section */}
                            <div className="space-y-4">
                              <div>
                                <div className="text-lg font-semibold text-primary mb-1">
                                  {currentQ.category}
                                </div>
                                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                  {currentQ.section}
                                </div>
                              </div>

                              {/* Question Text */}
                              <div className="text-xl leading-relaxed font-medium bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
                                {currentQ.question}
                              </div>
                            </div>

                            {/* Options */}
                            <RadioGroup
                              value={answers[currentQ.id] || ""}
                              onValueChange={handleAnswerChange}
                              className="space-y-3"
                            >
                              {currentQ.options?.map((apiOption, index) => {
                                const staticLetter = String.fromCharCode(
                                  65 + index
                                );
                                const isSelected =
                                  answers[currentQ.id] === apiOption;

                                return (
                                  <div
                                    key={index}
                                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                                      isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-input hover:border-primary/50 hover:bg-primary/3"
                                    }`}
                                  >
                                    <RadioGroupItem
                                      value={apiOption}
                                      id={`option-${currentQ.id}-${index}`}
                                      className="mt-0.5"
                                    />
                                    <Label
                                      htmlFor={`option-${currentQ.id}-${index}`}
                                      className="flex-1 cursor-pointer flex items-start"
                                    >
                                      <span
                                        className={`font-bold mr-3 text-lg flex-shrink-0 ${
                                          isSelected
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {staticLetter}.
                                      </span>
                                      <span className="leading-relaxed">
                                        {apiOption.replace(/^[A-Z]\)\s*/, "")}
                                      </span>
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="card-primary">
                          <CardContent className="p-12 text-center">
                            <div className="icon-wrapper-amber mx-auto mb-6">
                              <AlertCircle className="w-12 h-12 text-warning" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-3">
                              No Questions Available
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                              We're having trouble loading your assessment
                              questions. This might be due to a network issue or
                              server problem.
                            </p>
                            <Button
                              onClick={reloadQuestions}
                              className="btn-gradient-primary"
                              disabled={isFetchingQuestions}
                            >
                              <RefreshCw
                                className={`w-4 h-4 mr-2 ${
                                  isFetchingQuestions ? "animate-spin" : ""
                                }`}
                              />
                              Try Loading Questions Again
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Sidebar - Takes 1/3 width on large screens */}
                    <div className="space-y-6">
                      {/* Quick Stats Card */}
                      <Card className="card-primary">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Assessment Stats
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Current Part
                            </span>
                            <span className="font-semibold">
                              {currentPartIndex + 1}/{visibleQuestions.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Questions Answered
                            </span>
                            <span className="font-semibold">
                              {
                                currentPartQuestions.filter(
                                  (q) => answers[q.id]
                                ).length
                              }
                              /{totalQuestionsInPart}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Total Progress
                            </span>
                            <span className="font-semibold">
                              {Math.round(
                                (visibleQuestions
                                  .flatMap((p) => p.questions)
                                  .filter((q) => answers[q.id]).length /
                                  visibleQuestions.flatMap((p) => p.questions)
                                    .length) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="pt-4 border-t">
                            <div className="text-sm text-muted-foreground mb-2">
                              This Part Progress
                            </div>
                            <div className="flex space-x-1">
                              {currentPartQuestions.map((_, index) => (
                                <div
                                  key={index}
                                  className={`flex-1 h-2 rounded-full transition-all ${
                                    index === currentQuestionIndex
                                      ? "bg-primary"
                                      : index < currentQuestionIndex
                                      ? "bg-success"
                                      : answers[currentPartQuestions[index].id]
                                      ? "bg-warning"
                                      : "bg-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tips Card */}
                      <Card className="card-primary">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-warning" />
                            Quick Tips
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="icon-wrapper-green p-2 mt-0.5">
                              <CheckCircle className="w-4 h-4 text-success" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Be Honest</p>
                              <p className="text-xs text-muted-foreground">
                                Answer truthfully for accurate results
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="icon-wrapper-blue p-2 mt-0.5">
                              <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Take Your Time
                              </p>
                              <p className="text-xs text-muted-foreground">
                                No time limit - think carefully
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="icon-wrapper-purple p-2 mt-0.5">
                              <Shield className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                All Data Secure
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Your responses are encrypted
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Navigation Card */}
                      <Card className="card-primary">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={handlePrevious}
                              disabled={
                                currentPartIndex === 0 &&
                                currentQuestionIndex === 0
                              }
                              className="flex-1 border-input"
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              asChild
                              className="flex-1 border-input"
                            >
                              <Link href="/employee-dashboard">Exit</Link>
                            </Button>
                          </div>

                          {isLastQuestionInPart && isLastPart ? (
                            <Button
                              onClick={handleSubmit}
                              disabled={
                                !isAllComplete ||
                                isSubmitting ||
                                visibleQuestions.length === 0
                              }
                              className="w-full btn-gradient-primary"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader size="sm" className="mr-2" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Rocket className="w-4 h-4 mr-2" />
                                  Submit Assessment
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={handleNext}
                              disabled={
                                !isAnswered ||
                                (isLastQuestionInPart && !isPartComplete) ||
                                visibleQuestions.length === 0
                              }
                              className="w-full btn-gradient-primary"
                            >
                              {isLastQuestionInPart
                                ? "Next Part"
                                : "Next Question"}
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}

                          {!isAnswered && (
                            <p className="text-xs text-center text-muted-foreground">
                              Select an option to continue
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Bottom Navigation - Mobile Only */}
                  <div className="lg:hidden mt-6">
                    <Card className="card-primary">
                      <CardContent className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={
                              currentPartIndex === 0 &&
                              currentQuestionIndex === 0
                            }
                            className="flex-1 border-input"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                          </Button>

                          {isLastQuestionInPart && isLastPart ? (
                            <Button
                              onClick={handleSubmit}
                              disabled={
                                !isAllComplete ||
                                isSubmitting ||
                                visibleQuestions.length === 0
                              }
                              className="flex-1 btn-gradient-primary"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader size="sm" className="mr-2" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit"
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={handleNext}
                              disabled={
                                !isAnswered ||
                                (isLastQuestionInPart && !isPartComplete) ||
                                visibleQuestions.length === 0
                              }
                              className="flex-1 btn-gradient-primary"
                            >
                              Next
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
