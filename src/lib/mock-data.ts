// Mock data for HR Dashboard

export interface Company {
  id: string
  name: string
  industry: string
  employeeCount: number
  assessmentsCompleted: number
  retentionRisk: number
  logo?: string
}

export interface Employee {
  id: string
  name: string
  email: string
  position: string
  department: string
  salary: number
  joinDate: string
  riskLevel: 'low' | 'medium' | 'high'
  assessmentStatus: 'completed' | 'pending' | 'not-started'
  companyId: string
}

export interface Assessment {
  id: string
  employeeId: string
  employeeName: string
  title: string
  submissionDate: string
  status: 'completed' | 'in-progress' | 'pending'
  score: number
  companyId: string
}

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    employeeCount: 245,
    assessmentsCompleted: 189,
    retentionRisk: 15
  },
  {
    id: '2',
    name: 'FinanceFirst Ltd',
    industry: 'Finance',
    employeeCount: 156,
    assessmentsCompleted: 142,
    retentionRisk: 8
  },
  {
    id: '3',
    name: 'HealthPlus Medical',
    industry: 'Healthcare',
    employeeCount: 89,
    assessmentsCompleted: 76,
    retentionRisk: 22
  },
  {
    id: '4',
    name: 'EduTech Innovations',
    industry: 'Education',
    employeeCount: 67,
    assessmentsCompleted: 58,
    retentionRisk: 12
  },
  {
    id: '5',
    name: 'RetailMax Group',
    industry: 'Retail',
    employeeCount: 234,
    assessmentsCompleted: 198,
    retentionRisk: 18
  }
]

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    salary: 95000,
    joinDate: '2022-03-15',
    riskLevel: 'low',
    assessmentStatus: 'completed',
    companyId: '1'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@techcorp.com',
    position: 'Product Manager',
    department: 'Product',
    salary: 110000,
    joinDate: '2021-08-22',
    riskLevel: 'medium',
    assessmentStatus: 'completed',
    companyId: '1'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@financefirst.com',
    position: 'Financial Analyst',
    department: 'Finance',
    salary: 72000,
    joinDate: '2023-01-10',
    riskLevel: 'high',
    assessmentStatus: 'pending',
    companyId: '2'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@healthplus.com',
    position: 'Nurse Practitioner',
    department: 'Medical',
    salary: 85000,
    joinDate: '2022-09-05',
    riskLevel: 'low',
    assessmentStatus: 'completed',
    companyId: '3'
  },
  {
    id: '5',
    name: 'Jessica Brown',
    email: 'jessica.brown@edutech.com',
    position: 'Curriculum Designer',
    department: 'Education',
    salary: 68000,
    joinDate: '2023-04-12',
    riskLevel: 'medium',
    assessmentStatus: 'completed',
    companyId: '4'
  }
]

export const mockAssessments: Assessment[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    title: 'Software Engineering Career Path Assessment',
    submissionDate: '2024-01-15',
    status: 'completed',
    score: 87,
    companyId: '1'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Michael Chen',
    title: 'Leadership and Management Assessment',
    submissionDate: '2024-01-18',
    status: 'completed',
    score: 92,
    companyId: '1'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Emily Rodriguez',
    title: 'Financial Analysis Career Assessment',
    submissionDate: '2024-01-10',
    status: 'in-progress',
    score: 0,
    companyId: '2'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'David Kim',
    title: 'Healthcare Professional Assessment',
    submissionDate: '2024-01-20',
    status: 'completed',
    score: 94,
    companyId: '3'
  },
  {
    id: '5',
    employeeId: '5',
    employeeName: 'Jessica Brown',
    title: 'Educational Leadership Assessment',
    submissionDate: '2024-01-22',
    status: 'completed',
    score: 89,
    companyId: '4'
  }
]

// Chart data for dashboard
export const companiesOverviewData = [
  { name: 'Jan', companies: 4, employees: 678 },
  { name: 'Feb', companies: 5, employees: 721 },
  { name: 'Mar', companies: 5, employees: 735 },
  { name: 'Apr', companies: 5, employees: 758 },
  { name: 'May', companies: 5, employees: 791 }
]

export const retentionRiskData = [
  { name: 'Low Risk', value: 65, color: '#10b981' },
  { name: 'Medium Risk', value: 25, color: '#f59e0b' },
  { name: 'High Risk', value: 10, color: '#ef4444' }
]

export const assessmentCompletionData = [
  { company: 'TechCorp', completed: 189, total: 245 },
  { company: 'FinanceFirst', completed: 142, total: 156 },
  { company: 'HealthPlus', completed: 76, total: 89 },
  { company: 'EduTech', completed: 58, total: 67 },
  { company: 'RetailMax', completed: 198, total: 234 }
]

export const mobilityData = [
  { month: 'Jan', promotions: 12, transfers: 5, exits: 8 },
  { month: 'Feb', promotions: 15, transfers: 7, exits: 6 },
  { month: 'Mar', promotions: 18, transfers: 9, exits: 12 },
  { month: 'Apr', promotions: 14, transfers: 6, exits: 9 },
  { month: 'May', promotions: 20, transfers: 11, exits: 7 }
]