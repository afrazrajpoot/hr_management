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
        return <FileSpreadsheet className="w-8 h-8 text-green-600 dark:text-green-400" />;
      case "pdf":
        return <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />;
      default:
        return <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />;
    }
  };

  // Quick stats
  const quickStats = [
    {
      icon: Users,
      label: "Bulk Upload",
      value: "100+",
      gradient: "bg-gradient-purple",
      iconBg: "icon-brand",
      textColor: "gradient-text-primary",
    },
    {
      icon: Database,
      label: "AI Processing",
      value: "Instant",
      gradient: "bg-gradient-to-r from-green-500 to-green-400",
      iconBg: "icon-success",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: Shield,
      label: "Secure",
      value: "256-bit",
      gradient: "bg-gradient-to-r from-amber-500 to-amber-400",
      iconBg: "icon-warning",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: Award,
      label: "Smart Parse",
      value: "Auto",
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
      iconBg: "icon-info",
      textColor: "text-blue-600 dark:text-blue-400",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      icon: Download,
      label: "Download Template",
      gradient: "bg-gradient-purple",
      iconBg: "icon-brand",
    },
    {
      icon: Target,
      label: "AI Job Generator",
      gradient: "bg-gradient-to-r from-green-500 to-green-400",
      iconBg: "icon-success",
    },
    {
      icon: BarChart3,
      label: "Market Analysis",
      gradient: "bg-gradient-to-r from-amber-500 to-amber-400",
      iconBg: "icon-warning",
    },
    {
      icon: Zap,
      label: "Quick Post",
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
      iconBg: "icon-info",
    },
  ];

  return (
    <HRLayout>
      <div className="min-h-screen bg-layout-purple p-4 md:p-8">
        <div className="mx-auto">
          {/* Header with decorative elements */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-purple p-8 mb-8 shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                        Job Management Portal
                      </h1>
                      <p className="text-purple-100 mt-2">
                        Upload bulk jobs or create individual listings with
                        AI-powered assistance
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats with Bubble Effects */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light"
              >
                {/* Bubble Effect */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-4 group-hover:scale-110 transition-transform duration-500 ${index === 0
                  ? "bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10"
                  : index === 1
                    ? "bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10"
                    : index === 2
                      ? "bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10"
                      : "bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10"
                  }`} />

                <div className="p-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-subtle dark:text-subtle-dark">
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
              <div className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleUpload}
                      disabled={loading || !file}
                      className="flex-1 h-14 btn-purple rounded-xl text-lg font-medium hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </button>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="flex-1 h-14 relative overflow-hidden group bg-white dark:bg-transparent border-2 border-purple-200 dark:border-purple-800 rounded-xl transition-all duration-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center justify-center space-x-2 text-lg font-medium text-purple-700 dark:text-purple-300 group-hover:text-purple-900 dark:group-hover:text-purple-100">
                        <Plus className="w-5 h-5" />
                        <span>Create Individual Job</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="card-purple relative overflow-hidden border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                {/* Purple gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-purple" />

                <div className="bg-gradient-to-r from-purple-500/5 to-transparent border-b border-matte dark:border-matte p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-on-matte dark:text-on-matte flex items-center gap-2">
                        <div className="icon-brand p-2 rounded-lg">
                          <Cloud className="h-5 w-5" />
                        </div>
                        Upload Your Job Data
                      </h2>
                      <p className="text-subtle dark:text-subtle-dark mt-1">
                        Drag and drop or click to browse job files
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-subtle dark:text-subtle-dark">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${dragActive
                      ? "border-purple-accent bg-gradient-to-r from-purple-500/5 to-purple-600/10 dark:from-purple-500/10 dark:to-purple-600/20"
                      : file
                        ? "border-green-500 bg-gradient-to-r from-green-500/5 to-green-600/10 dark:from-green-500/10 dark:to-green-600/20"
                        : "border-matte dark:border-matte hover:border-purple-accent bg-gradient-to-r from-transparent to-purple-500/5 dark:to-purple-600/10"
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
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 dark:from-green-500/30 dark:to-green-600/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                            {getFileIcon(file.name)}
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-on-matte dark:text-on-matte text-lg">
                                {file.name}
                              </p>
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-sm text-subtle dark:text-subtle-dark">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                              to upload
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-600 dark:text-green-400">
                              File validated
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 dark:from-purple-500/30 dark:to-purple-600/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Cloud className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="mb-4">
                            <p className="font-bold text-on-matte dark:text-on-matte text-lg mb-1">
                              Choose a file or drag it here
                            </p>
                            <p className="text-sm text-subtle dark:text-subtle-dark">
                              CSV, Excel, ODT, or PDF files • Max 100MB
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-subtle dark:text-subtle-dark">
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
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
                <div className="card-purple relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                  {/* Green gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-400" />

                  <div className="bg-gradient-to-r from-green-500/5 to-transparent border-b border-matte dark:border-matte p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="icon-success p-2 rounded-lg">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-on-matte dark:text-on-matte">
                            Uploaded Jobs
                          </h3>
                          <p className="text-subtle dark:text-subtle-dark mt-1">
                            {uploadedJobs.length} jobs successfully processed
                          </p>
                        </div>
                      </div>
                      <Badge className="badge-success">
                        {uploadedJobs.length} Jobs
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      {uploadedJobs.map((job, index) => (
                        <div
                          key={job.id}
                          className="flex items-center p-4 border border-matte dark:border-matte rounded-lg hover:bg-gray-50/50 dark:hover:bg-matte-gray-subtle/30 transition-colors group"
                        >
                          <div className="icon-info mr-3">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-on-matte dark:text-on-matte group-hover:text-purple-accent transition-colors">
                              {job.title}
                            </p>
                            <p className="text-sm text-subtle dark:text-subtle-dark">
                              ID: {job.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <ChevronRight className="w-4 h-4 text-subtle dark:text-subtle-dark opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/20">
                      <p className="text-center text-sm text-on-matte dark:text-on-matte">
                        <span className="font-bold text-green-600 dark:text-green-400">
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
              <div className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="p-6">
                  <h3 className="font-bold text-on-matte dark:text-on-matte mb-4 flex items-center gap-2">
                    <div className="icon-info bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                      <Database className="h-5 w-5" />
                    </div>
                    Supported Formats
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-colors">
                        <div className="icon-success bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                          <FileSpreadsheet className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Spreadsheets
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            .csv, .xlsx, .xls
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
                        <div className="icon-info bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Documents
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            .pdf, .odt
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors">
                        <div className="icon-warning bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Security
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            256-bit encryption
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors">
                        <div className="icon-brand bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            AI Processing
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white dark:bg-matte-gray-medium">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-purple" />
                <DialogHeader className="pt-8 px-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-accent">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-gradient-purple">
                        Create New Job
                      </DialogTitle>
                      <DialogDescription className="text-base text-gray-500 dark:text-gray-400">
                        Fill in the details to create a new job posting with AI assistance
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="space-y-6 py-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="title"
                        className="flex items-center gap-2 mb-2 text-on-matte dark:text-on-matte"
                      >
                        <Target className="h-4 w-4 text-purple-accent" />
                        Job Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="h-12 input-purple border-matte dark:border-matte"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="mb-2 text-on-matte dark:text-on-matte">
                        Location
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Remote or Lahore, PK"
                        className="h-12 input-purple border-matte dark:border-matte"
                      />
                    </div>

                    <div>
                      <Label htmlFor="salary" className="mb-2 text-on-matte dark:text-on-matte">
                        Salary (Optional)
                      </Label>
                      <Input
                        id="salary"
                        name="salary"
                        type="number"
                        value={formData.salary}
                        onChange={handleInputChange}
                        placeholder="e.g., 50000"
                        className="h-12 input-purple border-matte dark:border-matte"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type" className="mb-2 text-on-matte dark:text-on-matte">
                        Job Type
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger className="h-12 input-purple border-matte dark:border-matte">
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
                      <Label htmlFor="companyName" className="mb-2 text-on-matte dark:text-on-matte">
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g., Tech Innovators Inc."
                        className="h-12 input-purple border-matte dark:border-matte"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyAbout" className="mb-2 text-on-matte dark:text-on-matte">
                        About Company
                      </Label>
                      <Textarea
                        id="companyAbout"
                        name="companyAbout"
                        value={formData.companyAbout}
                        onChange={handleInputChange}
                        placeholder="Brief description of the company..."
                        rows={3}
                        className="min-h-[5rem] input-purple border-matte dark:border-matte"
                      />
                    </div>

                    <div>
                      <Label htmlFor="skills" className="mb-2 text-on-matte dark:text-on-matte">
                        Skills (comma-separated)
                      </Label>
                      <Input
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="e.g., JavaScript, React, Node.js"
                        className="h-12 input-purple border-matte dark:border-matte"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="description"
                      className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                    >
                      <FileText className="h-4 w-4 text-purple-accent" />
                      Job Description *
                    </Label>
                    <button
                      type="button"
                      onClick={generateDescription}
                      disabled={!formData.title || generateLoading}
                      className="btn-purple-outline flex items-center gap-2 px-3 py-1.5 text-sm hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles
                        className={`h-4 w-4 ${generateLoading ? "animate-spin" : ""
                          }`}
                      />
                      AI Generate
                    </button>
                  </div>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter job description or use AI to generate one..."
                    rows={6}
                    className="input-purple border-matte dark:border-matte"
                    required
                  />
                  <p className="text-xs text-subtle dark:text-subtle-dark">
                    Click the AI Generate button to create a professional job
                    description automatically
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  disabled={
                    !formData.title || !formData.description || createLoading
                  }
                  className="btn-purple px-4 py-2 text-sm rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Job...</span>
                    </div>
                  ) : (
                    "Create Job"
                  )}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Preview Description Modal */}
          <Dialog
            open={isPreviewModalOpen}
            onOpenChange={setIsPreviewModalOpen}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] border-0 shadow-2xl bg-white dark:bg-matte-gray-medium">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-purple" />
                <DialogHeader className="pt-8 px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-300 dark:to-blue-300 bg-clip-text text-transparent">
                          AI-Generated Preview
                        </DialogTitle>
                        <DialogDescription className="text-base text-gray-500 dark:text-gray-400">
                          Review the professionally crafted job description
                        </DialogDescription>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-6 rounded-xl border border-matte dark:border-matte bg-white dark:bg-matte-gray-medium mt-4">
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/20">
                  <h2 className="text-2xl font-bold mb-2 text-on-matte dark:text-on-matte">
                    {formData.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-subtle dark:text-subtle-dark">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                      <span>{formData.location || "Remote"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span>{formData.type.replace("_", " ")}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
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
                      <span className="font-semibold text-on-matte dark:text-on-matte">
                        {formData.companyName}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="prose prose-sm max-w-none leading-relaxed text-on-matte dark:text-on-matte"
                  dangerouslySetInnerHTML={{
                    __html: processDescriptionForDisplay(
                      previewDescription
                    ).replace(/\n/g, "<br>"),
                  }}
                />
              </div>

              <DialogFooter className="mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="btn-purple-outline px-4 py-2 text-sm rounded-lg hover:scale-105 transition-all duration-200"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={handleUseDescription}
                  className="btn-purple px-4 py-2 text-sm rounded-lg hover:shadow-xl transition-all duration-300"
                >
                  Use This Description
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-matte dark:border-matte">
            <div className="flex items-center justify-between text-sm text-subtle dark:text-subtle-dark">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Secure job uploads</span>
                </div>
                <span>•</span>
                <span>AI-powered descriptions</span>
                <span>•</span>
                <span>Instant processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}