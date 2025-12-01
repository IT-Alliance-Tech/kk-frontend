// Updated products/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import DefaultProductImage from "@/assets/images/ChatGPT Image Nov 28, 2025, 10_33_10 PM.png"; // use default placeholder when product has no image or to replace dummy imports
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, Search, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/components/CartContext";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  mrp?: number;
  images?: string[];
  brand?: { name: string };
  category?: { name: string };
  stock: number;
}

interface PaginationData {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

const ITEMS_PER_PAGE = 12;

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationData, setPaginationData] = useState<PaginationData>({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
  });
  
  const { addItem, removeItem } = useCart();
  const [qtyMap, setQtyMap] = useState<{ [key: string]: number }>({});

  // Get current page from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Fetch products with pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await apiGet(
          `/products?page=${currentPage}&limit=${ITEMS_PER_PAGE}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`
        );
        
        // Handle both array response and object with items
        const items = Array.isArray(data) ? data : (data?.items ?? []);
        const total = Array.isArray(data) ? data.length : (data?.total ?? 0);
        const page = Array.isArray(data) ? 1 : (data?.page ?? 1);
        const pages = Array.isArray(data) ? 1 : (data?.pages ?? 1);
        
        setPaginationData({
          items,
          total,
          page,
          pages,
        });
        
        setProducts(items);
      } catch (err) {
        console.error("Failed to load products", err);
        setPaginationData({ items: [], total: 0, page: 1, pages: 1 });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationData.pages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    
    router.push(`/products?${params.toString()}`, { scroll: true });
  };

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    // Reset to page 1 when searching
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    
    router.push(`/products?${params.toString()}`);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { page: current, pages: total } = paginationData;

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      // Show current page and surrounding pages
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  };

  const increaseQty = (product: Product) => {
    const newQty = (qtyMap[product._id] || 0) + 1;
    setQtyMap((prev) => ({ ...prev, [product._id]: newQty }));

    addItem(
      {
        id: product._id,
        name: product.title,
        price: product.price,
        image_url: product.images?.[0] || "",
      },
      1
    );
  };

  const decreaseQty = (product: Product) => {
    const current = qtyMap[product._id] || 0;
    if (current === 0) return;

    const newQty = current - 1;
    setQtyMap((prev) => ({ ...prev, [product._id]: newQty }));

    removeItem(product._id);
  };

  // Calculate showing range
  const startItem = (paginationData.page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(
    paginationData.page * ITEMS_PER_PAGE,
    paginationData.total
  );

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">All Products</h1>
          {/* subtitle removed per design update */}

          {/* Removed inner page search bar as per updated UI requirement */}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-40 bg-slate-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-200 rounded mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No products found
              </h3>
              <p className="text-slate-600">Try adjusting your search</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                const qty = qtyMap[product._id] || 0;
                // use default placeholder when no product image or when replacing dummy import
                const productImageSrc = product.images?.[0] || DefaultProductImage;

                return (
                  <Card key={product._id} className="group hover:shadow-lg transition flex flex-col h-full">
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <Image
                          src={productImageSrc}
                          alt={product?.title || 'Product image'}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          unoptimized={typeof productImageSrc === 'string' && productImageSrc.startsWith("http")}
                          onError={(e) => {
                            e.currentTarget.src = typeof DefaultProductImage === 'string' ? DefaultProductImage : DefaultProductImage.src;
                          }}
                        />

                        {/* removed Sale badge (per new design) */}
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col">
                      <CardHeader>
                        <Link href={`/products/${product.slug}`}>
                          <CardTitle className="text-base line-clamp-2 group-hover:text-emerald-600">
                            {product.title}
                          </CardTitle>
                        </Link>

                        {product.brand?.name && (
                          <p className="text-sm text-slate-500">{product.brand.name}</p>
                        )}
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">₹{product.price}</span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="text-sm text-slate-500 line-through">
                              ₹{product.mrp}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </div>

                    {/* ------------------------------ */}
                    {/* CUSTOM ADD TO CART + QTY UI   */}
                    {/* ------------------------------ */}

                    {/* When item in cart: show Go to Cart (green) + move quantity spinner to bottom-right */}
                    <CardFooter className="mt-auto">
                      {qty === 0 ? (
                        <button
                          onClick={() => increaseQty(product)}
                          disabled={product.stock === 0}
                          className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                          aria-label={`Add ${product.title} to cart`}
                        >
                          <ShoppingCart size={16} />
                          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-2 w-full">
                          <Link
                            href="/cart"
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition text-center text-sm font-medium"
                            aria-label={`Go to cart for ${product.title}`}
                          >
                            Go to Cart
                          </Link>
                          <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-3 py-1.5 shadow-sm">
                            <button
                              onClick={() => decreaseQty(product)}
                              className="text-red-500 text-lg px-1"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="text-gray-900 text-base font-medium min-w-[1.5rem] text-center">{qty}</span>
                            <button
                              onClick={() => increaseQty(product)}
                              className="text-red-500 text-lg px-1"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
              </div>

              {/* Pagination Controls */}
              {paginationData.pages > 1 && (
                <div className="mt-12 flex flex-col items-center gap-6">
                  {/* Showing X-Y of Z */}
                  <p className="text-sm text-slate-600">
                    Showing {startItem}–{endItem} of {paginationData.total} products
                  </p>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((pageNum, idx) => {
                      if (pageNum === "...") {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-3 py-2 text-slate-400"
                          >
                            ...
                          </span>
                        );
                      }

                      const page = pageNum as number;
                      const isActive = page === currentPage;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[40px] px-4 py-2 rounded-lg border transition ${
                            isActive
                              ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                          aria-label={`Go to page ${page}`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === paginationData.pages}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Next page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen">
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">All Products</h1>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">Loading products...</div>
          </div>
        </section>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
