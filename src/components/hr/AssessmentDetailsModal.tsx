import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  TrendingUp,
  Zap,
  Lightbulb,
  Users,
  BookOpen,
  Brain,
  Calendar,
  Shield,
  Award,
  X,
  Sparkles,
  Heart,
  Star,
  MapPin,
  ArrowRight,
  Bookmark,
  Flag,
  Coffee,
  TargetIcon,
  Cpu,
  PieChart,
  LineChart,
  BrainCircuit,
  Rocket,
  Gem,
  Crown,
  Trophy,
  Medal,
  TrendingUpIcon
} from "lucide-react";

const AssessmentDetailsModal = ({ assessment, isOpen, onClose }: any) => {
  if (!assessment) return null;

  // Extract relevant paths for clarity - adapted to the passed structure
  const report = assessment.report || {};
  const geniusFactorProfile = assessment.geniusFactorProfile || report.geniusFactorProfileJson || {};
  const currentRoleAlignment = assessment.currentRoleAlignment || report.currentRoleAlignmentAnalysisJson || {};
  const careerOpportunities = assessment.careerOpportunities || report.internalCareerOpportunitiesJson || {};
  const retentionStrategies = assessment.retentionStrategies || report.retentionAndMobilityStrategiesJson || {};
  const developmentPlan = assessment.developmentPlan || report.developmentActionPlanJson || {};
  const personalizedResources = assessment.personalizedResources || report.personalizedResourcesJson || {};
  const dataSources = assessment.dataSources || report.dataSourcesAndMethodologyJson || {};

  // Format full name from passed structure
  const fullName = assessment.employee || '';
  // Format position and department (handling arrays or strings)
  const position = Array.isArray(assessment.position) ? assessment.position[assessment.position.length - 1] : assessment.position;
  const department = Array.isArray(assessment.department) ? assessment.department[assessment.department.length - 1] : assessment.department;
  // Avatar fallback
  const avatarInitial = assessment.avatar || assessment.firstName?.charAt(0)?.toUpperCase() || '?';

  // Status and completion based on passed data
  const status = assessment.status || "Completed";
  const completionRate = assessment.completionRate || 100;
  const geniusFactorScore = assessment.genius_factor_score || assessment.geniusScore || report.geniusFactorScore || 0;
  const dateCompleted = assessment.dateCompleted ? new Date(assessment.dateCompleted).toLocaleDateString() : new Date(report.createdAt || Date.now()).toLocaleDateString();

  // Format learning resources as strings
  const formattedLearningResources = personalizedResources.learning_resources?.map((res: any) => {
    if (res.type === "Book") {
      return `${res.type}: "${res.title}" by ${res.author}`;
    }
    return `${res.type}: "${res.title}" on ${res.provider}`;
  }) || [];

  // Format networking strategy as flattened array of strings
  const formattedNetworkingStrategy = [
    ...(developmentPlan.networking_strategy?.["Join professional groups"] || []),
    ...(developmentPlan.networking_strategy?.["Attend industry conferences"] || []),
    ...(developmentPlan.networking_strategy?.["Engage on professional platforms"] || [])
  ].map((item: string) => `• ${item}`);

  // For career pathways, adapt from role_suggestions (group by timeline or flatten)
  // Since no object structure, we'll flatten role suggestions for now
  const roleSuggestions = careerOpportunities.role_suggestions?.map((role: any) => 
    `${role.role_title} (${role.department} - ${role.timeline}) - Match: ${role.match_score}%`
  ) || [];

  // For required skill development, flatten from role_suggestions
  const requiredSkills = careerOpportunities.role_suggestions?.reduce((acc: string[], role: any) => {
    return [...acc, ...role.required_skills];
  }, []) || [];

  // Retention risk level derivation (simple based on alignment_score for now)
  const retentionRiskLevel = currentRoleAlignment.alignment_score < 70 ? "High" : currentRoleAlignment.alignment_score < 85 ? "Medium" : "Low";

  // Current role assessment description (use executiveSummary or derive)
  const roleAssessmentDescription = assessment.executiveSummary || report.executiveSummary || "Analysis of how your current role aligns with your genius factors.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto rounded-xl p-0 border-2 border-border bg-card shadow-2xl scrollbar-hide">
        {/* Header Section */}
        <DialogHeader className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 rounded-t-xl border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg border-2 border-primary/20">
                  <User className="w-10 h-10 text-primary-foreground" />
                  <div className="absolute -top-1 -right-1 bg-primary p-1.5 rounded-full border-2 border-card">
                    <Trophy className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-3xl font-bold text-card-foreground mb-2 flex items-center gap-3">
                  <span>{fullName}</span>
                  <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Genius Profile
                  </span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{position}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{department}</span>
                    </div>
                  </div>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Section */}
        <div className="p-8 space-y-8">
          {/* Assessment Summary */}
          <Card className="card-primary card-hover border border-border">
            <CardHeader className="border-b border-border p-6">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper-blue">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-card-foreground">
                    Assessment Overview
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Complete assessment insights and progress tracking
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-5 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {status === "Completed" ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                      Status
                    </div>
                  </div>
                  <div className="text-lg font-bold text-card-foreground">{status}</div>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                      Completion
                    </div>
                  </div>
                  <div className="text-lg font-bold text-card-foreground">
                    {completionRate}%
                  </div>
                </div>

                {status === "Completed" && (
                  <>
                    <div className="p-5 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-xs uppercase tracking-wide font-semibold text-primary">
                          Genius Score
                        </div>
                      </div>
                      <div className="text-2xl font-bold gradient-text-primary">
                        {geniusFactorScore}/100
                      </div>
                    </div>

                    <div className="p-5 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="text-lg font-bold text-card-foreground">
                        {dateCompleted}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-6 rounded-lg border border-border bg-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                    Executive Summary
                  </div>
                </div>
                <p className="text-card-foreground leading-relaxed">
                  {assessment.executiveSummary || report.executiveSummary}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Genius Factor Profile */}
          {status === "Completed" && (
            <Card className="card-primary card-hover border border-border">
              <CardHeader className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-purple">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">
                      Genius Factor Profile
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your unique cognitive strengths and natural talents
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <Crown className="w-5 h-5 text-warning" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Primary Genius Factor
                        </div>
                      </div>
                      <p className="text-xl font-bold text-card-foreground mb-4">
                        {geniusFactorProfile.primary_genius_factor}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {geniusFactorProfile.description}
                      </p>
                    </div>

                    {geniusFactorProfile.secondary_genius_factor && geniusFactorProfile.secondary_genius_factor !== 'None Identified' && (
                      <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                          <Gem className="w-5 h-5 text-muted-foreground" />
                          <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                            Secondary Genius Factor
                          </div>
                        </div>
                        <div className="text-lg font-bold text-card-foreground mb-3">
                          {geniusFactorProfile.secondary_genius_factor}
                        </div>
                        {geniusFactorProfile.secondary_description && (
                          <p className="text-muted-foreground leading-relaxed">
                            {geniusFactorProfile.secondary_description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-5 h-5 text-warning" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Key Strengths
                        </div>
                      </div>
                      <div className="space-y-3">
                        {geniusFactorProfile.key_strengths?.map(
                          (strength: string, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <span className="text-card-foreground">{strength}</span>
                            </div>
                          )
                        ) || []}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <Coffee className="w-5 h-5 text-success" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Energy Sources
                        </div>
                      </div>
                      <div className="space-y-3">
                        {geniusFactorProfile.energy_sources?.map(
                          (source: string, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <span className="text-card-foreground">{source}</span>
                            </div>
                          )
                        ) || []}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Role Alignment */}
          {status === "Completed" && (
            <Card className="card-primary card-hover border border-border">
              <CardHeader className="border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-green">
                    <TargetIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">
                      Current Role Alignment
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      How well your current role matches your genius factor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-secondary/30">
                      <div className="flex items-center gap-3 mb-3">
                        <PieChart className="w-5 h-5 text-primary" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Assessment Overview
                        </div>
                      </div>
                      <p className="text-card-foreground leading-relaxed">
                        {roleAssessmentDescription}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                          <TrendingUpIcon className="w-5 h-5 text-success" />
                          <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                            Strengths Utilized
                          </div>
                        </div>
                        <div className="space-y-2">
                          {currentRoleAlignment.strengths_utilized?.map(
                            (strength: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                <span className="text-sm text-card-foreground">{strength}</span>
                              </div>
                            )
                          ) || []}
                        </div>
                      </div>

                      <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                          <Lightbulb className="w-5 h-5 text-warning" />
                          <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                            Underutilized Talents
                          </div>
                        </div>
                        <div className="space-y-2">
                          {currentRoleAlignment.underutilized_talents?.map(
                            (talent: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                                <span className="text-sm text-card-foreground">{talent}</span>
                              </div>
                            )
                          ) || []}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <LineChart className="w-5 h-5 text-primary" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-primary">
                          Alignment Score
                        </div>
                      </div>
                      <div className="text-4xl font-bold gradient-text-primary mb-4">
                        {currentRoleAlignment.alignment_score || 0}%
                      </div>
                      <div className="w-full rounded-full h-3 bg-muted">
                        <div
                          className="h-3 rounded-full progress-bar-primary transition-all duration-300"
                          style={{
                            width: `${currentRoleAlignment.alignment_score || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-5 h-5 text-destructive" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Retention Risk Level
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        retentionRiskLevel === "High" ? "text-destructive" :
                        retentionRiskLevel === "Medium" ? "text-warning" :
                        "text-success"
                      }`}>
                        {retentionRiskLevel}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Career Opportunities */}
          {status === "Completed" && (
            <Card className="card-primary card-hover border border-border">
              <CardHeader className="border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-blue">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">
                      Career Opportunities
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Strategic pathways for professional growth
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <Flag className="w-5 h-5 text-primary" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Career Pathways
                        </div>
                      </div>
                      <div className="space-y-4">
                        {roleSuggestions.map((path: string, index: number) => (
                          <div key={index} className="p-3 rounded-lg bg-secondary/30">
                            <p className="text-sm text-card-foreground">{path}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <Building className="w-5 h-5 text-primary" />
                      <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                        Recommended Departments
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {careerOpportunities.recommended_departments?.map(
                        (dept: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-sm font-medium border border-border bg-secondary/30 text-card-foreground hover:bg-secondary/50 transition-colors"
                          >
                            {dept}
                          </span>
                        )
                      ) || []}
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                        Role Suggestions
                      </div>
                    </div>
                    <div className="space-y-2">
                      {roleSuggestions.map(
                        (role: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            <span className="text-sm text-card-foreground">{role}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-5 h-5 text-warning" />
                    <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                      Required Skill Development
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[...new Set(requiredSkills)].map( // Dedupe skills
                      (skill: string, index: number) => (
                        <div key={index} className="p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <span className="text-sm font-medium text-card-foreground">{skill}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Retention Strategies */}
          {status === "Completed" && (
            <Card className="card-primary card-hover border border-border">
              <CardHeader className="border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-amber">
                    <Heart className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">
                      Retention & Mobility Strategies
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Strategies to maximize engagement and growth
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5 text-success" />
                      <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                        Development Support
                      </div>
                    </div>
                    <div className="space-y-3">
                      {retentionStrategies.development_support_needed?.map(
                        (support: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                            <span className="text-sm text-card-foreground">{support}</span>
                          </div>
                        )
                      ) || []}
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-5 h-5 text-primary" />
                      <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                        Retention Strategies
                      </div>
                    </div>
                    <div className="space-y-3">
                      {retentionStrategies.retention_strategies?.map(
                        (strategy: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            <span className="text-sm text-card-foreground">{strategy}</span>
                          </div>
                        )
                      ) || []}
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <Rocket className="w-5 h-5 text-primary" />
                      <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                        Mobility Recommendations
                      </div>
                    </div>
                    <div className="space-y-3">
                      {retentionStrategies.mobility_recommendations?.map(
                        (recommendation: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            <span className="text-sm text-card-foreground">{recommendation}</span>
                          </div>
                        )
                      ) || []}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Development Action Plan */}
          {status === "Completed" && (
            <Card className="card-primary card-hover border border-border">
              <CardHeader className="border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-green">
                    <Bookmark className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">
                      Development Action Plan
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your personalized roadmap to success
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold bg-blue-500">
                          30
                        </div>
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Day Goals
                        </div>
                      </div>
                      <div className="space-y-3">
                        {developmentPlan.thirty_day_goals?.map(
                          (goal: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              <span className="text-sm text-card-foreground">{goal}</span>
                            </div>
                          )
                        ) || []}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold bg-green-500">
                          90
                        </div>
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Day Goals
                        </div>
                      </div>
                      <div className="space-y-3">
                        {developmentPlan.ninety_day_goals?.map(
                          (goal: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              <span className="text-sm text-card-foreground">{goal}</span>
                            </div>
                          )
                        ) || []}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold bg-purple-500">
                          6M
                        </div>
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Month Goals
                        </div>
                      </div>
                      <div className="space-y-3">
                        {developmentPlan.six_month_goals?.map(
                          (goal: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                              <span className="text-sm text-card-foreground">{goal}</span>
                            </div>
                          )
                        ) || []}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="w-5 h-5 text-primary" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Networking Strategy
                        </div>
                      </div>
                      <div className="space-y-3">
                        {formattedNetworkingStrategy.map(
                          (strategy: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <span className="text-sm text-card-foreground">{strategy}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personalized Resources */}
          {status === "Completed" && (
            <Card className="card-primary card-hover border border-border">
              <CardHeader className="border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-purple">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">
                      Personalized Resources
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Tools and practices to support your growth journey
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-warning" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Daily Affirmations
                        </div>
                      </div>
                      <div className="space-y-3">
                        {personalizedResources.affirmations?.map(
                          (affirmation: string, index: number) => (
                            <div key={index} className="p-4 rounded-lg border border-border bg-secondary/30">
                              <span className="text-sm italic text-card-foreground">
                                "{affirmation}"
                              </span>
                            </div>
                          )
                        ) || []}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Learning Resources
                        </div>
                      </div>
                      <div className="space-y-3">
                        {formattedLearningResources.map(
                          (resource: string, index: number) => (
                            <div key={index} className="p-3 rounded-lg border border-border bg-secondary/30">
                              <span className="text-sm text-card-foreground">{resource}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-5 h-5 text-warning" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Reflection Questions
                        </div>
                      </div>
                      <div className="space-y-3">
                        {personalizedResources.reflection_questions?.map(
                          (question: string, index: number) => (
                            <div key={index} className="p-4 rounded-lg border border-border bg-secondary/30">
                              <span className="text-sm font-medium text-card-foreground">
                                {question}
                              </span>
                            </div>
                          )
                        ) || []}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <Medal className="w-5 h-5 text-success" />
                        <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                          Mindfulness Practices
                        </div>
                      </div>
                      <div className="space-y-3">
                        {personalizedResources.mindfulness_practices?.map(
                          (practice: string, index: number) => (
                            <div key={index} className="p-3 rounded-lg border border-border bg-secondary/30">
                              <span className="text-sm text-card-foreground">{practice}</span>
                            </div>
                          )
                        ) || []}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Sources and Methodology */}
          {status === "Completed" && (
            <Card className="card-primary card-hover border border-border">
              <CardHeader className="border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-amber">
                    <Cpu className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">
                      Assessment Methodology
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Technical details and data sources used in this assessment
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-6 rounded-lg border border-border bg-secondary/30">
                    <div className="flex items-center gap-3 mb-4">
                      <BrainCircuit className="w-5 h-5 text-primary" />
                      <div className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
                        Assessment Methodology
                      </div>
                    </div>
                    <p className="text-card-foreground leading-relaxed">
                      {dataSources.score_calculation_method || "Scores were calculated using advanced AI models based on assessment responses, profile data, and industry benchmarks."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <div className="p-6 rounded-lg border border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <div className="text-sm font-medium text-card-foreground">
                  Assessment completed with advanced AI-powered analytics
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                This comprehensive analysis combines multiple data points to
                provide actionable insights for career development
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsModal;