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
import { useSocket } from "@/context/SocketContext";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Mobility() {
  const { mobilityAnalysis } = useSocket();
  const [selectedHrId, setSelectedHrId] = useState<string>("all");

  // Use real data instead of static data
  const hrStats = mobilityAnalysis?.hr_stats || {};
  const overallTrends = mobilityAnalysis?.overall_monthly_trends || [];
  const analysisPeriod = mobilityAnalysis?.analysis_period;

  // Get all HR IDs for dropdown
  const hrIds = useMemo(() => Object.keys(hrStats), [hrStats]);

  // Filter data based on selected HR ID
  const filteredHrStats = useMemo(() => {
    if (selectedHrId === "all") {
      return hrStats;
    }
    return { [selectedHrId]: hrStats[selectedHrId] };
  }, [hrStats, selectedHrId]);

  const filteredOverallTrends = useMemo(() => {
    if (selectedHrId === "all") {
      return overallTrends;
    }
    const hrData = hrStats[selectedHrId];
    return hrData?.monthly_trends || [];
  }, [overallTrends, hrStats, selectedHrId]);

  // Calculate totals from filtered HR stats
  const totalMovements: any = Object.values(filteredHrStats).reduce(
    (sum: any, hr: any) => sum + (hr.total_movements || 0),
    0
  );
  const totalPromotions: any = Object.values(filteredHrStats).reduce(
    (sum: any, hr: any) => sum + (hr.promotions || 0),
    0
  );
  const totalTransfers: any = Object.values(filteredHrStats).reduce(
    (sum: any, hr: any) => sum + (hr.transfers || 0),
    0
  );

  // Calculate percentages
  const promotionPercentage =
    totalMovements > 0
      ? Math.round((totalPromotions / totalMovements) * 100)
      : 0;
  const transferPercentage =
    totalMovements > 0
      ? Math.round((totalTransfers / totalMovements) * 100)
      : 0;

  // Prepare department data for chart
  const departmentMobilityData = Object.entries(filteredHrStats).flatMap(
    ([hrId, hrData]: any) =>
      Object.entries(hrData.departments || {}).map(
        ([deptName, deptData]: any) => ({
          department: deptName,
          internal: (deptData.incoming || 0) + (deptData.outgoing || 0),
          external: 0,
          retention: 85,
          hrId,
        })
      )
  );

  // Prepare mobility type data for pie chart
  const mobilityTypeData = [
    { name: "Promotions", value: totalPromotions, color: "#10b981" },
    { name: "Transfers", value: totalTransfers, color: "#3b82f6" },
    {
      name: "Other Movements",
      value: Math.max(0, totalMovements - totalPromotions - totalTransfers),
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);

  // Prepare recent movements from the data
  const recentMobility = Object.entries(filteredHrStats)
    .flatMap(([hrId, hrData]: any) =>
      Object.entries(hrData.departments || {}).flatMap(
        ([deptName, deptData]: any) => [
          ...(deptData.promotions > 0
            ? [
                {
                  id: `${hrId}-${deptName}-promotion`,
                  department: deptName,
                  type: "promotion",
                  count: deptData.promotions,
                  hrId,
                },
              ]
            : []),
          ...(deptData.transfers > 0
            ? [
                {
                  id: `${hrId}-${deptName}-transfer`,
                  department: deptName,
                  type: "transfer",
                  count: deptData.transfers,
                  hrId,
                },
              ]
            : []),
        ]
      )
    )
    .slice(0, 4);

  const getMobilityIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return <ArrowUp className="h-4 w-4 text-success" />;
      case "transfer":
        return <ArrowRight className="h-4 w-4 text-hr-secondary" />;
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
      default:
        return "outline" as const;
    }
  };

  return (
    <HRLayout
      title="Internal Mobility Tracking"
      subtitle="Monitor career movements and progression across all departments"
    >
      <div className="space-y-6">
        {/* HR Filter Dropdown */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-hr-primary" />
                Filter by HR Manager
              </div>
              <Select value={selectedHrId} onValueChange={setSelectedHrId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select HR Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All HR Managers</SelectItem>
                  {hrIds.map((hrId) => (
                    <SelectItem key={hrId} value={hrId}>
                      HR Manager: {hrId.slice(0, 8)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Movements"
            value={totalMovements.toString()}
            description={`Last 6 months`}
            icon={<ArrowUpDown className="h-4 w-4" />}
            trend={{
              value: 0,
              label: selectedHrId === "all" ? "All HR Managers" : "Selected HR",
              isPositive: true,
            }}
          />
          <StatCard
            title="Promotions"
            value={totalPromotions.toString()}
            description={`${promotionPercentage}% of movements`}
            icon={<ArrowUp className="h-4 w-4" />}
            trend={{
              value: 0,
              label: selectedHrId === "all" ? "All HR Managers" : "Selected HR",
              isPositive: true,
            }}
          />
          <StatCard
            title="Transfers"
            value={totalTransfers.toString()}
            description={`${transferPercentage}% of movements`}
            icon={<ArrowRight className="h-4 w-4" />}
            trend={{
              value: 0,
              label: selectedHrId === "all" ? "All HR Managers" : "Selected HR",
              isPositive: true,
            }}
          />
          <StatCard
            title={selectedHrId === "all" ? "HR Managers" : "Departments"}
            value={
              selectedHrId === "all"
                ? hrIds.length.toString()
                : Object.keys(
                    filteredHrStats[selectedHrId]?.departments || {}
                  ).length.toString()
            }
            description={
              selectedHrId === "all" ? "Active managers" : "Managed departments"
            }
            icon={<Building2 className="h-4 w-4" />}
            trend={{ value: 0, label: "Active", isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Mobility Trends Chart */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-hr-primary" />
                {selectedHrId === "all" ? "Overall" : "HR Manager"} Mobility
                Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredOverallTrends}>
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
                    dataKey="incoming"
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    name="Incoming"
                  />
                  <Line
                    type="monotone"
                    dataKey="outgoing"
                    stroke="hsl(var(--hr-secondary))"
                    strokeWidth={3}
                    name="Outgoing"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--hr-primary))"
                    strokeWidth={3}
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Movement Types Pie Chart */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-hr-accent" />
                Movement Types Distribution
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
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Mobility Chart */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-hr-secondary" />
              {selectedHrId === "all"
                ? "All Departments"
                : "Managed Departments"}{" "}
              Mobility
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
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Movements Table */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-hr-primary" />
              Recent Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Movement Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>HR Manager</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMobility.length > 0 ? (
                  recentMobility.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">
                        {movement.department}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMobilityIcon(movement.type)}
                          <Badge
                            variant={getMobilityBadgeVariant(movement.type)}
                          >
                            {movement.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{movement.count}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {movement.hrId.slice(0, 8)}...
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No recent mobility data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Analysis Period Info */}
        {analysisPeriod && (
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-hr-primary" />
                Analysis Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Time Range</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysisPeriod.start} to {analysisPeriod.end}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Coverage</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedHrId === "all" ? hrIds.length : 1} HR manager(s),{" "}
                    {departmentMobilityData.length} department(s)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </HRLayout>
  );
}
