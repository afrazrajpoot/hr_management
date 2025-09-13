"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import HRLayout from "@/components/hr/HRLayout";
import { useSession } from "next-auth/react";
import {
  Upload,
  FileText,
  CheckCircle,
  Users,
  FileSpreadsheet,
} from "lucide-react";

export default function UploadEmployeesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // const [uploadedEmployees, setUploadedEmployees] = useState<any[]>([]);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      // setUploadedEmployees();
      toast.success(`Uploaded ${data.inserted} employees successfully!`);
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
        return <FileSpreadsheet className="w-6 h-6 text-green-400" />;
      case "pdf":
        return <FileText className="w-6 h-6 text-red-400" />;
      default:
        return <FileText className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <HRLayout>
      <div className="p-8 max-w-2xl mx-auto ">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold">Upload Employees</h1>
          </div>
          <p className="text-muted-foreground">
            Upload your employee data in CSV, Excel, ODT, or PDF format
          </p>
        </div>

        {/* Upload Area */}
        <div className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
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
              accept=".csv,.xls,.xlsx,.odt,.pdf"
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

          <Button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full h-12"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Employees</span>
              </div>
            )}
          </Button>
        </div>
        {/* Help Text */}
        <div className="mt-8 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-medium mb-2">Supported file formats:</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• CSV files with employee data</p>
            <p>• Excel spreadsheets (.xlsx, .xls)</p>
            <p>• OpenDocument text files (.odt)</p>
            <p>• PDF documents</p>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
