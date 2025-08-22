
import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";

export interface Education {
  id: number;
  degree: string;
  institution: string;
  year: string;
  gpa: string;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface ResumeFile {
  name: string;
  size: string;
  type: string;
  uploadDate: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  hireDate: string;
  department: string;
  position: string;
  manager: string;
  employeeId: string;
  salary: string;
  bio: string;
  avatar: string;
  skills: string[]; // Array of strings for skills
  education: Education[];
  experience: Experience[];
  resume: ResumeFile | null;
}

export interface InputFieldConfig {
  label: string;
  icon: ComponentType<{ size?: number }>;
  field: keyof Employee | string;
  type?: string;
  isTextarea?: boolean;
}
