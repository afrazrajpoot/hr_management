"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import HRLayout from "@/components/hr/HRLayout";
import { useSession } from "next-auth/react";
import {
  Upload,
  FileText,
  CheckCircle,
  Briefcase,
  FileSpreadsheet,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

interface JobFormData {
  title: string;
  description: string;
  location: string;
  salary: string;
  type: string;
  skills: string; // Comma-separated for input, will be parsed to array
  companyName: string;
  companyAbout: string;
}

export default function UploadJobsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedJobs, setUploadedJobs] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    location: "",
    salary: "",
    type: "FULL_TIME",
    skills: "",
    companyName: "",
    companyAbout: "",
  });
  const [generateLoading, setGenerateLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDescription, setPreviewDescription] = useState("");
  const { data: session } = useSession<any>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    if (session?.user.id) {
      formDataUpload.append("recruiter_id", session.user.id);
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_URL}/jobs/upload`,
        {
          method: "POST",
          body: formDataUpload,
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${session?.user?.fastApiToken || ''}`
          },
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedJobs(data.jobs);
      toast.success(`Uploaded ${data.inserted} jobs successfully!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to upload jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const processDescriptionForDisplay = (desc: string): string => {
    let processed = desc
      // Remove hashtags for headers
      .replace(/^(#{1,6})\s+/gm, "")
      // Replace asterisks and dashes for bullets with a bullet symbol, remove extra *
      .replace(/^\s*[\*\-]\s+/gm, "• ")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Wrap **bold** in <strong>
      .replace(/\*(?!\s)/g, "") // Remove standalone *
      .replace(/#/g, ""); // Remove any remaining #

    return processed;
  };

  const generateDescription = async () => {
    if (!formData.title) {
      toast.error("Please enter a job title first");
      return;
    }

    setGenerateLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_URL}/api/jobs/generate-description`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" ,"Authorization": `Bearer ${session?.user?.fastApiToken || ''}`},
          body: JSON.stringify({
            title: formData.title,
            location: formData.location || null,
            salary: formData.salary ? parseInt(formData.salary) : null,
            type: formData.type,
            skills: formData.skills,
            company_name: formData.companyName || null,
            company_about: formData.companyAbout || null,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to generate description");

      const { description } = await res.json();
      setPreviewDescription(description);
      setIsPreviewModalOpen(true);
      toast.success("Description generated! Preview below.");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate description");
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleUseDescription = () => {
    setFormData((prev) => ({ ...prev, description: previewDescription }));
    setIsPreviewModalOpen(false);
    toast.success("Description applied to the form!");
  };

  const handleCreateJob = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required");
      return;
    }

    const skillsArray = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    const createData = {
      title: formData.title,
      description: formData.description,
      location: formData.location || null,
      salary: formData.salary ? parseInt(formData.salary) : null,
      type: formData.type,
      skills: skillsArray.length > 0 ? skillsArray : null,
      recruiterId: session?.user.id,
    };

    try {
      setCreateLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_URL}/api/jobs/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" ,"Authorization": `Bearer ${session?.user?.fastApiToken || ''}`},
          body: JSON.stringify(createData),
        }
      );

      if (!res.ok) throw new Error("Failed to create job");

      const data = await res.json();
      toast.success("Job created successfully!");
      setFormData({
        title: "",
        description: "",
        location: "",
        salary: "",
        type: "FULL_TIME",
        skills: "",
        companyName: "",
        companyAbout: "",
      });
      setIsCreateModalOpen(false);
      // Optionally refresh jobs list here
    } catch (error: any) {
      toast.error(error.message || "Failed to create job");
    } finally {
      setCreateLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "csv":
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="w-6 h-6 text-green-400" />;
      case "pdf":
        return <FileText className="w-6 h-6 text-red-400" />;
      default:
        return <FileText className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <HRLayout>
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold">Upload & Create Jobs</h1>
          </div>
          <p className="text-muted-foreground">
            Upload bulk jobs or create a single job listing manually
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={handleUpload}
            disabled={loading || !file}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Upload Bulk Jobs</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Bulk Jobs</span>
              </div>
            )}
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job Manually
          </Button>
        </div>

        {/* Upload Area */}
        <div className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : file
                ? "border-green-500 bg-green-500/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".csv,.xls,.xlsx,.odt,.ods,.pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            <div className="flex flex-col items-center space-y-4">
              {file ? (
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Choose a file or drag it here</p>
                    <p className="text-sm text-muted-foreground">
                      CSV, Excel, ODT, PDF files supported
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Uploaded Jobs List */}
        {uploadedJobs.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Uploaded Jobs ({uploadedJobs.length})
            </div>

            <div className="space-y-2">
              {uploadedJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-muted-foreground mr-3" />
                  <div className="flex-1">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {job.id}
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-center">
                <span className="font-medium text-green-600">
                  {uploadedJobs.length}
                </span>{" "}
                job{uploadedJobs.length !== 1 ? "s" : ""} successfully added to
                your listings
              </p>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-medium mb-2">Supported file formats:</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• CSV files with job data</p>
            <p>• Excel spreadsheets (.xlsx, .xls)</p>
            <p>• OpenDocument text files (.odt)</p>
            <p>• PDF documents</p>
          </div>
        </div>

        {/* Create Job Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new job posting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Software Engineer"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Remote or Lahore, PK"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary (Optional)</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="e.g., Tech Innovators Inc."
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="companyAbout">About Company</Label>
                <Textarea
                  id="companyAbout"
                  name="companyAbout"
                  value={formData.companyAbout}
                  onChange={handleInputChange}
                  placeholder="Brief description of the company..."
                  rows={3}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="type" className="mb-2">
                  Job Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript, React, Node.js"
                  className="mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter job description..."
                    rows={4}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateDescription}
                    disabled={!formData.title || generateLoading}
                    className="absolute bottom-2 right-2 h-8 w-8 p-0"
                  >
                    <Sparkles
                      className={`w-4 h-4 ${
                        generateLoading ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click the sparkles icon to generate description with AI
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateJob}
                disabled={
                  !formData.title || !formData.description || createLoading
                }
              >
                {createLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Job...</span>
                  </div>
                ) : (
                  "Create Job"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Description Modal */}
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw]">
            <DialogHeader>
              <DialogTitle>Job Description Preview</DialogTitle>
              <DialogDescription>
                Review the generated description in a professional layout. You
                can apply it to the form or close to edit manually.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto p-6 rounded-lg border shadow-sm">
              <div className="mb-6 p-4 bg-muted/20 rounded-md">
                <h2 className="text-2xl font-bold mb-2">{formData.title}</h2>
                <p className="text-lg text-muted-foreground mb-1">
                  {formData.location || "Remote"} | {formData.type} |{" "}
                  {formData.salary
                    ? `$${parseInt(formData.salary).toLocaleString()}`
                    : "Competitive Salary"}
                </p>
                {formData.companyName && (
                  <p className="text-lg font-semibold">
                    {formData.companyName}
                  </p>
                )}
              </div>
              <div
                className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: processDescriptionForDisplay(
                    previewDescription
                  ).replace(/\n/g, "<br>"),
                }}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close Preview
              </Button>
              <Button type="button" onClick={handleUseDescription}>
                Use This Description
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </HRLayout>
  );
}
