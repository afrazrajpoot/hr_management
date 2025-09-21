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
}: any) => (
  <Card className="card">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold">{value}</span>
            {change && (
              <Badge
                variant={
                  trend === "up"
                    ? "destructive"
                    : trend === "down"
                    ? "default"
                    : "secondary"
                }
                className="gap-1"
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
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
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

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md card"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {recommendation.department}
            </CardTitle>
            <CardDescription className="mt-2">
              Retention Score: {recommendation.retention_score.toFixed(1)}/100
            </CardDescription>
          </div>
          <Button variant="default" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Chat with Genius Factor AI
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Mobility Opportunities</h4>
          <ul className="text-sm space-y-1">
            {recommendation.mobility_opportunities.map(
              (item: string, i: number) => (
                <li key={i} className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Recommendations</h4>
          <ul className="text-sm space-y-1">
            {recommendation.recommendations.map((item: string, i: number) => (
              <li key={i} className="flex items-start">
                <Lightbulb className="h-4 w-4 text-warning mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Action Items</h4>
          <ul className="text-sm space-y-1">
            {recommendation.action_items.map((item: string, i: number) => (
              <li key={i} className="flex items-start">
                <Target className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
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
      color: "hsl(var(--hr-chart-2))",
    },
    {
      level: "Medium Risk",
      count: 0,
      percentage: 0,
      color: "hsl(var(--hr-chart-3))",
    },
    {
      level: "High Risk",
      count: 0,
      percentage: 0,
      color: "hsl(var(--hr-chart-5))",
    },
  ],
  departmentRiskData: [
    {
      department: "No Data",
      low: 0,
      medium: 0,
      high: 0,
      total: 0,
      color: "#8884d8",
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

  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  return (
    <div
      style={{
        background: isDark ? "#1f2937" : "#fff",
        color: isDark ? "#fff" : "#000",
        border: "1px solid",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        borderRadius: 8,
        padding: "12px 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        minWidth: 180,
        zIndex: 1000,
      }}
    >
      {label && <div className="font-semibold mb-2">{label}</div>}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} style={{ color: entry.color, marginBottom: 4 }}>
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
        color: "hsl(var(--hr-chart-2))",
      },
      {
        level: "Medium Risk",
        count: mediumRisk,
        percentage:
          totalEmployees > 0
            ? Math.round((mediumRisk / totalEmployees) * 100)
            : 0,
        color: "hsl(var(--hr-chart-3))",
      },
      {
        level: "High Risk",
        count: highRisk,
        percentage:
          totalEmployees > 0
            ? Math.round((highRisk / totalEmployees) * 100)
            : 0,
        color: "hsl(var(--hr-chart-5))",
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
          color: dept.color || "#8884d8",
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
        <Loader />
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="space-y-6 p-6 ">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Retention Risk Insights
            </h1>
            <p className="text-muted-foreground">
              {riskData.departmentCount > 0 ? (
                <>
                  Analyze retention risks across {riskData.departmentCount}{" "}
                  departments and {riskData.totalEmployees} employees
                </>
              ) : (
                "No data available. Showing demo metrics."
              )}
            </p>
          </div>

          {/* Conditionally render the Analyze with AI button */}
          {hasUnanalyzedDepartments && (
            <Button
              onClick={handleAnalyzeWithAI}
              disabled={isAnalysisLoading || !dashboardData}
              className="gap-2"
            >
              {isAnalysisLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-destructive/15 border border-destructive/50 text-destructive rounded-md p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>
                Failed to generate AI analysis:{" "}
                {(error as any).data?.detail || "Unknown error"}
              </span>
            </div>
          </div>
        )}

        {/* Risk Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <RiskStatCard
            title="Total At Risk"
            value={riskData.totalAtRisk}
            change={
              riskData.totalEmployees > 0
                ? `${Math.round(
                  (riskData.totalAtRisk / riskData.totalEmployees) * 100
                )}% of workforce`
                : "0% of workforce"
            }
            icon={AlertTriangle}
            trend="neutral"
          />
          <RiskStatCard
            title="High Risk"
            value={riskData.highRisk}
            change={
              riskData.totalEmployees > 0
                ? `${Math.round(
                  (riskData.highRisk / riskData.totalEmployees) * 100
                )}% critical`
                : "0% critical"
            }
            icon={AlertTriangle}
            trend="neutral"
          />
          <RiskStatCard
            title="Retention Rate"
            value={`${riskData.retentionRate}%`}
            change={`${100 - riskData.retentionRate}% at risk`}
            icon={Users}
            trend={riskData.retentionRate > 90 ? "down" : "up"}
          />
          <RiskStatCard
            title="Avg Risk Score"
            value={riskData.avgRiskScore}
            change={`/100 scale`}
            icon={Target}
            trend={Number(riskData.avgRiskScore) < 30 ? "down" : "up"}
          />
        </div>

        {/* Risk Distribution & Department Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Risk Distribution Pie Chart */}
          <Card className="card">
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
              <CardDescription>
                Current breakdown of employee retention risk levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData.riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ percentage }) => `${percentage}%`}
                  >
                    {riskData.riskDistributionData.map(
                      (entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      )
                    )}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {riskData.riskDistributionData.map(
                  (item: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.level}</span>
                      <span className="text-sm font-medium">
                        ({item.count})
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Department Risk Breakdown */}
          <Card className="card">
            <CardHeader>
              <CardTitle>Risk by Department</CardTitle>
              <CardDescription>
                Retention risk levels across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={riskData.departmentRiskData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="department"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar
                    dataKey="low"
                    stackId="a"
                    fill="hsl(var(--hr-chart-2))"
                    name="Low Risk"
                  />
                  <Bar
                    dataKey="medium"
                    stackId="a"
                    fill="hsl(var(--hr-chart-3))"
                    name="Medium Risk"
                  />
                  <Bar
                    dataKey="high"
                    stackId="a"
                    fill="hsl(var(--hr-chart-5))"
                    name="High Risk"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Results */}
        {analysisResults.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
            </div>

            <div className="mb-6 p-4 rounded-lg card">
              <p className="text-sm text-muted-foreground">Overall Summary</p>
              <p className="font-medium">
                {analysisData?.summary ||
                  "Analysis of retention risks across departments."}
              </p>
              {/* <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  Overall Risk Score:{" "}
                  {analysisResults.length > 0
                    ? (
                        analysisResults.reduce(
                          (sum, result) => sum + (result.risk_score || 0),
                          0
                        ) / analysisResults.length
                      ).toFixed(1)
                    : "0.0"}
                  /100
                </Badge>
              </div> */}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
          <div className="text-center py-12 rounded-lg card">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Run AI Analysis</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get personalized retention risk recommendations by running our AI
              analysis on your department data.
            </p>
            {hasUnanalyzedDepartments && (
              <Button
                onClick={handleAnalyzeWithAI}
                disabled={!dashboardData || isAnalysisLoading}
              >
                {isAnalysisLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>
            )}
          </div>
        )}

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
