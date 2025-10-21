import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Star,
  Briefcase,
  Users,
} from "lucide-react";

interface JobDetailsModalProps {
  job: any | null;
  onClose: () => void;
  onApply?: (jobId: string, jobTitle: string, matchScore: number) => void;
  appliedJobs: string[];
  applyingJobIds: Set<string>;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  onClose,
  onApply,
  appliedJobs,
  applyingJobIds,
}) => {
  // Define displayable fields with their labels and icons
  const fieldConfig: {
    [key: string]: {
      label: string;
      icon: React.ComponentType<any>;
      priority: number;
    };
  } = {
    industry: { label: "Industry", icon: Building2, priority: 1 },
    type: { label: "Job Type", icon: Briefcase, priority: 2 },
    location: { label: "Location", icon: MapPin, priority: 3 },
    salaryRange: { label: "Salary Range", icon: DollarSign, priority: 4 },
    companies: { label: "Recruiter", icon: Users, priority: 5 },
    status: { label: "Status", icon: Clock, priority: 6 },
    matchScore: { label: "Match Score", icon: Star, priority: 7 },
  };

  if (!job) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "open":
        return "default";
      case "closed":
      case "expired":
        return "secondary";
      case "urgent":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80)
      return "text-green-400 bg-green-500/10 border border-green-500/20";
    if (score >= 60)
      return "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border border-red-500/20";
  };

  // Sort fields by priority for better display order
  const sortedFields = Object.keys(fieldConfig).sort(
    (a, b) => fieldConfig[a].priority - fieldConfig[b].priority
  );

  const formatFieldValue = (field: string, value: any) => {
    switch (field) {
      case "type":
        return value
          ?.replace("_", " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase());
      case "companies":
        return Array.isArray(value) ? value.join(", ") : value;
      case "matchScore":
        return `${value}%`;
      default:
        return value;
    }
  };

  const isApplied = appliedJobs.includes(job.id || "");
  const isApplying = applyingJobIds.has(job.id || "");

  const handleApplyClick = () => {
    if (!onApply) {
      alert("Apply functionality not implemented");
      return;
    }
    if (isApplied) {
      alert("You have already applied for this job.");
      return;
    }
    onApply(job.id || "", job.title || "", job.matchScore || 0);
  };

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold leading-tight">
                {job.title}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Complete job information and requirements
              </DialogDescription>
            </div>
            {job.matchScore && (
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(
                  job.matchScore
                )}`}
              >
                <Star className="w-4 h-4 inline mr-1" />
                {job.matchScore}% Match
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Job Description - Featured prominently */}
          {job.description && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-primary" />
                Description
              </h4>
              <div className="text-muted-foreground leading-relaxed space-y-3">
                {job.description
                  .split("\n")
                  .map((paragraph: string, idx: number) => {
                    const trimmed = paragraph.trim().replace(/\*\*/g, "");
                    if (!trimmed) return null;

                    // Check if it's a bullet point
                    if (trimmed.match(/^[\-\*\•]/)) {
                      return (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 ml-4"
                        >
                          <span className="text-primary mt-1.5">•</span>
                          <span>{trimmed.replace(/^[\-\*\•]\s*/, "")}</span>
                        </div>
                      );
                    }

                    // Check if it's a heading (all caps or ends with colon)
                    if (
                      trimmed === trimmed.toUpperCase() ||
                      trimmed.endsWith(":")
                    ) {
                      return (
                        <h5
                          key={idx}
                          className="font-bold text-foreground mt-4 first:mt-0"
                        >
                          {trimmed}
                        </h5>
                      );
                    }

                    // Regular paragraph
                    return (
                      <p key={idx} className="text-sm">
                        {trimmed}
                      </p>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedFields.map((field) => {
              if (
                job[field] !== undefined &&
                job[field] !== null &&
                field !== "description"
              ) {
                const config = fieldConfig[field];
                const IconComponent = config.icon;
                const value = formatFieldValue(field, job[field]);

                return (
                  <div
                    key={field}
                    className="bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          {config.label}
                        </h4>
                        <div className="mt-1">
                          {field === "status" ? (
                            <Badge
                              variant={getStatusBadgeVariant(value)}
                              className="text-sm"
                            >
                              {value}
                            </Badge>
                          ) : field === "matchScore" ? (
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${getMatchScoreColor(
                                parseInt(value)
                              )}`}
                            >
                              {value}
                            </div>
                          ) : (
                            <p className="text-base font-semibold">{value}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Additional Details */}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Close
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-8 flex-1 sm:flex-none transition-all duration-200"
            onClick={handleApplyClick}
            disabled={isApplied || isApplying}
          >
            {isApplying ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Applying...</span>
              </div>
            ) : isApplied ? (
              "Applied"
            ) : (
              "Apply Now"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
