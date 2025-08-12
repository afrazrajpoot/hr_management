"use client";
import { useState } from "react";
// import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Save, Clock } from "lucide-react";
// import { Link } from "react-router-dom";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";

// Mock questions data
const questions = [
  {
    id: 1,
    type: "theory",
    question:
      "Describe a situation where you had to solve a complex problem. What was your approach and what did you learn from the experience?",
    category: "Problem Solving",
  },
  {
    id: 2,
    type: "multiple-choice",
    question:
      "Which of the following best describes your preferred work environment?",
    options: [
      "Collaborative team environment with frequent interaction",
      "Independent work with minimal supervision",
      "Structured environment with clear guidelines",
      "Dynamic environment with constantly changing priorities",
    ],
    category: "Work Style",
  },
  {
    id: 3,
    type: "theory",
    question:
      "How do you typically approach learning new skills or concepts? Provide specific examples of recent learning experiences.",
    category: "Learning Style",
  },
  {
    id: 4,
    type: "multiple-choice",
    question: "When facing a deadline, which approach do you typically take?",
    options: [
      "Plan meticulously and work steadily toward the goal",
      "Work in intense bursts of focused activity",
      "Break the task into smaller, manageable pieces",
      "Collaborate with others to divide the workload",
    ],
    category: "Time Management",
  },
  {
    id: 5,
    type: "theory",
    question:
      "Describe your ideal career five years from now. What specific achievements or positions would indicate success to you?",
    category: "Career Vision",
  },
];

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);

  const totalQuestions = 68; // In reality, this would be the full set
  const displayedQuestions = questions; // For demo, we're showing 5 questions
  const progress = ((currentQuestion + 1) / displayedQuestions.length) * 100;
  const overallProgress = ((currentQuestion + 1) / totalQuestions) * 100;

  const currentQ = displayedQuestions[currentQuestion];

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < displayedQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSave = () => {
    // In a real app, this would save to an API
    console.log("Saving answers:", answers);
  };

  const isAnswered = answers[currentQ.id] && answers[currentQ.id].trim() !== "";

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Career Assessment</h1>
              <p className="text-muted-foreground">
                Question {currentQuestion + 1} of {displayedQuestions.length}
                <span className="text-xs ml-2">
                  ({Math.round(overallProgress)}% of full assessment)
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {Math.floor(timeSpent / 60)}:
                {(timeSpent % 60).toString().padStart(2, "0")}
              </div>
              <Button variant="outline" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Progress
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Section Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="card-elevated mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{currentQ.category}</CardTitle>
              <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded">
                {currentQ.type === "theory"
                  ? "Open Response"
                  : "Multiple Choice"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg leading-relaxed">{currentQ.question}</div>

            {currentQ.type === "theory" ? (
              <Textarea
                placeholder="Share your thoughts and experiences here..."
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={6}
                className="resize-none"
              />
            ) : (
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQ.options?.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Save & Exit</Link>
            </Button>

            {currentQuestion === displayedQuestions.length - 1 ? (
              <Button asChild className="btn-gradient" disabled={!isAnswered}>
                <Link href="/results">
                  View Results
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                className="btn-gradient"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {displayedQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestion
                    ? "bg-primary"
                    : index < currentQuestion
                    ? "bg-success"
                    : answers[displayedQuestions[index].id]
                    ? "bg-warning"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
