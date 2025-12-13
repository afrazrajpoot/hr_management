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
  Loader2,
  AlertCircle,
  User,
  Sparkles,
  Award,
  Rocket,
  ChevronRight,
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

  const [activeTab, setActiveTab] = useState("skills");

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
          <Card className="w-full max-w-md bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 border-blue-200 dark:border-blue-800 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-2xl w-fit">
                <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="mt-6 text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Profile Incomplete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                We couldn't find your employee profile. Please complete your
                profile to access your development roadmap.
              </p>
              <Button
                onClick={() => router.push("/employee-dashboard/profile")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
          <Card className="max-w-md bg-gradient-to-br from-white to-rose-50 dark:from-gray-900 dark:to-rose-950/20 border-rose-200 dark:border-rose-800">
            <CardContent className="p-8 text-center">
              <div className="mx-auto bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 p-4 rounded-full w-fit mb-6">
                <AlertCircle className="w-12 h-12 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Error loading data
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Failed to load employee data
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
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

  return (
    <AppLayout>
      <div className="p-6 space-y-8 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                <Rocket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Development Roadmap
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Personalized skill development for{" "}
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {employee_name}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Review
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Target className="w-4 h-4 mr-2" />
              Set Goals
            </Button>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/50 p-1 rounded-2xl border border-blue-100 dark:border-gray-700">
            <TabsTrigger
              value="skills"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Target className="w-4 h-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6 animate-fadeIn">
            <Card className="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/10 border-blue-100 dark:border-blue-800/30 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-100 dark:border-blue-800/20">
                <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg mr-3">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Current Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {current_skills.length > 0 ? (
                    current_skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-blue-100 dark:border-blue-800/20 shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <Badge
                            variant="default"
                            className="text-sm py-1.5 px-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                          >
                            {skill.name}
                          </Badge>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Progress
                            value={skill.proficiency}
                            className="h-2.5 bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Proficiency Level
                            </span>
                            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                              {skill.proficiency}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl w-fit mb-4">
                        <Sparkles className="w-12 h-12 text-blue-400 dark:text-blue-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        No skills recorded yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Start building your skills profile to get personalized
                        recommendations
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommended_courses.length > 0 ? (
                recommended_courses.map((course, index) => (
                  <Card
                    key={index}
                    className="group bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-950/10 border-indigo-100 dark:border-indigo-800/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          {course.title}
                        </CardTitle>
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                        >
                          {course.provider}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic border-l-4 border-blue-200 dark:border-blue-700 pl-3 py-1">
                        {course.reason}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-blue-100 dark:border-blue-800/30">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          asChild
                        >
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Details
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                          asChild
                        >
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Enroll Now
                            <ChevronRight className="w-3 h-3 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-2 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/10 border-blue-100 dark:border-blue-800/30">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl w-fit mb-6">
                      <BookOpen className="w-16 h-16 text-blue-400 dark:text-blue-300" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      No courses recommended yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                      Complete your profile and skill assessment to get
                      personalized course recommendations.
                    </p>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      onClick={() => router.push("/employee-dashboard/profile")}
                    >
                      Complete Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-800 dark:to-emerald-950/10 border-emerald-100 dark:border-emerald-800/30 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-b border-emerald-100 dark:border-emerald-800/20">
                  <CardTitle className="flex items-center text-emerald-900 dark:text-emerald-100">
                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg mr-3">
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Career Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-800/30 dark:to-teal-800/30 rounded">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Current Position
                        </span>
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
                        {progress_tracking.current_position}
                      </Badge>
                    </div>

                    {progress_tracking.previous_position && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/30 dark:to-indigo-800/30 rounded">
                            <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Previous Position
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                        >
                          {progress_tracking.previous_position}
                        </Badge>
                      </div>
                    )}

                    <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/30 dark:to-purple-800/30 rounded">
                          <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Current Department
                        </span>
                      </div>
                      <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
                        {progress_tracking.current_department}
                      </Badge>
                    </div>

                    {progress_tracking.previous_department && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800/30 dark:to-pink-800/30 rounded">
                            <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Previous Department
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                        >
                          {progress_tracking.previous_department}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-950/10 border-amber-100 dark:border-amber-800/30 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b border-amber-100 dark:border-amber-800/20">
                  <CardTitle className="flex items-center text-amber-900 dark:text-amber-100">
                    <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg mr-3">
                      <Rocket className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    Development Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 rounded-2xl border border-amber-200 dark:border-amber-800/30">
                    <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
                      {recommended_courses.length}
                    </div>
                    <div className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                      Recommended Courses
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {current_skills.length}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Current Skills
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800/30">
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {progress_tracking.previous_position
                          ? "Promoted"
                          : "New Hire"}
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Career Status
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
