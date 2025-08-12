"use client";
// import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Share2,
  TrendingUp,
  Brain,
  Target,
  Lightbulb,
  Award,
  BarChart3,
} from "lucide-react";
// import { Link } from "react-router-dom";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import Link from "next/link";

// Mock data for Genius Factor results
const geniusFactors = [
  {
    name: "Tech Genius",
    score: 85,
    description: "Strong aptitude for technology and digital solutions",
  },
  {
    name: "Number Genius",
    score: 72,
    description: "Analytical thinking and quantitative reasoning",
  },
  {
    name: "Creative Genius",
    score: 91,
    description: "Innovation and creative problem-solving",
  },
  {
    name: "People Genius",
    score: 68,
    description: "Interpersonal skills and emotional intelligence",
  },
  {
    name: "Word Genius",
    score: 79,
    description: "Communication and language proficiency",
  },
  {
    name: "Logic Genius",
    score: 83,
    description: "Systematic thinking and reasoning",
  },
];

const strengths = [
  "Creative Problem-solving",
  "Technical Innovation",
  "Strategic Thinking",
  "Data Analysis",
  "Project Management",
];

const growthAreas = [
  "Public Speaking",
  "Team Leadership",
  "Financial Planning",
  "Networking Skills",
  "Time Management",
];

const assessmentHistory = [
  { date: "2025-08-01", type: "Full Assessment", score: 82 },
  { date: "2025-06-15", type: "Quick Assessment", score: 78 },
  { date: "2025-04-20", type: "Full Assessment", score: 75 },
];

export default function Results() {
  const overallScore = Math.round(
    geniusFactors.reduce((sum, factor) => sum + factor.score, 0) /
      geniusFactors.length
  );
  const topFactor = geniusFactors.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Genius Factor Profile</h1>
            <p className="text-muted-foreground mt-1">
              Assessment completed on {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            <Button className="btn-gradient">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="card-elevated bg-gradient-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Overall Genius Score
                </h2>
                <div className="text-4xl font-bold text-primary mb-2">
                  {overallScore}/100
                </div>
                <p className="text-muted-foreground">
                  Your strongest area is <strong>{topFactor.name}</strong> with
                  a score of {topFactor.score}
                </p>
              </div>
              <div className="hidden sm:block">
                <Brain className="w-16 h-16 text-primary/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Genius Factors Breakdown */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Genius Factor Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {geniusFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{factor.name}</span>
                    <span className="text-sm font-semibold">
                      {factor.score}/100
                    </span>
                  </div>
                  <Progress value={factor.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {factor.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths & Growth Areas */}
          <div className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 rounded-lg bg-success/10 border border-success/20"
                    >
                      <Target className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Growth Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {growthAreas.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 rounded-lg bg-warning/10 border border-warning/20"
                    >
                      <Lightbulb className="w-4 h-4 text-warning mr-2" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assessment History */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Assessment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessmentHistory.map((assessment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-accent/5"
                >
                  <div>
                    <div className="font-medium">{assessment.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(assessment.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {assessment.score}/100
                    </div>
                    <Badge
                      variant={assessment.score >= 80 ? "default" : "secondary"}
                    >
                      {assessment.score >= 80 ? "Excellent" : "Good"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/career-pathways">
                  <TrendingUp className="w-6 h-6" />
                  <span>Explore Career Paths</span>
                  <span className="text-xs text-muted-foreground">
                    Based on your profile
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/development">
                  <Target className="w-6 h-6" />
                  <span>Skill Development</span>
                  <span className="text-xs text-muted-foreground">
                    Personalized roadmap
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <Link href="/assessment">
                  <Brain className="w-6 h-6" />
                  <span>Retake Assessment</span>
                  <span className="text-xs text-muted-foreground">
                    Track your progress
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
