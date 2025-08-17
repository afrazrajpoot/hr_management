"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  AlertTriangle,
  Award,
  TrendingUp,
} from "lucide-react";
import HRLayout from "@/components/hr/HRLayout";

// Mock employee data
const employees = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    position: "HR Manager",
    department: "Human Resources",
    salary: "$85,000",
    joinDate: "2021-03-15",
    location: "New York, NY",
    status: "Active",
    assessmentStatus: "Completed",
    riskLevel: "Low",
    geniusFactor: 85,
    productivity: 90,
    engagement: 88,
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@company.com",
    phone: "+1 (555) 234-5678",
    position: "Senior Developer",
    department: "IT",
    salary: "$95,000",
    joinDate: "2020-07-22",
    location: "San Francisco, CA",
    status: "Active",
    assessmentStatus: "Completed",
    riskLevel: "Low",
    geniusFactor: 92,
    productivity: 94,
    engagement: 89,
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    position: "Marketing Specialist",
    department: "Marketing",
    salary: "$62,000",
    joinDate: "2022-01-10",
    location: "Austin, TX",
    status: "Active",
    assessmentStatus: "Pending",
    riskLevel: "Medium",
    geniusFactor: 78,
    productivity: 82,
    engagement: 75,
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.wilson@company.com",
    phone: "+1 (555) 456-7890",
    position: "Sales Manager",
    department: "Sales",
    salary: "$88,000",
    joinDate: "2019-11-05",
    location: "Chicago, IL",
    status: "Active",
    assessmentStatus: "Completed",
    riskLevel: "Low",
    geniusFactor: 87,
    productivity: 91,
    engagement: 86,
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    email: "lisa.thompson@company.com",
    phone: "+1 (555) 567-8901",
    position: "UX Designer",
    department: "Design/Creative",
    salary: "$75,000",
    joinDate: "2021-09-18",
    location: "Seattle, WA",
    status: "Active",
    assessmentStatus: "Completed",
    riskLevel: "Low",
    geniusFactor: 89,
    productivity: 87,
    engagement: 92,
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 6,
    name: "James Anderson",
    email: "james.anderson@company.com",
    phone: "+1 (555) 678-9012",
    position: "Financial Analyst",
    department: "Finance",
    salary: "$70,000",
    joinDate: "2022-06-12",
    location: "Boston, MA",
    status: "Active",
    assessmentStatus: "In Progress",
    riskLevel: "Medium",
    geniusFactor: 76,
    productivity: 79,
    engagement: 73,
    avatar: "/api/placeholder/40/40",
  },
];

const departments = [
  "All Departments",
  "Finance",
  "Sales",
  "Marketing",
  "IT",
  "Design/Creative",
  "Customer Support",
  "Operations",
  "Human Resources",
];
const riskLevels = ["All Risk Levels", "Low", "Medium", "High"];
const assessmentStatuses = [
  "All Statuses",
  "Completed",
  "In Progress",
  "Pending",
  "Not Started",
];

const getRiskColor = (risk) => {
  switch (risk) {
    case "Low":
      return "bg-success text-success-foreground";
    case "Medium":
      return "bg-warning text-warning-foreground";
    case "High":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "bg-success text-success-foreground";
    case "In Progress":
      return "bg-primary text-primary-foreground";
    case "Pending":
      return "bg-warning text-warning-foreground";
    case "Not Started":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const EmployeeModal = ({ employee, isOpen, onClose }) => {
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback>
                {employee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{employee.name}</h3>
              <p className="text-muted-foreground">
                {employee.position} • {employee.department}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  {employee.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {employee.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {employee.location}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Employment Details
              </h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  Joined: {new Date(employee.joinDate).toLocaleDateString()}
                </p>
                <p>
                  Salary: <span className="font-medium">{employee.salary}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Badge className={getRiskColor(employee.riskLevel)}>
                    {employee.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Award className="h-4 w-4" />
              Performance Metrics
            </h4>

            <div className="grid gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Genius Factor Score
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {employee.geniusFactor}/100
                  </span>
                </div>
                <Progress value={employee.geniusFactor} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Productivity Score
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {employee.productivity}/100
                  </span>
                </div>
                <Progress value={employee.productivity} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Engagement Score</span>
                  <span className="text-sm text-muted-foreground">
                    {employee.engagement}/100
                  </span>
                </div>
                <Progress value={employee.engagement} className="h-2" />
              </div>
            </div>
          </div>

          {/* Assessment Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Assessment Status</p>
                <Badge className={getStatusColor(employee.assessmentStatus)}>
                  {employee.assessmentStatus}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Assessments
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedRisk, setSelectedRisk] = useState("All Risk Levels");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "All Departments" ||
      employee.department === selectedDepartment;
    const matchesRisk =
      selectedRisk === "All Risk Levels" || employee.riskLevel === selectedRisk;
    const matchesStatus =
      selectedStatus === "All Statuses" ||
      employee.assessmentStatus === selectedStatus;

    return matchesSearch && matchesDepartment && matchesRisk && matchesStatus;
  });

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Header & Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Employee Management</h2>
            <p className="text-muted-foreground">
              {filteredEmployees.length} employees found
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 pl-10"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="hr-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {riskLevels.map((risk) => (
                    <SelectItem key={risk} value={risk}>
                      {risk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assessmentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card className="hr-card">
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>
              Manage and track all company employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Employee</th>
                    <th className="text-left p-3 font-medium">Position</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-left p-3 font-medium">Salary</th>
                    <th className="text-left p-3 font-medium">Assessment</th>
                    <th className="text-left p-3 font-medium">Risk Level</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {employee.position}
                      </td>
                      <td className="p-3">{employee.department}</td>
                      <td className="p-3 font-medium">{employee.salary}</td>
                      <td className="p-3">
                        <Badge
                          className={getStatusColor(employee.assessmentStatus)}
                        >
                          {employee.assessmentStatus}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={getRiskColor(employee.riskLevel)}>
                          {employee.riskLevel}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleViewEmployee(employee)}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Employee Modal */}
        <EmployeeModal
          employee={selectedEmployee}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </HRLayout>
  );
}
