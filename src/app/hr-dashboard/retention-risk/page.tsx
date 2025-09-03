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
import { useEffect, useState } from "react";

const RiskStatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  color = "primary",
}: any) => (
  <Card className="hr-card">
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

const InterventionCard = ({ intervention }: any) => {
  const getImpactColor = (impact: any) => {
    switch (impact) {
      case "High":
        return "bg-success text-success-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "Low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCostColor = (cost: any) => {
    switch (cost) {
      case "High":
        return "bg-destructive text-destructive-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "Low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="hr-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{intervention.title}</CardTitle>
            <CardDescription className="mt-2">
              {intervention.description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getImpactColor(intervention.impact)}>
              {intervention.impact} Impact
            </Badge>
            <Badge className={getCostColor(intervention.cost)}>
              {intervention.cost} Cost
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Target Risk</span>
            <p className="font-medium">{intervention.targetRisk}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Timeline</span>
            <p className="font-medium">{intervention.timeline}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Success Rate</span>
            <span className="font-medium">{intervention.successRate}%</span>
          </div>
          <Progress value={intervention.successRate} className="h-2" />
        </div>

        <Button className="w-full mt-4">Implement Intervention</Button>
      </CardContent>
    </Card>
  );
};

export default function RetentionRisk() {
  const { dashboardData } = useSocket();
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    if (dashboardData) {
      processRiskData();
    }
  }, [dashboardData]);

  const processRiskData = () => {
    const departmentData = dashboardData || [];

    // Calculate risk distribution
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
    const avgRiskScore = totalRiskScore / (departmentData.length || 1);
    const retentionRate = Math.round(
      ((totalEmployees - totalAtRisk) / totalEmployees) * 100
    );

    const riskDistributionData = [
      {
        level: "Low Risk",
        count: lowRisk,
        percentage: Math.round((lowRisk / totalEmployees) * 100),
        color: "hsl(var(--hr-chart-2))",
      },
      {
        level: "Medium Risk",
        count: mediumRisk,
        percentage: Math.round((mediumRisk / totalEmployees) * 100),
        color: "hsl(var(--hr-chart-3))",
      },
      {
        level: "High Risk",
        count: highRisk,
        percentage: Math.round((highRisk / totalEmployees) * 100),
        color: "hsl(var(--hr-chart-5))",
      },
    ];

    // Prepare department risk data
    const departmentRiskData = departmentData.map((dept: any) => {
      const riskDist = dept.metrics?.retention_risk_distribution || {};
      return {
        department: dept.name,
        low: riskDist["Low (0-30)"] || 0,
        medium: riskDist["Medium (31-60)"] || 0,
        high: riskDist["High (61-100)"] || 0,
        total: dept.employee_count || 0,
        color: dept.color,
      };
    });

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

  if (!dashboardData || !riskData) {
    return (
      <HRLayout>
        <div className="space-y-6 p-6">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium">Loading retention data...</h3>
              <p className="text-muted-foreground">
                Analyzing retention risk metrics from your dashboard
              </p>
            </div>
          </div>
        </div>
      </HRLayout>
    );
  }

  const interventionData = [
    {
      title: "Career Development Program",
      description: "Personalized career path planning for high-risk employees",
      targetRisk: "Medium to High",
      impact: riskData.highRisk > 5 ? "High" : "Medium",
      timeline: "3-6 months",
      cost: "Medium",
      successRate: Math.min(85, 100 - riskData.avgRiskScore),
    },
    {
      title: "Manager Training Initiative",
      description:
        "Enhanced leadership training focused on retention strategies",
      targetRisk: "All Levels",
      impact: "Medium",
      timeline: "2-4 months",
      cost: "Low",
      successRate: 65,
    },
    {
      title: "Flexible Work Arrangements",
      description:
        "Remote options and flexible schedules for better work-life balance",
      targetRisk: riskData.avgRiskScore > 40 ? "High" : "Medium",
      impact: "High",
      timeline: "1-2 months",
      cost: "Low",
      successRate: 82,
    },
    {
      title: "Targeted Retention Strategy",
      description: "Customized retention plans for critical at-risk roles",
      targetRisk: "High",
      impact: "High",
      timeline: "1-3 months",
      cost: "High",
      successRate: Math.min(95, 100 - riskData.avgRiskScore + 10),
    },
  ];

  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Retention Risk Insights
          </h1>
          <p className="text-muted-foreground">
            Analyze retention risks across {riskData.departmentCount}{" "}
            departments and {riskData.totalEmployees} employees
          </p>
        </div>

        {/* Risk Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <RiskStatCard
            title="Total At Risk"
            value={riskData.totalAtRisk}
            change={`${Math.round(
              (riskData.totalAtRisk / riskData.totalEmployees) * 100
            )}% of workforce`}
            icon={AlertTriangle}
            trend="neutral"
          />
          <RiskStatCard
            title="High Risk"
            value={riskData.highRisk}
            change={`${Math.round(
              (riskData.highRisk / riskData.totalEmployees) * 100
            )}% critical`}
            icon={AlertTriangle}
            trend="neutral"
          />
          <RiskStatCard
            title="Retention Rate"
            value={`${riskData.retentionRate}%`}
            change={`${100 - riskData.retentionRate}% at risk`}
            icon={Users}
            trend={riskData.retentionRate > 90 ? "up" : "down"}
          />
          <RiskStatCard
            title="Avg Risk Score"
            value={riskData.avgRiskScore}
            change={`/100 scale`}
            icon={Target}
            trend={riskData.avgRiskScore < 30 ? "down" : "up"}
          />
        </div>

        {/* Risk Distribution & Department Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Risk Distribution Pie Chart */}
          <Card className="hr-card">
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
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value} employees (${props.payload.percentage}%)`,
                      name,
                    ]}
                  />
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
          <Card className="hr-card">
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
                  <Tooltip />
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

        {/* Suggested Interventions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Suggested Interventions</h2>
          <p className="text-muted-foreground mb-6">
            Based on your current retention risk profile
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {interventionData.map((intervention, index) => (
              <InterventionCard key={index} intervention={intervention} />
            ))}
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
