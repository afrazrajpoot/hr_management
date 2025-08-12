"use client";
import { useState } from "react";
// import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  TrendingUp,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Filter,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";

// Mock career data
const careerRecommendations = [
  {
    id: 1,
    title: "Data Analyst",
    industry: "Technology",
    matchScore: 88,
    salaryRange: "$65,000 - $95,000",
    location: "Remote/On-site",
    experience: "2-4 years",
    trending: true,
    saved: false,
    description:
      "Analyze complex data sets to help organizations make informed business decisions.",
    skills: ["Python", "SQL", "Data Visualization", "Statistics"],
    companies: ["Google", "Microsoft", "Amazon", "Meta"],
  },
  {
    id: 2,
    title: "UX Designer",
    industry: "Design",
    matchScore: 82,
    salaryRange: "$70,000 - $105,000",
    location: "San Francisco, CA",
    experience: "3-5 years",
    trending: true,
    saved: true,
    description:
      "Create intuitive and engaging user experiences for digital products.",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    companies: ["Apple", "Airbnb", "Spotify", "Adobe"],
  },
  {
    id: 3,
    title: "Product Manager",
    industry: "Business",
    matchScore: 75,
    salaryRange: "$90,000 - $140,000",
    location: "New York, NY",
    experience: "4-6 years",
    trending: false,
    saved: false,
    description:
      "Drive product strategy and work with cross-functional teams to deliver solutions.",
    skills: [
      "Product Strategy",
      "Analytics",
      "Agile",
      "Stakeholder Management",
    ],
    companies: ["Tesla", "Netflix", "Uber", "LinkedIn"],
  },
  {
    id: 4,
    title: "Software Engineer",
    industry: "Technology",
    matchScore: 79,
    salaryRange: "$80,000 - $120,000",
    location: "Austin, TX",
    experience: "2-5 years",
    trending: true,
    saved: false,
    description: "Build and maintain software applications and systems.",
    skills: ["JavaScript", "React", "Node.js", "Python"],
    companies: ["Slack", "Dropbox", "GitHub", "Zoom"],
  },
  {
    id: 5,
    title: "Marketing Specialist",
    industry: "Marketing",
    matchScore: 71,
    salaryRange: "$55,000 - $75,000",
    location: "Chicago, IL",
    experience: "1-3 years",
    trending: false,
    saved: true,
    description:
      "Develop and execute marketing campaigns to promote products and services.",
    skills: ["Digital Marketing", "Content Creation", "Analytics", "SEO"],
    companies: ["HubSpot", "Mailchimp", "Shopify", "Canva"],
  },
  {
    id: 6,
    title: "Business Analyst",
    industry: "Consulting",
    matchScore: 77,
    salaryRange: "$70,000 - $95,000",
    location: "Boston, MA",
    experience: "2-4 years",
    trending: false,
    saved: false,
    description:
      "Analyze business processes and recommend improvements for efficiency.",
    skills: ["Business Analysis", "Process Mapping", "SQL", "Excel"],
    companies: ["McKinsey", "Deloitte", "PwC", "KPMG"],
  },
];

const industries = [
  "All",
  "Technology",
  "Design",
  "Business",
  "Marketing",
  "Consulting",
];
const experienceLevels = ["All", "Entry Level", "Mid Level", "Senior Level"];

export default function CareerPathways() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [savedJobs, setSavedJobs] = useState<number[]>([2, 5]);

  const toggleSaved = (jobId: number) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const filteredCareers = careerRecommendations.filter((career) => {
    const matchesSearch =
      career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      career.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry =
      selectedIndustry === "All" || career.industry === selectedIndustry;
    const matchesExperience =
      selectedExperience === "All" ||
      career.experience.includes(
        selectedExperience.replace(" Level", "").toLowerCase()
      );

    return matchesSearch && matchesIndustry && matchesExperience;
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Career Pathways</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered career recommendations based on your Genius Factor
              profile
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search career titles, companies, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={selectedIndustry}
                onValueChange={setSelectedIndustry}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedExperience}
                onValueChange={setSelectedExperience}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredCareers.length} career matches
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select defaultValue="match">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Match Score</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Career Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCareers.map((career) => (
            <Card key={career.id} className="card-interactive group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-xl">{career.title}</CardTitle>
                      {career.trending && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{career.industry}</span>
                      <span>•</span>
                      <span>{career.experience}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {career.matchScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Match</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSaved(career.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          savedJobs.includes(career.id)
                            ? "fill-current text-primary"
                            : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {career.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{career.salaryRange}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{career.location}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Key Skills:</div>
                  <div className="flex flex-wrap gap-2">
                    {career.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Top Companies:</div>
                  <div className="flex flex-wrap gap-2">
                    {career.companies.slice(0, 3).map((company, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {company}
                      </Badge>
                    ))}
                    {career.companies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{career.companies.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline" size="sm">
                    View Details
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                  <Button size="sm" className="btn-gradient">
                    Explore Path
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredCareers.length > 0 && (
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Recommendations
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
