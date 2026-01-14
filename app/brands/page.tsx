"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrandsPaginated } from "@/lib/api/brands.api";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Brand } from "@/lib/types";
import GlobalLoader from "@/components/common/GlobalLoader";
import Pagination from "@/components/common/Pagination";

const ITEMS_PER_PAGE = 12;

function BrandsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<{
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Get current page from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Fetch brands with pagination
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await getBrandsPaginated(currentPage, ITEMS_PER_PAGE);
        // Normalize logoUrl to handle different property names from backend
        setBrands((response.data || []).map((b: any) => ({ 
          ...b, 
          logoUrl: b.logoUrl || b.logo_url || b.logo || null 
        })));
        setPaginationInfo({
          totalCount: response.totalCount,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          hasNext: response.hasNext,
          hasPrev: response.hasPrev,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brands");
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationInfo.totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`/brands?${params.toString()}`, { scroll: true });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-16 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Shop by Brand
          </h1>
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

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-20">
              <GlobalLoader size="large" />
            </div>
          ) : brands.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                No brands found
              </h2>
              <p className="text-slate-500 text-sm">
                Check back soon for new brand partners
              </p>
            </div>
          ) : (
            <>
              {/* Brands Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {brands.map((brand) => (
                  <Link
                    key={brand.id || brand.slug}
                    href={`/brands/${brand.slug || brand.id}`}
                    className="group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 rounded-xl"
                    aria-label={`Browse ${brand.name} products`}
                  >
                    <Card className="h-full overflow-hidden border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                      <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-slate-100 p-4 sm:p-6">
                        <div className="relative w-full h-full">
                          <Image
                            src={brand.logoUrl ?? "/brand-placeholder.svg"}
                            alt={`${brand.name} logo`}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/brand-placeholder.svg";
                            }}
                          />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {brand.name}
                          </h3>
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={paginationInfo.currentPage}
                totalPages={paginationInfo.totalPages}
                totalItems={paginationInfo.totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                hasNext={paginationInfo.hasNext}
                hasPrev={paginationInfo.hasPrev}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen">
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-16 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Shop by Brand</h1>
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
    }>
      <BrandsPageContent />
    </Suspense>
  );
}
