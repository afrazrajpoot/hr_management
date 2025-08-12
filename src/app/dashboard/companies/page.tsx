"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import { StatCard } from "@/components/admin/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  ClipboardList,
  TrendingDown,
  Search,
  Eye,
  Filter,
} from "lucide-react";
import { mockCompanies } from "@/lib/mock-data";

export default function Companies() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  const industries = ["all", ...new Set(mockCompanies.map((c) => c.industry))];

  const filteredCompanies = mockCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry =
      selectedIndustry === "all" || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const totalEmployees = mockCompanies.reduce(
    (sum, company) => sum + company.employeeCount,
    0
  );
  const totalAssessments = mockCompanies.reduce(
    (sum, company) => sum + company.assessmentsCompleted,
    0
  );
  const averageRisk = Math.round(
    mockCompanies.reduce((sum, company) => sum + company.retentionRisk, 0) /
      mockCompanies.length
  );

  const getRiskBadgeVariant = (risk: number) => {
    if (risk < 10) return "default" as const;
    if (risk < 20) return "secondary" as const;
    return "destructive" as const;
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 10) return "Low Risk";
    if (risk < 20) return "Medium Risk";
    return "High Risk";
  };

  return (
    <HRLayout
      title="Companies Management"
      subtitle="Overview and management of all connected companies"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Companies"
            value={mockCompanies.length}
            description="Connected organizations"
            icon={<Building2 className="h-4 w-4" />}
          />
          <StatCard
            title="Total Employees"
            value={totalEmployees.toLocaleString()}
            description="Across all companies"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Assessments Completed"
            value={totalAssessments}
            description="Total assessments"
            icon={<ClipboardList className="h-4 w-4" />}
          />
          <StatCard
            title="Average Risk"
            value={`${averageRisk}%`}
            description="Retention risk"
            icon={<TrendingDown className="h-4 w-4" />}
          />
        </div>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry === "all" ? "All Industries" : industry}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card
              key={company.id}
              className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group"
              onClick={() =>
                router.push(`/hr-dashboard/companies/${company.id}`)
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-hr-primary transition-colors">
                        {company.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {company.industry}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getRiskBadgeVariant(company.retentionRisk)}>
                    {getRiskLevel(company.retentionRisk)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {company.employeeCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Employees
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {company.assessmentsCompleted}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Assessments
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      Assessment Completion
                    </span>
                    <span className="font-medium">
                      {Math.round(
                        (company.assessmentsCompleted / company.employeeCount) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (company.assessmentsCompleted /
                            company.employeeCount) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify_between text-sm mb-1">
                    <span className="text-muted-foreground">
                      Retention Risk
                    </span>
                    <span className="font-medium">
                      {company.retentionRisk}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        company.retentionRisk < 10
                          ? "bg-success"
                          : company.retentionRisk < 20
                          ? "bg-warning"
                          : "bg-destructive"
                      }`}
                      style={{ width: `${company.retentionRisk}%` }}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 group-hover:bg-hr-primary group-hover:text-white transition-all"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No companies found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find companies.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </HRLayout>
  );
}
