"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HRLayout } from "@/components/admin/layout/admin-layout";
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
  UserCheck,
  AlertCircle,
  UserPlus,
  Mail,
  Phone,
  Lock,
  User,
  Loader2,
  Info,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UploadUsersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState<string>("Employee");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualForm, setManualForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "Employee",
  });
  const { data: session } = useSession<any>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
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
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!role) {
      toast.error("Please select a role");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    try {
      setLoading(true);
      setUploadResult(null);

      const res = await fetch("/api/admin/upload-users", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setUploadResult(data);
      
      if (data.success > 0) {
        toast.success(
          `Successfully created ${data.success} user(s) with ${role} role`
        );
      }
      
      if (data.errors > 0) {
        toast.warning(
          `${data.errors} user(s) failed to create. Check details below.`
        );
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to upload users");
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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualForm.firstName || !manualForm.email) {
      toast.error("First name and email are required");
      return;
    }

    if (!manualForm.role || (manualForm.role !== "HR" && manualForm.role !== "Employee")) {
      toast.error("Please select a valid role");
      return;
    }

    try {
      setManualLoading(true);

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: manualForm.firstName,
          lastName: manualForm.lastName,
          email: manualForm.email,
          phoneNumber: manualForm.phoneNumber,
          password: manualForm.password || undefined, // Use default if empty
          role: manualForm.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      toast.success(`User ${data.user.email} created successfully with ${manualForm.role} role`);
      
      // Reset form
      setManualForm({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "Employee",
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setManualLoading(false);
    }
  };

  const quickStats = [
    {
      icon: Users,
      label: "Bulk Upload",
      value: "Unlimited",
      color: "from-primary to-purple-600",
    },
    {
      icon: Database,
      label: "Auto Processing",
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
    <HRLayout title="Upload Users" subtitle="Bulk upload users with role assignment">
      <div className="min-h-screen gradient-bg-primary p-4 md:p-8">
        <div className="mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 mb-8">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="sidebar-logo-wrapper">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-primary">
                        Upload Users
                      </h1>
                      <p className="text-muted-foreground mt-2">
                        Bulk upload users with role assignment (HR or Employee)
                      </p>
                    </div>
                  </div>
                </div>
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

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tabs for Upload/Manual */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "manual")} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Bulk Upload
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Manual Entry
                  </TabsTrigger>
                </TabsList>

                {/* Upload Tab */}
                <TabsContent value="upload" className="space-y-6">
                  <Card className="card-primary border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground">
                        Upload User File
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Select a role and upload your file (CSV, Excel)
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success"></div>
                      <span className="text-xs text-muted-foreground">
                        Ready
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-foreground">
                      Select Role for All Users
                    </Label>
                    <Select
                      value={role}
                      onValueChange={(value) => {
                        setRole(value);
                        setUploadResult(null);
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-11 bg-card border-input text-foreground">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-input">
                        <SelectItem value="Employee" className="select-dropdown-item">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Employee</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HR" className="select-dropdown-item">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <span>HR</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      All users in the uploaded file will be assigned the selected role
                    </p>
                  </div>

                  {/* File Upload Area */}
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
                      accept=".csv,.xls,.xlsx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={loading}
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
                              CSV, Excel files (.csv, .xlsx, .xls) • Max 100MB
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

                  {/* Upload Button */}
                  <Button
                    onClick={handleUpload}
                    disabled={loading || !file || !role}
                    className="w-full h-14 btn-gradient-primary text-lg font-medium"
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
                            ? `Upload Users as ${role}`
                            : "Select File to Upload"}
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-80" />
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Upload Results */}
              {uploadResult && (
                <Card className="card-primary border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Upload Results
                    </CardTitle>
                    <CardDescription>
                      {uploadResult.message}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <div className="text-2xl font-bold text-foreground">
                          {uploadResult.total}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Users
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-success/10">
                        <div className="text-2xl font-bold text-success">
                          {uploadResult.success}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created Successfully
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-destructive/10">
                        <div className="text-2xl font-bold text-destructive">
                          {uploadResult.errors}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Failed
                        </div>
                      </div>
                    </div>

                    {uploadResult.errors > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {uploadResult.results
                              .filter((r: any) => r.status === "error")
                              .slice(0, 10)
                              .map((result: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <strong>{result.email}:</strong> {result.message}
                                </div>
                              ))}
                            {uploadResult.results.filter((r: any) => r.status === "error").length > 10 && (
                              <div className="text-sm text-muted-foreground">
                                ... and {uploadResult.results.filter((r: any) => r.status === "error").length - 10} more errors
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

                  {/* File Requirements */}
                  <Card className="card-primary border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    File Format Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="icon-wrapper-green">
                          <FileSpreadsheet className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Supported Formats
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
                            Required Columns
                          </p>
                          <p className="text-xs text-muted-foreground">
                            email, firstName (required)
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
                            Optional Columns
                          </p>
                          <p className="text-xs text-muted-foreground">
                            lastName, phoneNumber, password
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="icon-wrapper-purple">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Auto Processing
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Smart column detection
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Column Name Variations Supported:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Email: email, e-mail, email address, mail</li>
                      <li>First Name: firstName, first name, firstname, name, fname</li>
                      <li>Last Name: lastName, last name, lastname, lname, surname</li>
                      <li>Phone: phone, phone number, phonenumber, mobile, contact</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
                </TabsContent>

                {/* Manual Entry Tab */}
                <TabsContent value="manual" className="space-y-6">
                  <Card className="card-primary border-0 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-foreground">
                            Add User Manually
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Create a single user with role assignment
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-success"></div>
                          <span className="text-xs text-muted-foreground">
                            Ready
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <form onSubmit={handleManualSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="manual-role" className="text-sm font-medium text-foreground">
                            Role <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={manualForm.role}
                            onValueChange={(value) =>
                              setManualForm((prev) => ({ ...prev, role: value }))
                            }
                            disabled={manualLoading}
                          >
                            <SelectTrigger className="h-11 bg-card border-input text-foreground">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-input">
                              <SelectItem value="Employee" className="select-dropdown-item">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>Employee</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="HR" className="select-dropdown-item">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4" />
                                  <span>HR</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* First Name */}
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                            First Name <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="firstName"
                              type="text"
                              placeholder="Enter first name"
                              value={manualForm.firstName}
                              onChange={(e) =>
                                setManualForm((prev) => ({ ...prev, firstName: e.target.value }))
                              }
                              className="pl-9 bg-card border-input text-foreground"
                              required
                              disabled={manualLoading}
                            />
                          </div>
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                            Last Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="lastName"
                              type="text"
                              placeholder="Enter last name"
                              value={manualForm.lastName}
                              onChange={(e) =>
                                setManualForm((prev) => ({ ...prev, lastName: e.target.value }))
                              }
                              className="pl-9 bg-card border-input text-foreground"
                              disabled={manualLoading}
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter email address"
                              value={manualForm.email}
                              onChange={(e) =>
                                setManualForm((prev) => ({ ...prev, email: e.target.value }))
                              }
                              className="pl-9 bg-card border-input text-foreground"
                              required
                              disabled={manualLoading}
                            />
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                            Phone Number
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phoneNumber"
                              type="tel"
                              placeholder="Enter phone number"
                              value={manualForm.phoneNumber}
                              onChange={(e) =>
                                setManualForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                              }
                              className="pl-9 bg-card border-input text-foreground"
                              disabled={manualLoading}
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium text-foreground">
                            Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              placeholder="Leave empty for default password (Pa$$w0rd!)"
                              value={manualForm.password}
                              onChange={(e) =>
                                setManualForm((prev) => ({ ...prev, password: e.target.value }))
                              }
                              className="pl-9 bg-card border-input text-foreground"
                              disabled={manualLoading}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            If left empty, default password will be: Pa$$w0rd!
                          </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={manualLoading || !manualForm.firstName || !manualForm.email}
                          className="w-full h-14 btn-gradient-primary text-lg font-medium"
                        >
                          {manualLoading ? (
                            <div className="flex items-center space-x-3">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Creating User...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-3">
                              <UserPlus className="w-5 h-5" />
                              <span>Create User as {manualForm.role}</span>
                              <ArrowUpRight className="w-4 h-4 opacity-80" />
                            </div>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Info Card */}
                  <Card className="card-primary border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Manual User Creation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">
                              Required Fields
                            </p>
                            <p className="text-xs text-muted-foreground">
                              First Name and Email are required
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <Shield className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">
                              Default Password
                            </p>
                            <p className="text-xs text-muted-foreground">
                              If password is not provided, default password "Pa$$w0rd!" will be used
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <UserCheck className="h-4 w-4 text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">
                              Role Assignment
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Select HR or Employee role for the user
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}

