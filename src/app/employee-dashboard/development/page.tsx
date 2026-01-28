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

  const {
    data: employeeData,
    error,
    isLoading,
    isError,
    refetch,
  } = useGetEmployeeLearningDashboardQuery(userId || "", {
    skip: !userId,
  });

  const [activeTab, setActiveTab] = useState("overview");

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

  if (isUserNotFoundError) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen p-6">
          <Card className="card-purple w-full max-w-md">
            <CardHeader className="text-center">
              <div className="icon-brand mx-auto p-4 rounded-2xl w-fit">
                <User className="w-12 h-12" />
              </div>
              <CardTitle className="mt-6 text-2xl text-gradient-purple">
                Profile Incomplete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-on-matte-subtle">
                We couldn't find your employee profile. Please complete your
                profile to access your development roadmap.
              </p>
              <Button
                onClick={() => router.push("/employee-dashboard/profile")}
                className="w-full btn-purple shadow-lg hover:shadow-xl transition-all duration-300"
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
          <Card className="card-purple max-w-md">
            <CardContent className="p-8 text-center">
              <div className="icon-brand mx-auto p-4 rounded-full w-fit mb-6">
                <AlertCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-gradient-purple mb-3">
                Error loading data
              </h2>
              <p className="text-on-matte-subtle mb-6">
                Failed to load employee data
              </p>
              <Button onClick={() => refetch()} className="btn-purple">
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

  const averageProficiency =
    current_skills.length > 0
      ? Math.round(
        current_skills.reduce((acc, skill) => acc + skill.proficiency, 0) /
        current_skills.length
      )
      : 0;

  // Color schemes that match bubbles and progress bars
  const colorSchemes = [
    {
      bubble1: "bg-purple-500",
      bubble2: "bg-purple-400",
      progress: "bg-purple-600 dark:bg-purple-500",
      text: "text-purple-accent",
    },
    {
      bubble1: "bg-blue-500",
      bubble2: "bg-blue-400",
      progress: "bg-blue-600 dark:bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      bubble1: "bg-emerald-500",
      bubble2: "bg-emerald-400",
      progress: "bg-emerald-600 dark:bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      bubble1: "bg-indigo-500",
      bubble2: "bg-indigo-400",
      progress: "bg-indigo-600 dark:bg-indigo-500",
      text: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-8 bg-layout-purple min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-purple">
              Development Dashboard
            </h1>
            <p className="text-on-matte-subtle mt-1">
              Personalized skill development for{" "}
              <span className="font-semibold text-purple-accent">
                {employee_name}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="btn-purple-outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Review
            </Button>
            <Button className="btn-purple">
              <Target className="w-4 h-4 mr-2" />
              Set Goals
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="card-purple hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="icon-brand p-3">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-matte">
                      {employee_name}
                    </h3>
                    <p className="text-sm text-on-matte-subtle">
                      Development Profile
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-accent" />
                      <span className="text-sm text-on-matte-subtle">
                        Skills
                      </span>
                    </div>
                    <span className="font-semibold text-purple-accent">
                      {current_skills.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm text-on-matte-subtle">
                        Courses
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {recommended_courses.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-on-matte-subtle">
                        Progress
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {averageProficiency}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-purple hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-on-matte mb-4">
                  Quick Actions
                </h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start btn-purple-outline"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Review
                  </Button>
                  <Button className="w-full justify-start btn-purple">
                    <Target className="w-4 h-4 mr-2" />
                    Set Goals
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start btn-purple-outline"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="card-purple relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 bg-purple-600" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-10 bg-purple-600" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <Badge className="badge-brand">Skills</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-on-matte mb-1">
                    {averageProficiency}%
                  </h3>
                  <p className="text-sm text-on-matte-subtle">
                    Avg. Proficiency
                  </p>
                  <Progress
                    value={averageProficiency}
                    className="mt-3 h-2 bg-gray-100 dark:bg-gray-800"
                    indicatorClassName="bg-purple-600 dark:bg-purple-500"
                  />
                </CardContent>
              </Card>

              <Card className="card-purple relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 bg-emerald-500" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-10 bg-emerald-500" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                      <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <Badge className="badge-success">Learning</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-on-matte mb-1">
                    {recommended_courses.length}
                  </h3>
                  <p className="text-sm text-on-matte-subtle">Recommended</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            recommended_courses.length * 20,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {recommended_courses.length}/5
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-purple relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 bg-blue-500" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-10 bg-blue-500" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Badge className="badge-info">Career</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-on-matte mb-1">
                    {progress_tracking.previous_position ? "↑" : "→"}
                  </h3>
                  <p className="text-sm text-on-matte-subtle">
                    {progress_tracking.previous_position
                      ? "Promoted"
                      : "Current Role"}
                  </p>
                  <p className="text-sm font-medium text-on-matte mt-2">
                    {progress_tracking.current_position}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full space-y-6"
            >
              <div className="bg-white dark:bg-matte-gray-dark rounded-2xl p-2 shadow-subtle">
                <TabsList className="grid w-full grid-cols-3 bg-transparent border-none h-14">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-[image:var(--purple-gradient)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Overview</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="skills"
                    className="data-[state=active]:bg-[image:var(--purple-gradient)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Skills</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="learning"
                    className="data-[state=active]:bg-[image:var(--purple-gradient)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Learning</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Skills Preview */}
                  <Card className="card-purple">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg text-on-matte">
                        <Target className="w-5 h-5 mr-2 text-purple-accent" />
                        Top Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {current_skills.slice(0, 3).map((skill, index) => (
                          <div key={index} className="p-3 rounded-lg border border-matte">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-purple-accent" />
                                <span className="font-medium text-on-matte">
                                  {skill.name}
                                </span>
                              </div>
                              <span className="font-semibold text-purple-accent">
                                {skill.proficiency}%
                              </span>
                            </div>
                            <Progress
                              value={skill.proficiency}
                              className="mt-2 h-2 bg-gray-100 dark:bg-gray-800"
                              indicatorClassName="bg-purple-600 dark:bg-purple-500"
                            />
                          </div>
                        ))}
                        {current_skills.length === 0 && (
                          <div className="text-center py-6">
                            <Sparkles className="w-10 h-10 text-on-matte-subtle mx-auto mb-2" />
                            <p className="text-on-matte-subtle">
                              No skills recorded yet
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Courses Preview */}
                  <Card className="card-purple">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg text-on-matte">
                        <BookOpen className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        Recommended Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recommended_courses
                          .slice(0, 3)
                          .map((course, index) => (
                            <div key={index} className="p-4 rounded-lg border border-matte">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-on-matte">
                                  {course.title}
                                </h4>
                                <Badge variant="outline" className="text-xs badge-success">
                                  {course.provider}
                                </Badge>
                              </div>
                              <p className="text-sm text-on-matte-subtle mb-3 line-clamp-2">
                                {course.reason}
                              </p>
                              <Button
                                size="sm"
                                className="w-full btn-purple"
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
                          <div className="text-center py-8">
                            <BookOpen className="w-10 h-10 text-on-matte-subtle mx-auto mb-3" />
                            <p className="text-on-matte-subtle">
                              No courses recommended yet
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Skills Tab - Progress color matches bubble */}
              <TabsContent value="skills" className="space-y-6 mt-6">
                <Card className="card-purple">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-on-matte">
                      <Target className="w-5 h-5 mr-2 text-purple-accent" />
                      All Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {current_skills.map((skill, index) => {
                        const scheme = colorSchemes[index % colorSchemes.length];

                        return (
                          <div
                            key={index}
                            className="relative p-4 rounded-lg border border-matte surface-matte overflow-hidden"
                          >
                            {/* Bubble effects */}
                            <div
                              className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 ${scheme.bubble1}`}
                            />
                            <div
                              className={`absolute -bottom-6 -left-6 w-20 h-20 rounded-full blur-xl opacity-15 ${scheme.bubble2}`}
                            />

                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="icon-brand p-2">
                                    <Award className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-on-matte">
                                    {skill.name}
                                  </span>
                                </div>
                                <Badge className="badge-brand">
                                  {skill.proficiency}%
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-on-matte-subtle">
                                    Proficiency
                                  </span>
                                  <span className={`font-medium ${scheme.text}`}>
                                    Level {Math.ceil(skill.proficiency / 25)}
                                  </span>
                                </div>
                                <Progress
                                  value={skill.proficiency}
                                  className="h-2 bg-gray-100 dark:bg-gray-800"
                                  indicatorClassName={scheme.progress}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {current_skills.length === 0 && (
                        <div className="text-center py-12">
                          <div className="icon-brand mx-auto p-4 rounded-2xl w-fit mb-4">
                            <Sparkles className="w-12 h-12" />
                          </div>
                          <h3 className="text-lg font-semibold text-on-matte mb-2">
                            No skills recorded yet
                          </h3>
                          <p className="text-on-matte-subtle mb-6">
                            Start building your skills profile to get
                            personalized recommendations
                          </p>
                          <Button
                            onClick={() =>
                              router.push("/employee-dashboard/profile")
                            }
                            className="btn-purple"
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
              <TabsContent value="learning" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recommended Courses */}
                  <Card className="card-purple">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-on-matte">
                        <BookOpen className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        Recommended Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recommended_courses.map((course, index) => (
                          <div key={index} className="p-4 rounded-lg border border-matte">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-on-matte">
                                {course.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-xs badge-success"
                              >
                                {course.provider}
                              </Badge>
                            </div>
                            <p className="text-sm text-on-matte-subtle mb-3">
                              {course.reason}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 btn-purple-outline"
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
                                className="flex-1 btn-purple"
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
                            <GraduationCap className="w-12 h-12 text-on-matte-subtle mx-auto mb-3" />
                            <p className="text-on-matte-subtle">
                              No courses available. Complete your profile for
                              recommendations.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Career Progress */}
                  <Card className="card-purple">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-on-matte">
                        <Rocket className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Career Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-900/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-semibold text-on-matte">
                                Current Position
                              </span>
                            </div>
                            <Badge className="badge-success">
                              {progress_tracking.current_position}
                            </Badge>
                          </div>
                          <p className="text-sm text-on-matte-subtle">
                            Department: {progress_tracking.current_department}
                          </p>
                        </div>

                        {progress_tracking.previous_position && (
                          <div className="p-4 rounded-lg border border-matte surface-matte">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-accent" />
                                <span className="font-semibold text-on-matte">
                                  Previous Position
                                </span>
                              </div>
                              <Badge variant="outline" className="badge-brand">
                                {progress_tracking.previous_position}
                              </Badge>
                            </div>
                            <p className="text-sm text-on-matte-subtle">
                              Department:{" "}
                              {progress_tracking.previous_department}
                            </p>
                          </div>
                        )}

                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-matte">
                          <h4 className="font-semibold text-on-matte mb-3">
                            Development Summary
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 rounded-lg surface-matte border border-matte">
                              <div className="text-xl font-bold text-purple-accent">
                                {current_skills.length}
                              </div>
                              <div className="text-xs text-on-matte-subtle">
                                Skills
                              </div>
                            </div>
                            <div className="text-center p-3 rounded-lg surface-matte border border-matte">
                              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {recommended_courses.length}
                              </div>
                              <div className="text-xs text-on-matte-subtle">
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