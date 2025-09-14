// app/api/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/auth";
import { getServerSession } from "next-auth";

async function getRecommendations(employeeId: string, recruiterId: string) {
  const fastApiUrl = `${process.env.NEXT_PUBLIC_PYTHON_URL}/employee_dashboard/recommend-companies`;

  const response = await fetch(fastApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recruiter_id: recruiterId, employee_id: employeeId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FastAPI request failed: ${text}`);
  }

  const data = await response.json();

  let recommendations = [];
  if (data && data.recommendations) {
    try {
      const cleanedJson =
        typeof data.recommendations === "string"
          ? data.recommendations.replace(/```json\n|\n```/g, "")
          : JSON.stringify(data.recommendations);

      recommendations = JSON.parse(cleanedJson);
    } catch (error) {
      throw new Error("Invalid recommendations format");
    }
  }

  return recommendations;
}

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = {
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
  };

  try {
    const recommendations = await getRecommendations(
      session.user.id,
      session.user.hrId
    );

    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedRecommendations = recommendations.slice(
      startIndex,
      endIndex
    );

    return NextResponse.json({
      recommendations: paginatedRecommendations,
      total: recommendations.length,
      page: filters.page,
      limit: filters.limit,
      hasMore: endIndex < recommendations.length,
    });
  } catch (err) {
    console.error("Error in recommendations API:", err);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
