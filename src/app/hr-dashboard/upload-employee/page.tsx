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
      value: "1000+",
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
      icon: Sparkles,
      label: "Smart Parse",
      value: "Auto",
      color: "from-blue-500 to-cyan-500",
    },
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
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-primary">
                        Upload Employees
                      </h1>
                      <p className="text-muted-foreground mt-2">
                        Bulk upload employee data with AI-powered processing and
                        validation
                      </p>
                    </div>
                  </div>
                </div>

                {/* <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-card-foreground border border-border hover:border-primary transition-all">
                    <Download className="h-4 w-4" />
                    Download Template
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
            {/* Upload Area - Main Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Card */}
              <div className="card-primary border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        Upload Your File
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Drag and drop or click to browse files
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
                      accept=".csv,.xls,.xlsx,.odt,.pdf"
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
                            <span>Secure cloud storage</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="w-full h-14 mt-6 btn-gradient-primary text-lg font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-3">
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
                  </Button>
                </div>
              </div>

              {/* File Requirements */}
              <div className="card-primary border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Supported Formats & Requirements
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
            <div className="mt-6 p-4 rounded-lg bg-card border border-border">
              <h4 className="font-medium text-foreground mb-2">
                Debug Information
              </h4>
              <div className="text-xs text-muted-foreground space-y-1">
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
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  <span>Secure upload</span>
                </div>
                <span>•</span>
                <span>AI-powered validation</span>
                <span>•</span>
                <span>Instant processing</span>
              </div>
              <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                Need Help? <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
