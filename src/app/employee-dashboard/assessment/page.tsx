"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
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
import { questions } from "../../../../question";
import FileUploader from "@/components/FileUploader";
import { useSession } from "next-auth/react";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

// Group questions by part
const questionsByPart = questions.map((part) => ({
  part: part.part,
  questions: part.sections.flatMap((section) =>
    section.questions.map((question) => ({
      ...question,
      section: section.section,
    }))
  ),
}));

const API_URL = `${process.env.NEXT_PUBLIC_PYTHON_URL}/analyze/assessment`;
const STORAGE_KEY = "assessment_progress";

export default function Assessment() {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useRouter();
  const [analysisResults, setAnalysisResults] = useState<Array<{
    part: string;
    majorityOptions: string[] | null;
    maxCount: number;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();

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
        setHasSavedProgress(true); // ✅ Set to true when progress is loaded
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
    if (typeof window === "undefined" || isLoading) return;

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
    setHasSavedProgress(true); // ✅ Set to true when progress is saved
  }, [
    answers,
    currentPartIndex,
    currentQuestionIndex,
    timeSpent,
    analysisResults,
    isLoading,
  ]);

  // Show all questions to all users regardless of paid status
  const visibleQuestions = questionsByPart;

  const currentPart = visibleQuestions[currentPartIndex];
  
  // Guard against invalid index if user status changes or state is stale
  // Reset to first part if current part is invalid
  useEffect(() => {
    if (!currentPart && visibleQuestions.length > 0 && !isLoading) {
      setCurrentPartIndex(0);
      setCurrentQuestionIndex(0);
    }
  }, [currentPart, visibleQuestions.length, isLoading]);

  const currentPartQuestions = currentPart?.questions || [];
  const totalQuestionsInPart = currentPartQuestions.length;
  const currentQ = currentPartQuestions[currentQuestionIndex];

  // Calculate total progress across visible parts
  // Note: The original progress calculation was just for the current part?
  // Line 131: const progress = ((currentQuestionIndex + 1) / totalQuestionsInPart) * 100;
  // It seems to be per-part progress.
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
    setError(null); // Clear any previous errors
    try {
      // Prepare assessment data for API
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

      // Build detailed answers array
      const allAnswers = visibleQuestions.flatMap((part) =>
        part.questions.map((q) => ({
          id: q.id,
          part: part.part,
          section: q.section,
          question: q.question,
          selectedOption: answers[q.id] || null,
        }))
      );

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.fastApiToken || ""}`,
        },
        body: JSON.stringify({
          data: partsData,
          userId: session?.user.id,
          hrId: session?.user?.hrId || "individual_user",
          departement: session?.user?.department?.at(-1) || "Healthcare",
          employeeName: session?.user.name,
          employeeEmail: session?.user.email,
          is_paid: session?.user.paid || false,
          allAnswers,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      // Debug: Log the full response to understand its structure
      console.log("API Response:", result);
      console.log("Has results property?", "results" in result);
      console.log("Result keys:", Object.keys(result));
      
      // Handle different response structures flexibly
      // The API might return { results: [...] } or just the array directly
      let analysisData = null;
      
      if (result && result.results) {
        // Standard format: { results: [...] }
        analysisData = result.results;
      } else if (Array.isArray(result)) {
        // Direct array format: [...]
        analysisData = result;
      } else if (result && typeof result === 'object') {
        // Fallback: use the result as-is if it's an object
        analysisData = result;
      }
      
      if (!analysisData) {
        console.error("Invalid API response:", result);
        throw new Error("Invalid response from API - no valid data received");
      }

      setAnalysisResults(analysisData);
      setError(null);

      // Generate career recommendation after successful assessment
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PYTHON_URL}/employee_dashboard/generate-employee-career-recommendation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user?.fastApiToken || ""}`,
            },
            body: JSON.stringify({ employeeId: session?.user?.id }),
          }
        );
        
        if (!res.ok) {
          console.error("Failed to generate career recommendation:", res.status);
        }
      } catch (recError) {
        console.error("Error generating career recommendation:", recError);
        // Don't throw - this is a secondary operation
      }

      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedProgress(false); // ✅ Clear the flag

      // Show success toast
      toast.success("Assessment submitted successfully!", {
        description: "Your results have been analyzed.",
      });

      // EMIT DASHBOARD UPDATE EVENT
      if (socket && isConnected && session?.user?.hrId) {
        socket.emit("hr_dashboard", { hrId: session.user.hrId });
      }
    } catch (err: any) {
      setError(`Failed to analyze assessment: ${err.message}`);
      setAnalysisResults(null);
      // Show error toast
      // toast.error("Failed to submit assessment", {
      //   description: err.message,
      // });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        navigate.push("/employee-dashboard/results");
      }, 3000);
    }
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

  // Reset progress function
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
      setHasSavedProgress(false); // ✅ Clear the flag
      toast.success("Assessment restarted successfully!");
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

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto flex justify-center items-center h-64">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto ">
        {isSubmitting && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <Loader />
          </div>
        )}
        {analysisResults ? (
          <Card className="card">
            <CardHeader>
              <CardTitle className="text-2xl">Assessment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Part</TableHead>
                    <TableHead className="text-left">
                      Most Selected Option(s)
                    </TableHead>
                    <TableHead className="text-left">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.part}</TableCell>
                      <TableCell>
                        {result.majorityOptions
                          ? result.majorityOptions.join(", ")
                          : "No answers provided"}
                      </TableCell>
                      <TableCell>
                        {result.majorityOptions ? result.maxCount : 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                className="mt-4"
                onClick={() => {
                  setAnalysisResults(null);
                  setAnswers({});
                  setCurrentPartIndex(0);
                  setCurrentQuestionIndex(0);
                  setHasSavedProgress(false); // ✅ Clear the flag
                }}
              >
                Restart Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 ">
              <div className="flex items-center justify-between mb-4 ">
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
                  {/* Reset Progress Button - only show if there's saved progress */}
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
            {currentQ && (
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
                    disabled={!isAllComplete || isSubmitting}
                    className="btn-gradient"
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
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
                      !isAnswered || (isLastQuestionInPart && !isPartComplete)
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
            <div className="mt-8 flex justify-center">
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
          </>
        )}
      </div>
    </AppLayout>
  );
}
