"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  ArrowRight,
  Search,
  Calendar,
  User,
  Building,
  ChevronRight,
} from "lucide-react";
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
  Sankey,
} from "recharts";
import HRLayout from "@/components/hr/HRLayout";

// Mock mobility data
const mobilityTrendData = [
  { month: "Jan", promotions: 5, transfers: 8, total: 13 },
  { month: "Feb", promotions: 7, transfers: 6, total: 13 },
  { month: "Mar", promotions: 12, transfers: 10, total: 22 },
  { month: "Apr", promotions: 8, transfers: 9, total: 17 },
  { month: "May", promotions: 15, transfers: 12, total: 27 },
  { month: "Jun", promotions: 18, transfers: 14, total: 32 },
];

const departmentFlowData = [
  {
    department: "Finance",
    incoming: 6,
    outgoing: 7,
    net: -1,
    color: "hsl(var(--hr-chart-1))",
  },
  {
    department: "Sales",
    incoming: 6,
    outgoing: 5,
    net: 1,
    color: "hsl(var(--hr-chart-2))",
  },
  {
    department: "Marketing",
    incoming: 8,
    outgoing: 2,
    net: 6,
    color: "hsl(var(--hr-chart-3))",
  },
  {
    department: "IT",
    incoming: 4,
    outgoing: 3,
    net: 1,
    color: "hsl(var(--hr-chart-4))",
  },
  {
    department: "Operations",
    incoming: 6,
    outgoing: 2,
    net: 4,
    color: "hsl(var(--hr-chart-5))",
  },
  {
    department: "Customer Support",
    incoming: 0,
    outgoing: 6,
    net: -6,
    color: "#8B5CF6",
  },
  {
    department: "Design/Creative",
    incoming: 0,
    outgoing: 3,
    net: -3,
    color: "#06B6D4",
  },
  {
    department: "Human Resources",
    incoming: 0,
    outgoing: 1,
    net: -1,
    color: "#F59E0B",
  },
];

const departmentTransferPairs = [
  { source: "Customer Support", target: "Sales", value: 6 },
  { source: "Sales", target: "Marketing", value: 5 },
  { source: "Finance", target: "IT", value: 4 },
  { source: "IT", target: "Operations", value: 3 },
  { source: "Design/Creative", target: "Marketing", value: 3 },
  { source: "Marketing", target: "Operations", value: 2 },
  { source: "Operations", target: "Finance", value: 2 },
  { source: "Human Resources", target: "Operations", value: 1 },
];

const careerProgressionData = [
  {
    id: 1,
    employee: "Sarah Johnson",
    avatar: "SJ",
    timeline: [
      {
        position: "Junior Analyst",
        department: "Finance",
        date: "2022-01",
        level: 1,
      },
      {
        position: "Financial Analyst",
        department: "Finance",
        date: "2023-06",
        level: 2,
      },
      {
        position: "Senior Analyst",
        department: "Finance",
        date: "2024-01",
        level: 3,
      },
    ],
  },
  {
    id: 2,
    employee: "Michael Chen",
    avatar: "MC",
    timeline: [
      {
        position: "Software Developer",
        department: "IT",
        date: "2021-08",
        level: 2,
      },
      {
        position: "Senior Developer",
        department: "IT",
        date: "2023-03",
        level: 3,
      },
      { position: "Tech Lead", department: "IT", date: "2024-01", level: 4 },
    ],
  },
  {
    id: 3,
    employee: "Emily Rodriguez",
    avatar: "ER",
    timeline: [
      {
        position: "Marketing Coordinator",
        department: "Marketing",
        date: "2022-03",
        level: 1,
      },
      {
        position: "Marketing Specialist",
        department: "Marketing",
        date: "2023-01",
        level: 2,
      },
      {
        position: "Marketing Manager",
        department: "Operations",
        date: "2024-02",
        level: 3,
      },
    ],
  },
];

const recentTransitionsData = [
  {
    id: 1,
    employee: "David Kim",
    avatar: "DK",
    type: "Transfer",
    fromPosition: "Account Executive",
    toPosition: "Sales Manager",
    fromDepartment: "Sales",
    toDepartment: "Sales",
    date: "2024-01-15",
    reason: "Leadership opportunity",
  },
  {
    id: 2,
    employee: "Lisa Wang",
    avatar: "LW",
    type: "Promotion",
    fromPosition: "UX Designer",
    toPosition: "Senior UX Designer",
    fromDepartment: "Design/Creative",
    toDepartment: "Design/Creative",
    date: "2024-01-10",
    reason: "Performance excellence",
  },
  {
    id: 3,
    employee: "James Wilson",
    avatar: "JW",
    type: "Transfer",
    fromPosition: "Operations Specialist",
    toPosition: "Business Analyst",
    fromDepartment: "Operations",
    toDepartment: "Finance",
    date: "2024-01-08",
    reason: "Career development",
  },
  {
    id: 4,
    employee: "Anna Thompson",
    avatar: "AT",
    type: "Promotion",
    fromPosition: "Support Specialist",
    toPosition: "Support Team Lead",
    fromDepartment: "Customer Support",
    toDepartment: "Customer Support",
    date: "2024-01-05",
    reason: "Team leadership skills",
  },
];

const MobilityStatCard = ({
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

const TransitionCard = ({ transition }) => {
  const getTypeColor = (type) => {
    return type === "Promotion"
      ? "bg-success text-success-foreground"
      : "bg-primary text-primary-foreground";
  };

  return (
    <Card className="hr-card hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {transition.avatar}
              </span>
            </div>
            <div>
              <h4 className="font-semibold">{transition.employee}</h4>
              <p className="text-sm text-muted-foreground">{transition.date}</p>
            </div>
          </div>
          <Badge className={getTypeColor(transition.type)}>
            {transition.type}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">From:</span>
            <span className="font-medium">{transition.fromPosition}</span>
            <span className="text-muted-foreground">
              ({transition.fromDepartment})
            </span>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">To:</span>
            <span className="font-medium">{transition.toPosition}</span>
            <span className="text-muted-foreground">
              ({transition.toDepartment})
            </span>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Reason:</span> {transition.reason}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CareerTimelineCard = ({ progression }) => {
  return (
    <Card className="hr-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {progression.avatar}
            </span>
          </div>
          <div>
            <CardTitle className="text-lg">{progression.employee}</CardTitle>
            <CardDescription>Career progression timeline</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progression.timeline.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    index === progression.timeline.length - 1
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
                {index < progression.timeline.length - 1 && (
                  <div className="w-px h-8 bg-border mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{step.position}</h4>
                  <Badge variant="outline" className="text-xs">
                    {step.department}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function InternalMobility() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransitions = recentTransitionsData.filter((transition) => {
    const matchesSearch =
      transition.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transition.fromDepartment
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transition.toDepartment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || transition.type === typeFilter;

    return matchesSearch && matchesType;
  });

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
            value="32"
            change="+18.5%"
            icon={TrendingUp}
            description="This month"
          />
          <MobilityStatCard
            title="Promotions"
            value="18"
            change="+25.0%"
            icon={TrendingUp}
            description="This month"
          />
          <MobilityStatCard
            title="Transfers"
            value="14"
            change="+12.0%"
            icon={ArrowRight}
            description="This month"
          />
          <MobilityStatCard
            title="Retention Rate"
            value="94%"
            change="+2.1%"
            icon={User}
            description="Post-mobility"
          />
        </div>

        {/* Mobility Trends */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Mobility Trend */}
          <Card className="hr-card">
            <CardHeader>
              <CardTitle>Monthly Mobility Trends</CardTitle>
              <CardDescription>
                Internal movements over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mobilityTrendData}>
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
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Flow Chart */}
          <Card className="hr-card">
            <CardHeader>
              <CardTitle>Department Movement Flow</CardTitle>
              <CardDescription>
                Net employee transfers between departments (incoming vs
                outgoing)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={departmentFlowData}
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
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "net")
                        return [
                          `${Number(value) > 0 ? "+" : ""}${value}`,
                          "Net Movement",
                        ];
                      return [
                        value,
                        name === "incoming" ? "Incoming" : "Outgoing",
                      ];
                    }}
                  />
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
                  <Bar
                    dataKey="net"
                    fill="hsl(var(--hr-chart-4))"
                    name="Net Movement"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Career Progression Timelines */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Career Progression Examples
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {careerProgressionData.map((progression) => (
              <CareerTimelineCard
                key={progression.id}
                progression={progression}
              />
            ))}
          </div>
        </div>

        {/* Recent Transitions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Transitions</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Promotion">Promotions</SelectItem>
                  <SelectItem value="Transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTransitions.map((transition) => (
              <TransitionCard key={transition.id} transition={transition} />
            ))}
          </div>

          {filteredTransitions.length === 0 && (
            <Card className="hr-card">
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No transitions found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </HRLayout>
  );
}
