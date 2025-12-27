"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCategoryLogoUrl } from "@/lib/supabaseUrls";
import { buildUrl } from "@/lib/api";
import GlobalLoader from "@/components/common/GlobalLoader";

// Helper: safely convert API response to an array for client usage
function normalizeToArray<T = any>(maybeArray: any): T[] {
  if (Array.isArray(maybeArray)) return maybeArray as T[];

  // Some backends wrap payloads: { data: [...] }, { items: [...] }, { categories: [...] }
  if (maybeArray && typeof maybeArray === "object") {
    if (Array.isArray(maybeArray.data)) return maybeArray.data as T[];
    if (Array.isArray(maybeArray.items)) return maybeArray.items as T[];
    if (Array.isArray(maybeArray.categories)) return maybeArray.categories as T[];
    // fallback: first array field found
    for (const k of Object.keys(maybeArray)) {
      if (Array.isArray((maybeArray as any)[k])) return (maybeArray as any)[k] as T[];
    }
  }
  // If it's a primitive or unexpected shape, return empty array to avoid runtime errors
  return [];
}

type Category = {
  _id: string;
  slug: string;
  name: string;
  image_url?: string;
  description?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(buildUrl("/api/categories"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const rawCategories = await res.json();
        // Convert to array if the API returned an object wrapper (safe fallback)
        const categories = normalizeToArray<Category>(rawCategories);
        // debugging: log when normalization was needed — remove after fix confirmed
        if (!Array.isArray(rawCategories)) {
          console.log("[DEBUG] categories raw response shape (normalized):", JSON.stringify(rawCategories));
        }
        setCategories(categories);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Filter categories based on search query (client-side)
  const filteredCategories = (categories || []).filter((category) =>
    String(category?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-16 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Shop by Category
            </h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-20">
              <GlobalLoader size="large" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-slate-700 text-lg">No categories found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-16 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Shop by Category
          </h1>
          {/* subtitle removed per design update */}

          {/* Removed inner page search bar as per updated UI requirement */}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          {searchQuery && (
            <p className="text-sm text-slate-600 mb-4">
              Found {filteredCategories.length} categor{filteredCategories.length === 1 ? 'y' : 'ies'}
            </p>
          )}

          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-slate-700 text-lg mb-2">No categories found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => {
                const slug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
                const logoUrl = getCategoryLogoUrl(slug) || category.image_url || '/brand-placeholder.svg';
                
                return (
                  <Link
                    key={category._id}
                    href={`/categories/${category.slug}`}
                    className="group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 rounded-xl"
                    aria-label={`Browse ${category.name} products`}
                  >
                    <Card className="h-full overflow-hidden border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                      {/* Image Section */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <Image
                          src={logoUrl}
                          alt={`${category.name} category`}
                          fill
                          className="object-contain object-center group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          loading="lazy"
                        />
                      </div>

                      {/* Content Section */}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {category.name}
                          </CardTitle>
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {category.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
