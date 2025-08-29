import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface JobDetailsModalProps {
  job: any | null;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  // Define displayable fields with their labels
  const fieldLabels: { [key: string]: string } = {
    title: "Job Title",
    description: "Description",
    industry: "Industry",
    type: "Job Type",
    status: "Status",
    matchScore: "Match Score",
    salaryRange: "Salary Range",
    location: "Location",
    companies: "Recruiter",
  };

  // Fields to display in the modal
  const displayFields = [
    "title",
    "description",
    "industry",
    "type",
    "status",
    "matchScore",
    "salaryRange",
    "location",
    "companies",
  ];

  if (!job) return null;

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
          <DialogDescription>Job Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {displayFields.map((field) => {
            if (job[field] !== undefined && job[field] !== null) {
              const value =
                field === "type"
                  ? job[field].replace("_", " ")
                  : field === "companies"
                  ? job[field].join(", ")
                  : field === "matchScore"
                  ? `${job[field]}%`
                  : job[field];
              return (
                <div key={field}>
                  <h4 className="text-sm font-medium">{fieldLabels[field]}</h4>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="btn-gradient"
            onClick={() => alert("Apply functionality not implemented")}
          >
            Apply Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
