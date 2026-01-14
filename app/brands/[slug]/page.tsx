/**
 * Brand detail page - Client Component with pagination
 * Displays a single brand with its information and paginated products
 */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { getBrand, getBrands, slugify } from "@/lib/api/brands.api";
import { apiFetch } from "@/lib/api";
import GlobalLoader from "@/components/common/GlobalLoader";
import Pagination from "@/components/common/Pagination";
import type { Brand } from "@/lib/types";

const ITEMS_PER_PAGE = 12;

/**
 * Validate and normalise an image URL string for next/image.
 */
function safeRemoteUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const u = new URL(raw);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return u.toString();
    }
    return null;
  } catch (e) {
    return null;
  }
}

function BrandPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const identifier = (params?.slug as string) ?? (params?.id as string) ?? "";

  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<{
    total: number;
    page: number;
    pages: number;
  }>({
    total: 0,
    page: 1,
    pages: 1,
  });

  // Get current page from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // First effect: resolve brand
  useEffect(() => {
    if (!identifier) return;

    async function resolveBrand() {
      try {
        setLoading(true);
        setError(null);

        let foundBrand: Brand | null = null;

        // Try fetching by slug/id
        foundBrand = await getBrand(identifier);

        if (!foundBrand) {
          // Fallback: search all brands
          const allBrands = await getBrands();
          foundBrand = allBrands.find((b) => slugify(b.name) === identifier) || null;
        }

        if (!foundBrand) {
          setError("Brand not found");
          setLoading(false);
          return;
        }

        setBrand(foundBrand);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    resolveBrand();
  }, [identifier]);

  // Second effect: fetch products when brand or page changes
  useEffect(() => {
    if (!brand) return;

    const brandId = brand.id || brand._id;

    async function loadBrandProducts() {
      try {
        setProductsLoading(true);

        if (!brandId) {
          setProducts([]);
          return;
        }

        // Fetch products with pagination
        const response = await apiFetch<any>(
          `/products?brand=${encodeURIComponent(brandId)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );

        // Handle response
        const items = response.items || (Array.isArray(response) ? response : []);
        const total = response.total || items.length;
        const page = response.page || currentPage;
        const pages = response.pages || 1;

        setProducts(items);
        setPaginationInfo({ total, page, pages });
      } catch (err: any) {
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    }

    loadBrandProducts();
  }, [brand, currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationInfo.pages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`/brands/${identifier}?${params.toString()}`, { scroll: true });
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center py-20">
              <GlobalLoader size="large" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error || "Brand not found"}</p>
          <button
            onClick={() => router.push("/brands")}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Back to Brands
          </button>
        </div>
      </div>
    );
  }

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
                    <div className="w-40 h-40 relative">
                      <Image
                        src={logoSrc}
                        alt={brand.name || "Brand logo"}
                        width={160}
                        height={160}
                        className="w-40 h-40 object-contain border border-slate-200 rounded-lg p-4 bg-white"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/brand-placeholder.svg";
                        }}
                      />
                    </div>
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

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <GlobalLoader size="medium" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="flex flex-col divide-y divide-gray-200 md:divide-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={paginationInfo.page}
                totalPages={paginationInfo.pages}
                totalItems={paginationInfo.total}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                hasNext={paginationInfo.page < paginationInfo.pages}
                hasPrev={paginationInfo.page > 1}
              />
            </>
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

export default function BrandPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen">
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-center py-20">
                <GlobalLoader size="large" />
              </div>
            </div>
          </section>
        </div>
      }
    >
      <BrandPageContent />
    </Suspense>
  );
}
