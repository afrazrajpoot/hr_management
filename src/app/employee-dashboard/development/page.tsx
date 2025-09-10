// pages/development.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import { useGetEmployeeLearningDashboardQuery } from "@/redux/employee-python-api/employee-python-api";

export default function Development() {
  const { data: session, status: sessionStatus } = useSession();
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

  if (sessionStatus === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Error loading data</h2>
            <p className="text-muted-foreground mt-2">
              Failed to load employee data
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading || !employeeData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
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
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Development Roadmap</h1>
            <p className="text-muted-foreground mt-1">
              Personalized skill development for {employee_name}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Review
            </Button>
            <Button className="btn-gradient">
              <Target className="w-4 h-4 mr-2" />
              Set Goals
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="courses">Recommended Courses</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Current Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {current_skills.length > 0 ? (
                    current_skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <Badge
                          variant="secondary"
                          className="text-sm py-1 px-3"
                        >
                          {skill.name}
                        </Badge>
                        <div className="flex-1">
                          <Progress
                            value={skill.proficiency}
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Proficiency: {skill.proficiency}%
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No skills recorded yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommended_courses.length > 0 ? (
                recommended_courses.map((course, index) => (
                  <Card key={index} className="card-interactive">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                        <span>{course.provider}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {course.reason}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Course
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </a>
                        </Button>
                        <Button size="sm" className="btn-gradient" asChild>
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Enroll Now
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No courses recommended yet
                    </h3>
                    <p className="text-muted-foreground">
                      Complete your profile to get personalized course
                      recommendations.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Career Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Current Position
                      </span>
                      <Badge variant="default">
                        {progress_tracking.current_position}
                      </Badge>
                    </div>
                    {progress_tracking.previous_position && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Previous Position
                        </span>
                        <Badge variant="outline">
                          {progress_tracking.previous_position}
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Current Department
                      </span>
                      <Badge variant="default">
                        {progress_tracking.current_department}
                      </Badge>
                    </div>
                    {progress_tracking.previous_department && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Previous Department
                        </span>
                        <Badge variant="outline">
                          {progress_tracking.previous_department}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Development Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-gradient-accent rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {recommended_courses.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recommended Courses
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-semibold">
                        {current_skills.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Current Skills
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">
                        {progress_tracking.previous_position
                          ? "Promoted"
                          : "New Hire"}
                      </div>
                      <div className="text-xs text-muted-foreground">
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
