import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Guarded Supabase client usage to prevent runtime errors
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function GET() {
  try {
    if (!supabase) {
      // Supabase not configured during build — return fallback response
      return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
    }

    // Query brands table for id, name, logo_path, slug
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, slug, logo_path")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Robust logoUrl construction
    const brands = (data || []).map((brand: any) => {
      let logoUrl = null;
      let logoPath = brand.logo_path;
      // If logo_path is missing or contains tmp/placeholder, use slug
      if (!logoPath || /tmp|placeholder/.test(logoPath)) {
        if (brand.slug) {
          logoPath = `product-images/brands/${brand.slug}/logo.png`;
        } else if (brand.id) {
          logoPath = `product-images/brands/${brand.id}/logo.png`;
        }
      }
      if (logoPath && (logoPath.startsWith('product-images/') || logoPath.startsWith('brands/'))) {
        logoUrl = `${supabaseUrl}/storage/v1/object/public/${logoPath}`;
      }
      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logoUrl,
      };
    });

    return NextResponse.json(brands, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
