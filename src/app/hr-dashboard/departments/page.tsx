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
import { Users, TrendingUp, TrendingDown, Building2 } from "lucide-react";
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
import EmployeeDetailModal from "@/components/hr/EmployeeDetailModal";
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

interface CustomTooltipProps extends TooltipProps<number, string> {}

// Custom Tooltip for Pie Chart (Department Distribution)
const PieChartTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-lg border bg-white/10 backdrop-blur-sm border-white/20">
        <p className="text-white text-sm">
          {`${payload[0].name}: ${payload[0].value} employees`}
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Bar Chart (Ingoing vs Outgoing)
const BarChartTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps & { label?: string }) => {
  if (active && payload && payload.length) {
    const ingoingData = payload.find((p) => p.dataKey === "ingoing");
    const outgoingData = payload.find((p) => p.dataKey === "outgoing");

    return (
      <div className="p-4 rounded-lg border bg-white/10 backdrop-blur-sm border-white/20 min-w-[180px]">
        <div className="text-white text-sm font-medium mb-3 border-b border-white/20 pb-2">
          {label} Department
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-green-400">Ingoing</span>
            </div>
            <span className="text-white font-medium">
              {ingoingData?.value || 0}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-red-400">Outgoing</span>
            </div>
            <span className="text-white font-medium">
              {outgoingData?.value || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium pt-2 border-t border-white/20">
            <span className="text-gray-300">Net Change:</span>
            <span
              className={`${
                (ingoingData?.value || 0) - (outgoingData?.value || 0) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {(ingoingData?.value || 0) - (outgoingData?.value || 0) >= 0
                ? "+"
                : ""}
              {(ingoingData?.value || 0) - (outgoingData?.value || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom XAxis tick for better department label display
const CustomXAxisTick = ({ x, y, payload }: any) => {
  const departmentName = payload.value;

  // Abbreviate long department names for better display
  const getAbbreviatedName = (name: string) => {
    if (name.length <= 8) return name;
    const words = name.split(" ");
    if (words.length > 1) {
      return words.map((word) => word.substring(0, 3)).join(" ");
    }
    return name.substring(0, 8) + "...";
  };

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize="11"
        fontWeight="500"
        transform="rotate(-45 0 0)"
        style={{ transformOrigin: "center" }}
      >
        {getAbbreviatedName(departmentName)}
      </text>
    </g>
  );
};

const DepartmentDashboard = () => {
  const { departmentCardData, departmentData, totalMobility } = useSocket();
  console.log(totalMobility, "department data ");
  console.log(departmentData, "department data ");

  const { data: session } = useSession();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data for demonstration - replace with your actual data
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
      ingoing: 2,
      outgoing: 1,
      employeeCount: 2,
      employees: [
        {
          id: "3468090d-9d5b-457a-b943-2a38be99aac2",
          firstName: "Ayesha",
          lastName: "Ali",
          email: "ayesha.ali@example.com",
          position: "MLOps",
          salary: "40000",
          employeeId: "N/A",
        },
        {
          id: "839891c2-2948-4f45-a84e-6dffee4f2427",
          firstName: "Omar",
          lastName: "Hussain",
          email: "omar.hussain@example.com",
          position: "Data Analyst",
          salary: "45000",
          employeeId: "DA001",
        },
      ],
    },
    {
      department: "Design",
      createdAt: "2025-09-05",
      ingoing: 2,
      outgoing: 1,
      employeeCount: 1,
      employees: [
        {
          id: "design-001",
          firstName: "Sarah",
          lastName: "Khan",
          email: "sarah.khan@example.com",
          position: "UI/UX Designer",
          salary: "38000",
          employeeId: "DG001",
        },
      ],
    },
    {
      department: "IT",
      createdAt: "2025-09-05",
      ingoing: 0,
      outgoing: 2,
      employeeCount: 2,
      employees: [
        {
          id: "it-001",
          firstName: "Ahmed",
          lastName: "Hassan",
          email: "ahmed.hassan@example.com",
          position: "Software Engineer",
          salary: "50000",
          employeeId: "IT001",
        },
        {
          id: "it-002",
          firstName: "Fatima",
          lastName: "Sheikh",
          email: "fatima.sheikh@example.com",
          position: "DevOps Engineer",
          salary: "52000",
          employeeId: "IT002",
        },
      ],
    },
  ];

  const cardData: DepartmentCardData =
    departmentCardData || mockDepartmentCardData;
  const deptData: Department[] = departmentData || mockDepartmentData;

  // Filter departments that have movement (ingoing or outgoing > 0)
  const departmentsWithMovement = deptData.filter(
    (dept) => dept.ingoing > 0 || dept.outgoing > 0
  );

  // Prepare data for department distribution chart (all departments)
  const departmentDistributionData = deptData.map((dept) => ({
    name: dept.department,
    value: dept.employeeCount,
  }));

  // Prepare data for ingoing vs outgoing chart (only departments with movement)
  const movementData = departmentsWithMovement.map((dept) => ({
    name: dept.department,
    ingoing: dept.ingoing,
    outgoing: dept.outgoing,
  }));

  // Calculate totals from real data
  const totalIngoing = totalMobility?.totalIngoing;
  const totalOutgoing = totalMobility?.totalOutgoing;
  const totalEmployees = deptData.reduce(
    (sum, dept) => sum + dept.employeeCount,
    0
  );

  const COLORS = ["#3b82f6", "#9333ea", "#22c55e", "#f97316", "#ef4444"];

  const handleCardClick = (employee: Employee, department: string) => {
    setSelectedEmployee({ ...employee, department });
    setIsModalOpen(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      Analytics: "bg-blue-500",
      Design: "bg-purple-500",
      IT: "bg-green-500",
      HR: "bg-orange-500",
      Finance: "bg-red-500",
      Operations: "bg-indigo-500",
      Education: "bg-yellow-500",
      Sustainability: "bg-teal-500",
      Healthcare: "bg-pink-500",
      Marketing: "bg-rose-500",
      Consulting: "bg-cyan-500",
      Sales: "bg-emerald-500",
      Media: "bg-violet-500",
      Engineering: "bg-amber-500",
    };
    return colors[department] || "bg-green-500";
  };

  return (
    <HRLayout>
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Department Dashboard</h1>
          </div>

          {/* Summary Cards - Using real data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Departments
                </CardTitle>
                <Building2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  <p>{deptData.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  <p>{totalEmployees}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Ingoing
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {totalIngoing}
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Outgoing
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {totalOutgoing}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-white">
                  Department Distribution
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Employee count by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {departmentDistributionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader>
                <CardTitle className="text-white">
                  Employee Movement by Department
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Ingoing vs Outgoing (Departments with activity only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {" "}
                  {/* Increased height for better visibility */}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={movementData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 100, // More space for rotated labels
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={<CustomXAxisTick />}
                        interval={0}
                        height={80}
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        fontWeight={500}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                        tickCount={4}
                      />
                      <Tooltip
                        content={<BarChartTooltip />}
                        cursor={{ fill: "transparent" }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "white",
                          paddingTop: "10px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="ingoing"
                        fill="#22c55e"
                        name="Ingoing"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                      <Bar
                        dataKey="outgoing"
                        fill="#ef4444"
                        name="Outgoing"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Cards - Show all departments */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Departments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deptData.map((department, index) => (
                <Card
                  key={index}
                  className="card transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 hover:scale-105 cursor-pointer"
                  onClick={() =>
                    department.employees.length > 0
                      ? handleCardClick(
                          department.employees[0],
                          department.department
                        )
                      : null
                  }
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getDepartmentColor(
                            department.department
                          )}`}
                        ></div>
                        <CardTitle className="text-white">
                          {department.department}
                        </CardTitle>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-white bg-white/10 border-white/20"
                      >
                        {department.employeeCount} employees
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      Created: {department.createdAt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center space-x-1 text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        <span>Ingoing: {department.ingoing}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-red-400">
                        <TrendingDown className="h-4 w-4" />
                        <span>Outgoing: {department.outgoing}</span>
                      </span>
                    </div>

                    {department.employees &&
                      department.employees.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-300">
                            Employees:
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {department.employees
                              .slice(0, 3)
                              .map((employee, empIndex) => (
                                <div
                                  key={empIndex}
                                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-white/10 text-white text-xs">
                                        {getInitials(
                                          employee.firstName,
                                          employee.lastName
                                        )}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        {employee.firstName} {employee.lastName}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {employee.position}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {department.employees.length > 3 && (
                              <p className="text-xs text-gray-400 text-center">
                                +{department.employees.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Employee Detail Modal */}
          <DepartmentModal
            employee={selectedEmployee}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            hrId={session?.user?.id as string}
          />
        </div>
      </div>
    </HRLayout>
  );
};

export default DepartmentDashboard;
