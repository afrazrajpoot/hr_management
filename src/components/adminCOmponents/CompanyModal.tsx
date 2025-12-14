"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Globe,
  Users,
  FileText,
  User,
  Calendar,
  Target,
  Briefcase,
  Award,
  ExternalLink,
  TrendingUp,
  BarChart3,
  Activity,
  Shield,
  MessageSquare,
  Download,
  Copy,
  CheckCircle,
  ChevronRight,
  MoreHorizontal,
  Star,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CompanyDetail {
  name: string;
  email?: string;
  industry?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  foundedYear?: number;
  employeeCount?: number;
  role?: string;
}

interface HRUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  jobs: Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    salary: number;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    recruiterId: string;
  }>;
}

interface Company {
  id: string;
  companyDetail: CompanyDetail;
  company?: {
    id: string;
    companyDetail: CompanyDetail;
    hrId: string[];
    createdAt: string;
    updatedAt: string;
  };
  hrUsers: HRUser[];
  totalHRUsers: number;
  totalEmployees: number;
  totalIndividualReports: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyModal({ company, isOpen, onClose }: CompanyModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!company) return null;

  const handleViewDashboard = () => {
    onClose();
    router.push(`/hr-dashboard/organizations/${company.id}`);
  };

  const copyToClipboard = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      toast.success("Email copied to clipboard");
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      toast.success("Phone number copied to clipboard");
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const completionRate =
    company.totalEmployees > 0
      ? Math.round(
          (company.totalIndividualReports / company.totalEmployees) * 100
        )
      : 0;

  const stats = [
    {
      label: "Employees",
      value: company.totalEmployees,
      icon: Users,
      color: "blue",
      trend: "+12%",
    },
    {
      label: "Assessments",
      value: company.totalIndividualReports,
      icon: FileText,
      color: "purple",
      trend: "+23%",
    },
    {
      label: "HR Users",
      value: company.totalHRUsers,
      icon: User,
      color: "green",
      trend: "+5%",
    },
    {
      label: "Completion",
      value: `${completionRate}%`,
      icon: Award,
      color: "amber",
      trend: completionRate > 80 ? "+8%" : "-2%",
    },
  ];

  const quickActions = [
    {
      label: "Send Message",
      icon: MessageSquare,
      action: () => toast.info("Message feature coming soon"),
    },
    {
      label: "Export Data",
      icon: Download,
      action: () => toast.info("Export feature coming soon"),
    },
    { label: "View Analytics", icon: BarChart3, action: handleViewDashboard },
    {
      label: "Add HR User",
      icon: User,
      action: () => toast.info("Add user feature coming soon"),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 border-b border-border flex-shrink-0">
          <DialogHeader className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="relative group">
                  <div className="sidebar-user-avatar h-20 w-20 flex items-center justify-center relative">
                    <Building2 className="h-10 w-10 text-white" />
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-background">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                    {company.companyDetail.name}
                    <Badge className="badge-green">
                      <Zap className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {company.companyDetail.industry && (
                      <Badge className="badge-blue group hover:scale-105 transition-transform">
                        <Briefcase className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform" />
                        {company.companyDetail.industry}
                      </Badge>
                    )}
                    {company.companyDetail.employeeCount && (
                      <Badge
                        variant="secondary"
                        className="group hover:bg-muted transition-colors"
                      >
                        <Users className="h-3 w-3 mr-1 group-hover:scale-110 transition-transform" />
                        {company.companyDetail.employeeCount} employees
                      </Badge>
                    )}
                    {company.companyDetail.foundedYear && (
                      <Badge
                        variant="outline"
                        className="group hover:border-primary transition-colors"
                      >
                        <Calendar className="h-3 w-3 mr-1 group-hover:text-primary transition-colors" />
                        Founded {company.companyDetail.foundedYear}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="font-medium">4.8</span>
                      <span className="text-xs">(24 reviews)</span>
                    </span>
                    <span className="text-xs">•</span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-green-500" />
                      <span>Last active: Today</span>
                    </span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full h-9 w-9 hover:bg-muted hover:scale-110 transition-all"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="w-full bg-muted/50 mx-6">
            <TabsTrigger
              value="overview"
              className="flex-1 data-[state=active]:bg-background"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="flex-1 data-[state=active]:bg-background"
            >
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex-1 data-[state=active]:bg-background"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 data-[state=active]:bg-background"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 m-0">
            {/* Stats Cards with Hover Effects */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="assessment-item group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                  onClick={() => toast.info(`View ${stat.label} details`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={cn(
                        "icon-wrapper p-2",
                        stat.color === "blue" && "icon-wrapper-blue",
                        stat.color === "purple" && "icon-wrapper-purple",
                        stat.color === "green" && "icon-wrapper-green",
                        stat.color === "amber" && "icon-wrapper-amber"
                      )}
                    >
                      <stat.icon
                        className={cn(
                          "h-5 w-5",
                          stat.color === "blue" && "text-blue-600",
                          stat.color === "purple" && "text-purple-600",
                          stat.color === "green" && "text-green-600",
                          stat.color === "amber" && "text-amber-600"
                        )}
                      />
                    </div>
                    <Badge
                      className={cn(
                        "badge",
                        stat.trend.startsWith("+")
                          ? "badge-green"
                          : "badge-amber"
                      )}
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                  <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        stat.color === "blue" && "bg-blue-500",
                        stat.color === "purple" && "bg-purple-500",
                        stat.color === "green" && "bg-green-500",
                        stat.color === "amber" && "bg-amber-500"
                      )}
                      style={{
                        width: `${Math.min(
                          Number(stat.value.toString().replace("%", "")) || 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="card-primary card-hover">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="icon-wrapper-purple p-2">
                      <Zap className="h-4 w-4" />
                    </div>
                    Quick Actions
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all group"
                      onClick={action.action}
                    >
                      <div className="icon-wrapper-blue p-2 group-hover:scale-110 transition-transform">
                        <action.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Card */}
              <Card className="card-primary card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="icon-wrapper-blue p-2">
                      <Phone className="h-4 w-4" />
                    </div>
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {company.companyDetail.email && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="icon-wrapper-green p-2">
                          <Mail className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Email
                          </div>
                          <div className="font-medium text-foreground">
                            {company.companyDetail.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          copyToClipboard(company.companyDetail.email!, "email")
                        }
                      >
                        {copiedEmail ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}

                  {(company.companyDetail.phone ||
                    company.companyDetail.phoneNumber) && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="icon-wrapper-blue p-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Phone
                          </div>
                          <div className="font-medium text-foreground">
                            {company.companyDetail.phone ||
                              company.companyDetail.phoneNumber}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          copyToClipboard(
                            company.companyDetail.phone ||
                              company.companyDetail.phoneNumber!,
                            "phone"
                          )
                        }
                      >
                        {copiedPhone ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}

                  {company.companyDetail.address && (
                    <div className="p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="icon-wrapper-amber p-2">
                          <MapPin className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Address
                          </div>
                          <div className="font-medium text-foreground text-sm">
                            {company.companyDetail.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {company.companyDetail.website && (
                    <a
                      href={company.companyDetail.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="icon-wrapper-purple p-2">
                          <Globe className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Website
                          </div>
                          <div className="font-medium text-foreground flex items-center gap-1">
                            {company.companyDetail.website}
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Progress Card */}
              <Card className="card-primary card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="icon-wrapper-green p-2">
                      <Target className="h-4 w-4" />
                    </div>
                    Assessment Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                          Completion Rate
                        </span>
                        <span className="font-medium text-foreground">
                          {completionRate}%
                        </span>
                      </div>
                      <Progress
                        value={completionRate}
                        className="progress-bar-primary h-3"
                      />
                      <div className="text-xs text-muted-foreground mt-2">
                        {company.totalIndividualReports} of{" "}
                        {company.totalEmployees} employees assessed
                      </div>
                    </div>

                    {completionRate < 50 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-amber-700">
                              Low Completion Rate
                            </div>
                            <div className="text-xs text-amber-600">
                              Consider reaching out to complete assessments
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/30 rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="text-2xl font-bold text-foreground">
                          {company.totalIndividualReports}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="text-2xl font-bold text-foreground">
                          {company.totalEmployees -
                            company.totalIndividualReports}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pending
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info Card */}
              <Card className="card-primary card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="icon-wrapper-purple p-2">
                      <Building2 className="h-4 w-4" />
                    </div>
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.companyDetail.description && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-medium text-foreground mb-2">
                        About
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {company.companyDetail.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {company.companyDetail.industry && (
                      <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="text-xs text-muted-foreground">
                          Industry
                        </div>
                        <div className="font-medium text-foreground">
                          {company.companyDetail.industry}
                        </div>
                      </div>
                    )}

                    {company.companyDetail.role && (
                      <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="text-xs text-muted-foreground">
                          Business Type
                        </div>
                        <div className="font-medium text-foreground">
                          {company.companyDetail.role}
                        </div>
                      </div>
                    )}

                    {company.company && (
                      <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="text-xs text-muted-foreground">
                          Joined Platform
                        </div>
                        <div className="font-medium text-foreground">
                          {new Date(
                            company.company.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="text-xs text-muted-foreground">
                        Last Updated
                      </div>
                      <div className="font-medium text-foreground">
                        {new Date(company.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6 m-0">
            <Card className="card-primary card-hover">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="icon-wrapper-blue p-2">
                      <Users className="h-4 w-4" />
                    </div>
                    HR Team Members
                    <Badge className="badge-blue ml-2">
                      {company.hrUsers.length}
                    </Badge>
                  </div>
                  <Button size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.hrUsers.map((hr) => (
                    <div
                      key={hr.id}
                      className="assessment-item p-4 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                      onClick={() =>
                        toast.info(`View ${hr.firstName}'s profile`)
                      }
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="sidebar-user-avatar h-12 w-12 group-hover:scale-110 transition-transform">
                          <AvatarFallback className="text-white font-bold">
                            {hr.firstName.charAt(0)}
                            {hr.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {hr.firstName} {hr.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {hr.email}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="badge-blue text-xs capitalize">
                              <User className="h-3 w-3 mr-1" />
                              {hr.role}
                            </Badge>
                            {hr.jobs.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs group-hover:border-primary transition-colors"
                              >
                                <Briefcase className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform" />
                                {hr.jobs.length} job
                                {hr.jobs.length !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                          {hr.phoneNumber && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                              <Phone className="h-3 w-3" />
                              {hr.phoneNumber}
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
        </Tabs>

        <Separator className="flex-shrink-0" />

        <DialogFooter className="p-6 gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-muted hover:scale-105 transition-all"
          >
            Close
          </Button>
          <Button
            onClick={handleViewDashboard}
            className="btn-gradient-primary hover:scale-105 transition-transform"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Full Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Missing icon components
const X = ({ className }: { className?: string }) => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const Settings = ({ className }: { className?: string }) => (
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
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
