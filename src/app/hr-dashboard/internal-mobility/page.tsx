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
  <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
    {/* Bubble Effect */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500" />

    <CardContent className="p-6 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="icon-info group-hover:scale-110 transition-transform duration-300">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-subtle dark:text-subtle-dark">{title}</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl ml-[2vw] font-bold gradient-text-primary">
              {value}
            </span>
            {change && (
              <Badge className="badge-info gap-1">
                <TrendingUp className="h-3 w-3" />
                {change}
              </Badge>
            )}
          </div>
          <p className="text-xs text-subtle dark:text-subtle-dark mt-3">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-matte-gray-medium text-on-matte dark:text-on-matte border border-matte dark:border-matte rounded-xl p-4 shadow-xl backdrop-blur-sm min-w-[180px]">
      {label && <div className="font-bold mb-2">{label}</div>}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="text-sm mb-1 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-medium">{entry.name}:</span>
          <span className="font-bold">{entry.value}</span>
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
      "#6366F1", // Tailwind purple-500 (primary)
      "#10B981", // Tailwind green-500 (success)
      "#F59E0B", // Tailwind amber-500 (warning)
      "#8B5CF6", // Tailwind purple-600
      "#06B6D4", // Tailwind cyan-500
      "#EC4899", // Tailwind pink-500
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
      <div className="min-h-screen bg-layout-purple p-4 md:p-6 space-y-6">
        {/* Header */}
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-purple p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Internal Mobility Tracking
                </h1>
                <p className="text-purple-100 mt-2">
                  Monitor career movements and progression within the organization
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/30 dark:border-red-500/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="icon-error p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-on-matte dark:text-on-matte">
                  Data Loading Error
                </h4>
                <p className="text-sm text-subtle dark:text-subtle-dark">{error}</p>
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
          <Card className="card-purple relative overflow-hidden border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-purple-600/5 dark:from-purple-500/10 dark:to-purple-600/10 rounded-full opacity-50" />

            <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent border-b border-matte dark:border-matte">
              <CardTitle className="text-on-matte dark:text-on-matte flex items-center gap-2">
                <div className="icon-brand p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                Monthly Mobility Trends
              </CardTitle>
              <CardDescription className="text-subtle dark:text-subtle-dark">
                Internal movements over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData.monthlyTrendsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb" // Tailwind gray-200
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280" // Tailwind gray-500
                    tick={{
                      fill: "#6b7280",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{
                      fill: "#6b7280",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Line
                    type="monotone"
                    dataKey="promotions"
                    stroke="#10B981" // Tailwind green-500
                    strokeWidth={2}
                    name="Promotions"
                    dot={{ strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="transfers"
                    stroke="#6366F1" // Tailwind purple-500
                    strokeWidth={2}
                    name="Transfers"
                    dot={{ strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#F59E0B" // Tailwind amber-500
                    strokeWidth={2}
                    name="Total Movements"
                    dot={{ strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Flow Chart - Only Incoming & Outgoing */}
          <Card className="card-purple relative overflow-hidden border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-green-500/5 to-green-600/5 dark:from-green-500/10 dark:to-green-600/10 rounded-full opacity-50" />

            <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent border-b border-matte dark:border-matte">
              <CardTitle className="text-on-matte dark:text-on-matte flex items-center gap-2">
                <div className="icon-success p-2 rounded-lg">
                  <ArrowRight className="h-5 w-5" />
                </div>
                Department Movement Flow
              </CardTitle>
              <CardDescription className="text-subtle dark:text-subtle-dark">
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
                    stroke="#e5e7eb" // Tailwind gray-200
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="department"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{
                      fill: "#6b7280", // Tailwind gray-500
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
                    dataKey="incoming"
                    fill="#10B981" // Tailwind green-500
                    name="Incoming"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="outgoing"
                    fill="#6366F1" // Tailwind purple-500
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
            <Card className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
              <CardContent className="p-6">
                <div className="max-w-md space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-sm font-medium flex items-center gap-2 text-subtle dark:text-subtle-dark"
                  >
                    <Search className="h-4 w-4" />
                    Search Employees
                  </Label>
                  <Input
                    id="search"
                    placeholder="Search by name, email, position, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-purple border-matte dark:border-matte"
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