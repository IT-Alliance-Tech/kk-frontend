/**
 * Admin Categories Page - Redesigned
 * Modern category management with product/brand counts and status controls
 */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAdminCategories, disableCategory, enableCategory, getAdminProducts, getAdminBrands } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, Eye, Pencil, Power, CheckCircle, XCircle, FolderTree, Package, Tag } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminTable, TableActionMenu, TableActionButton } from "@/components/admin/ui/AdminTable";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminFilterBar, AdminFilterSelect } from "@/components/admin/ui/AdminFilterBar";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";

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
  const limit = 10;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce global search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(globalSearch);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [globalSearch]);

  // Load products and brands once for counting
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
      
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      const response = await getAdminCategories(params);
      
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

  // Helper to get counts
  const getCategoryCounts = (categoryId: string) => {
    const productCount = products?.filter(p => String(p.category) === String(categoryId)).length ?? 0;
    const brandCount = Array.from(
      new Set(
        products?.filter(p => String(p.category) === String(categoryId))
          .map(p => String(p.brand))
          .filter(Boolean) || []
      )
    ).length ?? 0;
    return { productCount, brandCount };
  };

  // Table columns
  const columns = [
    {
      key: "name",
      header: "Category",
      render: (category: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <FolderTree className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {category.productCategory?.name || category.name}
            </p>
            {category.slug && (
              <p className="text-xs text-slate-500 font-mono">/{category.slug}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "products",
      header: "Products",
      className: "hidden sm:table-cell",
      render: (category: any) => {
        const { productCount } = getCategoryCounts(category._id);
        return (
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{productCount}</span>
          </div>
        );
      },
    },
    {
      key: "brands",
      header: "Brands",
      className: "hidden md:table-cell",
      render: (category: any) => {
        const { brandCount } = getCategoryCounts(category._id);
        return (
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{brandCount}</span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (category: any) => (
        category.isActive !== false ? (
          <AdminBadge variant="success" className="flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Active
          </AdminBadge>
        ) : (
          <AdminBadge variant="danger" className="flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Disabled
          </AdminBadge>
        )
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[80px]",
      render: (category: any) => (
        <TableActionMenu>
          <TableActionButton
            onClick={() => router.push(`/admin/categories/view/${category._id}`)}
            icon={<Eye className="w-4 h-4" />}
            label="View"
          />
          <TableActionButton
            onClick={() => router.push(`/admin/categories/${category._id}`)}
            icon={<Pencil className="w-4 h-4" />}
            label="Edit"
          />
          {category.isActive !== false ? (
            <TableActionButton
              onClick={() => handleDisable(category._id)}
              icon={<Power className="w-4 h-4" />}
              label="Disable"
            />
          ) : (
            <TableActionButton
              onClick={() => handleEnable(category._id)}
              icon={<Power className="w-4 h-4" />}
              label="Enable"
            />
          )}
        </TableActionMenu>
      ),
    },
  ];

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <AdminLoadingState fullPage message="Loading categories..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Categories"
        description="Organize products into categories"
        badge={
          <AdminBadge variant="secondary" size="lg">
            {total} categories
          </AdminBadge>
        }
        actions={
          <Link href="/admin/categories/new">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </Link>
        }
      />

      {/* Filters */}
      <AdminCard>
        <AdminFilterBar
          searchValue={globalSearch}
          searchPlaceholder="Search categories by name..."
          onSearchChange={setGlobalSearch}
        >
          <AdminFilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="All Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Disabled" },
            ]}
            className="w-full sm:w-36"
          />
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </AdminFilterBar>
      </AdminCard>

      {/* Categories Table */}
      <AdminCard padding="none">
        {categories.length === 0 && !loading ? (
          <AdminEmptyState
            type={hasActiveFilters ? "no-results" : "no-data"}
            title={hasActiveFilters ? "No categories found" : "No categories yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Add your first category to organize products."
            }
            action={
              hasActiveFilters
                ? { label: "Clear Filters", onClick: handleResetFilters }
                : { label: "Add Category", onClick: () => router.push("/admin/categories/new") }
            }
          />
        ) : (
          <>
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                  <AdminLoadingState />
                </div>
              )}
              <AdminTable
                columns={columns}
                data={categories}
                keyExtractor={(category) => category._id}
              />
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-200 px-4 py-3">
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={total}
                  itemsPerPage={limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
}
