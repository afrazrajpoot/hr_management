"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Eye, Phone, Mail, MapPin, Globe, X } from "lucide-react";

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

  if (!company) return null;

  const handleViewDashboard = () => {
    onClose();
    router.push(`/hr-dashboard/organizations/${company.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-bold">{company.companyDetail.name}</div>
              <div className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                {company.companyDetail.industry && (
                  <Badge variant="secondary" className="capitalize">
                    {company.companyDetail.industry}
                  </Badge>
                )}
                {company.companyDetail.employeeCount && (
                  <span className="text-xs">
                    {company.companyDetail.employeeCount} employees
                  </span>
                )}
                {company.companyDetail.foundedYear && (
                  <span className="text-xs">
                    Founded {company.companyDetail.foundedYear}
                  </span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {company.totalEmployees}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Employees
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {company.totalIndividualReports}
                </div>
                <div className="text-xs text-muted-foreground">Assessments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{company.totalHRUsers}</div>
                <div className="text-xs text-muted-foreground">HR Users</div>
              </CardContent>
            </Card>
            {company.companyDetail.employeeCount && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {company.companyDetail.employeeCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Company Size
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Company Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.companyDetail.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <div className="font-medium">
                        {company.companyDetail.phone}
                      </div>
                    </div>
                  </div>
                )}

                {company.companyDetail.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Mobile
                      </div>
                      <div className="font-medium">
                        {company.companyDetail.phoneNumber}
                      </div>
                    </div>
                  </div>
                )}

                {company.companyDetail.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-medium">
                        {company.companyDetail.email}
                      </div>
                    </div>
                  </div>
                )}

                {company.companyDetail.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Address
                      </div>
                      <div className="font-medium">
                        {company.companyDetail.address}
                      </div>
                    </div>
                  </div>
                )}

                {company.companyDetail.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Website
                      </div>
                      <a
                        href={company.companyDetail.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {company.companyDetail.website}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.companyDetail.description && (
                  <div>
                    <div className="text-sm font-medium mb-2">Description</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {company.companyDetail.description}
                    </p>
                  </div>
                )}

                {company.company && (
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Company Metadata
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">
                        {new Date(
                          company.company.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* HR Team */}
          {company.hrUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  HR Team ({company.hrUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.hrUsers.map((hr) => (
                    <Card key={hr.id} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {hr.firstName.charAt(0)}
                              {hr.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="font-medium">
                              {hr.firstName} {hr.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {hr.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {hr.role}
                              </Badge>
                            </div>
                            {hr.phoneNumber && (
                              <div className="text-xs text-muted-foreground">
                                {hr.phoneNumber}
                              </div>
                            )}
                            {hr.jobs.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Managing {hr.jobs.length} job opening
                                {hr.jobs.length !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {/* <Button onClick={handleViewDashboard}>
            <Eye className="h-4 w-4 mr-2" />
            View Full Dashboard
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
