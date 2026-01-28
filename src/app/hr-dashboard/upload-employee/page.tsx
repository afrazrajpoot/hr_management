"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import HRLayout from "@/components/hr/HRLayout";
import { useSession } from "next-auth/react";
import {
  Upload,
  FileText,
  CheckCircle,
  Users,
  FileSpreadsheet,
  Cloud,
  Download,
  ArrowUpRight,
  Shield,
  Database,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function UploadEmployeesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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

    const formData = new FormData();
    formData.append("file", file);
    if (session?.user.id) {
      formData.append("hr_id", session.user.id);
    }

    try {
      setLoading(true);

      // Add Authorization header with FastAPI token from session
      const headers: Record<string, string> = {};

      if (session?.user?.fastApiToken) {
        headers["Authorization"] = `Bearer ${session.user.fastApiToken}`;
        console.log(
          "✅ Sending FastAPI token:",
          session.user.fastApiToken.substring(0, 30) + "..."
        );
      } else {
        console.log("⚠️ No FastAPI token found in session");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_URL}/employees/upload`,
        {
          method: "POST",
          headers: headers, // Add headers here
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      console.log(data, "my data");

      // Check if it's an error response
      if (data.error) {
        toast.error(data.details || data.error || "Upload failed");
      } else {
        toast.success(data?.details || "Successfully uploaded employees");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to upload employees");
    } finally {
      setLoading(false);
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
      value: "1000+",
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
      icon: Sparkles,
      label: "Smart Parse",
      value: "Auto",
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
      iconBg: "icon-info",
      textColor: "text-blue-600 dark:text-blue-400",
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
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                        Upload Employees
                      </h1>
                      <p className="text-purple-100 mt-2">
                        Bulk upload employee data with AI-powered processing and
                        validation
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
            {/* Upload Area - Main Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Card */}
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
                        Upload Your File
                      </h2>
                      <p className="text-subtle dark:text-subtle-dark mt-1">
                        Drag and drop or click to browse files
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
                      accept=".csv,.xls,.xlsx,.odt,.pdf"
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
                            <span>Secure cloud storage</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="w-full h-14 mt-6 btn-purple rounded-xl text-lg font-medium hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Upload...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <Upload className="w-5 h-5" />
                        <span>
                          {file
                            ? "Upload Employees Now"
                            : "Select File to Upload"}
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-80" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* File Requirements */}
              <div className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="p-6">
                  <h3 className="font-bold text-on-matte dark:text-on-matte mb-4 flex items-center gap-2">
                    <div className="icon-info bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                      <Database className="h-5 w-5" />
                    </div>
                    Supported Formats & Requirements
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
                            Smart data parsing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Debug info (optional - remove in production) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 rounded-lg bg-card border border-matte dark:border-matte">
              <h4 className="font-medium text-on-matte dark:text-on-matte mb-2">
                Debug Information
              </h4>
              <div className="text-xs text-subtle dark:text-subtle-dark space-y-1">
                <p>
                  Session status:{" "}
                  {session ? "✅ Authenticated" : "❌ Not authenticated"}
                </p>
                <p>
                  FastAPI token:{" "}
                  {session?.user?.fastApiToken
                    ? "✅ Available"
                    : "❌ Not available"}
                </p>
                {session?.user?.fastApiToken && (
                  <p className="truncate">
                    Token: {session.user.fastApiToken.substring(0, 30)}...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-matte dark:border-matte">
            <div className="flex items-center justify-between text-sm text-subtle dark:text-subtle-dark">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Secure upload</span>
                </div>
                <span>•</span>
                <span>AI-powered validation</span>
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