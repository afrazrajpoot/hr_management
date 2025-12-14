"use client";

import { HRLayout } from "@/components/admin/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Download,
  Plus,
  BarChart3,
  Activity,
  Target,
  MoreHorizontal,
  ChevronRight,
  TrendingDown,
  Zap,
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Mobility() {
  const { mobilityAnalysis } = useSocket();
  const [selectedHrId, setSelectedHrId] = useState<string>("all");

  // Use real data instead of static data
  const hrStats = mobilityAnalysis?.hr_stats || {};
  const overallTrends = mobilityAnalysis?.overall_monthly_trends || [];
  const analysisPeriod = mobilityAnalysis?.analysis_period;
  const totals = mobilityAnalysis?.totals || {};

  // Get all HR IDs for dropdown
  const hrIds = useMemo(() => Object.keys(hrStats), [hrStats]);

  // Create HR ID to name mapping
  const hrNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    hrIds.forEach((hrId) => {
      const hrData = hrStats[hrId];
      const fullName = hrData?.user?.fullName || `HR-${hrId.slice(0, 8)}`;
      map[hrId] = fullName;
    });
    return map;
  }, [hrIds, hrStats]);

  // Get selected HR name
  const selectedHrName = useMemo(() => {
    if (selectedHrId === "all") return "All HR Managers";
    return hrNameMap[selectedHrId] || `HR-${selectedHrId.slice(0, 8)}`;
  }, [selectedHrId, hrNameMap]);

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
  const totalIngoingArrays: any = Object.values(filteredHrStats).reduce(
    (sum: any, hr: any) => sum + (hr.ingoing_array_count || 0),
    0
  );
  const totalOutgoingArrays: any = Object.values(filteredHrStats).reduce(
    (sum: any, hr: any) => sum + (hr.outgoing_array_count || 0),
    0
  );

  // Use totals from API if available and selectedHrId is "all"
  const finalTotalIngoing =
    selectedHrId === "all"
      ? totals.total_ingoing_arrays || totalIngoingArrays
      : totalIngoingArrays;
  const finalTotalOutgoing =
    selectedHrId === "all"
      ? totals.total_outgoing_arrays || totalOutgoingArrays
      : totalOutgoingArrays;

  // Calculate percentages
  const promotionPercentage =
    totalMovements > 0
      ? Math.round((totalPromotions / totalMovements) * 100)
      : 0;
  const transferPercentage =
    totalMovements > 0
      ? Math.round((totalTransfers / totalMovements) * 100)
      : 0;
  const ingoingPercentage =
    totalMovements > 0
      ? Math.round((finalTotalIngoing / totalMovements) * 100)
      : 0;
  const outgoingPercentage =
    totalMovements > 0
      ? Math.round((finalTotalOutgoing / totalMovements) * 100)
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
          hrName: hrNameMap[hrId], // Add HR name for tooltip
        })
      )
  );

  // Prepare mobility type data for pie chart - Ingoing vs Outgoing
  const mobilityTypeData = [
    {
      name: "Ingoing",
      value: finalTotalIngoing,
      color: "#10b981", // Green
      percentage: ingoingPercentage,
    },
    {
      name: "Outgoing",
      value: finalTotalOutgoing,
      color: "#ef4444", // Red
      percentage: outgoingPercentage,
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
                  hrName: hrNameMap[hrId], // Add HR name
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
                  hrName: hrNameMap[hrId], // Add HR name
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
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "transfer":
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getMobilityBadgeVariant = (type: string) => {
    switch (type) {
      case "promotion":
        return "badge-green";
      case "transfer":
        return "badge-blue";
      default:
        return "badge-blue";
    }
  };

  return (
    <HRLayout
      title="Internal Mobility Tracking"
      subtitle="Monitor career movements and progression across all departments"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Mobility Tracking
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor career movements and progression across organizations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hover:bg-muted">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="btn-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Track Movement
            </Button>
          </div>
        </div>

        {/* Filter Card */}
        <Card className="card-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Analysis
            </CardTitle>
            <Select value={selectedHrId} onValueChange={setSelectedHrId}>
              <SelectTrigger className="w-[300px]">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select HR Manager" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All HR Managers</SelectItem>
                {hrIds.map((hrId) => (
                  <SelectItem key={hrId} value={hrId}>
                    {hrNameMap[hrId]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Movements
                </p>
                <h3 className="text-2xl font-bold mt-1">{totalMovements}</h3>
                <Badge className="badge-blue mt-2">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  Last 6 months
                </Badge>
              </div>
              <div className="icon-wrapper-blue">
                <ArrowUpDown className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ingoing Movements
                </p>
                <h3 className="text-2xl font-bold mt-1">{finalTotalIngoing}</h3>
                <div className="mt-2">
                  <Progress
                    value={ingoingPercentage}
                    className="progress-bar-primary h-2"
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {ingoingPercentage}% of total
                  </span>
                </div>
              </div>
              <div className="icon-wrapper-green">
                <ArrowDown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Outgoing Movements
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {finalTotalOutgoing}
                </h3>
                <div className="mt-2">
                  <Progress
                    value={outgoingPercentage}
                    className="progress-bar-primary h-2"
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {outgoingPercentage}% of total
                  </span>
                </div>
              </div>
              <div className="icon-wrapper-blue">
                <ArrowUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Managers
                </p>
                <h3 className="text-2xl font-bold mt-1">{hrIds.length}</h3>
                <Badge className="badge-purple mt-2">
                  <Building2 className="h-3 w-3 mr-1" />
                  Managing departments
                </Badge>
              </div>
              <div className="icon-wrapper-purple">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Mobility Trends Chart */}
          <Card className="card-primary card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="icon-wrapper-green p-2">
                  <TrendingUp className="h-4 w-4" />
                </div>
                Mobility Trends
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
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
                    stroke="#10b981" // Green
                    strokeWidth={3}
                    name="Ingoing"
                  />
                  <Line
                    type="monotone"
                    dataKey="outgoing"
                    stroke="#ef4444" // Red
                    strokeWidth={3}
                    name="Outgoing"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Movement Types Pie Chart */}
          <Card className="card-primary card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="icon-wrapper-purple p-2">
                  <BarChart3 className="h-4 w-4" />
                </div>
                Movement Flow
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
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
                    formatter={(value, name, props) => [
                      `${value} movements`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-6 flex-wrap">
                {mobilityTypeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({item.value})
                    </span>
                    <Badge
                      className={cn(
                        item.name === "Ingoing" ? "badge-green" : "badge-blue",
                        "text-xs"
                      )}
                    >
                      {item.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Mobility Chart */}
        <Card className="card-primary card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="icon-wrapper-blue p-2">
                <Building2 className="h-4 w-4" />
              </div>
              Departments Mobility
            </CardTitle>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
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
                  formatter={(value, name, props) => [
                    value,
                    `${name} (${props?.payload?.hrName || ""})`,
                  ]}
                  cursor={false}
                />
                <Bar
                  dataKey="internal"
                  fill="#3b82f6"
                  name="Internal Moves"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Movements Table */}
        <Card className="card-primary card-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="icon-wrapper-amber p-2">
                  <Activity className="h-4 w-4" />
                </div>
                Recent Activity Summary
                <Badge className="badge-amber ml-2">
                  {recentMobility.length}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="hover:bg-muted">
                <Zap className="h-4 w-4 mr-2" />
                View All
              </Button>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMobility.length > 0 ? (
                  recentMobility.map((movement) => (
                    <TableRow
                      key={movement.id}
                      className="group hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="sidebar-user-avatar h-8 w-8 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-foreground group-hover:text-primary transition-colors">
                            {movement.department}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "icon-wrapper p-2",
                              movement.type === "promotion"
                                ? "icon-wrapper-green"
                                : "icon-wrapper-blue"
                            )}
                          >
                            {getMobilityIcon(movement.type)}
                          </div>
                          <Badge
                            className={getMobilityBadgeVariant(movement.type)}
                          >
                            {movement.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-foreground">
                          {movement.count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {movement.hrName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {movement.hrId.slice(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="icon-wrapper-blue p-3">
                          <TrendingDown className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-muted-foreground">
                          No recent mobility data available
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="card-primary card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="icon-wrapper-green p-2">
                  <Target className="h-4 w-4" />
                </div>
                Promotion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {promotionPercentage}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {totalPromotions} promotions out of {totalMovements} total
                  movements
                </p>
                <Progress
                  value={promotionPercentage}
                  className="progress-bar-primary mt-4"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="icon-wrapper-blue p-2">
                  <ArrowRight className="h-4 w-4" />
                </div>
                Transfer Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {transferPercentage}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {totalTransfers} transfers across departments
                </p>
                <Progress
                  value={transferPercentage}
                  className="progress-bar-primary mt-4"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="icon-wrapper-purple p-2">
                  <Calendar className="h-4 w-4" />
                </div>
                Analysis Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  Last 6 Months
                </div>
                {analysisPeriod && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {analysisPeriod.start} to {analysisPeriod.end}
                  </p>
                )}
                <div className="mt-4">
                  <Badge className="badge-purple">
                    <Activity className="h-3 w-3 mr-1" />
                    Real-time Data
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HRLayout>
  );
}

// Add missing icon component
const Eye = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
