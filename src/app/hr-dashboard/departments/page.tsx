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
  department?: string; // Added department to Employee interface
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

const DepartmentDashboard = () => {
  const { departmentCardData, departmentData } = useSocket();
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

  // Prepare data for department distribution chart
  const departmentDistributionData = deptData.map((dept) => ({
    name: dept.department,
    value: dept.employeeCount,
  }));

  // Prepare data for ingoing vs outgoing chart
  const movementData = deptData.map((dept) => ({
    name: dept.department,
    ingoing: dept.ingoing,
    outgoing: dept.outgoing,
  }));

  const COLORS = ["#3b82f6", "#9333ea", "#22c55e", "#f97316", "#ef4444"];

  const handleCardClick = (employee: Employee, department: string) => {
    setSelectedEmployee({ ...employee, department }); // Include department in selected employee
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
    };
    return colors[department] || "bg-gray-500";
  };

  // Custom tooltip for department distribution chart
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <p className="text-white">{`${payload[0].name}: ${payload[0].value} employees`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <HRLayout>
      <div className="min-h-screen text-white p-6 bg-[#081229]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Department Dashboard</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Departments
                </CardTitle>
                <Building2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {cardData.totalDepartments}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {cardData.totalEmployees}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Ingoing
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {cardData.totalIngoing}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Outgoing
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {cardData.totalOutgoing}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
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
                      <Tooltip content={<CustomTooltip />} />
                      {/* <Legend /> */}
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Ingoing vs Outgoing
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Department-wise movement comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={movementData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderColor: "#4b5563",
                          color: "white",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="ingoing" fill="#22c55e" name="Ingoing" />
                      <Bar dataKey="outgoing" fill="#ef4444" name="Outgoing" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Cards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Departments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deptData.map((department, index) => (
                <Card
                  key={index}
                  className="bg-gray-800 border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 hover:scale-105 cursor-pointer"
                  onClick={() =>
                    handleCardClick(
                      department.employees[0],
                      department.department
                    )
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
                        className="bg-gray-700 text-gray-300"
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

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">
                        Employees:
                      </h4>
                      <div className="space-y-2">
                        {department.employees?.map((employee, empIndex) => (
                          <div
                            key={empIndex}
                            className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-600 text-white text-xs">
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
                      </div>
                    </div>
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
