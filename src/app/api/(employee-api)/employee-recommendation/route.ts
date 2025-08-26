// app/api/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";
import { getServerSession } from "next-auth";

interface FilterParams {
  page?: number;
  limit?: number;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

async function getCachedRecommendations(employee: any, companies: any[]) {
  const cacheKey = `recommendations:${employee.employeeId}`;
  const cached = cache.get(cacheKey);

  // Return cached data if it exists and is not expired
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Call FastAPI if no cache or cache expired
  const fastApiUrl = `${process.env.NEXT_PUBLIC_PYTHON_URL}/employee_dashboard/recommend-companies`;
  
  const response = await fetch(fastApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee, companies }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FastAPI request failed: ${text}`);
  }

  const data = await response.json();
  
  // Parse recommendations
  let recommendations = [];
  if (data && data.recommendations) {
    try {
      const cleanedJson = typeof data.recommendations === "string" 
        ? data.recommendations.replace(/```json\n|\n```/g, "")
        : JSON.stringify(data.recommendations);
      recommendations = JSON.parse(cleanedJson);
    } catch (error) {
      throw new Error("Invalid recommendations format");
    }
  }

  // Cache the results
  cache.set(cacheKey, {
    data: recommendations,
    timestamp: Date.now()
  });

  return recommendations;
}

export async function GET(req: NextRequest) {
  const session: any = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse query parameters - only page and limit for server-side
  const { searchParams } = new URL(req.url);
  const filters = {
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
  };

  try {
    // 1. Try to get employee from DB
    let employee = await prisma.employee.findUnique({
      where: { employeeId: session.user.id },
    });

    // 2. If no employee, try to get user instead
    let user = null;
    if (!employee) {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Employee or User not found" },
          { status: 404 }
        );
      }
    }

    // 3. Get companies (limit to 50 to save tokens)
    const companies = await prisma.company.findMany({ take: 50 });

    // 4. Get recommendations (pass employee or user)
    let recommendations;
    try {
      recommendations = await getCachedRecommendations(employee ?? user, companies);
   
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      return NextResponse.json(
        { error: "Failed to get recommendations" },
        { status: 500 }
      );
    }

    // 5. Server-side pagination
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedRecommendations = recommendations.slice(startIndex, endIndex);

    return NextResponse.json({
      recommendations: paginatedRecommendations,
      total: recommendations.length,
      page: filters.page,
      limit: filters.limit,
      hasMore: endIndex < recommendations.length,
    });
  } catch (err) {
    console.error("Error in recommendations API:", err);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Optional: Add endpoint to clear cache
export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json();
  
  if (action === 'clear-cache') {
    const cacheKey = `recommendations:${session.user.id}`;
    cache.delete(cacheKey);
    return NextResponse.json({ message: "Cache cleared" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}