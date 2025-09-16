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
// import EmployeeDirectory from "@/components/hr/EmployeeDirectory";

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
  <Card className="card">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <Badge variant="secondary" className="text-xs">
          {change}
        </Badge>
      </div>
      <div>
        <p className="text-2xl font-bold mb-1">{value}</p>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  // Detect dark mode using a CSS class on <body> or <html>
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  return (
    <div
      style={{
        background: isDark ? "#1f2937" : "#fff", // gray-800 for dark, white for light
        color: isDark ? "#fff" : "#000",
        border: "1px solid",
        borderColor: isDark ? "#374151" : "#e5e7eb", // gray-700 or gray-200
        borderRadius: 8,
        padding: "12px 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        minWidth: 180,
        zIndex: 1000,
      }}
    >
      <div className="font-semibold mb-2">{label}</div>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} style={{ color: entry.color, marginBottom: 4 }}>
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
      "hsl(var(--hr-chart-1))",
      "hsl(var(--hr-chart-2))",
      "hsl(var(--hr-chart-3))",
      "hsl(var(--hr-chart-4))",
      "hsl(var(--hr-chart-5))",
      "#8B5CF6",
      "#06B6D4",
      "#F59E0B",
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
      <div className="space-y-6 p-6 ">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Internal Mobility Tracking
          </h1>
          <p className="text-muted-foreground">
            Monitor career movements and progression within the organization
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md">
            Error loading mobility data: {error}
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
          <Card className="card">
            <CardHeader>
              <CardTitle>Monthly Mobility Trends</CardTitle>
              <CardDescription>
                Internal movements over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData.monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="promotions"
                    stroke="hsl(var(--hr-chart-2))"
                    strokeWidth={2}
                    name="Promotions"
                  />
                  <Line
                    type="monotone"
                    dataKey="transfers"
                    stroke="hsl(var(--hr-chart-1))"
                    strokeWidth={2}
                    name="Transfers"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--hr-chart-4))"
                    strokeWidth={2}
                    name="Total Movements"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Flow Chart - Only Incoming & Outgoing */}
          <Card className="card">
            <CardHeader>
              <CardTitle>Department Movement Flow</CardTitle>
              <CardDescription>
                Employee transfers between departments (incoming vs outgoing)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={processedData.departmentFlowData}
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
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="incoming"
                    fill="hsl(var(--hr-chart-2))"
                    name="Incoming"
                  />
                  <Bar
                    dataKey="outgoing"
                    fill="hsl(var(--hr-chart-1))"
                    name="Outgoing"
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
            <Card className="card">
              <CardContent className="p-6">
                <div className="max-w-md space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Search Employees
                  </Label>
                  <Input
                    id="search"
                    placeholder="Search by name, email, position, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
