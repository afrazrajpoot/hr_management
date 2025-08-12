"use client";

import { HRLayout } from "@/components/admin/layout/admin-layout";
import { StatCard } from "@/components/admin/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  TrendingUp,
  Users,
  Building2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Calendar,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Mobility() {
  const mobilityTrendData = [
    { month: "Jan", promotions: 12, transfers: 5, exits: 8 },
    { month: "Feb", promotions: 15, transfers: 7, exits: 6 },
    { month: "Mar", promotions: 18, transfers: 9, exits: 12 },
    { month: "Apr", promotions: 14, transfers: 6, exits: 9 },
    { month: "May", promotions: 20, transfers: 11, exits: 7 },
  ];

  const departmentMobilityData = [
    { department: "Engineering", internal: 15, external: 3, retention: 92 },
    { department: "Product", internal: 8, external: 2, retention: 89 },
    { department: "Finance", internal: 5, external: 4, retention: 85 },
    { department: "Medical", internal: 12, external: 1, retention: 95 },
    { department: "Education", internal: 7, external: 2, retention: 88 },
  ];

  const mobilityTypeData = [
    { name: "Promotions", value: 45, color: "#10b981" },
    { name: "Lateral Transfers", value: 25, color: "#3b82f6" },
    { name: "Department Changes", value: 20, color: "#f59e0b" },
    { name: "Role Changes", value: 10, color: "#8b5cf6" },
  ];

  const recentMobility = [
    {
      id: "1",
      employeeName: "Sarah Johnson",
      fromPosition: "Software Engineer",
      toPosition: "Senior Software Engineer",
      fromDepartment: "Engineering",
      toDepartment: "Engineering",
      type: "promotion",
      date: "2024-01-15",
      company: "TechCorp Solutions",
    },
    {
      id: "2",
      employeeName: "Michael Chen",
      fromPosition: "Product Manager",
      toPosition: "Senior Product Manager",
      fromDepartment: "Product",
      toDepartment: "Product",
      type: "promotion",
      date: "2024-01-18",
      company: "TechCorp Solutions",
    },
    {
      id: "3",
      employeeName: "Emily Rodriguez",
      fromPosition: "Financial Analyst",
      toPosition: "Financial Analyst",
      fromDepartment: "Finance",
      toDepartment: "Operations",
      type: "transfer",
      date: "2024-01-20",
      company: "FinanceFirst Ltd",
    },
    {
      id: "4",
      employeeName: "David Kim",
      fromPosition: "Nurse Practitioner",
      toPosition: "Nursing Supervisor",
      fromDepartment: "Medical",
      toDepartment: "Medical",
      type: "promotion",
      date: "2024-01-22",
      company: "HealthPlus Medical",
    },
  ];

  const getMobilityIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return <ArrowUp className="h-4 w-4 text-success" />;
      case "transfer":
        return <ArrowRight className="h-4 w-4 text-hr-secondary" />;
      case "exit":
        return <ArrowDown className="h-4 w-4 text-destructive" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getMobilityBadgeVariant = (type: string) => {
    switch (type) {
      case "promotion":
        return "default" as const;
      case "transfer":
        return "secondary" as const;
      case "exit":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <HRLayout
      title="Internal Mobility Tracking"
      subtitle="Monitor career movements and progression across all companies"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Movements"
            value="147"
            description="This year"
            icon={<ArrowUpDown className="h-4 w-4" />}
            trend={{ value: 23, label: "vs last year", isPositive: true }}
          />
          <StatCard
            title="Promotions"
            value="79"
            description="54% of movements"
            icon={<ArrowUp className="h-4 w-4" />}
            trend={{ value: 18, label: "vs last year", isPositive: true }}
          />
          <StatCard
            title="Internal Transfers"
            value="38"
            description="26% of movements"
            icon={<ArrowRight className="h-4 w-4" />}
            trend={{ value: 12, label: "vs last year", isPositive: true }}
          />
          <StatCard
            title="Average Time to Promotion"
            value="2.3 years"
            description="Down from 2.8 years"
            icon={<Calendar className="h-4 w-4" />}
            trend={{ value: 18, label: "improvement", isPositive: true }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-hr-primary" />
                Mobility Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mobilityTrendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="promotions"
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    name="Promotions"
                  />
                  <Line
                    type="monotone"
                    dataKey="transfers"
                    stroke="hsl(var(--hr-secondary))"
                    strokeWidth={3}
                    name="Transfers"
                  />
                  <Line
                    type="monotone"
                    dataKey="exits"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={3}
                    name="Exits"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-hr-accent" />
                Movement Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mobilityTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mobilityTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => ["" + value + "%", "of Movements"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {mobilityTypeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-hr-secondary" />
              Mobility by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentMobilityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="department"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="internal"
                  fill="hsl(var(--success))"
                  name="Internal Moves"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="external"
                  fill="hsl(var(--destructive))"
                  name="External Exits"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-hr-primary" />
              Recent Movements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMobility.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">
                      {movement.employeeName}
                    </TableCell>
                    <TableCell>{movement.company}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {movement.fromPosition}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {movement.fromDepartment}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{movement.toPosition}</div>
                        <div className="text-sm text-muted-foreground">
                          {movement.toDepartment}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMobilityIcon(movement.type)}
                        <Badge variant={getMobilityBadgeVariant(movement.type)}>
                          {movement.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{movement.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-hr-accent" />
              Popular Career Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Engineering Track</h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-muted rounded">
                    Junior Engineer
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded">
                    Software Engineer
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded">
                    Senior Engineer
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded">Tech Lead</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average progression time: 4-6 years
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Management Track</h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-muted rounded">
                    Team Member
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded">
                    Senior Member
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded">Team Lead</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded">Manager</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average progression time: 5-7 years
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Specialist Track</h4>
                <div className="flex items_center gap-2 text-sm">
                  <span className="px-2 py-1 bg-muted rounded">Analyst</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded">
                    Senior Analyst
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded">
                    Principal Analyst
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-muted rounded">
                    Subject Expert
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average progression time: 3-5 years
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-hr-primary" />
              Key Mobility Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <h4 className="font-medium text-success mb-2">
                  High Mobility Departments
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Engineering: 18 internal moves</li>
                  <li>• Product: 12 internal moves</li>
                  <li>• Medical: 15 internal moves</li>
                </ul>
              </div>
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <h4 className="font-medium text-warning mb-2">
                  Promotion Bottlenecks
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Senior→Principal roles (6+ months)</li>
                  <li>• Individual→Management (8+ months)</li>
                  <li>• Cross-department moves (4+ months)</li>
                </ul>
              </div>
              <div className="p-4 bg-hr-primary/10 border border-hr-primary/20 rounded-lg">
                <h4 className="font-medium text-hr-primary mb-2">
                  Retention Impact
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• 95% of promoted employees stay 2+ years</li>
                  <li>• Internal moves reduce exit risk by 60%</li>
                  <li>• Clear progression paths improve satisfaction</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
