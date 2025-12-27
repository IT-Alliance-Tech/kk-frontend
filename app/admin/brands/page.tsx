"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAdminBrands, deleteBrand, disableBrand, enableBrand } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GlobalLoader from "@/components/common/GlobalLoader";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [globalSearch, setGlobalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const router = useRouter();
  const limit = 5; // STRICT: 5 brands per page
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

  const loadBrands = useCallback(async (page: number = 1) => {
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
      
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      const response = await getAdminBrands(params);
      
      // Extract brands and pagination info
      const brandsData = response?.brands || response?.data?.brands || [];
      const totalCount = response?.total || response?.data?.total || 0;
      const totalPagesCount = response?.totalPages || response?.data?.totalPages || 1;
      
      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setTotal(totalCount);
      setTotalPages(totalPagesCount);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load brands:", error);
      setBrands([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterName, filterStatus, limit]);

  // Load brands when filters change, reset to page 1
  useEffect(() => {
    loadBrands(1);
  }, [loadBrands]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || loading) return;
    loadBrands(newPage);
  };

  const handleResetFilters = () => {
    setGlobalSearch("");
    setDebouncedSearch("");
    setFilterName("");
    setFilterStatus("");
  };

  const hasActiveFilters = debouncedSearch || filterName || filterStatus;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await deleteBrand(id);
      loadBrands(currentPage);
    } catch (err: any) {
      console.error("Brand deletion error:", err);
      alert(err.message || "Failed to delete brand");
      
      // Handle 401 Unauthorized - redirect to login
      if (err.status === 401 || err.message?.includes("Invalid user") || err.message?.includes("Not authenticated")) {
        router.push("/admin/login");
      }
    }
  };

  const handleDisable = async (id: string) => {
    if (!confirm("Are you sure you want to disable this brand?")) return;
    try {
      await disableBrand(id);
      loadBrands(currentPage);
    } catch (err: any) {
      console.error("Brand disable error:", err);
      alert(err.message || "Failed to disable brand");
      
      if (err.status === 401 || err.message?.includes("Invalid user") || err.message?.includes("Not authenticated")) {
        router.push("/admin/login");
      }
    }
  };

  const handleEnable = async (id: string) => {
    try {
      await enableBrand(id);
      loadBrands(currentPage);
    } catch (err: any) {
      console.error("Brand enable error:", err);
      alert(err.message || "Failed to enable brand");
      
      if (err.status === 401 || err.message?.includes("Invalid user") || err.message?.includes("Not authenticated")) {
        router.push("/admin/login");
      }
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Brands</h1>
        <Link
          href="/admin/brands/new"
          className="bg-black text-white px-4 py-2 rounded text-sm sm:text-base text-center"
        >
          + Add Brand
        </Link>
      </div>

      {/* Global Search Bar */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search brands by name..."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Brand Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                placeholder="Filter by name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && (
        <div className="mb-3 text-sm text-gray-600">
          {total > 0 ? (
            <>
              Showing {brands.length > 0 ? ((currentPage - 1) * limit + 1) : 0} to {Math.min(currentPage * limit, total)} of {total} brand{total !== 1 ? 's' : ''}
              {hasActiveFilters && " (filtered)"}
            </>
          ) : (
            "No brands found"
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
              <tr className="bg-gray-100">
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Logo</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Name</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Status</th>
                <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Action</th>
              </tr>
            </thead>

            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border p-4 text-center text-gray-500">
                    No brands found
                  </td>
                </tr>
              ) : (
                brands.map((b: any) => (
                  <tr key={b._id} className={!b.isActive ? "bg-gray-50 opacity-60" : ""}>
                    <td className="border p-2">
                      {b.logoUrl ? (
                        <Image
                          src={b.logoUrl}
                          alt={b.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                          width={500}
                          height={500}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 flex items-center justify-center text-xs">
                          No Logo
                        </div>
                      )}
                    </td>
                    <td className="border p-2 text-xs sm:text-sm">{b.name}</td>
                    <td className="border p-2 text-xs sm:text-sm text-center">
                      {b.isActive !== false ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-red-600 font-medium">Disabled</span>
                      )}
                    </td>
                    <td className="border p-2 space-x-2 sm:space-x-3 whitespace-nowrap">
                      <Link
                        href={`/admin/brands/${b._id}`}
                        className="text-blue-600 text-xs sm:text-sm"
                      >
                        Edit
                      </Link>

                      {b.isActive !== false ? (
                        <>
                          <button
                            className="text-orange-600 text-xs sm:text-sm"
                            onClick={() => handleDisable(b._id)}
                          >
                            Disable
                          </button>
                          <button
                            className="text-red-600 text-xs sm:text-sm"
                            onClick={() => handleDelete(b._id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          className="text-green-600 text-xs sm:text-sm"
                          onClick={() => handleEnable(b._id)}
                        >
                          Enable
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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
                        className={`px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
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
