"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  DollarSign,
  User,
  Briefcase,
  Building2,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  MapPin,
  Phone,
  Calendar,
  Users,
  BarChart3,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Brain,
  HandHeart,
  Shield,
  Sparkles,
  Users2,
  Target as TargetIcon,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface EmployeeDetailModalProps {
  isOpen: boolean;
  hrId: string;
  onClose: () => void;
  employee: any;
}

interface DepartmentStats {
  department: string;
  employee_count: number;
  employees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    employeeId?: string;
  }>;
  llm_recommendations?: {
    structured_recommendations: {
      team_composition_overview: {
        overview: string;
      };
      strengths_identified: {
        strengths: string[];
      };
      critical_gaps: {
        gaps: string[];
      };
      recommendations_for_balance: {
        recommendations: string[];
      };
      targeted_training_development: {
        training_recommendations: string[];
      };
      team_building_collaboration: {
        collaboration_recommendations: string[];
      };
      risk_mitigation: {
        risks: string[];
        mitigation_strategies: string[];
      };
    };
    summary: string;
    data_quality: {
      employees_with_data: number;
      total_employees: number;
      coverage_percentage: number;
    };
  };
}

export default function DepartmentModal({
  isOpen,
  hrId,
  onClose,
  employee,
}: EmployeeDetailModalProps) {
  const [departmentStats, setDepartmentStats] =
    useState<DepartmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  useEffect(() => {
    if (isOpen && employee?.department) {
      // Reset departmentStats when dialog opens
      setDepartmentStats(null);
      fetchDepartmentStats();
    }
  }, [isOpen, employee?.department, hrId]);

  const fetchDepartmentStats = async () => {
    if (!employee?.department) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/departments/aggregate?department=${encodeURIComponent(
          employee.department
        )}&hrId=${hrId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.fastApiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch department stats");
      }

      const data = await response.json();

      if (data.success && data.data) {
        // If we get an array, find the specific department
        if (Array.isArray(data.data)) {
          const deptStats = data.data.find(
            (dept: DepartmentStats) => dept.department === employee.department
          );
          setDepartmentStats(deptStats || null);
        } else if (data.data.department) {
          // If we get a single department object
          setDepartmentStats(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching department stats:", error);
      toast.error("Failed to load department statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] border-0 p-0 flex flex-col">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="decorative-gradient-blur-blue top-0 left-0 w-96 h-96"></div>
          <div className="decorative-gradient-blur-purple bottom-0 right-0 w-80 h-80"></div>
        </div>

        <div className="overflow-y-auto flex-1 p-8 gradient-bg-primary">
          <div className="space-y-8">
            {/* Department Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card-primary card-hover">
                <div className="flex items-center gap-4">
                  <div className="icon-wrapper-blue">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="text-2xl font-bold text-foreground">
                      {employee.department}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-primary card-hover">
                <div className="flex items-center gap-4">
                  <div className="icon-wrapper-green">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Employees
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {departmentStats?.employee_count || 0}
                    </p>
                  </div>
                </div>
              </div>

              {departmentStats?.llm_recommendations?.data_quality && (
                <div className="card-primary card-hover">
                  <div className="flex items-center gap-4">
                    <div className="icon-wrapper-purple">
                      <BarChart3 className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Data Coverage
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {departmentStats.llm_recommendations.data_quality.coverage_percentage.toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Department Statistics Card */}
            <Card className="card-primary">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-blue">
                    <BarChart3 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      Department Statistics
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive analysis and team composition
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : departmentStats ? (
                  <div className="space-y-6">
                    {/* Employees List */}
                    {departmentStats.employees.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                            <Users2 className="w-5 h-5 text-primary" />
                            Team Members ({departmentStats.employees.length})
                          </h4>
                          <Badge className="badge-blue">
                            {departmentStats.employee_count} total
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {departmentStats.employees.map((emp) => (
                            <div
                              key={emp.id}
                              className={`assessment-item group ${
                                emp.id === employee.id
                                  ? "border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        emp.id === employee.id
                                          ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                                          : "bg-secondary text-muted-foreground"
                                      }`}
                                    >
                                      <User className="w-5 h-5" />
                                    </div>
                                    {emp.id === employee.id && (
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-foreground">
                                        {emp.firstName} {emp.lastName}
                                      </p>
                                      {emp.id === employee.id && (
                                        <Badge className="badge-primary text-xs">
                                          Current
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {emp.position}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {emp.email}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="icon-wrapper-blue w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      No department statistics available
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Department analysis data will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights & Recommendations */}
            {departmentStats?.llm_recommendations && (
              <Card className="card-primary">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="ai-recommendation-icon-wrapper">
                        <Brain className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-foreground">
                          AI Insights & Recommendations
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Powered by GeniusFactor AI
                        </p>
                      </div>
                    </div>
                    <Badge className="badge-purple">
                      <Zap className="w-3 h-3 mr-1" />
                      Smart Analysis
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="ai-recommendation-card">
                    <div className="flex items-start gap-3">
                      <div className="icon-wrapper-blue flex-shrink-0 mt-1">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-foreground mb-2">
                          Executive Summary
                        </h4>
                        <p className="text-foreground/80 leading-relaxed">
                          {departmentStats.llm_recommendations.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Data Coverage */}
                  <div className="assessment-item">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="icon-wrapper-green">
                        <BarChart3 className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          Data Coverage
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Assessment data availability across the department
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">
                          Coverage Progress
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {departmentStats.llm_recommendations.data_quality.coverage_percentage.toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                      <div className="progress-bar-primary">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                          style={{
                            width: `${departmentStats.llm_recommendations.data_quality.coverage_percentage}%`,
                          }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 rounded-lg bg-secondary/50">
                          <p className="font-semibold text-foreground">
                            {
                              departmentStats.llm_recommendations.data_quality
                                .employees_with_data
                            }
                          </p>
                          <p className="text-muted-foreground">With Data</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-secondary/50">
                          <p className="font-semibold text-foreground">
                            {
                              departmentStats.llm_recommendations.data_quality
                                .total_employees
                            }
                          </p>
                          <p className="text-muted-foreground">
                            Total Employees
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Composition */}
                  {departmentStats.llm_recommendations
                    .structured_recommendations.team_composition_overview
                    .overview && (
                    <div className="assessment-item">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="icon-wrapper-blue">
                          <Users2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            Team Composition
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Current team structure and dynamics
                          </p>
                        </div>
                      </div>
                      <p className="text-foreground/80 leading-relaxed">
                        {
                          departmentStats.llm_recommendations
                            .structured_recommendations
                            .team_composition_overview.overview
                        }
                      </p>
                    </div>
                  )}

                  {/* Strengths & Gaps Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Strengths */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.strengths_identified.strengths
                      .length > 0 && (
                      <div className="card-primary">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="icon-wrapper-green">
                            <TrendingUp className="w-5 h-5 text-success" />
                          </div>
                          <h4 className="font-semibold text-foreground">
                            Team Strengths
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {departmentStats.llm_recommendations.structured_recommendations.strengths_identified.strengths.map(
                            (strength, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-success"></div>
                                <p className="text-sm text-foreground/80">
                                  {strength}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Gaps */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.critical_gaps.gaps.length >
                      0 && (
                      <div className="card-primary">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="icon-wrapper-amber">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                          </div>
                          <h4 className="font-semibold text-foreground">
                            Areas for Improvement
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {departmentStats.llm_recommendations.structured_recommendations.critical_gaps.gaps.map(
                            (gap, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-warning"></div>
                                <p className="text-sm text-foreground/80">
                                  {gap}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendations Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Balance Recommendations */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.recommendations_for_balance
                      .recommendations.length > 0 && (
                      <div className="quick-action-item">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="icon-wrapper-purple">
                            <TargetIcon className="w-5 h-5 text-accent" />
                          </div>
                          <h4 className="font-semibold text-foreground">
                            Balance
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {departmentStats.llm_recommendations.structured_recommendations.recommendations_for_balance.recommendations.map(
                            (rec, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-primary font-bold">
                                  •
                                </span>
                                <p className="text-sm text-foreground/80">
                                  {rec}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Training & Development */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.targeted_training_development
                      .training_recommendations.length > 0 && (
                      <div className="quick-action-item">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="icon-wrapper-blue">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <h4 className="font-semibold text-foreground">
                            Training
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {departmentStats.llm_recommendations.structured_recommendations.targeted_training_development.training_recommendations.map(
                            (training, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-primary font-bold">
                                  •
                                </span>
                                <p className="text-sm text-foreground/80">
                                  {training}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Collaboration */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.team_building_collaboration
                      .collaboration_recommendations.length > 0 && (
                      <div className="quick-action-item">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="icon-wrapper-green">
                            <HandHeart className="w-5 h-5 text-success" />
                          </div>
                          <h4 className="font-semibold text-foreground">
                            Collaboration
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {departmentStats.llm_recommendations.structured_recommendations.team_building_collaboration.collaboration_recommendations.map(
                            (collab, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-primary font-bold">
                                  •
                                </span>
                                <p className="text-sm text-foreground/80">
                                  {collab}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Management */}
                  {(departmentStats.llm_recommendations
                    .structured_recommendations.risk_mitigation.risks.length >
                    0 ||
                    departmentStats.llm_recommendations
                      .structured_recommendations.risk_mitigation
                      .mitigation_strategies.length > 0) && (
                    <div className="card-primary">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="icon-wrapper-amber">
                          <Shield className="w-5 h-5 text-warning" />
                        </div>
                        <h4 className="font-semibold text-foreground">
                          Risk Management
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {/* Risks */}
                        {departmentStats.llm_recommendations
                          .structured_recommendations.risk_mitigation.risks
                          .length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-muted-foreground mb-2">
                              Identified Risks
                            </h5>
                            <div className="space-y-2">
                              {departmentStats.llm_recommendations.structured_recommendations.risk_mitigation.risks.map(
                                (risk, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-destructive"></div>
                                    <p className="text-sm text-foreground/80">
                                      {risk}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Mitigation Strategies */}
                        {departmentStats.llm_recommendations
                          .structured_recommendations.risk_mitigation
                          .mitigation_strategies.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-muted-foreground mb-2">
                              Mitigation Strategies
                            </h5>
                            <div className="space-y-2">
                              {departmentStats.llm_recommendations.structured_recommendations.risk_mitigation.mitigation_strategies.map(
                                (strategy, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-success"></div>
                                    <p className="text-sm text-foreground/80">
                                      {strategy}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
