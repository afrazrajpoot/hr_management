"use client";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react";
import ReportModal from "./ReportModal";

const getRiskColor = (risk: string | undefined) => {
  switch (risk) {
    case "Low":
      return "bg-success text-success-foreground";
    case "Moderate":
      return "bg-warning text-warning-foreground";
    case "High":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

interface EmployeeModalProps {
  employee: any;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeModal = ({ employee, isOpen, onClose }: EmployeeModalProps) => {
  // Define all hooks at the top
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const safeEmployee = useMemo(() => {
    if (!employee) {
      return {
        id: "",
        firstName: "Unknown",
        lastName: "",
        email: "N/A",
        salary: 0,
        position: "N/A",
        department: "N/A",
        reports: [],
      };
    }
    return {
      id: employee.id || "",
      firstName: employee.firstName || "Unknown",
      lastName: employee.lastName !== "Not provide" ? employee.lastName : "",
      email: employee.email || "N/A",
      salary: employee.salary || 0,
      position: employee.employee?.position || "N/A",
      department:
        employee.employee?.department ||
        employee.reports[0]?.departement ||
        "N/A",
      reports: employee.reports || [],
    };
  }, [employee]);

  // Early return after hooks
  if (!employee) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>No Employee Data</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            No employee data available.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback>
                  {`${safeEmployee.firstName[0]}${
                    safeEmployee.lastName ? safeEmployee.lastName[0] : ""
                  }`}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{`${safeEmployee.firstName} ${safeEmployee.lastName}`}</h3>
                <p className="text-muted-foreground">
                  {safeEmployee.position} • {safeEmployee.department}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {safeEmployee.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Not provided
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Not provided
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5" />
                  Employment Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Joined: Not provided
                  </p>
                  <p>
                    Salary:{" "}
                    <span className="font-medium">
                      ${safeEmployee.salary.toLocaleString() || "N/A"}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getRiskColor(
                        safeEmployee.reports[0]
                          ?.currentRoleAlignmentAnalysisJson
                          ?.retention_risk_level
                      )}
                    >
                      {safeEmployee.reports[0]?.currentRoleAlignmentAnalysisJson
                        ?.retention_risk_level || "N/A"}{" "}
                      Risk
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2 text-lg">
                <Award className="h-5 w-5" />
                Performance Metrics
              </h4>
              <div className="grid gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Genius Factor Score
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {safeEmployee.reports[0]?.geniusFactorProfileJson?.primary_genius_factor?.match(
                        /\d+/
                      )?.[0] || "N/A"}
                      /100
                    </span>
                  </div>
                  <Progress
                    value={
                      parseInt(
                        safeEmployee.reports[0]?.geniusFactorProfileJson?.primary_genius_factor?.match(
                          /\d+/
                        )?.[0] || "0"
                      ) || 0
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            {/* Reports Trigger */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Reports
              </h4>
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => setIsReportModalOpen(true)}
                disabled={!safeEmployee.reports.length}
              >
                <TrendingUp className="h-4 w-4" />
                View Reports
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <ReportModal
        reports={safeEmployee.reports}
        firstName={safeEmployee.firstName}
        lastName={safeEmployee.lastName}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
};

export default EmployeeModal;
