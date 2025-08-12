"use client";
import { useState } from "react";
// import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Target,
  Users,
  Award,
  Clock,
  Play,
  CheckCircle,
  Star,
  TrendingUp,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";

// Mock data for skills and development
const skillAreas = [
  {
    category: "Technical Skills",
    skills: [
      { name: "Python Programming", current: 65, target: 85, priority: "High" },
      { name: "Data Visualization", current: 70, target: 90, priority: "High" },
      { name: "SQL Database", current: 80, target: 95, priority: "Medium" },
      { name: "Machine Learning", current: 45, target: 75, priority: "Medium" },
    ],
  },
  {
    category: "Soft Skills",
    skills: [
      { name: "Public Speaking", current: 55, target: 80, priority: "High" },
      { name: "Team Leadership", current: 60, target: 85, priority: "High" },
      {
        name: "Project Management",
        current: 75,
        target: 90,
        priority: "Medium",
      },
      { name: "Strategic Thinking", current: 70, target: 85, priority: "Low" },
    ],
  },
];

const recommendedCourses = [
  {
    id: 1,
    title: "Advanced Python for Data Science",
    provider: "Coursera",
    rating: 4.8,
    duration: "6 weeks",
    difficulty: "Intermediate",
    skills: ["Python", "Data Analysis", "Pandas"],
    price: "$49/month",
    enrolled: false,
    progress: 0,
  },
  {
    id: 2,
    title: "Public Speaking Mastery",
    provider: "LinkedIn Learning",
    rating: 4.6,
    duration: "4 weeks",
    difficulty: "Beginner",
    skills: ["Communication", "Presentation", "Confidence"],
    price: "$29/month",
    enrolled: true,
    progress: 35,
  },
  {
    id: 3,
    title: "Leadership Fundamentals",
    provider: "edX",
    rating: 4.7,
    duration: "8 weeks",
    difficulty: "Intermediate",
    skills: ["Leadership", "Team Management", "Decision Making"],
    price: "Free",
    enrolled: false,
    progress: 0,
  },
  {
    id: 4,
    title: "Data Visualization with Tableau",
    provider: "Udemy",
    rating: 4.5,
    duration: "5 weeks",
    difficulty: "Beginner",
    skills: ["Tableau", "Data Viz", "Analytics"],
    price: "$84.99",
    enrolled: true,
    progress: 78,
  },
];

const mentorshipSuggestions = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior Data Scientist",
    company: "Google",
    expertise: ["Machine Learning", "Python", "Career Growth"],
    rating: 4.9,
    sessions: 120,
    available: true,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "VP of Engineering",
    company: "Microsoft",
    expertise: ["Leadership", "Technical Strategy", "Team Building"],
    rating: 4.8,
    sessions: 89,
    available: false,
  },
  {
    id: 3,
    name: "Lisa Rodriguez",
    role: "Head of Product",
    company: "Airbnb",
    expertise: ["Product Management", "Public Speaking", "Strategy"],
    rating: 4.9,
    sessions: 156,
    available: true,
  },
];

export default function Development() {
  const [activeTab, setActiveTab] = useState("skills");

  const getPriorityColor: any = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "warning";
      case "Low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getDifficultyColor: any = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "success";
      case "Intermediate":
        return "warning";
      case "Advanced":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Development Roadmap</h1>
            <p className="text-muted-foreground mt-1">
              Personalized skill development and learning recommendations
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skills Assessment</TabsTrigger>
            <TabsTrigger value="courses">Recommended Courses</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          </TabsList>

          {/* Skills Assessment Tab */}
          <TabsContent value="skills" className="space-y-6">
            {skillAreas.map((area, areaIndex) => (
              <Card key={areaIndex} className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    {area.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {area.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{skill.name}</h4>
                          <Badge variant={getPriorityColor(skill.priority)}>
                            {skill.priority} Priority
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {skill.current}% → {skill.target}%
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Current Level</span>
                          <span>{skill.current}%</span>
                        </div>
                        <Progress value={skill.current} className="h-2" />

                        <div className="flex justify-between text-xs">
                          <span>Target Level</span>
                          <span>{skill.target}%</span>
                        </div>
                        <Progress
                          value={skill.target}
                          className="h-1 opacity-50"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-muted-foreground">
                          Gap: {skill.target - skill.current}% to reach target
                        </div>
                        <Button size="sm" variant="outline">
                          Find Resources
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Recommended Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendedCourses.map((course) => (
                <Card key={course.id} className="card-interactive">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                          <span>{course.provider}</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
                            {course.rating}
                          </div>
                        </div>
                      </div>
                      {course.enrolled && (
                        <Badge variant="default">Enrolled</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge
                          variant={getDifficultyColor(course.difficulty)}
                          className="text-xs"
                        >
                          {course.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Skills you'll learn:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {course.enrolled && course.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="font-semibold text-primary">
                        {course.price}
                      </div>
                      <div className="flex space-x-2">
                        {course.enrolled ? (
                          <Button size="sm" className="btn-gradient">
                            <Play className="w-3 h-3 mr-2" />
                            Continue
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline">
                              Preview
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                            <Button size="sm" className="btn-gradient">
                              Enroll Now
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mentorship Tab */}
          <TabsContent value="mentorship" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Recommended Mentors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mentorshipSuggestions.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{mentor.name}</h4>
                          <div className="flex items-center text-sm">
                            <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
                            {mentor.rating}
                          </div>
                          {mentor.available ? (
                            <Badge variant="success">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Fully Booked</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {mentor.role} at {mentor.company}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {mentor.sessions} sessions completed
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Expertise:</div>
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-muted-foreground">
                        1-on-1 mentorship sessions
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          className="btn-gradient"
                          disabled={!mentor.available}
                        >
                          {mentor.available
                            ? "Request Session"
                            : "Join Waitlist"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Learning Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-gradient-accent rounded-lg">
                    <div className="text-3xl font-bold text-primary">14</div>
                    <div className="text-sm text-muted-foreground">
                      Day Streak
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-semibold">5</div>
                      <div className="text-xs text-muted-foreground">
                        Courses Completed
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">28</div>
                      <div className="text-xs text-muted-foreground">
                        Hours Learned
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">12</div>
                      <div className="text-xs text-muted-foreground">
                        Skills Improved
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/10">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div>
                      <div className="font-medium">Python Pro</div>
                      <div className="text-sm text-muted-foreground">
                        Completed Python course
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/10">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div>
                      <div className="font-medium">Presentation Master</div>
                      <div className="text-sm text-muted-foreground">
                        Improved public speaking by 25%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Star className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">
                        Leadership Badge
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Complete leadership course
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
