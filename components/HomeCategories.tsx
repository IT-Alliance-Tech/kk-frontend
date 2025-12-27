"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildUrl } from "@/lib/api";
import { getCategoryLogoUrl } from "@/lib/supabaseUrls";
import GlobalLoader from "@/components/common/GlobalLoader";

type Category = {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  imageUrl?: string; // final resolved image url
  image?: string;
  imagePath?: string;
};

export default function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Use lightweight homepage-specific API
        const res = await fetch(buildUrl("/api/homepage/categories"), { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
        const json = await res.json();
        const data = json?.data ?? [];
        
        const cats: Category[] = Array.isArray(data) ? data : [];

        const withImages = await Promise.all(
          cats.map(async (c) => {
            const possiblePath = c.imagePath ?? c.image ?? c.imageUrl ?? "";
            let img = "";
            try {
              img = getCategoryLogoUrl(possiblePath || (c.slug ?? c._id ?? "")) || "";
            } catch (e) {
              console.debug("getCategoryLogoUrl error for", c, e);
              img = "";
            }
            return { ...c, imageUrl: img || (c.imageUrl ?? "") };
          })
        );

        if (mounted) {
          setCategories(withImages);
          setErr(null);
        }
      } catch (e: any) {
        // Silently fail - hide section on error for better UX
        if (mounted) {
          setCategories([]);
          setErr(e?.message ?? "Failed to load");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-white py-6 sm:py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6">
          <div className="relative py-4 mb-4">
            <div className="flex items-center justify-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">Shop by Category</h2>
            </div>
          </div>
          <div className="flex justify-center py-12">
            <GlobalLoader size="large" />
          </div>
        </div>
      </section>
    );
  }

  // Hide section on error or when empty (graceful degradation)
  if (err || !categories.length) {
    return null;
  }

  return (
    // full width section so background and spacing match other sections
    <section className="w-full bg-white py-6 sm:py-8">
      {/* centered inner container (same as other homepage sections) */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6">
        {/* Header row: centered title + right aligned Explore link */}
        <div className="relative py-4">
          <div className="flex items-center justify-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">Categories</h2>
          </div>

          {/* Explore link pinned to right on same horizontal band (desktop) */}
          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 hidden sm:block">
            <Link href="/categories" className="text-emerald-600 hover:underline">
              Explore more →
            </Link>
          </div>

          {/* Mobile: show explore below title for small screens */}
          <div className="mt-3 sm:hidden text-right">
            <Link href="/categories" className="text-emerald-600 hover:underline">
              Explore more →
            </Link>
          </div>
        </div>

        {/* Grid container: remains inside centered inner container */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const id = cat._id ?? cat.id ?? cat.slug;
          const slug = cat.slug ?? (cat.name ? String(cat.name).toLowerCase().replace(/\s+/g, "-") : id);
          const img = cat.imageUrl ?? "";

          return (
            <Link
              href={`/categories/${slug}`}
              key={String(id)}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition p-6 flex flex-col items-center text-center"
              aria-label={`Category ${cat.name ?? "Category"}`}
            >
              <div
                className="w-full h-36 md:h-40 lg:h-44 mb-4 flex items-center justify-center rounded overflow-hidden bg-gray-50"
                style={{ minHeight: 140 }}
              >
                {img ? (
                  // using a plain img tag here so it works with remote Supabase URLs without next/image config
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={cat.name ?? "Category image"}
                    className="object-contain w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36"
                    style={{ maxWidth: "100%" }}
                    loading="lazy"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No image</div>
                )}
              </div>

              <div className="text-xl font-semibold text-gray-800 mt-2">{cat.name ?? "Untitled"}</div>
            </Link>
          );
        })}
      </div>
      </div>
    </section>
  );
}
