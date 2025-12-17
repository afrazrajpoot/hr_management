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
  Users,
  Target,
  Zap,
  BarChart3,
  ChevronRight,
  Download,
  Cloud,
  Shield,
  Database,
  Award,
  ArrowUpRight,
  Badge,
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
            Authorization: `Bearer ${session?.user?.fastApiToken || ""}`,
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
      .replace(/^(#{1,6})\s+/gm, "")
      .replace(/^\s*[\*\-]\s+/gm, "• ")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(?!\s)/g, "")
      .replace(/#/g, "");

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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.fastApiToken || ""}`,
          },
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.fastApiToken || ""}`,
          },
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
        return <FileSpreadsheet className="w-8 h-8 text-success" />;
      case "pdf":
        return <FileText className="w-8 h-8 text-destructive" />;
      default:
        return <FileText className="w-8 h-8 text-primary" />;
    }
  };

  // Quick stats
  const quickStats = [
    {
      icon: Users,
      label: "Bulk Upload",
      value: "100+",
      color: "from-primary to-purple-600",
    },
    {
      icon: Database,
      label: "AI Processing",
      value: "Instant",
      color: "from-success to-green-500",
    },
    {
      icon: Shield,
      label: "Secure",
      value: "256-bit",
      color: "from-warning to-amber-500",
    },
    {
      icon: Award,
      label: "Smart Parse",
      value: "Auto",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      icon: Download,
      label: "Download Template",
      color: "from-primary to-purple-600",
    },
    {
      icon: Target,
      label: "AI Job Generator",
      color: "from-success to-green-500",
    },
    {
      icon: BarChart3,
      label: "Market Analysis",
      color: "from-warning to-amber-500",
    },
    { icon: Zap, label: "Quick Post", color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <HRLayout>
      <div className="min-h-screen gradient-bg-primary p-4 md:p-8">
        <div className=" mx-auto">
          {/* Header with decorative elements */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 mb-8">
            <div className="decorative-gradient-blur-blue -top-20 -right-20" />
            <div className="decorative-gradient-blur-purple -bottom-20 -left-20" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="sidebar-logo-wrapper">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-primary">
                        Job Management Portal
                      </h1>
                      <p className="text-muted-foreground mt-2">
                        Upload bulk jobs or create individual listings with
                        AI-powered assistance
                      </p>
                    </div>
                  </div>
                </div>

                {/* <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-card-foreground border border-border hover:border-primary transition-all">
                    <Download className="h-4 w-4" />
                    Template
                  </button>
                </div> */}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="card-primary card-hover border-0 shadow-lg"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Action Buttons */}
              <div className="card-primary border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleUpload}
                      disabled={loading || !file}
                      className="flex-1 h-14 btn-gradient-primary text-lg font-medium"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <Upload className="w-5 h-5" />
                          <span>Upload Bulk Jobs</span>
                          <ArrowUpRight className="w-4 h-4 opacity-80" />
                        </div>
                      )}
                    </Button>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      variant="outline"
                      className="flex-1 h-14 border-primary text-primary hover:bg-primary/10 text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Job
                    </Button>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="card-primary border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        Upload Your Job Data
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Drag and drop or click to browse job files
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success"></div>
                      <span className="text-xs text-muted-foreground">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
                      dragActive
                        ? "border-primary bg-gradient-to-r from-primary/5 to-primary/10"
                        : file
                        ? "border-success bg-gradient-to-r from-success/5 to-success/10"
                        : "border-border hover:border-primary/50 bg-gradient-to-r from-transparent to-primary/5"
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

                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      {file ? (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-success/20 to-green-600/20 flex items-center justify-center mb-2">
                            {getFileIcon(file.name)}
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-foreground text-lg">
                                {file.name}
                              </p>
                              <CheckCircle className="w-5 h-5 text-success" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                              to upload
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                            <span className="text-xs text-success">
                              File validated
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mb-4">
                            <Cloud className="w-10 h-10 text-primary" />
                          </div>
                          <div className="mb-4">
                            <p className="font-bold text-foreground text-lg mb-1">
                              Choose a file or drag it here
                            </p>
                            <p className="text-sm text-muted-foreground">
                              CSV, Excel, ODT, or PDF files • Max 100MB
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            <span>Secure cloud processing</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Jobs List */}
              {uploadedJobs.length > 0 && (
                <div className="card-primary border-0 shadow-xl">
                  <div className="bg-gradient-to-r from-success/5 to-transparent border-b border-border p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="icon-wrapper-green">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            Uploaded Jobs
                          </h3>
                          <p className="text-muted-foreground mt-1">
                            {uploadedJobs.length} jobs successfully processed
                          </p>
                        </div>
                      </div>
                      <Badge className="badge-green">
                        {uploadedJobs.length} Jobs
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      {uploadedJobs.map((job, index) => (
                        <div
                          key={job.id}
                          className="flex items-center p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group"
                        >
                          <div className="icon-wrapper-blue mr-3">
                            <Briefcase className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {job.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {job.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-success/5 to-transparent">
                      <p className="text-center text-sm">
                        <span className="font-bold text-success">
                          {uploadedJobs.length}
                        </span>{" "}
                        job{uploadedJobs.length !== 1 ? "s" : ""} successfully
                        added to your listings
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* File Requirements */}
              <div className="card-primary border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Supported Formats
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="icon-wrapper-green">
                          <FileSpreadsheet className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Spreadsheets
                          </p>
                          <p className="text-xs text-muted-foreground">
                            .csv, .xlsx, .xls
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="icon-wrapper-blue">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Documents
                          </p>
                          <p className="text-xs text-muted-foreground">
                            .pdf, .odt
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="icon-wrapper-amber">
                          <Shield className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Security
                          </p>
                          <p className="text-xs text-muted-foreground">
                            256-bit encryption
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="icon-wrapper-purple">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            AI Processing
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Smart job parsing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Job Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600" />
                <DialogHeader className="pt-6">
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Create New Job
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Fill in the details to create a new job posting with AI
                    assistance
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="space-y-6 py-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="title"
                        className="flex items-center gap-2 mb-2"
                      >
                        <Target className="h-4 w-4 text-primary" />
                        Job Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Senior Software Engineer"
                        className="border-border/50 focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="mb-2">
                        Location
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Remote or Lahore, PK"
                        className="border-border/50 focus:border-primary"
                      />
                    </div>

                    <div>
                      <Label htmlFor="salary" className="mb-2">
                        Salary (Optional)
                      </Label>
                      <Input
                        id="salary"
                        name="salary"
                        type="number"
                        value={formData.salary}
                        onChange={handleInputChange}
                        placeholder="e.g., 50000"
                        className="border-border/50 focus:border-primary"
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
                        <SelectTrigger className="border-border/50">
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
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName" className="mb-2">
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g., Tech Innovators Inc."
                        className="border-border/50 focus:border-primary"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyAbout" className="mb-2">
                        About Company
                      </Label>
                      <Textarea
                        id="companyAbout"
                        name="companyAbout"
                        value={formData.companyAbout}
                        onChange={handleInputChange}
                        placeholder="Brief description of the company..."
                        rows={3}
                        className="border-border/50 focus:border-primary"
                      />
                    </div>

                    <div>
                      <Label htmlFor="skills" className="mb-2">
                        Skills (comma-separated)
                      </Label>
                      <Input
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="e.g., JavaScript, React, Node.js"
                        className="border-border/50 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="description"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      Job Description *
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateDescription}
                      disabled={!formData.title || generateLoading}
                      className="gap-2"
                    >
                      <Sparkles
                        className={`h-4 w-4 ${
                          generateLoading ? "animate-spin" : ""
                        }`}
                      />
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter job description or use AI to generate one..."
                    rows={6}
                    className="border-border/50 focus:border-primary"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Click the AI Generate button to create a professional job
                    description automatically
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-6 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-border hover:border-primary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateJob}
                  disabled={
                    !formData.title || !formData.description || createLoading
                  }
                  className="btn-gradient-primary"
                >
                  {createLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          <Dialog
            open={isPreviewModalOpen}
            onOpenChange={setIsPreviewModalOpen}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] border-0 shadow-2xl">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600" />
                <DialogHeader className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-foreground">
                        AI-Generated Description Preview
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Review the professionally crafted job description
                      </DialogDescription>
                    </div>
                    <div className="icon-wrapper-purple">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-6 rounded-xl border border-border bg-card mt-4">
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
                  <h2 className="text-2xl font-bold mb-2 text-foreground">
                    {formData.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>{formData.location || "Remote"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
                      <span>{formData.type.replace("_", " ")}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-warning"></div>
                      <span>
                        {formData.salary
                          ? `$${parseInt(formData.salary).toLocaleString()}`
                          : "Competitive Salary"}
                      </span>
                    </div>
                  </div>
                  {formData.companyName && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                      <span className="font-semibold text-foreground">
                        {formData.companyName}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="prose prose-sm max-w-none leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: processDescriptionForDisplay(
                      previewDescription
                    ).replace(/\n/g, "<br>"),
                  }}
                />
              </div>

              <DialogFooter className="mt-6 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="border-border hover:border-primary"
                >
                  Close Preview
                </Button>
                <Button
                  type="button"
                  onClick={handleUseDescription}
                  className="btn-gradient-primary"
                >
                  Use This Description
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  <span>Secure job uploads</span>
                </div>
                <span>•</span>
                <span>AI-powered descriptions</span>
                <span>•</span>
                <span>Instant processing</span>
              </div>
              {/* <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                Need Help? <ChevronRight className="h-3 w-3" />
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
