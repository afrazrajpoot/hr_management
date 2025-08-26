-- CreateTable
CREATE TABLE "public"."IndividualEmployeeReport" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "geniusFactorProfileJson" JSONB NOT NULL,
    "currentRoleAlignmentAnalysisJson" JSONB NOT NULL,
    "internalCareerOpportunitiesJson" JSONB NOT NULL,
    "retentionAndMobilityStrategiesJson" JSONB NOT NULL,
    "developmentActionPlanJson" JSONB NOT NULL,
    "personalizedResourcesJson" JSONB NOT NULL,
    "dataSourcesAndMethodologyJson" JSONB NOT NULL,

    CONSTRAINT "IndividualEmployeeReport_pkey" PRIMARY KEY ("id")
);
