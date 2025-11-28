"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Filter categories based on search query (client-side)
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
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

        {/* Loading Skeletons */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">

            {/* Grid Skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
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
              {filteredCategories.map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 rounded-xl"
                  aria-label={`Browse ${category.name} products`}
                >
                  <Card className="h-full overflow-hidden border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                    {/* Image Section */}
                    {category.image_url ? (
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <Image
                          src={category.image_url}
                          alt={`${category.name} category`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="relative h-48 w-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <Package className="h-16 w-16 text-emerald-300" />
                      </div>
                    )}

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
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
