"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { buildUrl } from "@/lib/api";
import { Package } from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";
import Pagination from "@/components/common/Pagination";

const ITEMS_PER_PAGE = 12;

// Helper: normalize API response to an array (handles nested data.items)
function unwrapArray<T = any>(json: any): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as T[];
  // common wrappers:
  if (Array.isArray(json.data)) return json.data as T[];
  if (Array.isArray(json.items)) return json.items as T[];
  if (Array.isArray(json.data?.items)) return json.data.items as T[];
  // sometimes API returns { data: { items: [...] } }
  if (Array.isArray(json.data?.results)) return json.data.results as T[];
  // try to find first array property on object
  for (const k of Object.keys(json)) {
    if (Array.isArray(json[k])) return json[k] as T[];
  }
  return [];
}

function CategoryPageContent() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
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

  // First effect: resolve category slug to ID
  useEffect(() => {
    if (!slug) return;

    async function resolveCategory() {
      try {
        setLoading(true);
        setError(null);

        const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;

        // Fetch category list to get _id
        const catRes = await fetch(buildUrl("/api/categories"));
        if (!catRes.ok) throw new Error(`Failed to load categories`);
        const catJson = await catRes.json();
        
        const categoryList = unwrapArray(catJson);

        const category = categoryList.find(
          (c: any) => (c.slug ?? c.name)?.toLowerCase?.() === normalizedSlug?.toLowerCase?.()
        );

        if (!category) {
          throw new Error("Category not found");
        }

        setCategoryName(category.name);
        setCategoryId(category._id ?? category.id);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    }

    resolveCategory();
  }, [slug]);

  // Second effect: fetch products when categoryId or page changes
  useEffect(() => {
    if (!categoryId) return;

    async function loadCategoryProducts() {
      try {
        setLoading(true);

        // Fetch products for this category with pagination
        const prodRes = await fetch(
          buildUrl(`/api/products?category=${encodeURIComponent(categoryId as string)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`),
          { cache: "no-store" }
        );
        if (!prodRes.ok) throw new Error("Failed to load products");
        const prodJson = await prodRes.json();
        
        // Backend returns { items, total, page, pages }
        const items = prodJson.items || unwrapArray(prodJson);
        const total = prodJson.total || items.length;
        const page = prodJson.page || currentPage;
        const pages = prodJson.pages || 1;

        setProducts(items);
        setPaginationInfo({ total, page, pages });
      } catch (err: any) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    loadCategoryProducts();
  }, [categoryId, currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationInfo.pages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;
    router.push(`/categories/${normalizedSlug}?${params.toString()}`, { scroll: true });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-slate-900">
              {categoryName ? `${categoryName} Products` : "Loading..."}
            </h1>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-900">
            {categoryName} Products
          </h1>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No products found
              </h3>
              <p className="text-slate-600">Check back soon for new products in this category</p>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 min-h-screen">
          <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-12">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl font-bold text-slate-900">Loading...</h1>
            </div>
          </section>
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-center py-20">
                <GlobalLoader size="large" />
              </div>
            </div>
          </section>
        </div>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
