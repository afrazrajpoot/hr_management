-- CreateTable
CREATE TABLE "public"."AiCareerRecommendation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "careerRecommendation" TEXT NOT NULL,

    CONSTRAINT "AiCareerRecommendation_pkey" PRIMARY KEY ("id")
);
