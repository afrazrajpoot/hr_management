"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import HRLayout from "@/components/hr/HRLayout";
import { useSession } from "next-auth/react";

export default function UploadJobsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedJobs, setUploadedJobs] = useState<any[]>([]);
  const { data: session } = useSession<any>();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("recruiter_id", session?.user.id); // replace dynamically if needed

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/jobs/upload", {
        method: "POST",
        body: formData,
      });

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

  return (
    <HRLayout>
      <div className="p-8">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Upload Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file">Select File (CSV, XLSX, ODT, PDF)</Label>
              <Input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept=".csv,.xls,.xlsx,.odt,.pdf"
              />
            </div>
            <Button onClick={handleUpload} disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
            {uploadedJobs.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold">Uploaded Jobs:</h3>
                <ul className="list-disc ml-5">
                  {uploadedJobs.map((job) => (
                    <li key={job.id}>{job.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
