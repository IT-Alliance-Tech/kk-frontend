"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAdminProducts, deleteProduct, getBrands, getCategories } from "@/lib/admin";
import Link from "next/link";
import GlobalLoader from "@/components/common/GlobalLoader";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [globalSearch, setGlobalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const limit = 10;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce global search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(globalSearch);
    }, 500); // 500ms delay
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [globalSearch]);

  const loadProducts = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      
      // Add filters to params
      // Priority: debouncedSearch (global) > filterName (advanced filter)
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      } else if (filterName.trim()) {
        params.search = filterName.trim();
      }
      
      if (filterCategory) {
        params.category = filterCategory;
      }
      if (filterBrand) {
        params.brand = filterBrand;
      }
      if (filterPriceMin) {
        params.priceMin = filterPriceMin;
      }
      if (filterPriceMax) {
        params.priceMax = filterPriceMax;
      }
      
      const response = await getAdminProducts(params);
      
      // Extract products and pagination info
      const productsData = response?.products || response?.data?.products || [];
      const totalCount = response?.total || response?.data?.total || 0;
      const totalPagesCount = response?.totalPages || response?.data?.totalPages || 1;
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setTotal(totalCount);
      setTotalPages(totalPagesCount);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterName, filterCategory, filterBrand, filterPriceMin, filterPriceMax, limit]);

  const loadCategoriesAndBrands = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        getCategories(),
        getBrands(),
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (err) {
      console.error("Failed to load categories/brands:", err);
    }
  };

  useEffect(() => {
    loadCategoriesAndBrands();
  }, []);

  // Load products when filters change, reset to page 1
  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || loading) return;
    loadProducts(newPage);
  };

  const handleResetFilters = () => {
    setGlobalSearch("");
    setDebouncedSearch("");
    setFilterName("");
    setFilterCategory("");
    setFilterBrand("");
    setFilterPriceMin("");
    setFilterPriceMax("");
  };

  const hasActiveFilters = debouncedSearch || filterName || filterCategory || filterBrand || filterPriceMin || filterPriceMax;

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded text-sm sm:text-base text-center"
        >
          + Add Product
        </Link>
      </div>

      {/* Global Search Bar */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search products by name..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 transition"
          >
            {showFilters ? "Hide Filters" : "Advanced Filters"}
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold mb-3 text-sm sm:text-base">Advanced Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Product Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                placeholder="Filter by name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filterPriceMin}
                onChange={(e) => setFilterPriceMin(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Price Max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price (₹)
              </label>
              <input
                type="number"
                placeholder="99999"
                value={filterPriceMax}
                onChange={(e) => setFilterPriceMax(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && (
        <div className="mb-3 text-sm text-gray-600">
          {total > 0 ? (
            <>
              Showing {products.length > 0 ? ((currentPage - 1) * limit + 1) : 0} to {Math.min(currentPage * limit, total)} of {total} product{total !== 1 ? 's' : ''}
              {hasActiveFilters && " (filtered)"}
            </>
          ) : (
            "No products found"
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 flex justify-center">
          <GlobalLoader size="large" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border min-w-[640px]">
            <thead>
              {/* Reordered columns to: Title, Category, Brand, Price, Action (per product owner request) */}
              <tr className="bg-gray-100">
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Title</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Category</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Brand</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Price</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p: any) => {
                  // Show category/brand name instead of ID: prefer product.category.name/product.brand.name, then lookup from categories/brands arrays
                  const categoryName = p?.category?.name 
                    ?? categories?.find(c => String(c._id) === String(p.category))?.name 
                    ?? p.category 
                    ?? '-';
                  
                  const brandName = p?.brand?.name 
                    ?? brands?.find(b => String(b._id) === String(p.brand))?.name 
                    ?? p.brand 
                    ?? '-';

                  // Defensive access for product id and title
                  const pid = p?.id || p?._id;
                  const label = p?.title ?? 'product';

                  return (
                    <tr key={p._id}>
                      <td className="border p-1.5 sm:p-2 text-xs sm:text-sm">{p.title}</td>
                      <td className="border p-1.5 sm:p-2 text-xs sm:text-sm">{categoryName}</td>
                      <td className="border p-1.5 sm:p-2 text-xs sm:text-sm">{brandName}</td>
                      <td className="border p-1.5 sm:p-2 text-xs sm:text-sm whitespace-nowrap">₹{p.price}</td>
                      <td className="border p-1.5 sm:p-2 space-x-1 sm:space-x-3 whitespace-nowrap">
                        {/* Open read-only product view page */}
                        <Link
                          href={`/admin/products/view/${pid}`}
                          className="text-green-600 text-xs sm:text-sm"
                          aria-label={`View ${label}`}
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/products/${pid}`}
                          className="text-blue-600 text-xs sm:text-sm"
                          aria-label={`Edit ${label}`}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Showing info */}
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              {/* Page buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 border rounded text-sm ${
                          currentPage === pageNum
                            ? 'bg-black text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

