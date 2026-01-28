"use client";
import { useSocket } from "@/context/SocketContext";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Building2,
  ChevronRight,
  Activity,
  Target,
  BarChart3,
  Zap,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import HRLayout from "@/components/hr/HRLayout";
import { useSession } from "next-auth/react";
import DepartmentModal from "@/components/hr/DepartmentModal";

// Define TypeScript interfaces
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  salary: string;
  employeeId: string;
  department?: string;
}

interface Department {
  department: string;
  createdAt: string;
  ingoing: number;
  outgoing: number;
  employeeCount: number;
  employees: Employee[];
}

interface DepartmentCardData {
  totalDepartments: number;
  totalEmployees: number;
  totalIngoing: number;
  totalOutgoing: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> { }

// Professional color palette - Defined BEFORE any functions that use it
const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

// Define getDepartmentColor function BEFORE it's used
const getDepartmentColor = (department: string) => {
  const colors: Record<string, string> = {
    Analytics: "var(--color-chart-1)",
    Design: "var(--color-chart-2)",
    IT: "var(--color-chart-3)",
    Marketing: "var(--color-chart-4)",
    Finance: "var(--color-chart-5)",
    Operations: "var(--color-chart-1)",
    Education: "var(--color-chart-2)",
    Sustainability: "var(--color-chart-3)",
    Healthcare: "var(--color-chart-4)",
    HR: "var(--color-chart-5)",
    Engineering: "var(--color-chart-1)",
    Sales: "var(--color-chart-2)",
    Consulting: "var(--color-chart-3)",
  };
  return (
    colors[department] || COLORS[Math.floor(Math.random() * COLORS.length)]
  );
};

// Enhanced Custom Tooltip for Pie Chart
const PieChartTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-xl backdrop-blur-sm min-w-[160px]">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].payload.fill }}
          />
          <p className="font-bold text-foreground">{payload[0].name}</p>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Employees:</span>
            <span className="font-bold text-foreground">
              {payload[0].value}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Percentage:</span>
            <span className="font-bold text-primary">
              {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}
              %
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Enhanced Custom Tooltip for Bar Chart
const BarChartTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps & { label?: string }) => {
  if (active && payload && payload.length) {
    const ingoingData = payload.find((p) => p.dataKey === "ingoing");
    const outgoingData = payload.find((p) => p.dataKey === "outgoing");
    const netChange = (ingoingData?.value || 0) - (outgoingData?.value || 0);

    return (
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-xl backdrop-blur-sm min-w-[200px]">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
          <div className="h-2 w-2 rounded-full bg-chart-1" />
          <h4 className="font-bold text-foreground">{label} Department</h4>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-chart-2"></div>
              <span className="text-muted-foreground text-sm">
                Ingoing
              </span>
            </div>
            <span className="font-bold text-foreground">
              {ingoingData?.value || 0}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-chart-1"></div>
              <span className="text-muted-foreground text-sm">
                Outgoing
              </span>
            </div>
            <span className="font-bold text-foreground">
              {outgoingData?.value || 0}
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                Net Change:
              </span>
              <span
                className={`font-bold ${netChange >= 0 ? "text-chart-2" : "text-chart-1"
                  }`}
              >
                {netChange >= 0 ? "+" : ""}
                {netChange}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom XAxis tick
const CustomXAxisTick = ({ x, y, payload }: any) => {
  const departmentName = payload.value;

  const getAbbreviatedName = (name: string) => {
    if (name.length <= 10) return name;
    const words = name.split(" ");
    if (words.length > 1) {
      return words.map((word) => word.substring(0, 3)).join(" ");
    }
    return name.substring(0, 10) + "...";
  };

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        fontSize="12"
        fontWeight="500"
        transform="rotate(-45 0 0)"
      >
        {getAbbreviatedName(departmentName)}
      </text>
    </g>
  );
};

const DepartmentDashboard = () => {
  const { departmentCardData, departmentData, totalMobility } = useSocket();
  console.log(totalMobility, "department data");
  console.log(departmentData, "department data");

  const { data: session } = useSession();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<"all" | "active">("all");

  // Mock data
  const mockDepartmentCardData: DepartmentCardData = {
    totalDepartments: 5,
    totalEmployees: 9,
    totalIngoing: 5,
    totalOutgoing: 5,
  };

  const mockDepartmentData: Department[] = [
    {
      department: "Analytics",
      createdAt: "2025-09-05",
      ingoing: 4,
      outgoing: 1,
      employeeCount: 12,
      employees: [
        {
          id: "3468090d-9d5b-457a-b943-2a38be99aac2",
          firstName: "Ayesha",
          lastName: "Ali",
          email: "ayesha.ali@example.com",
          position: "MLOps Engineer",
          salary: "85000",
          employeeId: "N/A",
        },
        {
          id: "839891c2-2948-4f45-a84e-6dffee4f2427",
          firstName: "Omar",
          lastName: "Hussain",
          email: "omar.hussain@example.com",
          position: "Data Analyst",
          salary: "72000",
          employeeId: "DA001",
        },
      ],
    },
    {
      department: "Design",
      createdAt: "2025-09-05",
      ingoing: 3,
      outgoing: 0,
      employeeCount: 8,
      employees: [
        {
          id: "design-001",
          firstName: "Sarah",
          lastName: "Khan",
          email: "sarah.khan@example.com",
          position: "UI/UX Designer",
          salary: "68000",
          employeeId: "DG001",
        },
      ],
    },
    {
      department: "IT",
      createdAt: "2025-09-05",
      ingoing: 0,
      outgoing: 3,
      employeeCount: 15,
      employees: [
        {
          id: "it-001",
          firstName: "Ahmed",
          lastName: "Hassan",
          email: "ahmed.hassan@example.com",
          position: "Software Engineer",
          salary: "95000",
          employeeId: "IT001",
        },
        {
          id: "it-002",
          firstName: "Fatima",
          lastName: "Sheikh",
          email: "fatima.sheikh@example.com",
          position: "DevOps Engineer",
          salary: "105000",
          employeeId: "IT002",
        },
      ],
    },
    {
      department: "Marketing",
      createdAt: "2025-09-05",
      ingoing: 5,
      outgoing: 2,
      employeeCount: 9,
      employees: [
        {
          id: "marketing-001",
          firstName: "Ali",
          lastName: "Raza",
          email: "ali.raza@example.com",
          position: "Marketing Lead",
          salary: "78000",
          employeeId: "MK001",
        },
      ],
    },
    {
      department: "Finance",
      createdAt: "2025-09-05",
      ingoing: 2,
      outgoing: 1,
      employeeCount: 7,
      employees: [
        {
          id: "finance-001",
          firstName: "Zainab",
          lastName: "Khan",
          email: "zainab.khan@example.com",
          position: "Financial Analyst",
          salary: "82000",
          employeeId: "FN001",
        },
      ],
    },
  ];

  const cardData: DepartmentCardData =
    departmentCardData || mockDepartmentCardData;
  const deptData: Department[] = departmentData || mockDepartmentData;

  // Filter departments based on active view
  const filteredDepartments =
    activeView === "active"
      ? deptData.filter((dept) => dept.ingoing > 0 || dept.outgoing > 0)
      : deptData;

  // Prepare chart data - using the getDepartmentColor function defined above
  const departmentDistributionData = deptData.map((dept) => ({
    name: dept.department,
    value: dept.employeeCount,
    total: deptData.reduce((sum, d) => sum + d.employeeCount, 0),
    fill: getDepartmentColor(dept.department), // Use fill instead of color for consistency
  }));

  const movementData = filteredDepartments.map((dept) => ({
    name: dept.department,
    ingoing: dept.ingoing,
    outgoing: dept.outgoing,
  }));

  // Calculate totals
  const totalIngoing = totalMobility?.totalIngoing || 0;
  const totalOutgoing = totalMobility?.totalOutgoing || 0;
  const totalEmployees = deptData.reduce(
    (sum, dept) => sum + dept.employeeCount,
    0
  );
  const netMovement = totalIngoing - totalOutgoing;

  // Define getInitials function
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""
      }`.toUpperCase();
  };

  const handleCardClick = (employee: Employee, department: string) => {
    setSelectedEmployee({ ...employee, department });
    setIsModalOpen(true);
  };

  // Quick actions for sidebar
  const quickActions = [
    {
      icon: Plus,
      label: "Add Department",
      color: "from-primary to-purple-600",
    },
    {
      icon: Users,
      label: "Assign Employees",
      color: "from-success to-green-500",
    },
    { icon: Target, label: "Set Targets", color: "from-warning to-amber-500" },
    {
      icon: BarChart3,
      label: "Export Report",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <HRLayout>
      <div className="min-h-screen gradient-bg-primary p-4 md:p-6 space-y-6">
        {/* Header with decorative elements */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="decorative-gradient-blur-blue -top-20 -right-20" />
          <div className="decorative-gradient-blur-purple -bottom-20 -left-20" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="sidebar-logo-wrapper">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-primary">
                    Department Analytics
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Workforce distribution and mobility insights
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-card rounded-lg p-1 border border-border">
                <button
                  onClick={() => setActiveView("all")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  All Departments
                </button>
                <button
                  onClick={() => setActiveView("active")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === "active"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Active Only
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Fixed Icon Positioning */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Departments */}
          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Departments
                      </p>
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {deptData.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Employees */}
          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Employees
                      </p>
                      <div className="text-3xl font-bold bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">
                        {totalEmployees}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Net Movement */}
          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-600/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Net Movement
                      </p>
                      <div className="flex items-end gap-2">
                        <span
                          className={`text-3xl font-bold ${netMovement >= 0 ? "text-success" : "text-destructive"
                            }`}
                        >
                          {netMovement >= 0 ? "+" : ""}
                          {netMovement}
                        </span>
                        <Badge
                          className={`${netMovement >= 0 ? "badge-green" : "badge-amber"
                            }`}
                        >
                          {netMovement >= 0 ? "Growth" : "Decline"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Active Departments */}
          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-warning/20 to-amber-600/10 flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Active Departments
                      </p>
                      <div className="text-3xl font-bold bg-gradient-to-r from-warning to-amber-600 bg-clip-text text-transparent">
                        {filteredDepartments.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Department Distribution Pie Chart */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Department Distribution
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Employee allocation across departments
                  </CardDescription>
                </div>
                <Badge className="badge-blue">
                  <Users className="h-3 w-3 mr-1" />
                  {totalEmployees} Employees
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      label={false}
                    >
                      {departmentDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip />} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{
                        paddingLeft: "40px",
                        fontSize: "12px",
                        maxWidth: "50%",
                      }}
                      formatter={(value, entry) => {
                        const item = departmentDistributionData.find((d) => d.name === value);
                        const percent = item ? ((item.value / item.total) * 100).toFixed(0) : 0;
                        return (
                          <span className="text-foreground">
                            {value}: {percent}%
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {departmentDistributionData.length} departments
                </div>
                <button className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  View Breakdown <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Employee Movement Bar Chart */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-success/5 to-transparent border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="h-5 w-5 text-success" />
                    Employee Movement Analytics
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Incoming vs outgoing workforce flow
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-chart-2"></div>
                    <span className="text-xs">Ingoing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-chart-1"></div>
                    <span className="text-xs">Outgoing</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={movementData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      tick={<CustomXAxisTick />}
                      interval={0}
                      height={80}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      content={<BarChartTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="ingoing"
                      fill="var(--color-chart-2)"
                      name="Ingoing Employees"
                      radius={[6, 6, 0, 0]}
                      barSize={30}
                    />
                    <Bar
                      dataKey="outgoing"
                      fill="var(--color-chart-1)"
                      name="Outgoing Employees"
                      radius={[6, 6, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gradient-to-r from-success/5 to-transparent rounded-xl p-4">
                  <div className="text-2xl font-bold text-success">
                    {totalIngoing}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Incoming
                  </div>
                </div>
                <div className="bg-gradient-to-r from-destructive/5 to-transparent rounded-xl p-4">
                  <div className="text-2xl font-bold text-destructive">
                    {totalOutgoing}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Outgoing
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Department Cards - Main Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">
                Department Overview
              </h2>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {activeView === "all"
                  ? "All Departments"
                  : "Active Departments Only"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDepartments.map((department, index) => (
                <Card
                  key={index}
                  className="card-primary card-hover group border-0 shadow-lg overflow-hidden"
                  onClick={() =>
                    department.employees.length > 0 &&
                    handleCardClick(
                      department.employees[0],
                      department.department
                    )
                  }
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{
                      background:
                        department.ingoing > department.outgoing
                          ? "linear-gradient(to right, hsl(var(--success)), hsl(var(--success))/0.5)"
                          : department.outgoing > department.ingoing
                            ? "linear-gradient(to right, hsl(var(--destructive)), hsl(var(--destructive))/0.5)"
                            : "linear-gradient(to right, hsl(var(--muted-foreground)), hsl(var(--muted-foreground))/0.5)",
                    }}
                  />

                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            background: getDepartmentColor(
                              department.department
                            ),
                          }}
                        >
                          {department.department.substring(0, 2)}
                        </div>
                        <div>
                          <CardTitle className="text-foreground">
                            {department.department}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Created:{" "}
                            {new Date(
                              department.createdAt
                            ).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-muted text-muted-foreground border-0"
                      >
                        {department.employeeCount} employees
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-success/5 to-transparent rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Ingoing
                            </div>
                            <div className="text-xl font-bold text-success">
                              {department.ingoing}
                            </div>
                          </div>
                          <TrendingUp className="h-4 w-4 text-success" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-destructive/5 to-transparent rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Outgoing
                            </div>
                            <div className="text-xl font-bold text-destructive">
                              {department.outgoing}
                            </div>
                          </div>
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        </div>
                      </div>
                    </div>

                    {department.employees.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-foreground">
                            Top Employees:
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            Click to view details →
                          </span>
                        </div>
                        <div className="space-y-2">
                          {department.employees
                            .slice(0, 2)
                            .map((employee, empIndex) => (
                              <div
                                key={empIndex}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                      {getInitials(
                                        employee.firstName,
                                        employee.lastName
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {employee.firstName} {employee.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {employee.position}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ))}
                          {department.employees.length > 2 && (
                            <div className="text-center">
                              <Badge variant="outline" className="text-xs">
                                +{department.employees.length - 2} more
                                employees
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Real-time data</span>
            </div>
            <span>•</span>
            <span>{deptData.length} departments monitored</span>
            <span>•</span>
            <span>{totalEmployees} total employees</span>
          </div>
          {/* <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            Generate Report <ArrowRight className="h-3 w-3" />
          </button> */}
        </div>

        {/* Employee Detail Modal */}
        <DepartmentModal
          employee={selectedEmployee}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          hrId={session?.user?.id as string}
        />
      </div>
    </HRLayout>
  );
};

export default DepartmentDashboard;