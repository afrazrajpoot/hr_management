-- CreateTable
CREATE TABLE "public"."AnalysisResult" (
    "id" SERIAL NOT NULL,
    "hrid" VARCHAR(50) NOT NULL,
    "department_name" VARCHAR(255) NOT NULL,
    "ai_response" JSONB NOT NULL,
    "risk_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalysisResult_hrid_idx" ON "public"."AnalysisResult"("hrid");

-- CreateIndex
CREATE INDEX "AnalysisResult_department_name_idx" ON "public"."AnalysisResult"("department_name");

-- CreateIndex
CREATE INDEX "AnalysisResult_created_at_idx" ON "public"."AnalysisResult"("created_at");
