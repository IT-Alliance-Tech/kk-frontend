import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Make sure your environment variables are set in .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    console.log("➡️ API: Fetching products...");

    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ API: Returned ${data?.length ?? 0} products`);
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("❌ Server crash:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
