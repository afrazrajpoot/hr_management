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
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import HRLayout from "@/components/hr/HRLayout";

// Mock retention risk data
const riskDistributionData = [
  {
    level: "Low Risk",
    count: 127,
    percentage: 72,
    color: "hsl(var(--hr-chart-2))",
  },
  {
    level: "Medium Risk",
    count: 35,
    percentage: 20,
    color: "hsl(var(--hr-chart-3))",
  },
  {
    level: "High Risk",
    count: 15,
    percentage: 8,
    color: "hsl(var(--hr-chart-5))",
  },
];

const riskTrendData = [
  { month: "Jan", low: 120, medium: 45, high: 22 },
  { month: "Feb", low: 118, medium: 42, high: 18 },
  { month: "Mar", low: 125, medium: 38, high: 16 },
  { month: "Apr", low: 123, medium: 41, high: 19 },
  { month: "May", low: 129, medium: 36, high: 14 },
  { month: "Jun", low: 127, medium: 35, high: 15 },
];

const departmentRiskData = [
  { department: "Finance", low: 18, medium: 4, high: 2, total: 24 },
  { department: "Sales", low: 28, medium: 5, high: 2, total: 35 },
  { department: "Marketing", low: 12, medium: 4, high: 2, total: 18 },
  { department: "IT", low: 22, medium: 4, high: 2, total: 28 },
  { department: "HR", low: 12, medium: 2, high: 1, total: 15 },
  { department: "Support", low: 16, medium: 4, high: 2, total: 22 },
  { department: "Operations", low: 14, medium: 3, high: 2, total: 19 },
  { department: "Design", low: 10, medium: 2, high: 2, total: 14 },
];

const riskFactorsData = [
  { factor: "Low Engagement", impact: 85, frequency: 45 },
  { factor: "Skills Misalignment", impact: 78, frequency: 32 },
  { factor: "Career Stagnation", impact: 92, frequency: 28 },
  { factor: "Work-Life Balance", impact: 73, frequency: 38 },
  { factor: "Compensation Issues", impact: 88, frequency: 22 },
  { factor: "Manager Relationship", impact: 81, frequency: 35 },
];

const interventionData = [
  {
    title: "Career Development Program",
    description:
      "Personalized career path planning and skill development opportunities",
    targetRisk: "Medium to High",
    impact: "High",
    timeline: "3-6 months",
    cost: "Medium",
    successRate: 78,
  },
  {
    title: "Manager Training Initiative",
    description:
      "Enhanced leadership training focused on employee engagement and retention",
    targetRisk: "All Levels",
    impact: "Medium",
    timeline: "2-4 months",
    cost: "Low",
    successRate: 65,
  },
  {
    title: "Flexible Work Arrangements",
    description:
      "Remote work options and flexible schedules to improve work-life balance",
    targetRisk: "Medium",
    impact: "Medium",
    timeline: "1-2 months",
    cost: "Low",
    successRate: 82,
  },
  {
    title: "Compensation Review",
    description:
      "Market-rate analysis and salary adjustments for key retention risks",
    targetRisk: "High",
    impact: "High",
    timeline: "1-3 months",
    cost: "High",
    successRate: 91,
  },
];

const RiskStatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  color = "primary",
}) => (
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
        <div
          className={`h-12 w-12 rounded-lg bg-${color}/10 flex items-center justify-center`}
        >
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const InterventionCard = ({ intervention }) => {
  const getImpactColor = (impact) => {
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

  const getCostColor = (cost) => {
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
  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Retention Risk Insights
          </h1>
          <p className="text-muted-foreground">
            Analyze retention risks and implement targeted interventions
          </p>
        </div>

        {/* Risk Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <RiskStatCard
            title="Total At Risk"
            value="50"
            change="-8.2%"
            icon={AlertTriangle}
            trend="down"
            color="destructive"
          />
          <RiskStatCard
            title="High Risk"
            value="15"
            change="-3.1%"
            icon={AlertTriangle}
            trend="down"
            color="destructive"
          />
          <RiskStatCard
            title="Retention Rate"
            value="92%"
            change="+2.3%"
            icon={Users}
            trend="down"
            color="success"
          />
          <RiskStatCard
            title="Avg Risk Score"
            value="24.5"
            change="-5.7%"
            icon={Target}
            trend="down"
            color="warning"
          />
        </div>

        {/* Risk Distribution & Trend */}
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
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} employees`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {riskDistributionData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.level}</span>
                    <span className="text-sm font-medium">({item.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Trend Over Time */}
          <Card className="hr-card">
            <CardHeader>
              <CardTitle>Risk Trend Analysis</CardTitle>
              <CardDescription>
                6-month retention risk trends by level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="hsl(var(--hr-chart-2))"
                    strokeWidth={2}
                    name="Low Risk"
                  />
                  <Line
                    type="monotone"
                    dataKey="medium"
                    stroke="hsl(var(--hr-chart-3))"
                    strokeWidth={2}
                    name="Medium Risk"
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="hsl(var(--hr-chart-5))"
                    strokeWidth={2}
                    name="High Risk"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Risk Breakdown */}
        <Card className="hr-card">
          <CardHeader>
            <CardTitle>Risk Distribution by Department</CardTitle>
            <CardDescription>
              Retention risk levels across all departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={departmentRiskData}
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

        {/* Risk Factors Analysis */}
        <Card className="hr-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Key Risk Factors
            </CardTitle>
            <CardDescription>
              Impact vs frequency analysis of retention risk factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {riskFactorsData.map((factor, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">{factor.factor}</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Impact Severity</span>
                          <span className="font-medium">{factor.impact}%</span>
                        </div>
                        <Progress value={factor.impact} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Frequency</span>
                          <span className="font-medium">
                            {factor.frequency}%
                          </span>
                        </div>
                        <Progress
                          value={factor.frequency}
                          className="h-2 bg-muted"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Interventions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Suggested Interventions</h2>
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
