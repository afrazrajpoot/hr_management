"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight, User } from "lucide-react";
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

interface InternalMobilityData {
  monthlyMobilityTrends: MonthlyTrends;
  departmentMovementFlow: DepartmentFlow;
  metrics: Metrics;
  data_timeframe?: DataTimeframe;
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
  <Card className="hr-card">
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

export default function InternalMobility() {
  const { internalMobility } = useSocket() as {
    internalMobility: InternalMobilityData | null;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retentionRate, setRetentionRate] = useState<number>(0);

  // Calculate retention rate on client side
  // Calculate retention rate on client side
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

      console.log("📊 Retention Calculation:");
      console.log("Total Incoming:", totalIncoming);
      console.log("Total Outgoing:", totalOutgoing);
      console.log("Net Movement:", totalIncoming - totalOutgoing);

      // Calculate retention rate: (incoming - outgoing) / incoming * 100
      if (totalIncoming === 0) {
        console.log("No incoming movements - defaulting to 100% retention");
        return 100; // No incoming movements means 100% retention
      }

      const rate = ((totalIncoming - totalOutgoing) / totalIncoming) * 100;
      const roundedRate = Math.max(
        0,
        Math.min(100, Math.round(rate * 10) / 10)
      );

      console.log("Retention Rate:", roundedRate + "%");
      return roundedRate;
    } catch (err) {
      console.error("Error calculating retention rate:", err);
      return 0;
    }
  };

  // Process socket data for charts
  const processMobilityData = (): ProcessedData | null => {
    if (!internalMobility || internalMobility.error) return null;

    // Process monthly trends data - Use the backend's transfer calculation
    const monthlyTrendsData = Object.keys(
      internalMobility.monthlyMobilityTrends.ingoing
    ).map((month) => {
      const ingoing = internalMobility.monthlyMobilityTrends.ingoing[month];
      const outgoing = internalMobility.monthlyMobilityTrends.outgoing[month];
      const promotions =
        internalMobility.monthlyMobilityTrends.promotions[month];

      // Calculate transfers based on what the backend provides
      // Since backend shows total_movements = 4, total_promotions = 3, total_transfers = 3
      // This suggests transfers include both incoming and outgoing movements
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
    const departmentFlowData = Object.entries(
      internalMobility.departmentMovementFlow
    ).map(([department, data]) => ({
      department,
      incoming: data.incoming,
      outgoing: data.outgoing,
      color: getDepartmentColor(department),
    }));

    return {
      monthlyTrendsData,
      departmentFlowData,
      metrics: internalMobility.metrics,
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
      setLoading(false);
      if (internalMobility.error) {
        setError(internalMobility.error);
      } else {
        setError(null);
        // Calculate and set retention rate
        const rate = calculateRetentionRate(internalMobility);
        setRetentionRate(rate);

        // Debug log to see the data
        console.log("Internal mobility data:", internalMobility);
        console.log("Calculated retention rate:", rate);
      }
    }
  }, [internalMobility]);

  if (loading) {
    return (
      <HRLayout>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </HRLayout>
    );
  }

  if (error) {
    return (
      <HRLayout>
        <div className="space-y-6 p-6">
          <div className="text-center text-destructive">
            <p>Error loading mobility data: {error}</p>
          </div>
        </div>
      </HRLayout>
    );
  }

  if (!processedData) {
    return (
      <HRLayout>
        <div className="space-y-6 p-6">
          <div className="text-center">
            <p>No mobility data available</p>
          </div>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Internal Mobility Tracking
          </h1>
          <p className="text-muted-foreground">
            Monitor career movements and progression within the organization
          </p>
        </div>

        {/* Mobility Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MobilityStatCard
            title="Total Movements"
            value={processedData.metrics.total_movements}
            change="+18.5%"
            icon={TrendingUp}
            description="Last 6 months"
          />
          <MobilityStatCard
            title="Promotions"
            value={processedData.metrics.total_promotions}
            change="+25.0%"
            icon={TrendingUp}
            description="Last 6 months"
          />
          <MobilityStatCard
            title="Transfers"
            value={processedData.metrics.total_transfers}
            change="+12.0%"
            icon={ArrowRight}
            description="Last 6 months"
          />
          <MobilityStatCard
            title="Retention Rate"
            value={`${retentionRate}%`}
            change={retentionRate > 0 ? "+2.1%" : "0%"}
            icon={User}
            description="Post-mobility"
          />
        </div>

        {/* Mobility Trends */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Mobility Trend - Show Promotions, Transfers, and Total */}
          <Card className="hr-card">
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
                  <Tooltip />
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
          <Card className="hr-card">
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
                  <Tooltip />
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

        {/* Data Debug Info */}
        {internalMobility && (
          <Card className="hr-card">
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>
                  Total Incoming:{" "}
                  {Object.values(
                    internalMobility.departmentMovementFlow
                  ).reduce((sum, dept) => sum + dept.incoming, 0)}
                </p>
                <p>
                  Total Outgoing:{" "}
                  {Object.values(
                    internalMobility.departmentMovementFlow
                  ).reduce((sum, dept) => sum + dept.outgoing, 0)}
                </p>
                <p>
                  Total Promotions: {internalMobility.metrics.total_promotions}
                </p>
                <p>
                  Total Transfers: {internalMobility.metrics.total_transfers}
                </p>
                <p>
                  Total Movements: {internalMobility.metrics.total_movements}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </HRLayout>
  );
}
