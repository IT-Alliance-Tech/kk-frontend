"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAdminCategories, disableCategory, enableCategory, getAdminProducts, getAdminBrands } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlobalLoader from "@/components/common/GlobalLoader";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [globalSearch, setGlobalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const router = useRouter();
  const limit = 5; // STRICT: 5 categories per page
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

  // Load products and brands once for counting (use cached/unpaginated call)
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [productsData, brandsData] = await Promise.all([
          getAdminProducts(),
          getAdminBrands()
        ]);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (error) {
        console.error("Failed to load products/brands:", error);
        setProducts([]);
        setBrands([]);
      }
    };
    loadStaticData();
  }, []);

  const loadCategories = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      
      // Add search filter
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      
      // Add status filter
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      const response = await getAdminCategories(params);
      
      // Extract categories and pagination info
      const categoriesData = response?.categories || response?.data?.categories || [];
      const totalCount = response?.total || response?.data?.total || 0;
      const totalPagesCount = response?.totalPages || response?.data?.totalPages || 1;
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setTotal(totalCount);
      setTotalPages(totalPagesCount);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, limit]);

  // Load categories when filters change, reset to page 1
  useEffect(() => {
    loadCategories(1);
  }, [loadCategories]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || loading) return;
    loadCategories(newPage);
  };

  const handleResetFilters = () => {
    setGlobalSearch("");
    setDebouncedSearch("");
    setFilterStatus("");
  };

  const hasActiveFilters = debouncedSearch || filterStatus;

  const handleDisable = async (id: string) => {
    if (!confirm("Are you sure you want to disable this category?")) return;
    try {
      await disableCategory(id);
      loadCategories(currentPage);
    } catch (err: any) {
      console.error("Category disable error:", err);
      alert(err.message || "Failed to disable category");
      
      if (err.status === 401 || err.message?.includes("Invalid user") || err.message?.includes("Not authenticated")) {
        router.push("/admin/login");
      }
    }
  };

  const handleEnable = async (id: string) => {
    try {
      await enableCategory(id);
      loadCategories(currentPage);
    } catch (err: any) {
      console.error("Category enable error:", err);
      alert(err.message || "Failed to enable category");
      
      if (err.status === 401 || err.message?.includes("Invalid user") || err.message?.includes("Not authenticated")) {
        router.push("/admin/login");
      }
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="bg-black text-white px-4 py-2 rounded text-sm sm:text-base text-center"
        >
          + Add Category
        </Link>
      </div>

      {/* Search Bar and Status Filter */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search categories by name..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Disabled</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-3 text-sm text-gray-600">
          {total > 0 ? (
            <>
              Showing {categories.length > 0 ? ((currentPage - 1) * limit + 1) : 0} to {Math.min(currentPage * limit, total)} of {total} categor{total !== 1 ? 'ies' : 'y'}
              {hasActiveFilters && " (filtered)"}
            </>
          ) : (
            "No categories found"
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
            <table className="w-full border min-w-[520px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Name</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">#Products</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">#Brands</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Status</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Action</th>
              </tr>
            </thead>

            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((c: any) => {
                  // Calculate product count for this category
                  const productCount = products?.filter(p => String(p.category) === String(c._id)).length ?? 0;
                  
                  // Calculate brand count for this category
                  const brandCount = Array.from(
                    new Set(
                      products?.filter(p => String(p.category) === String(c._id))
                        .map(p => String(p.brand))
                        .filter(Boolean) || []
                    )
                  ).length ?? 0;

                  return (
                    <tr key={c._id} className={!c.isActive ? "bg-gray-50 opacity-60" : ""}>
                      <td className="border p-1.5 sm:p-2 text-xs sm:text-sm">{c.productCategory?.name || c.name}</td>
                      <td className="border p-1.5 sm:p-2 text-center text-xs sm:text-sm whitespace-nowrap">{productCount}</td>
                      <td className="border p-1.5 sm:p-2 text-center text-xs sm:text-sm whitespace-nowrap">{brandCount}</td>
                      <td className="border p-1.5 sm:p-2 text-xs sm:text-sm text-center">
                        {c.isActive !== false ? (
                          <span className="text-green-600 font-medium">Active</span>
                        ) : (
                          <span className="text-red-600 font-medium">Disabled</span>
                        )}
                      </td>
                      <td className="border p-1.5 sm:p-2 space-x-2 sm:space-x-3 whitespace-nowrap">
                        <Link
                          href={`/admin/categories/view/${c._id}`}
                          className="text-green-600 text-xs sm:text-sm"
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/categories/${c._id}`}
                          className="text-blue-600 text-xs sm:text-sm"
                        >
                          Edit
                        </Link>

                        {c.isActive !== false ? (
                          <button
                            className="text-orange-600 text-xs sm:text-sm"
                            onClick={() => handleDisable(c._id)}
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            className="text-green-600 text-xs sm:text-sm"
                            onClick={() => handleEnable(c._id)}
                          >
                            Enable
                          </button>
                        )}
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
                  disabled={currentPage === 1 || loading}
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
                        disabled={loading}
                        className={`px-3 py-1.5 border rounded text-sm ${
                          currentPage === pageNum
                            ? "bg-black text-white"
                            : "hover:bg-gray-100"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
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
