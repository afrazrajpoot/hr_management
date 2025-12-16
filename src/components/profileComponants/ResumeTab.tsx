import React, { ChangeEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Edit, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { Employee } from "../../../types/profileTypes";
// import { Employee } from "./types";

interface ResumeTabProps {
  formData: Employee;
  handleResumeUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ResumeTab: React.FC<ResumeTabProps> = ({
  formData,
  handleResumeUpload,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    }}
    initial="hidden"
    animate="visible"
  >
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Resume Management</CardTitle>
            <CardDescription>Upload and manage your resume</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={onSave}
                  className="btn-gradient-primary"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="border-input"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={onEdit}
                className="btn-gradient-primary"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          className="border-2 border-dashed rounded-lg p-8 text-center"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Upload size={48} className="mx-auto opacity-60 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Resume</h3>
          <p className="opacity-70 mb-4">
            Drag and drop your resume file here, or click to select
          </p>
          <label className="cursor-pointer">
            <Button variant="outline">Choose File</Button>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </label>
          <p className="text-sm opacity-60 mt-2">
            Supported formats: PDF, DOC, DOCX
          </p>
        </motion.div>
        {formData.resume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg border">
                      <Download size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{formData.resume.name}</h4>
                      <p className="text-sm opacity-60">
                        {formData.resume.size} • Uploaded on{" "}
                        {formData.resume.uploadDate}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Download
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default ResumeTab;
