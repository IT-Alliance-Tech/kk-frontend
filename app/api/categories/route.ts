import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/categories`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: res.status },
      );
    }

    const data = await res.json();
    
    // Unwrap backend envelope { statusCode, success, error, data }
    // If backend returns envelope, extract data; otherwise return as-is
    let categories = data;
    if (data && typeof data === "object" && ("statusCode" in data || "success" in data)) {
      if (data.success && data.data) {
        categories = data.data;
      } else if (!data.success) {
        return NextResponse.json(
          { error: data.error?.message || data.message || "Failed to fetch categories" },
          { status: data.statusCode || 500 }
        );
      }
    }
    
    // Ensure we return an array
    const categoriesArray = Array.isArray(categories) 
      ? categories 
      : (categories?.items || categories?.categories || []);
    
    return NextResponse.json(categoriesArray);
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Backend not available" },
      { status: 503 },
    );
  }
}
