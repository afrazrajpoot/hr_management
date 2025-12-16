"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, ArrowRight, User, Search } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import HRLayout from "@/components/hr/HRLayout";
import { useSocket } from "@/context/SocketContext";
import EmployeeDirectory from "@/components/hr/EmployeeDirectrory";

// Type definitions
interface MonthlyTrends {
  ingoing: { [month: string]: number };
  outgoing: { [month: string]: number };
  promotions: { [month: string]: number };
}

interface DepartmentFlow {
  [department: string]: {
    incoming: number;
    outgoing: number;
    net_movement: number;
  };
}

interface Metrics {
  total_promotions: number;
  total_transfers: number;
  total_movements: number;
  retention_rate: number;
}

interface DataTimeframe {
  start_date: string;
  end_date: string;
}

interface UserData {
  id: string;
  hrId: string;
  name: string;
  email: string;
  position: string[];
  department: string[];
  salary: number;
}

interface InternalMobilityData {
  monthlyMobilityTrends: MonthlyTrends;
  departmentMovementFlow: DepartmentFlow;
  metrics: Metrics;
  data_timeframe?: DataTimeframe;
  users?: UserData[];
  error?: string;
}

interface ProcessedData {
  monthlyTrendsData: {
    month: string;
    ingoing: number;
    outgoing: number;
    promotions: number;
    transfers: number;
    total: number;
  }[];
  departmentFlowData: {
    department: string;
    incoming: number;
    outgoing: number;
    color: string;
  }[];
  metrics: Metrics;
}

interface MobilityStatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<any>;
  description: string;
}

const MobilityStatCard: React.FC<MobilityStatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  description,
}) => (
  <Card className="card-primary card-hover border-0 shadow-lg group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 ">
            <div className="icon-wrapper-blue">
              <Icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl ml-[2vw] font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {value}
            </span>
            {change && (
              <Badge className="badge-blue gap-1">
                <TrendingUp className="h-3 w-3" />
                {change}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">{description}</p>
        </div>
        {/* <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="h-7 w-7" />
        </div> */}
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-xl backdrop-blur-sm min-w-[180px]">
      {label && <div className="font-bold mb-2 text-foreground">{label}</div>}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="text-sm mb-1" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Generate default empty data
const generateDefaultMonthlyTrends = (): MonthlyTrends => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const emptyMonths: { [month: string]: number } = {};
  months.forEach((month) => {
    emptyMonths[month] = 0;
  });

  return {
    ingoing: emptyMonths,
    outgoing: emptyMonths,
    promotions: emptyMonths,
  };
};

const generateDefaultDepartmentFlow = (): DepartmentFlow => {
  const departments = ["Engineering", "Marketing", "Sales", "HR", "Operations"];
  const flow: DepartmentFlow = {};

  departments.forEach((dept) => {
    flow[dept] = {
      incoming: 0,
      outgoing: 0,
      net_movement: 0,
    };
  });

  return flow;
};

const defaultMetrics: Metrics = {
  total_promotions: 0,
  total_transfers: 0,
  total_movements: 0,
  retention_rate: 0,
};

const defaultInternalMobilityData: InternalMobilityData = {
  monthlyMobilityTrends: generateDefaultMonthlyTrends(),
  departmentMovementFlow: generateDefaultDepartmentFlow(),
  metrics: defaultMetrics,
};

export default function InternalMobility() {
  const { internalMobility } = useSocket() as {
    internalMobility: InternalMobilityData | null;
  };

  const [error, setError] = useState<string | null>(null);
  const [retentionRate, setRetentionRate] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!internalMobility?.users) return [];

    return internalMobility.users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position.some((pos) =>
          pos.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        user.department.some((dept) =>
          dept.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesSearch;
    });
  }, [internalMobility?.users, searchTerm]);

  // Calculate retention rate
  const calculateRetentionRate = (data: InternalMobilityData): number => {
    try {
      const { departmentMovementFlow } = data;

      // Calculate total incoming and outgoing across all departments
      let totalIncoming = 0;
      let totalOutgoing = 0;

      Object.values(departmentMovementFlow).forEach((dept) => {
        totalIncoming += dept.incoming;
        totalOutgoing += dept.outgoing;
      });

      // Calculate retention rate: (incoming - outgoing) / incoming * 100
      if (totalIncoming === 0) {
        return 100; // No incoming movements means 100% retention
      }

      const rate = ((totalIncoming - totalOutgoing) / totalIncoming) * 100;
      return Math.max(0, Math.min(100, Math.round(rate * 10) / 10));
    } catch (err) {
      console.error("Error calculating retention rate:", err);
      return 0;
    }
  };

  // Process socket data for charts
  const processMobilityData = (): ProcessedData => {
    const dataToProcess = internalMobility || defaultInternalMobilityData;

    if (dataToProcess.error) {
      setError(dataToProcess.error);
      return processMobilityDataFromData(defaultInternalMobilityData);
    }

    return processMobilityDataFromData(dataToProcess);
  };

  const processMobilityDataFromData = (
    data: InternalMobilityData
  ): ProcessedData => {
    // Process monthly trends data
    const monthlyTrendsData = Object.keys(
      data.monthlyMobilityTrends.ingoing
    ).map((month) => {
      const ingoing = data.monthlyMobilityTrends.ingoing[month];
      const outgoing = data.monthlyMobilityTrends.outgoing[month];
      const promotions = data.monthlyMobilityTrends.promotions[month];
      const transfers = ingoing + outgoing;

      return {
        month,
        ingoing,
        outgoing,
        promotions,
        transfers,
        total: ingoing + outgoing,
      };
    });

    // Process department flow data
    const departmentFlowData = Object.entries(data.departmentMovementFlow).map(
      ([department, flowData]) => ({
        department,
        incoming: flowData.incoming,
        outgoing: flowData.outgoing,
        color: getDepartmentColor(department),
      })
    );

    return {
      monthlyTrendsData,
      departmentFlowData,
      metrics: data.metrics,
    };
  };

  // Helper function to assign colors to departments
  const getDepartmentColor = (department: string): string => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--success))",
      "hsl(var(--warning))",
      "#8B5CF6",
      "#06B6D4",
      "#F59E0B",
      "#EC4899",
      "#10B981",
    ];

    // Simple hash function for consistent color assignment
    const hash = department
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const processedData = processMobilityData();

  useEffect(() => {
    if (internalMobility) {
      if (internalMobility.error) {
        setError(internalMobility.error);
      } else {
        setError(null);
        // Calculate and set retention rate
        const rate = calculateRetentionRate(internalMobility);
        setRetentionRate(rate);
      }
    } else {
      // Reset to default values when no data
      setRetentionRate(0);
      setError(null);
    }
  }, [internalMobility]);

  return (
    <HRLayout>
      <div className="min-h-screen gradient-bg-primary p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="decorative-gradient-blur-blue -top-20 -right-20" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-primary">
              Internal Mobility Tracking
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor career movements and progression within the organization
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-gradient-to-r from-destructive/10 to-transparent border border-destructive/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper-red">
                <TrendingUp className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Data Loading Error
                </h4>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobility Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MobilityStatCard
            title="Total Movements"
            value={processedData.metrics.total_movements}
            change="+0%"
            icon={TrendingUp}
            description="Last 6 months"
          />
          <MobilityStatCard
            title="Promotions"
            value={processedData.metrics.total_promotions}
            change="+0%"
            icon={TrendingUp}
            description="Last 6 months"
          />
          <MobilityStatCard
            title="Transfers"
            value={processedData.metrics.total_transfers}
            change="+0%"
            icon={ArrowRight}
            description="Last 6 months"
          />
          <MobilityStatCard
            title="Retention Rate"
            value={`${retentionRate}%`}
            change={retentionRate > 0 ? "+0%" : "0%"}
            icon={User}
            description="Post-mobility"
          />
        </div>

        {/* Mobility Trends */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Mobility Trend - Show Promotions, Transfers, and Total */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
              <CardTitle className="text-foreground">
                Monthly Mobility Trends
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Internal movements over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData.monthlyTrendsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Line
                    type="monotone"
                    dataKey="promotions"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    name="Promotions"
                  />
                  <Line
                    type="monotone"
                    dataKey="transfers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Transfers"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                    name="Total Movements"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Flow Chart - Only Incoming & Outgoing */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-success/5 to-transparent border-b border-border">
              <CardTitle className="text-foreground">
                Department Movement Flow
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Employee transfers between departments (incoming vs outgoing)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={processedData.departmentFlowData}
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
                    dataKey="incoming"
                    fill="hsl(var(--success))"
                    name="Incoming"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="outgoing"
                    fill="hsl(var(--primary))"
                    name="Outgoing"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Employee Directory */}
        {internalMobility?.users && internalMobility.users.length > 0 && (
          <>
            {/* Search Bar */}
            <Card className="card-primary card-hover border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="max-w-md space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-sm font-medium flex items-center gap-2 text-muted-foreground"
                  >
                    <Search className="h-4 w-4" />
                    Search Employees
                  </Label>
                  <Input
                    id="search"
                    placeholder="Search by name, email, position, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-border/50 focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>

            <EmployeeDirectory users={filteredUsers} />
          </>
        )}
      </div>
    </HRLayout>
  );
}
