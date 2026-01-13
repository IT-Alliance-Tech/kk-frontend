/**
 * Admin Brands Page - Redesigned
 * Modern brand management with logo previews, filters, and status controls
 */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAdminBrands, deleteBrand, disableBrand, enableBrand } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getErrorMessage, isAuthError } from "@/lib/utils/errorHandler";
import { Plus, Filter, X, Eye, Pencil, Trash2, Power, CheckCircle, XCircle, ImageIcon, ChevronDown } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminTable, TableActionMenu, TableActionButton } from "@/components/admin/ui/AdminTable";
import { AdminBadge, StatusBadge } from "@/components/admin/ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminFilterBar, AdminFilterSelect } from "@/components/admin/ui/AdminFilterBar";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";
import { AdminModal } from "@/components/admin/ui/AdminModal";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Filter states
  const [globalSearch, setGlobalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; brand: any }>({ open: false, brand: null });
  const [actionLoading, setActionLoading] = useState(false);
  
  const router = useRouter();
  const limit = 10; // Items per page
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

  const loadBrands = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      const response = await getAdminBrands(params);
      
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
  }, [debouncedSearch, filterStatus, limit]);

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
    setFilterStatus("");
  };

  const hasActiveFilters = debouncedSearch || filterStatus;

  const handleDelete = async () => {
    if (!deleteModal.brand) return;
    try {
      setActionLoading(true);
      setErrorMessage("");
      await deleteBrand(deleteModal.brand._id);
      setDeleteModal({ open: false, brand: null });
      loadBrands(currentPage);
    } catch (err: any) {
      console.error("Brand deletion error:", err);
      const message = getErrorMessage(err, "Failed to delete brand. Please try again.");
      setErrorMessage(message);
      
      if (isAuthError(err)) {
        router.push("/admin/login");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable = async (id: string) => {
    try {
      setErrorMessage("");
      await disableBrand(id);
      loadBrands(currentPage);
    } catch (err: any) {
      console.error("Brand disable error:", err);
      const message = getErrorMessage(err, "Failed to disable brand. Please try again.");
      setErrorMessage(message);
      
      if (isAuthError(err)) {
        router.push("/admin/login");
      }
    }
  };

  const handleEnable = async (id: string) => {
    try {
      setErrorMessage("");
      await enableBrand(id);
      loadBrands(currentPage);
    } catch (err: any) {
      console.error("Brand enable error:", err);
      const message = getErrorMessage(err, "Failed to enable brand. Please try again.");
      setErrorMessage(message);
      
      if (isAuthError(err)) {
        router.push("/admin/login");
      }
    }
  };

  // Brand stats
  const brandStats = {
    total: total,
    active: brands.filter(b => b.isActive !== false).length,
    inactive: brands.filter(b => b.isActive === false).length,
  };

  // Table columns
  const columns = [
    {
      key: "logo",
      header: "Logo",
      className: "w-[80px]",
      render: (brand: any) => (
        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
          {brand.logoUrl ? (
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              className="w-full h-full object-contain p-1"
              width={56}
              height={56}
              loading="lazy"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Brand Name",
      render: (brand: any) => (
        <div>
          <p className="font-medium text-slate-900">{brand.name}</p>
          {brand.slug && (
            <p className="text-xs text-slate-500 font-mono">/{brand.slug}</p>
          )}
        </div>
      ),
    },
    {
      key: "products",
      header: "Products",
      className: "hidden md:table-cell",
      render: (brand: any) => (
        <span className="text-slate-600">
          {brand.productCount || 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (brand: any) => (
        brand.isActive !== false ? (
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
      render: (brand: any) => (
        <TableActionMenu>
          <TableActionButton
            onClick={() => router.push(`/admin/brands/${brand._id}`)}
            icon={<Pencil className="w-4 h-4" />}
            label="Edit"
          />
          {brand.isActive !== false ? (
            <TableActionButton
              onClick={() => handleDisable(brand._id)}
              icon={<Power className="w-4 h-4" />}
              label="Disable"
            />
          ) : (
            <TableActionButton
              onClick={() => handleEnable(brand._id)}
              icon={<Power className="w-4 h-4" />}
              label="Enable"
              variant="default"
            />
          )}
          <TableActionButton
            onClick={() => setDeleteModal({ open: true, brand })}
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete"
            variant="danger"
          />
        </TableActionMenu>
      ),
    },
  ];

  if (loading && brands.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <AdminLoadingState fullPage message="Loading brands..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Brands"
        description="Manage your product brands and manufacturers"
        badge={
          <AdminBadge variant="secondary" size="lg">
            {total} brands
          </AdminBadge>
        }
        actions={
          <Link href="/admin/brands/new">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          </Link>
        }
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{errorMessage}</p>
          <button
            onClick={() => setErrorMessage("")}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <AdminCard>
        <AdminFilterBar
          searchValue={globalSearch}
          searchPlaceholder="Search brands by name..."
          onSearchChange={setGlobalSearch}
        >
          <AdminFilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="All Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
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

      {/* Brands Table */}
      <AdminCard padding="none">
        {brands.length === 0 && !loading ? (
          <AdminEmptyState
            type={hasActiveFilters ? "no-results" : "no-data"}
            title={hasActiveFilters ? "No brands found" : "No brands yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Add your first brand to get started."
            }
            action={
              hasActiveFilters
                ? { label: "Clear Filters", onClick: handleResetFilters }
                : { label: "Add Brand", onClick: () => router.push("/admin/brands/new") }
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
                data={brands}
                keyExtractor={(brand) => brand._id}
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

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, brand: null })}
        title="Delete Brand"
        description={`Are you sure you want to delete "${deleteModal.brand?.name}"? This action cannot be undone.`}
        size="sm"
      >
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg mb-4">
          {deleteModal.brand?.logoUrl ? (
            <Image
              src={deleteModal.brand.logoUrl}
              alt={deleteModal.brand.name}
              className="w-12 h-12 object-contain"
              width={48}
              height={48}
            />
          ) : (
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-red-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-slate-900">{deleteModal.brand?.name}</p>
            <p className="text-sm text-slate-500">{deleteModal.brand?.productCount || 0} products</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModal({ open: false, brand: null })}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {actionLoading ? "Deleting..." : "Delete Brand"}
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
