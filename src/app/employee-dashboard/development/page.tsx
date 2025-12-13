// pages/development.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Target,
  TrendingUp,
  ExternalLink,
  Calendar,
  AlertCircle,
  User,
  Sparkles,
  Award,
  Rocket,
  ChevronRight,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import { useGetEmployeeLearningDashboardQuery } from "@/redux/employee-python-api/employee-python-api";
import Loader from "@/components/Loader";

export default function Development() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  // Use query with skip option - it won't run until userId is available
  const {
    data: employeeData,
    error,
    isLoading,
    isError,
    refetch,
  } = useGetEmployeeLearningDashboardQuery(userId || "", {
    skip: !userId, // Skip the query if userId is not available
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Check if the error is specifically a "User or employee not found" error
  const isUserNotFoundError =
    isError &&
    error &&
    typeof error === "object" &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "detail" in error.data &&
    typeof error.data.detail === "string" &&
    error.data.detail.includes("User or employee not found");

  if (sessionStatus === "loading") {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  // Handle user not found error with a specific UI
  if (isUserNotFoundError) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen p-6">
          <Card className="card-primary w-full max-w-md">
            <CardHeader className="text-center">
              <div className="icon-wrapper-blue mx-auto p-4 rounded-2xl w-fit">
                <User className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="mt-6 text-2xl gradient-text-primary">
                Profile Incomplete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-muted-foreground">
                We couldn't find your employee profile. Please complete your
                profile to access your development roadmap.
              </p>
              <Button
                onClick={() => router.push("/employee-dashboard/profile")}
                className="w-full btn-gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                Complete Your Profile
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isError && !isUserNotFoundError) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="card-primary max-w-md">
            <CardContent className="p-8 text-center">
              <div className="icon-wrapper-blue mx-auto p-4 rounded-full w-fit mb-6">
                <AlertCircle className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold gradient-text-primary mb-3">
                Error loading data
              </h2>
              <p className="text-muted-foreground mb-6">
                Failed to load employee data
              </p>
              <Button
                onClick={() => refetch()}
                className="btn-gradient-primary text-white"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isLoading || !employeeData) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const {
    current_skills,
    recommended_courses,
    progress_tracking,
    employee_name,
  } = employeeData;

  // Calculate average skill proficiency
  const averageProficiency =
    current_skills.length > 0
      ? Math.round(
          current_skills.reduce((acc, skill) => acc + skill.proficiency, 0) /
            current_skills.length
        )
      : 0;

  return (
    <AppLayout>
      <div className="p-6 space-y-8 gradient-bg-primary min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text-primary">
              Development Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalized skill development for{" "}
              <span className="font-semibold text-primary">
                {employee_name}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-input text-secondary-foreground hover:bg-secondary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Review
            </Button>
            <Button className="btn-gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Target className="w-4 h-4 mr-2" />
              Set Goals
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Quick Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="card-primary card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="icon-wrapper-blue p-3">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {employee_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Development Profile
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Skills
                      </span>
                    </div>
                    <span className="font-semibold text-primary">
                      {current_skills.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">
                        Courses
                      </span>
                    </div>
                    <span className="font-semibold text-accent">
                      {recommended_courses.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm text-muted-foreground">
                        Progress
                      </span>
                    </div>
                    <span className="font-semibold text-success">
                      {averageProficiency}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card className="card-primary card-hover">
              <CardContent className="p-6">
                <h4 className="font-semibold text-card-foreground mb-4">
                  Quick Actions
                </h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-input text-secondary-foreground hover:bg-secondary"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Review
                  </Button>
                  <Button className="w-full justify-start btn-gradient-primary text-white">
                    <Target className="w-4 h-4 mr-2" />
                    Set Goals
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-input text-secondary-foreground hover:bg-secondary"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="card-primary card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="icon-wrapper-blue p-2">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <Badge className="badge-blue">Skills</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-1">
                    {averageProficiency}%
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Avg. Proficiency
                  </p>
                  <Progress
                    value={averageProficiency}
                    className="mt-3 h-2 progress-bar-primary"
                  />
                </CardContent>
              </Card>

              <Card className="card-primary card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="icon-wrapper-green p-2">
                      <GraduationCap className="w-5 h-5 text-accent" />
                    </div>
                    <Badge className="badge-green">Learning</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-1">
                    {recommended_courses.length}
                  </h3>
                  <p className="text-sm text-muted-foreground">Recommended</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full progress-bar-primary rounded-full"
                        style={{
                          width: `${Math.min(
                            recommended_courses.length * 20,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-primary">
                      {recommended_courses.length}/5
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-primary card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="icon-wrapper-purple p-2">
                      <Rocket className="w-5 h-5 text-accent" />
                    </div>
                    <Badge className="badge-purple">Career</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-1">
                    {progress_tracking.previous_position ? "↑" : "→"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {progress_tracking.previous_position
                      ? "Promoted"
                      : "Current Role"}
                  </p>
                  <p className="text-sm font-medium text-card-foreground mt-2">
                    {progress_tracking.current_position}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Section */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3 bg-card border border-input p-1 rounded-xl">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:btn-gradient-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="data-[state=active]:btn-gradient-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Skills
                </TabsTrigger>
                <TabsTrigger
                  value="learning"
                  className="data-[state=active]:btn-gradient-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learning
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Skills Preview */}
                  <Card className="card-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 mr-2 text-primary" />
                        Top Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {current_skills.slice(0, 3).map((skill, index) => (
                          <div key={index} className="assessment-item">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-primary" />
                                <span className="font-medium text-card-foreground">
                                  {skill.name}
                                </span>
                              </div>
                              <span className="font-semibold text-primary">
                                {skill.proficiency}%
                              </span>
                            </div>
                            <Progress
                              value={skill.proficiency}
                              className="mt-2 h-2 progress-bar-primary"
                            />
                          </div>
                        ))}
                        {current_skills.length === 0 && (
                          <div className="text-center py-6">
                            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                              No skills recorded yet
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Courses Preview */}
                  <Card className="card-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-accent" />
                        Recommended Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recommended_courses
                          .slice(0, 3)
                          .map((course, index) => (
                            <div key={index} className="assessment-item">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-medium text-card-foreground">
                                  {course.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {course.provider}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {course.reason}
                              </p>
                              <Button
                                size="sm"
                                className="w-full btn-gradient-primary text-white"
                                asChild
                              >
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Enroll Now
                                </a>
                              </Button>
                            </div>
                          ))}
                        {recommended_courses.length === 0 && (
                          <div className="text-center py-6">
                            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                              No courses recommended yet
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6">
                <Card className="card-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-primary" />
                      All Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {current_skills.map((skill, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-input bg-card"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="icon-wrapper-blue p-2">
                                <Award className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-semibold text-card-foreground">
                                {skill.name}
                              </span>
                            </div>
                            <Badge className="badge-blue">
                              {skill.proficiency}%
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Proficiency
                              </span>
                              <span className="font-medium text-primary">
                                Level {Math.ceil(skill.proficiency / 25)}
                              </span>
                            </div>
                            <Progress
                              value={skill.proficiency}
                              className="h-2 progress-bar-primary"
                            />
                          </div>
                        </div>
                      ))}
                      {current_skills.length === 0 && (
                        <div className="text-center py-12">
                          <div className="icon-wrapper-blue mx-auto p-4 rounded-2xl w-fit mb-4">
                            <Sparkles className="w-12 h-12 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-card-foreground mb-2">
                            No skills recorded yet
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Start building your skills profile to get
                            personalized recommendations
                          </p>
                          <Button
                            onClick={() =>
                              router.push("/employee-dashboard/profile")
                            }
                            className="btn-gradient-primary text-white"
                          >
                            Add Skills
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Learning Tab */}
              <TabsContent value="learning" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Courses */}
                  <Card className="card-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-accent" />
                        Recommended Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recommended_courses.map((course, index) => (
                          <div key={index} className="assessment-item">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-card-foreground">
                                {course.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-xs badge-green"
                              >
                                {course.provider}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {course.reason}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-input text-secondary-foreground hover:bg-secondary"
                                asChild
                              >
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Details
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 btn-gradient-primary text-white"
                                asChild
                              >
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Enroll Now
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                        {recommended_courses.length === 0 && (
                          <div className="text-center py-8">
                            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">
                              No courses available. Complete your profile for
                              recommendations.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Career Progress */}
                  <Card className="card-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Rocket className="w-5 h-5 mr-2 text-accent" />
                        Career Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-accent" />
                              <span className="font-semibold text-card-foreground">
                                Current Position
                              </span>
                            </div>
                            <Badge className="badge-green">
                              {progress_tracking.current_position}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Department: {progress_tracking.current_department}
                          </p>
                        </div>

                        {progress_tracking.previous_position && (
                          <div className="p-4 rounded-lg border border-input bg-card">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-card-foreground">
                                  Previous Position
                                </span>
                              </div>
                              <Badge variant="outline" className="badge-blue">
                                {progress_tracking.previous_position}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Department:{" "}
                              {progress_tracking.previous_department}
                            </p>
                          </div>
                        )}

                        <div className="p-4 rounded-lg bg-muted">
                          <h4 className="font-semibold text-card-foreground mb-3">
                            Development Summary
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 rounded-lg bg-card border border-input">
                              <div className="text-xl font-bold text-primary">
                                {current_skills.length}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Skills
                              </div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-card border border-input">
                              <div className="text-xl font-bold text-accent">
                                {recommended_courses.length}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Courses
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
