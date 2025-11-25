"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrands } from "@/lib/api/brands.api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, AlertCircle, Search, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Brand } from "@/lib/types";

export default function BrandsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || ""
  );

  // Fetch brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const data = await getBrands();
        setBrands(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brands");
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Client-side filtering with useMemo
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;
    
    const query = searchQuery.toLowerCase();
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(query)
    );
  }, [brands, searchQuery]);

  // Handle search with URL state sync
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    
    router.push(`/brands?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-16 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Shop by Brand
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl mb-6">
            Explore products from our trusted brand partners
          </p>

          {/* Search Bar */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12 bg-white shadow-sm border-slate-200 focus:ring-emerald-400 focus:border-emerald-400"
                aria-label="Search brands"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Count */}
          {searchQuery && !loading && (
            <p className="text-sm text-slate-600 mb-4">
              Found {filteredBrands.length} brand{filteredBrands.length === 1 ? '' : 's'}
            </p>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-48 bg-slate-200" />
                  <CardContent className="p-6">
                    <div className="h-5 bg-slate-200 rounded mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBrands.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                No brands found
              </h2>
              <p className="text-slate-500 text-sm">
                {searchQuery ? "Try adjusting your search" : "Check back soon for new brand partners"}
              </p>
            </div>
          ) : (
            /* Brands Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBrands.map((brand) => (
                <Link
                  key={brand._id}
                  href={`/brands/${brand.slug || brand.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 rounded-xl"
                  aria-label={`Browse ${brand.name} products`}
                >
                  <Card className="h-full overflow-hidden border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                    {/* Image Section */}
                    {brand.logoUrl ? (
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <Image
                          src={brand.logoUrl}
                          alt={`${brand.name} logo`}
                          fill
                          className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="relative h-48 w-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <Package className="h-16 w-16 text-emerald-300" />
                      </div>
                    )}

                    {/* Content Section */}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {brand.name}
                        </h3>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-xs"
                      >
                        View Products
                      </Badge>
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
