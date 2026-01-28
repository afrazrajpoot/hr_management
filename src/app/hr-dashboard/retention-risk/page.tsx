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
  Download,
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
}: any) => {
  const getTrendClasses = (trend: string) => {
    switch (trend) {
      case "up":
        return {
          icon: "icon-warning bg-gradient-to-br from-amber-500/20 to-amber-600/10 dark:from-amber-500/30 dark:to-amber-600/20",
          badge: "badge-warning",
          gradient: "from-amber-600 to-amber-400"
        };
      case "down":
        return {
          icon: "icon-success bg-gradient-to-br from-green-500/20 to-green-600/10 dark:from-green-500/30 dark:to-green-600/20",
          badge: "badge-success",
          gradient: "from-green-600 to-green-400"
        };
      default:
        return {
          icon: "icon-info bg-gradient-to-br from-blue-500/20 to-blue-600/10 dark:from-blue-500/30 dark:to-blue-600/20",
          badge: "badge-info",
          gradient: "from-blue-600 to-blue-400"
        };
    }
  };

  const trendClasses = getTrendClasses(trend);

  return (
    <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
      {/* Bubble Effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500 ${trend === "up"
        ? "bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10"
        : trend === "down"
          ? "bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10"
          : "bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10"
        }`} />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className={`${trendClasses.icon} p-2 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-subtle dark:text-subtle-dark">{title}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-3xl ml-[2vw] font-bold bg-gradient-to-r ${trendClasses.gradient} bg-clip-text text-transparent`}>
                {value}
              </span>
              {change && (
                <Badge className={`${trendClasses.badge} gap-1`}>
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
              <p className="text-xs text-subtle dark:text-subtle-dark mt-3">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecommendationCard = ({ recommendation, onClick }: any) => {
  const getRiskClasses = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "high":
        return {
          badge: "badge-error",
          color: "text-red-600 dark:text-red-400",
          gradient: "from-red-600 to-red-400",
          bgGradient: "from-red-500/5 to-red-600/5 dark:from-red-500/10 dark:to-red-600/10",
          bullet: "bg-red-500"
        };
      case "medium":
        return {
          badge: "badge-warning",
          color: "text-amber-600 dark:text-amber-400",
          gradient: "from-amber-600 to-amber-400",
          bgGradient: "from-amber-500/5 to-amber-600/5 dark:from-amber-500/10 dark:to-amber-600/10",
          bullet: "bg-amber-500"
        };
      case "low":
        return {
          badge: "badge-success",
          color: "text-green-600 dark:text-green-400",
          gradient: "from-green-600 to-green-400",
          bgGradient: "from-green-500/5 to-green-600/5 dark:from-green-500/10 dark:to-green-600/10",
          bullet: "bg-green-500"
        };
      default:
        return {
          badge: "badge-info",
          color: "text-blue-600 dark:text-blue-400",
          gradient: "from-blue-600 to-blue-400",
          bgGradient: "from-blue-500/5 to-blue-600/5 dark:from-blue-500/10 dark:to-blue-600/10",
          bullet: "bg-blue-500"
        };
    }
  };

  const riskClasses = getRiskClasses(recommendation.risk_level);

  return (
    <Card className="card-purple relative overflow-hidden group border-0 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
      {/* Top gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${riskClasses.gradient}`} />

      {/* Subtle bubble effect */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-50 group-hover:opacity-70 transition-opacity ${riskClasses.bgGradient.replace('/5', '/10').replace('/10', '/20')}`} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${riskClasses.badge.replace('badge-', 'icon-')} p-2 rounded-lg`}>
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-on-matte dark:text-on-matte group-hover:text-purple-accent transition-colors">
                  {recommendation.department}
                </CardTitle>
                <CardDescription className="text-subtle dark:text-subtle-dark">
                  Retention Analysis
                </CardDescription>
              </div>
            </div>
          </div>
          <Badge className={`${riskClasses.badge} gap-1`}>
            <Shield className="h-3 w-3" />
            {recommendation.risk_level} Risk
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Section */}
        <div className={`rounded-xl p-4 ${riskClasses.bgGradient}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`${riskClasses.badge.replace('badge-', 'icon-')} p-2 rounded-lg`}>
                <TargetIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-subtle dark:text-subtle-dark">
                Retention Score
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${riskClasses.color}`}>
                {recommendation.retention_score.toFixed(1)}
              </div>
              <span className="text-xs text-subtle dark:text-subtle-dark">/100</span>
            </div>
          </div>
          <Progress
            value={recommendation.retention_score}
            className="h-2 mt-3 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-purple-600"
          />
        </div>

        {/* Mobility Opportunities */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="icon-success p-2 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-medium text-on-matte dark:text-on-matte">
              Mobility Opportunities
            </h4>
          </div>
          <ul className="space-y-2">
            {recommendation.mobility_opportunities
              .slice(0, 2)
              .map((item: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span className="text-subtle dark:text-subtle-dark">{item}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="icon-info p-2 rounded-lg">
              <Target className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-medium text-on-matte dark:text-on-matte">
              Priority Actions
            </h4>
          </div>
          <ul className="space-y-2">
            {recommendation.action_items
              .slice(0, 2)
              .map((item: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span className="text-subtle dark:text-subtle-dark">{item}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Chat Button */}
        <button
          className="btn-purple-outline flex items-center gap-2 px-3 py-1.5 text-sm w-full mt-4 hover:scale-105 transition-all duration-200"
          onClick={onClick}
        >
          <Bot className="h-4 w-4" />
          Chat with AI Assistant
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>
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
      color: "#10B981", // Tailwind green-500
    },
    {
      level: "Medium Risk",
      count: 0,
      percentage: 0,
      color: "#F59E0B", // Tailwind amber-500
    },
    {
      level: "High Risk",
      count: 0,
      percentage: 0,
      color: "#EF4444", // Tailwind red-500
    },
  ],
  departmentRiskData: [
    {
      department: "No Data",
      low: 0,
      medium: 0,
      high: 0,
      total: 0,
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
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-xl backdrop-blur-sm min-w-[180px] bg-white dark:bg-matte-gray-medium">
      {label && <div className="font-bold mb-2 text-on-matte dark:text-on-matte">{label}</div>}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="text-sm mb-1 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-medium text-on-matte dark:text-on-matte">{entry.name}:</span>
          <span className="font-bold text-on-matte dark:text-on-matte">{entry.value}</span>
          {entry.payload && entry.payload.percentage !== undefined && (
            <span className="ml-2 text-xs text-subtle dark:text-subtle-dark">
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
        color: "#10B981", // Tailwind green-500
      },
      {
        level: "Medium Risk",
        count: mediumRisk,
        percentage:
          totalEmployees > 0
            ? Math.round((mediumRisk / totalEmployees) * 100)
            : 0,
        color: "#F59E0B", // Tailwind amber-500
      },
      {
        level: "High Risk",
        count: highRisk,
        percentage:
          totalEmployees > 0
            ? Math.round((highRisk / totalEmployees) * 100)
            : 0,
        color: "#EF4444", // Tailwind red-500
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
        <div className="min-h-screen bg-layout-purple flex items-center justify-center">
          <Loader />
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="min-h-screen bg-layout-purple p-4 md:p-6 space-y-6">
        {/* Header with decorative elements */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-purple p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                    Retention Risk Intelligence
                  </h1>
                  <p className="text-purple-100 mt-2">
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
                  className="btn-purple flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium hover:shadow-xl transition-all duration-300"
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
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/30 dark:border-red-500/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="icon-error p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-on-matte dark:text-on-matte">Analysis Failed</h4>
                <p className="text-sm text-subtle dark:text-subtle-dark">
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
            change={`${Math.round(
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
          <Card className="card-purple relative overflow-hidden border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-green-500/5 to-green-600/5 dark:from-green-500/10 dark:to-green-600/10 rounded-full opacity-50" />

            <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent border-b border-matte dark:border-matte">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-on-matte dark:text-on-matte">
                    <div className="icon-success p-2 rounded-lg">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    Risk Level Distribution
                  </CardTitle>
                  <CardDescription className="text-subtle dark:text-subtle-dark">
                    Breakdown of employee retention risk levels
                  </CardDescription>
                </div>
                <Badge className="badge-success">
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
                            stroke="#ffffff"
                            strokeWidth={2}
                            strokeOpacity={0.8}
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
                      <span className="text-sm font-medium text-on-matte dark:text-on-matte">
                        {item.level}
                      </span>
                      <Badge variant="outline" className="text-xs border-matte dark:border-matte">
                        {item.count} employees
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Department Risk Breakdown */}
          <Card className="card-purple relative overflow-hidden border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-blue-600/5 dark:from-blue-500/10 dark:to-blue-600/10 rounded-full opacity-50" />

            <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b border-matte dark:border-matte">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-on-matte dark:text-on-matte">
                    <div className="icon-info p-2 rounded-lg">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    Risk by Department
                  </CardTitle>
                  <CardDescription className="text-subtle dark:text-subtle-dark">
                    Retention risk levels across departments
                  </CardDescription>
                </div>
                <Badge className="badge-info">
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
                      stroke="#e5e7eb"
                      strokeOpacity={0.3}
                    />
                    <XAxis
                      dataKey="department"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{
                        fill: "#6b7280",
                        fontSize: 12,
                      }}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "#6b7280",
                        fontSize: 12,
                      }}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar
                      dataKey="low"
                      stackId="a"
                      fill="#10B981" // Tailwind green-500
                      name="Low Risk"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="medium"
                      stackId="a"
                      fill="#F59E0B" // Tailwind amber-500
                      name="Medium Risk"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="high"
                      stackId="a"
                      fill="#EF4444" // Tailwind red-500
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
                  <div className="icon-brand p-2 rounded-lg">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-on-matte dark:text-on-matte">
                    AI-Powered Recommendations
                  </h2>
                </div>
                <p className="text-subtle dark:text-subtle-dark">
                  Personalized retention strategies and risk mitigation plans
                </p>
              </div>
              <Badge className="badge-brand border-purple-accent">
                {analysisResults.length} Departments Analyzed
              </Badge>
            </div>

            {/* Summary Card */}
            <Card className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="icon-brand p-2 rounded-lg flex-shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-matte dark:text-on-matte mb-2">
                      AI Analysis Summary
                    </h4>
                    <p className="text-subtle dark:text-subtle-dark">
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
          <Card className="card-purple border-0 shadow-xl text-center bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
            <CardContent className="p-12">
              <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 flex items-center justify-center">
                <Brain className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-on-matte dark:text-on-matte mb-3">
                Unlock AI Insights
              </h3>
              <p className="text-subtle dark:text-subtle-dark max-w-md mx-auto mb-8">
                Get personalized retention risk recommendations by running our
                AI analysis on your department data. Discover hidden risks and
                actionable strategies.
              </p>
              {hasUnanalyzedDepartments && (
                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={!dashboardData || isAnalysisLoading}
                  className="btn-purple flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium mx-auto hover:shadow-xl transition-all duration-300"
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
        <div className="flex items-center justify-between text-sm text-subtle dark:text-subtle-dark pt-4 border-t border-matte dark:border-matte">
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