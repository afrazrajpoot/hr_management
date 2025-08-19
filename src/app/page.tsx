"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Building2,
  Users,
  BarChart3,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-primary min-h-[60vh] flex items-center">
        <div className="container mx-auto px-6 text-center text-white">
          <div className="flex items-center justify-center mb-6">
            <Brain className="h-16 w-16 mr-4" />
            <h1 className="text-5xl font-bold bg-red-500 bg-clip-text text-transparent">
              Genius Factor
            </h1>
          </div>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Advanced HR Analytics and Career Assessment Platform
          </p>
          <p className="text-lg mb-12 max-w-3xl mx-auto opacity-80">
            Unlock employee potential with AI-powered assessments, retention
            risk analysis, and comprehensive career pathway recommendations.
          </p>
          <Button
            size="lg"
            className=" text-hr-primary text-lg px-8 py-3"
            onClick={() => router.push("/auth/sign-in")}
          >
            Get Startetd
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Comprehensive HR Analytics Suite
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage, analyze, and optimize your human
              resources strategy
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="group-hover:text-hr-primary transition-colors">
                  Company Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage multiple companies, track employee metrics, and monitor
                  organizational health across your entire portfolio.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="group-hover:text-hr-primary transition-colors">
                  Employee Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive employee profiles, assessment tracking, and
                  performance insights to drive strategic decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="group-hover:text-hr-primary transition-colors">
                  AI Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  68-question adaptive assessments powered by AI to identify
                  career paths, strengths, and development opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="group-hover:text-hr-primary transition-colors">
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced retention risk modeling to identify at-risk employees
                  and implement proactive intervention strategies.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="group-hover:text-hr-primary transition-colors">
                  Mobility Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor internal career movements, track promotion patterns,
                  and optimize organizational mobility pathways.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="group-hover:text-hr-primary transition-colors">
                  Career Pathways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI-generated career recommendations and development pathways
                  tailored to individual employee profiles and goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your HR Strategy?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join forward-thinking organizations using Genius Factor to optimize
            their human capital and drive business success.
          </p>
          {/* <Button
            size="lg"
            className="bg-white text-hr-primary hover:bg-white/90 text-lg px-8 py-3"
            onClick={() => router.push("/hr-dashboard")}
          >
            Start Your Analytics Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button> */}
        </div>
      </div>
    </div>
  );
}
