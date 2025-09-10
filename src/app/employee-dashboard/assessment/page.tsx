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

const API_URL = `http://127.0.0.1:8000/analyze/assessment`;

export default function Assessment() {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<Array<{
    part: string;
    majorityOptions: string[] | null;
    maxCount: number;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loading
  const { socket, isConnected } = useSocket();
  const currentPart = questionsByPart[currentPartIndex];
  const currentPartQuestions = currentPart.questions;
  const totalQuestionsInPart = currentPartQuestions.length;
  const currentQ = currentPartQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestionsInPart) * 100;
  const { data: session } = useSession();

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
    setIsSubmitting(true); // Start loading
    try {
      // Prepare assessment data for API
      const partsData = questionsByPart.map((part) => {
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

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: partsData, userId: session?.user.id }),
      });
      if (response.ok) {
        const generateREcommendation = await fetch(
          `/api/generate-career-recommendation`
        );
      }
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResults(result.results);
      setError(null);

      // Show success toast
      toast.success("Assessment submitted successfully!", {
        description: "Your results have been analyzed.",
      });

      // EMIT DASHBOARD UPDATE EVENT
      if (socket && isConnected && session?.user?.hrId) {
        console.log("📊 Emitting dashboard update after assessment completion");
        socket.emit("hr_dashboard", { hrId: session.user.hrId });
      }
    } catch (err: any) {
      setError(`Failed to analyze assessment: ${err.message}`);
      setAnalysisResults(null);
      // Show error toast
      toast.error("Failed to submit assessment", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestionsInPart - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentPartIndex < questionsByPart.length - 1) {
      setCurrentPartIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentPartIndex > 0) {
      const prevPart = questionsByPart[currentPartIndex - 1];
      setCurrentPartIndex(currentPartIndex - 1);
      setCurrentQuestionIndex(prevPart.questions.length - 1);
    }
  };

  const isAnswered = !!answers[currentQ.id];
  const isPartComplete = currentPartQuestions.every((q) => !!answers[q.id]);
  const isAllComplete = questionsByPart.every((part) =>
    part.questions.every((q) => !!answers[q.id])
  );

  const isLastQuestionInPart =
    currentQuestionIndex === totalQuestionsInPart - 1;
  const isLastPart = currentPartIndex === questionsByPart.length - 1;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {analysisResults ? (
          <Card className="card-elevated">
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
                }}
              >
                Restart Assessment
              </Button>
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
                    {currentPart.part} - Question {currentQuestionIndex + 1} of{" "}
                    {totalQuestionsInPart}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {Math.floor(timeSpent / 60)}:
                    {(timeSpent % 60).toString().padStart(2, "0")}
                  </div>
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

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Current Part Card */}
            <Card className="card-elevated mb-6">
              <CardHeader>
                <CardTitle className="text-xl">{currentPart.part}</CardTitle>
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
                    {currentQ.options.map((option, index) => (
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
                  <Link href="/dashboard">Exit</Link>
                </Button>

                {isLastQuestionInPart && isLastPart ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isAllComplete || isSubmitting}
                    className="btn-gradient"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
      <FileUploader />
    </AppLayout>
  );
}
