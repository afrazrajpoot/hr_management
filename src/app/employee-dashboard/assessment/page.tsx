"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, User, CreditCard, Building, Mail, Calendar, MapPin, UserCheck, RefreshCw } from "lucide-react";
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
import { fetchAssessmentQuestions, submitAssessment, generateCareerRecommendation } from "@/lib/assessment-api";
import type { AssessmentAnalysisResult, PartWithQuestions } from "@/types/assessment-types";
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
  const [analysisResults, setAnalysisResults] = useState<AssessmentAnalysisResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionsByPart, setQuestionsByPart] = useState<PartWithQuestions[]>([]);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(true);

  // States for handling guideline responses
  const [guidelineType, setGuidelineType] = useState<'unauthorized' | 'notFound' | 'subscription' | 'profileIncomplete' | 'noProfile' | null>(null);
  const [guidelineMessage, setGuidelineMessage] = useState<string>('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [hasExistingReport, setHasExistingReport] = useState(false);
  const [userStatus, setUserStatus] = useState<{ paid: boolean; hasEmployeeProfile: boolean; isProfileComplete: boolean } | null>(null);

  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();

  // Network connection check
  const checkNetworkConnection = () => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  };

  // Fetch questions on mount - now properly handles guideline responses
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsFetchingQuestions(true);
        setError(null);
        setGuidelineType(null);
        setGuidelineMessage('');
        setMissingFields([]);
        setHasExistingReport(false);
        setUserStatus(null);

        // Check network connection
        if (!checkNetworkConnection()) {
          throw new Error("No internet connection. Please check your network and try again.");
        }

        const response = await fetchAssessmentQuestions();

        if (!response.success) {
          // Handle guideline responses based on the API structure
          if (response.error === 'Unauthorized') {
            setGuidelineType('unauthorized');
            setGuidelineMessage('You need to sign in to access the assessment.');
          } else if (response.error === 'User not found') {
            setGuidelineType('notFound');
            setGuidelineMessage('Your account could not be found. Please contact support.');
          } else if (response.needsSubscription) {
            setGuidelineType('subscription');
            setGuidelineMessage(response.message || 'Subscribe to attempt the assessment multiple times.');
            setHasExistingReport(response.hasExistingReport || false);
          } else if (response.isProfileComplete === false) {
            setGuidelineType('profileIncomplete');
            setGuidelineMessage(response.message || 'Complete your profile before taking the assessment.');
            setMissingFields(response.missingFields || []);
          } else if (response.hasEmployeeProfile === false) {
            setGuidelineType('noProfile');
            setGuidelineMessage(response.message || 'Employee profile not found. Please complete your profile setup.');
          } else {
            // Fallback to generic error
            throw new Error(response.error || response.message || 'Failed to load assessment questions.');
          }
          return;
        }

        // Success case
        setQuestionsByPart(response.data || []);
        setUserStatus(response.userStatus || null);
      } catch (err: any) {
        console.error("Failed to load questions:", err);
        
        // Extract error message safely
        let errorMessage = "Failed to load assessment questions. Please try refreshing the page.";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
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
    if (typeof window === "undefined" || isLoading || isFetchingQuestions || guidelineType) return;

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
    if (!currentPart && visibleQuestions.length > 0 && !isLoading && !isFetchingQuestions && !guidelineType) {
      setCurrentPartIndex(0);
      setCurrentQuestionIndex(0);
    }
  }, [currentPart, visibleQuestions.length, isLoading, isFetchingQuestions, guidelineType]);

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
        throw new Error("No internet connection. Please check your network and try again.");
      }

      // Validate that all questions are answered before submitting
      const unansweredQuestions = visibleQuestions.flatMap(part =>
        part.questions.filter(q => !answers[q.id])
      );
      
      if (unansweredQuestions.length > 0) {
        throw new Error(`Please answer all ${unansweredQuestions.length} remaining questions before submitting.`);
      }

      const partsData = visibleQuestions.map((part) => {
        const optionCounts: Record<string, number> = {};
        part.questions.forEach((q) => {
          if (answers[q.id]) {
            const optionLetter = answers[q.id].charAt(0);
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
      console.log('Raw API Response:', result);
      console.log('Response type:', typeof result);
      console.log('Is array?', Array.isArray(result));
      console.log('Response length:', result?.length);

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
        if (result.error || (result.message && result.message.toLowerCase().includes('error'))) {
          throw new Error(result.error || result.message || 'API reported an error');
        }
        if (!result.success && typeof result.success !== 'undefined') {
          throw new Error(result.message || 'API submission failed');
        }
      }

      if (!analysisData) {
        throw new Error('Invalid response from API - no valid data received');
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
      console.error('Submission error details:', err);  // Log full error

      // Safe error message extraction
      let errorMessage = "Failed to submit assessment";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
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
      } else if (errorMessage.includes("token") || errorMessage.includes("auth")) {
        errorMessage += ". Your session may have expired – try signing in again.";
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
        throw new Error(response.error || response.message || 'Failed to load questions');
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
      case 'unauthorized': return <User className="w-10 h-10 text-destructive" />;
      case 'subscription': return <CreditCard className="w-10 h-10 text-warning" />;
      case 'profileIncomplete': return <UserCheck className="w-10 h-10 text-primary" />;
      case 'noProfile': return <Building className="w-10 h-10 text-secondary" />;
      case 'notFound': return <AlertCircle className="w-10 h-10 text-destructive" />;
      default: return <AlertCircle className="w-10 h-10 text-destructive" />;
    }
  };

  // Helper to get primary action button for guideline
  const getGuidelineAction = () => {
    switch (guidelineType) {
      case 'unauthorized':
        return (
          <Button onClick={() => navigate.push('/api/auth/signin')} className="mt-4 btn-gradient">
            Sign In
          </Button>
        );
   
      case 'profileIncomplete':
      case 'noProfile':
        return (
          <Button onClick={() => navigate.push("/employee-dashboard/profile")} className="mt-4 btn-gradient">
            Complete Profile
          </Button>
        );
      case 'notFound':
        return (
          <Button onClick={() => window.location.href = '/support'} variant="outline" className="mt-4">
            Contact Support
          </Button>
        );
      default:
        return (
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Try Again
          </Button>
        );
    }
  };

  // Show loading state while checking localStorage or fetching questions
  if (isLoading || isFetchingQuestions) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto flex flex-col justify-center items-center h-64 space-y-4">
          <Loader />
          <p className="text-muted-foreground">Loading assessment questions...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {error && !analysisResults && !guidelineType ? (
          <Card className="border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
            <CardContent className="pt-6 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Submission Failed</h2>
                <p className="text-muted-foreground text-lg">{error}</p>
                {error.includes("API") || error.includes("connection") || error.includes("server") ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    Please check your internet connection and try again. If the problem persists, contact support.
                  </p>
                ) : null}
              </div>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button 
                  onClick={retrySubmission}
                  className="btn-gradient"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Retrying...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : guidelineType ? (
          // Guideline message UI - styled as a helpful box, not an error
          <Card className="border-0 shadow-none max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-6 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                {getGuidelineIcon(guidelineType)}
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {guidelineType === 'subscription' ? 'Upgrade Required' : 
                   guidelineType === 'profileIncomplete' || guidelineType === 'noProfile' ? 'Profile Setup Needed' :
                   guidelineType === 'unauthorized' ? 'Sign In Required' :
                   'Account Issue'}
                </h2>
                <p className="text-muted-foreground text-lg">{guidelineMessage}</p>
              </div>

              {/* Show missing fields if applicable */}
              {guidelineType === 'profileIncomplete' && missingFields.length > 0 && (
                <Card className="w-full border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                      <UserCheck className="w-4 h-4" />
                      Missing Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {missingFields.map((field) => (
                        <li key={field} className="flex items-center gap-2">
                          {field === 'firstName' && <User className="w-4 h-4 flex-shrink-0" />}
                          {field === 'lastName' && <User className="w-4 h-4 flex-shrink-0" />}
                          {field === 'dateOfBirth' && <Calendar className="w-4 h-4 flex-shrink-0" />}
                          {field === 'hireDate' && <Calendar className="w-4 h-4 flex-shrink-0" />}
                          {field === 'address' && <MapPin className="w-4 h-4 flex-shrink-0" />}
                          <span>{field.replace(/([A-Z])/g, ' $1').trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Additional info for subscription */}
              {guidelineType === 'subscription' && hasExistingReport && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <p className="text-sm text-warning-foreground">
                    You've already completed this assessment once. Subscribe to unlock unlimited attempts and advanced insights.
                  </p>
                </div>
              )}

              {getGuidelineAction()}
            </CardContent>
          </Card>
        ) : (
          <>
            {isSubmitting && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{
                  background: "rgba(15, 23, 42, 0.45)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <div className="flex flex-col items-center space-y-4">
                  <Loader />
                  <p className="text-white text-lg font-medium">Submitting your assessment...</p>
                  <p className="text-gray-300 text-sm">Please don't close this window</p>
                </div>
              </div>
            )}
            {analysisResults ? (
              <Card className="card border-success/20 bg-success/5 dark:bg-success/10">
                <CardContent className="pt-6 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-success" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Assessment Submitted Successfully!</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      Your answers have been securely recorded and analyzed by our AI system.
                    </p>
                  </div>

                  <div className="bg-background/50 p-6 rounded-lg border max-w-xl mx-auto text-left space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      What happens next?
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        You will be automatically redirected to your results dashboard in a few seconds.
                      </li>
                      <li className="flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        Our system is generating your personalized career path recommendations based on your unique profile.
                      </li>
                      <li className="flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        You can view your detailed analysis, including your Genius Factor and key strengths, on the results page.
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={() => navigate.push("/employee-dashboard/results")}
                      className="btn-gradient min-w-[200px]"
                    >
                      View My Results
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Redirecting in 2 seconds...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold">Career Assessment</h1>
                      <p className="text-muted-foreground">
                        {currentPart?.part} - Question {currentQuestionIndex + 1} of{" "}
                        {totalQuestionsInPart}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {Math.floor(timeSpent / 60)}:
                        {(timeSpent % 60).toString().padStart(2, "0")}
                      </div>
                      {hasSavedProgress && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetProgress}
                          className="text-xs px-2 py-1"
                        >
                          Reset Progress
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={reloadQuestions}
                        disabled={isFetchingQuestions}
                        className="text-xs px-2 py-1"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isFetchingQuestions ? 'animate-spin' : ''}`} />
                        Reload Questions
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Part Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>

                {/* Current Part Card */}
                {currentQ && visibleQuestions.length > 0 ? (
                  <Card className="card-elevated mb-6 card">
                    <CardHeader>
                      <CardTitle className="text-xl">{currentPart?.part}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">
                            {currentQ.category}
                          </div>
                          <span className="text-sm text-muted-foreground bg-gray-50/50 dark:bg-gray-800/50 px-2 py-1 rounded">
                            Multiple Choice
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {currentQ.section}
                        </div>
                        <div className="text-lg leading-relaxed">
                          {currentQ.question}
                        </div>
                        <RadioGroup
                          value={answers[currentQ.id] || ""}
                          onValueChange={handleAnswerChange}
                          className="space-y-3"
                        >
                          {currentQ.options?.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <RadioGroupItem
                                value={option}
                                id={`option-${currentQ.id}-${index}`}
                              />
                              <Label
                                htmlFor={`option-${currentQ.id}-${index}`}
                                className="flex-1 cursor-pointer"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="card-elevated mb-6 card">
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
                      <p className="text-muted-foreground mb-4">
                        Unable to load assessment questions. This might be due to a network issue or server problem.
                      </p>
                      <Button onClick={reloadQuestions} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Loading Questions Again
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentPartIndex === 0 && currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" asChild>
                      <Link href="/employee-dashboard">Exit</Link>
                    </Button>

                    {isLastQuestionInPart && isLastPart ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={!isAllComplete || isSubmitting || visibleQuestions.length === 0}
                        className="btn-gradient"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader size="sm" className="mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Assessment
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={
                          !isAnswered || (isLastQuestionInPart && !isPartComplete) || visibleQuestions.length === 0
                        }
                        className="btn-gradient"
                      >
                        {isLastQuestionInPart ? "Next Part" : "Next"}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Indicators for Current Part */}
                {visibleQuestions.length > 0 && (
                  <div className="mt-8">
                    <div className="text-sm text-muted-foreground mb-2 text-center">
                      Answered {currentPartQuestions.filter(q => answers[q.id]).length} of {totalQuestionsInPart} questions in this part
                    </div>
                    <div className="flex justify-center">
                      <div className="flex space-x-2">
                        {currentPartQuestions.map((_, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === currentQuestionIndex
                                ? "bg-primary dark:bg-primary"
                                : index < currentQuestionIndex
                                ? "bg-success dark:bg-success"
                                : answers[currentPartQuestions[index].id]
                                ? "bg-warning dark:bg-warning"
                                : "bg-muted dark:bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}