/**
 * Brand detail page - Server Component
 * Displays a single brand with its information and products
 * Updated: 2025-11-29 - Enhanced null handling and defensive error handling
 */

import Image from "next/image";
import { notFound } from "next/navigation";
import { getBrand } from "@/lib/api/brands.api";
import { getProductsByBrand } from "@/lib/api/products.api";
import DefaultProductImage from "@/assets/images/ChatGPT Image Nov 28, 2025, 10_33_10 PM.png"; // optional fallback asset (not required)
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { slugify } from "@/lib/api/brands.api";
import { getBrands } from "@/lib/api/brands.api";

type Props = {
  params: Promise<{ slug?: string; id?: string }>;
};

/**
 * Validate and normalise an image URL string for next/image.
 * Returns a safe absolute URL string or null.
 */
function safeRemoteUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  // If already a full http(s) URL, try to normalise using URL constructor.
  try {
    const u = new URL(raw);
    if (u.protocol === "http:" || u.protocol === "https:") {
      // encode path segments to avoid spaces/unescaped chars problems
      // preserve query and hostname
      // Using toString() since URL automatically encodes components.
      return u.toString();
    }
    return null;
  } catch (e) {
    // raw is possibly a relative path or contains spaces: try to guess
    // If it looks like a supabase storage path (no host) we cannot safely use it here
    return null;
  }
}

export default async function BrandPage({ params }: Props) {
  // params may be a promise in this Next.js setup — await it to safely access values
  const resolvedParams = await params;
  const identifier = resolvedParams?.slug ?? resolvedParams?.id ?? "";
  
  if (!identifier) {
    console.error("❌ No slug parameter provided");
    notFound();
  }

  let brand: any = null;
  let productsData: any[] = [];

  try {

    // Resolve brand by _id or slug
    if (/^[a-fA-F0-9]{24}$/.test(identifier)) {
      brand = await getBrand(identifier); // Assume getBrand handles both _id and slug
    }

    if (!brand) {
      const allBrands = await getBrands();
      brand = allBrands.find((b) => slugify(b.name) === identifier);
    }

    if (!brand) {
      console.log(`❌ Brand not found after all attempts: ${identifier}`);
      notFound();
    }

    console.log(`✅ Brand loaded successfully: ${brand.name}`);
  } catch (error) {
    console.error("❌ Unexpected error fetching brand:", error);
    notFound();
  }

  // Fetch products for this brand using the brand's id
  // use env var for backend base URL; default to localhost:5001 for dev
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  try {
    const brandId = brand.id || brand._id;
    if (brandId) {
      productsData = await getProductsByBrand(brandId);
      console.log(`✅ Loaded ${productsData.length} products for brand: ${brand.name}`);
    } else {
      console.warn("⚠️ Brand has no id; skipping products fetch");
      productsData = [];
    }
  } catch (error) {
    console.error("⚠️ Error fetching products for brand:", error);
    productsData = [];
  }

  // Determine safe image src for next/image; if invalid, fallback to local placeholder
  const remoteLogo = safeRemoteUrl(brand.logoUrl);
  const logoSrc = remoteLogo || "/brand-placeholder.svg";

  return (
    <div className="bg-white min-h-screen">
      {/* Brand Header Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Brand Logo */}
                  <div className="flex-shrink-0">
                    {logoSrc ? (
                      // next/image works with absolute urls (remote) and local strings (starting with '/')
                      <div className="w-40 h-40 relative">
                        <Image
                          src={logoSrc}
                          alt={brand.name || "Brand logo"}
                          width={160}
                          height={160}
                          className="w-40 h-40 object-contain border border-slate-200 rounded-lg p-4 bg-white"
                          // If you prefer `fill`, ensure wrapper is relative and size is fixed
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50">
                        <Package className="h-20 w-20 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Brand Info */}
                  <div className="flex-grow text-center md:text-left">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                      {brand.name}
                    </h1>
                    {brand.description && (
                      <p className="text-lg text-slate-600 leading-relaxed">
                        {brand.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Products by {brand.name}
          </h2>

          {Array.isArray(productsData) && productsData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {productsData.map((product: any) => (
                // keep robust key, prefer _id then id
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No products available for this brand yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * Test checklist:
 * 1. Open /brands/bake-master (existing slug) — should show products.
 * 2. Open using _id if available (e.g., /brands/507f1f77bcf86cd799439011) — should work.
 * 3. Verify network request origin is http://localhost:5001 (or the env var value).
 */
