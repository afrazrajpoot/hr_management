
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from "lucide-react";
import { InputFieldConfig } from "../../types/profileTypes";
// import { InputFieldConfig } from "./types";

export const personalInfoFields: InputFieldConfig[] = [
  { label: "First Name", icon: User, field: "firstName" },
  { label: "Last Name", icon: User, field: "lastName" },
  { label: "Email", icon: Mail, field: "email", type: "email" },
  { label: "Phone", icon: Phone, field: "phone", type: "tel" },
  { label: "Date of Birth", icon: Calendar, field: "dateOfBirth", type: "date" },
  { label: "Address", icon: MapPin, field: "address" },
  { label: "Bio", icon: User, field: "bio", isTextarea: true },
];

export const employmentFields: InputFieldConfig[] = [
  { label: "Position", icon: Briefcase, field: "position" },
  { label: "Department", icon: Briefcase, field: "department" },
  { label: "Manager", icon: User, field: "manager" },
  { label: "Hire Date", icon: Calendar, field: "hireDate", type: "date" },
];

export const skillFields: InputFieldConfig[] = [
  { label: "Skill", icon: User, field: "skill", type: "text" },
];

export const experienceFields: InputFieldConfig[] = [
  { label: "Company", icon: Briefcase, field: "company", type: "text" },
  { label: "Position", icon: Briefcase, field: "position", type: "text" },
  { label: "Duration", icon: Calendar, field: "duration", type: "text" },
  { label: "Description", icon: User, field: "description", isTextarea: true },
];