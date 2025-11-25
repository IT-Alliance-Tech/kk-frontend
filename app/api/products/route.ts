import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    // Build backend URL with query params
    const backendUrl = `${BACKEND_URL}/api/products${queryString ? `?${queryString}` : ""}`;

    console.log("➡️ Frontend API: Proxying to backend:", backendUrl);

    const res = await fetch(backendUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Failed to fetch products" }));
      return NextResponse.json(
        errorData,
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(`✅ Frontend API: Returned ${data.items?.length ?? data.length ?? 0} products`);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("❌ Products API error:", error.message);
    return NextResponse.json(
      { error: "Backend not available" },
      { status: 503 }
    );
  }
}
