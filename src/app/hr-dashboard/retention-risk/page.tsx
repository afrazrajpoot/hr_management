"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Loader2,
  Brain,
  Bot,
  Shield,
  Activity,
  Zap,
  ChevronRight,
  Sparkles,
  BarChart3,
  MessageSquare,
  TargetIcon,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import HRLayout from "@/components/hr/HRLayout";
import { useSocket } from "@/context/SocketContext";
import { useEffect, useState, useMemo } from "react";
import { useAnalyzeRetentionRiskMutation } from "@/redux/hr-python-api/intervation";
import ChatPopup from "@/components/hr/ChatPopup";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";

// Interface for chat messages
interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
}

interface ChatConversation {
  department: string;
  messages: ChatMessage[];
}

// Interface for AnalysisResult (based on Prisma schema)
interface AnalysisResult {
  id: number;
  hrid: string;
  department_name: string;
  ai_response: {
    department: string;
    retention_score: number;
    risk_level: string;
    mobility_opportunities: string[];
    recommendations: string[];
    action_items: string[];
  };
  risk_score: number | null;
  created_at: string;
}

const RiskStatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  description,
}: any) => (
  <Card className="card-primary card-hover border-0 shadow-lg group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`icon-wrapper-${
                trend === "up" ? "amber" : trend === "down" ? "green" : "blue"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {value}
            </span>
            {change && (
              <Badge
                className={`gap-1 ${
                  trend === "up"
                    ? "badge-amber"
                    : trend === "down"
                    ? "badge-green"
                    : "badge-blue"
                }`}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {change}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-3">{description}</p>
          )}
        </div>
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const RecommendationCard = ({ recommendation, onClick }: any) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "high":
        return "badge-red";
      case "medium":
        return "badge-amber";
      case "low":
        return "badge-green";
      default:
        return "badge-blue";
    }
  };

  return (
    <Card
      className="card-primary card-hover group border-0 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                  {recommendation.department}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Retention Analysis
                </CardDescription>
              </div>
            </div>
          </div>
          <Badge
            className={`${getRiskBadgeClass(recommendation.risk_level)} gap-1`}
          >
            <Shield className="h-3 w-3" />
            {recommendation.risk_level} Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Section */}
        <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="icon-wrapper-purple">
                <TargetIcon className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Retention Score
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-purple-600">
                {recommendation.retention_score.toFixed(1)}
              </div>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <Progress
            value={recommendation.retention_score}
            className="h-2 mt-3 progress-bar-primary"
          />
        </div>

        {/* Mobility Opportunities */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper-green">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <h4 className="text-sm font-medium text-foreground">
              Mobility Opportunities
            </h4>
          </div>
          <ul className="space-y-2">
            {recommendation.mobility_opportunities
              .slice(0, 2)
              .map((item: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper-blue">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <h4 className="text-sm font-medium text-foreground">
              Priority Actions
            </h4>
          </div>
          <ul className="space-y-2">
            {recommendation.action_items
              .slice(0, 2)
              .map((item: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Chat Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10 gap-2 group"
        >
          <Bot className="h-4 w-4" />
          Chat with AI Assistant
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Button>
      </CardContent>
    </Card>
  );
};

// Fallback data structure
const fallbackRiskData = {
  riskDistributionData: [
    {
      level: "Low Risk",
      count: 0,
      percentage: 0,
      color: "hsl(var(--success))",
    },
    {
      level: "Medium Risk",
      count: 0,
      percentage: 0,
      color: "hsl(var(--warning))",
    },
    {
      level: "High Risk",
      count: 0,
      percentage: 0,
      color: "hsl(var(--destructive))",
    },
  ],
  departmentRiskData: [
    {
      department: "No Data",
      low: 0,
      medium: 0,
      high: 0,
      total: 0,
      color: "hsl(var(--primary))",
    },
  ],
  totalAtRisk: 0,
  highRisk: 0,
  totalEmployees: 0,
  avgRiskScore: "0.0",
  retentionRate: 100,
  departmentCount: 0,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-xl backdrop-blur-sm min-w-[180px]">
      {label && <div className="font-bold mb-2 text-foreground">{label}</div>}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="text-sm mb-1" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
          {entry.payload && entry.payload.percentage !== undefined && (
            <span className="ml-2 text-xs opacity-80">
              ({entry.payload.percentage}%)
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default function RetentionRisk() {
  const { dashboardData } = useSocket();
  const { data: session } = useSession();
  const [
    analyzeRetentionRisk,
    { data: analysisData, isLoading: isAnalysisLoading, error },
  ] = useAnalyzeRetentionRiskMutation();
  const [riskData, setRiskData] = useState<any>(fallbackRiskData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatConversations, setChatConversations] = useState<
    Record<string, ChatConversation>
  >({});
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  // Determine if there are unanalyzed departments
  const hasUnanalyzedDepartments = useMemo(() => {
    if (!dashboardData || !Array.isArray(dashboardData)) return false;
    const analyzedDepartments = new Set(
      analysisResults.map((result) => result.department_name)
    );
    return dashboardData.some(
      (dept: any) => !analyzedDepartments.has(dept.name)
    );
  }, [dashboardData, analysisResults]);

  // Fetch AnalysisResult data from API
  useEffect(() => {
    const fetchAnalysisResults = async () => {
      if (!session?.user?.id) {
        console.error("No hrid found in session");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/get-analysis-result", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setAnalysisResults(result.data || []);
      } catch (error) {
        console.error("Error fetching analysis results:", error);
        setAnalysisResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisResults();
  }, [session?.user?.id]);

  // Process dashboard data for risk statistics
  useEffect(() => {
    if (dashboardData && Array.isArray(dashboardData)) {
      processRiskData(dashboardData);
    } else {
      setRiskData(fallbackRiskData);
    }
  }, [dashboardData]);

  const processRiskData = (departmentData: any[]) => {
    if (!Array.isArray(departmentData)) {
      console.error(
        "processRiskData expected an array but got:",
        departmentData
      );
      setRiskData(fallbackRiskData);
      return;
    }

    let lowRisk = 0;
    let mediumRisk = 0;
    let highRisk = 0;
    let totalEmployees = 0;
    let totalRiskScore = 0;

    departmentData.forEach((dept: any) => {
      const riskDist = dept.metrics?.retention_risk_distribution || {};
      lowRisk += riskDist["Low (0-30)"] || 0;
      mediumRisk += riskDist["Medium (31-60)"] || 0;
      highRisk += riskDist["High (61-100)"] || 0;
      totalEmployees += dept.employee_count || 0;
      totalRiskScore += dept.metrics?.avg_scores?.retention_risk_score || 0;
    });

    const totalAtRisk = mediumRisk + highRisk;
    const avgRiskScore =
      departmentData.length > 0 ? totalRiskScore / departmentData.length : 0;
    const retentionRate =
      totalEmployees > 0
        ? Math.round(((totalEmployees - totalAtRisk) / totalEmployees) * 100)
        : 100;

    const riskDistributionData = [
      {
        level: "Low Risk",
        count: lowRisk,
        percentage:
          totalEmployees > 0 ? Math.round((lowRisk / totalEmployees) * 100) : 0,
        color: "hsl(var(--success))",
      },
      {
        level: "Medium Risk",
        count: mediumRisk,
        percentage:
          totalEmployees > 0
            ? Math.round((mediumRisk / totalEmployees) * 100)
            : 0,
        color: "hsl(var(--warning))",
      },
      {
        level: "High Risk",
        count: highRisk,
        percentage:
          totalEmployees > 0
            ? Math.round((highRisk / totalEmployees) * 100)
            : 0,
        color: "hsl(var(--destructive))",
      },
    ];

    const departmentRiskData =
      departmentData.length > 0
        ? departmentData.map((dept: any) => ({
            department: dept.name || "Unknown Department",
            low: dept.metrics?.retention_risk_distribution?.["Low (0-30)"] || 0,
            medium:
              dept.metrics?.retention_risk_distribution?.["Medium (31-60)"] ||
              0,
            high:
              dept.metrics?.retention_risk_distribution?.["High (61-100)"] || 0,
            total: dept.employee_count || 0,
            color: dept.color || "hsl(var(--primary))",
          }))
        : fallbackRiskData.departmentRiskData;

    setRiskData({
      riskDistributionData,
      departmentRiskData,
      totalAtRisk,
      highRisk,
      totalEmployees,
      avgRiskScore: avgRiskScore.toFixed(1),
      retentionRate,
      departmentCount: departmentData.length,
    });
  };

  // Handle "Analyze with AI" button click
  const handleAnalyzeWithAI = async () => {
    if (!dashboardData || !Array.isArray(dashboardData)) {
      console.error("No valid dashboard data available");
      return;
    }

    // Identify departments without analysis data
    const analyzedDepartments = new Set(
      analysisResults.map((result) => result.department_name)
    );
    const departmentsToAnalyze = dashboardData.filter(
      (dept: any) => !analyzedDepartments.has(dept.name)
    );

    try {
      // Send only unanalyzed departments to the AI analysis endpoint
      await analyzeRetentionRisk(departmentsToAnalyze).unwrap();
      // Refetch analysis results after generating new data
      const response = await fetch("/api/get-analysis-result", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResults(result.data || []);
    } catch (err) {
      console.error("Failed to analyze retention risk:", err);
    }
  };

  const handleCardClick = (recommendation: any) => {
    setSelectedDepartment(recommendation);
    setIsChatOpen(true);

    const conversationKey = `${session?.user?.id}_${recommendation.department}`;
    if (!chatConversations[conversationKey]) {
      setChatConversations((prev) => ({
        ...prev,
        [conversationKey]: {
          department: recommendation.department,
          messages: [
            {
              role: "assistant",
              content: `Hello! I'm here to help you with retention strategies for the ${recommendation.department} department. How can I assist you today?`,
            },
          ],
        },
      }));
    }
  };

  const updateChatMessages = (
    department: string,
    newMessages: ChatMessage[]
  ) => {
    const conversationKey = `${session?.user?.id}_${department}`;
    setChatConversations((prev) => ({
      ...prev,
      [conversationKey]: {
        department,
        messages: newMessages,
      },
    }));
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedDepartment(null);
  };

  if (isLoading) {
    return (
      <HRLayout>
        <div className="min-h-screen gradient-bg-primary flex items-center justify-center">
          <Loader />
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="min-h-screen gradient-bg-primary p-4 md:p-6 space-y-6">
        {/* Header with decorative elements */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="decorative-gradient-blur-blue -top-20 -right-20" />
          <div className="decorative-gradient-blur-purple -bottom-20 -left-20" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="sidebar-logo-wrapper">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-primary">
                    Retention Risk Intelligence
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    AI-powered risk analysis across {riskData.departmentCount}{" "}
                    departments • {riskData.totalEmployees} employees
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasUnanalyzedDepartments && session?.user?.paid && (
                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={isAnalysisLoading || !dashboardData}
                  className="btn-gradient-primary flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
                >
                  {isAnalysisLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Run AI Analysis
                    </>
                  )}
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-card-foreground border border-border hover:border-primary transition-all">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-destructive/10 to-transparent border border-destructive/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper-red">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Analysis Failed</h4>
                <p className="text-sm text-muted-foreground">
                  {(error as any).data?.detail || "Unknown error occurred"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Risk Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <RiskStatCard
            title="At Risk Employees"
            value={riskData.totalAtRisk}
            change={`${
              Math.round(
                (riskData.totalAtRisk / riskData.totalEmployees) * 100
              ) || 0
            }%`}
            icon={AlertTriangle}
            trend={riskData.totalAtRisk > 0 ? "up" : "neutral"}
            description="Employees with medium to high retention risk"
          />

          <RiskStatCard
            title="High Risk"
            value={riskData.highRisk}
            change="Critical priority"
            icon={AlertTriangle}
            trend="up"
            description="Immediate attention required"
          />

          <RiskStatCard
            title="Retention Rate"
            value={`${riskData.retentionRate}%`}
            change={`${100 - riskData.retentionRate}% at risk`}
            icon={Users}
            trend={riskData.retentionRate > 90 ? "down" : "up"}
            description="Overall employee retention"
          />

          <RiskStatCard
            title="Avg Risk Score"
            value={riskData.avgRiskScore}
            change="/100 scale"
            icon={Target}
            trend={Number(riskData.avgRiskScore) < 30 ? "down" : "up"}
            description="Average retention risk score"
          />
        </div>

        {/* Risk Distribution & Department Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Risk Distribution Pie Chart */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-success/5 to-transparent border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <PieChart className="h-5 w-5 text-success" />
                    Risk Level Distribution
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Breakdown of employee retention risk levels
                  </CardDescription>
                </div>
                <Badge className="badge-green">
                  <Shield className="h-3 w-3 mr-1" />
                  Risk Overview
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData.riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="count"
                      label={({ percentage }) => `${percentage}%`}
                      labelLine={false}
                    >
                      {riskData.riskDistributionData.map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {riskData.riskDistributionData.map(
                  (item: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {item.level}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.count} employees
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Department Risk Breakdown */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Risk by Department
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Retention risk levels across departments
                  </CardDescription>
                </div>
                <Badge className="badge-blue">
                  <Activity className="h-3 w-3 mr-1" />
                  Department Analysis
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={riskData.departmentRiskData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.3}
                    />
                    <XAxis
                      dataKey="department"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar
                      dataKey="low"
                      stackId="a"
                      fill="hsl(var(--success))"
                      name="Low Risk"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="medium"
                      stackId="a"
                      fill="hsl(var(--warning))"
                      name="Medium Risk"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="high"
                      stackId="a"
                      fill="hsl(var(--destructive))"
                      name="High Risk"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Results */}
        {analysisResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="ai-recommendation-icon-wrapper">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    AI-Powered Recommendations
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  Personalized retention strategies and risk mitigation plans
                </p>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {analysisResults.length} Departments Analyzed
              </Badge>
            </div>

            {/* Summary Card */}
            <Card className="ai-recommendation-card border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="icon-wrapper-purple flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      AI Analysis Summary
                    </h4>
                    <p className="text-muted-foreground">
                      {analysisData?.summary ||
                        "Analysis of retention risks across departments."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {analysisResults.map((result, index) => (
                <RecommendationCard
                  key={index}
                  recommendation={result.ai_response}
                  onClick={() => handleCardClick(result.ai_response)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {analysisResults.length === 0 && (
          <Card className="ai-recommendation-card border-0 shadow-xl text-center">
            <CardContent className="p-12">
              <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Unlock AI Insights
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Get personalized retention risk recommendations by running our
                AI analysis on your department data. Discover hidden risks and
                actionable strategies.
              </p>
              {hasUnanalyzedDepartments && (
                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={!dashboardData || isAnalysisLoading}
                  className="btn-gradient-primary flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium mx-auto"
                >
                  {isAnalysisLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5" />
                      Run AI Analysis
                    </>
                  )}
                </button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Real-time risk monitoring</span>
            </div>
            <span>•</span>
            <span>{riskData.departmentCount} departments analyzed</span>
            <span>•</span>
            <span>Last updated: Just now</span>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            Need Help? <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Chat Popup */}
        <ChatPopup
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          department={selectedDepartment}
          hrId={session?.user?.id || ""}
          dashboardData={dashboardData || []}
          messages={
            selectedDepartment
              ? chatConversations[
                  `${session?.user?.id}_${selectedDepartment.department}`
                ]?.messages || []
              : []
          }
          onMessagesUpdate={updateChatMessages}
        />
      </div>
    </HRLayout>
  );
}

// Missing import for Download icon
const Download = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
