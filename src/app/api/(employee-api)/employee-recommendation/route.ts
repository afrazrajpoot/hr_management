// app/api/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/auth";
import { getServerSession } from "next-auth";
import { fetchWithTimeout } from "@/lib/utils";

// Set max duration for this route (60 seconds)
export const maxDuration = 60;

async function getRecommendations(employeeId: string, recruiterId: string, fastApiToken: string | null) {
  const fastApiUrl = `${process.env.NEXT_PUBLIC_PYTHON_URL}/employee_dashboard/recommend-companies`;

  // Prepare headers with FastAPI token if available
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (fastApiToken) {
    headers["Authorization"] = `Bearer ${fastApiToken}`;
  }

  const response = await fetchWithTimeout(fastApiUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      recruiter_id: recruiterId,
      employee_id: employeeId
    }),
    timeout: 30000, // 30 seconds timeout
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FastAPI request failed: ${response.status} ${text}`);
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
    // Get FastAPI token from session
    const fastApiToken = session.user.fastApiToken;

    if (!fastApiToken) {
      console.warn("No FastAPI token found in session");
      // You might want to handle this case differently - either return an error
      // or try to get recommendations without the token
    }

    const recommendations = await getRecommendations(
      session.user.id,
      session.user.hrId,
      fastApiToken
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
  } catch (err: any) {
    console.error("Error in recommendations API:", err);

    // Provide more detailed error information
    const errorMessage = err.message || "Failed to get recommendations";

    return NextResponse.json(
      {
        error: "Failed to get recommendations",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}