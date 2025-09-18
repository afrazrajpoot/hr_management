import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Cake,
  Briefcase,
  Clock,
  BookOpen,
  Award,
  File,
} from "lucide-react";

export default function EmployeeDetailModal({
  employee,
  isOpen,
  onClose,
}: any) {
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>
            Complete information for {employee.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{employee.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">
                  {employee.email || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {employee.phoneNumber || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Cake className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {employee.dateOfBirth
                    ? new Date(employee.dateOfBirth).toLocaleDateString()
                    : "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {employee.address || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">
                  {employee.position || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Hire Date</p>
                <p className="font-medium">
                  {employee.hireDate
                    ? new Date(employee.hireDate).toLocaleDateString()
                    : "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Manager</p>
                <p className="font-medium">
                  {employee.manager || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Department */}
          {employee.department && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Department(s)</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(employee.department) ? (
                  employee.department.map((dept: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {dept}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">{employee.department}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Bio */}
          {employee.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground">{employee.bio}</p>
            </div>
          )}

          {/* Skills */}
          {employee.skills && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(employee.skills) ? (
                  employee.skills.map((skill: any, index: number) =>
                    typeof skill === "string" ? (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ) : (
                      <Badge key={index} variant="outline">
                        {skill.name} ({skill.proficiency})
                      </Badge>
                    )
                  )
                ) : (
                  <p className="text-muted-foreground">
                    {JSON.stringify(employee.skills)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {employee.education && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                <BookOpen className="h-5 w-5 inline mr-2" />
                Education
              </h3>
              <div className="space-y-2">
                {Array.isArray(employee.education) ? (
                  employee.education.map((edu: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">{edu.degree || "Education"}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.institution}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {edu.year}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    {JSON.stringify(employee.education)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Experience */}
          {employee.experience && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                <Award className="h-5 w-5 inline mr-2" />
                Experience
              </h3>
              <div className="space-y-2">
                {Array.isArray(employee.experience) ? (
                  employee.experience.map((exp: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">
                        {exp.position || "Position"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exp.duration}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    {JSON.stringify(employee.experience)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Resume */}
          {employee.resume && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                <File className="h-5 w-5 inline mr-2" />
                Resume
              </h3>
              <Button variant="outline" asChild>
                <a
                  href={employee.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Resume
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
