/**
 * Admin Coupons Page - Redesigned
 * Modern coupon management with filters, table, and modal
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { listCoupons, deleteCoupon, type Coupon } from '@/lib/api/coupons.api';
import { Plus, Pencil, Trash2, Search, Calendar, Tag, TrendingUp, X, Percent, DollarSign } from 'lucide-react';

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminTable, TableActionMenu, TableActionButton } from "@/components/admin/ui/AdminTable";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/ui/AdminFilterBar";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import Pagination from "@/components/common/Pagination";

const CouponModal = dynamic(() => import('@/components/admin/CouponModal'), { ssr: false });

const ITEMS_PER_PAGE = 10;

export default function AdminCouponsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>(
    (searchParams.get('status') as 'all' | 'active' | 'expired') || 'all'
  );
  const [paginationInfo, setPaginationInfo] = useState<{
    total: number;
    page: number;
    pages: number;
  }>({
    total: 0,
    page: 1,
    pages: 1,
  });
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; coupon: Coupon | null }>({ open: false, coupon: null });

  // Get current page from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build params for API
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (filterStatus === 'active') {
        params.active = true;
        params.expired = false;
      } else if (filterStatus === 'expired') {
        params.expired = true;
      }

      const result = await listCoupons(params);
      const couponsList = result.coupons || result;
      const pagination = result.pagination;
      
      setCoupons(couponsList);
      
      if (pagination) {
        setPaginationInfo({
          total: pagination.total || couponsList.length,
          page: pagination.page || currentPage,
          pages: pagination.pages || 1,
        });
      } else {
        setPaginationInfo({
          total: couponsList.length,
          page: currentPage,
          pages: 1,
        });
      }
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, searchTerm, filterStatus]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationInfo.pages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`/admin/coupons?${params.toString()}`, { scroll: true });
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/admin/coupons?${params.toString()}`, { scroll: false });
  };

  // Handle status filter change
  const handleStatusChange = (status: 'all' | 'active' | 'expired') => {
    setFilterStatus(status);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (status !== 'all') {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`/admin/coupons?${params.toString()}`, { scroll: false });
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.coupon) return;
    
    try {
      await deleteCoupon(deleteModal.coupon._id);
      setCoupons(coupons.filter((c) => c._id !== deleteModal.coupon?._id));
      setDeleteModal({ open: false, coupon: null });
    } catch (err: any) {
      alert(`Failed to delete coupon: ${err.message}`);
    }
  };

  const handleModalClose = (refresh?: boolean) => {
    setShowModal(false);
    setEditingCoupon(null);
    if (refresh) {
      fetchCoupons();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getApplicabilityText = (coupon: Coupon) => {
    if (
      coupon.applicableProducts.length === 0 &&
      coupon.applicableCategories.length === 0 &&
      coupon.applicableBrands.length === 0
    ) {
      return 'All Products';
    }

    const parts = [];
    if (coupon.applicableProducts.length > 0) {
      parts.push(`${coupon.applicableProducts.length} Products`);
    }
    if (coupon.applicableCategories.length > 0) {
      parts.push(`${coupon.applicableCategories.length} Categories`);
    }
    if (coupon.applicableBrands.length > 0) {
      parts.push(`${coupon.applicableBrands.length} Brands`);
    }

    return parts.join(', ');
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const hasActiveFilters = searchTerm || filterStatus !== 'all';

  // Coupon stats
  const now = new Date();
  const activeCoupons = coupons.filter(c => c.active && new Date(c.expiryDate) >= now).length;
  const expiredCoupons = coupons.filter(c => new Date(c.expiryDate) < now).length;

  // Table columns
  const columns = [
    {
      key: "code",
      header: "Coupon Code",
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Tag className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="font-mono font-semibold text-slate-900">{coupon.code}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (coupon: Coupon) => (
        <AdminBadge variant={coupon.type === 'percentage' ? 'purple' : 'blue'}>
          {coupon.type === 'percentage' ? 'Percentage' : 'Flat'}
        </AdminBadge>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-1.5">
          {coupon.type === 'percentage' ? (
            <Percent className="w-4 h-4 text-emerald-600" />
          ) : (
            <span className="text-emerald-600 font-medium">₹</span>
          )}
          <span className="font-semibold text-slate-900">
            {coupon.type === 'percentage' ? `${coupon.value}%` : coupon.value}
          </span>
        </div>
      ),
    },
    {
      key: "applies",
      header: "Applies To",
      className: "hidden lg:table-cell",
      render: (coupon: Coupon) => (
        <span className="text-sm text-slate-600">{getApplicabilityText(coupon)}</span>
      ),
    },
    {
      key: "expiry",
      header: "Expiry",
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Calendar className="w-4 h-4" />
          {formatDate(coupon.expiryDate)}
        </div>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      className: "hidden md:table-cell",
      render: (coupon: Coupon) => (
        <span className="text-sm text-slate-600">
          {coupon.usedCount}
          {coupon.usageLimit && <span className="text-slate-400"> / {coupon.usageLimit}</span>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (coupon: Coupon) => {
        const expired = isExpired(coupon.expiryDate);
        if (expired) {
          return <AdminBadge variant="danger">Expired</AdminBadge>;
        }
        return coupon.active ? (
          <AdminBadge variant="success">Active</AdminBadge>
        ) : (
          <AdminBadge variant="secondary">Inactive</AdminBadge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-[80px]",
      render: (coupon: Coupon) => (
        <TableActionMenu>
          <TableActionButton
            onClick={() => handleEdit(coupon)}
            icon={<Pencil className="w-4 h-4" />}
            label="Edit"
          />
          <TableActionButton
            onClick={() => setDeleteModal({ open: true, coupon })}
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete"
            variant="danger"
          />
        </TableActionMenu>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <AdminLoadingState fullPage message="Loading coupons..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Coupons"
        description="Manage discount coupons and promotions"
        badge={
          <AdminBadge variant="secondary" size="lg">
            {coupons.length} coupons
          </AdminBadge>
        }
        actions={
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{coupons.length}</p>
          <p className="text-sm text-slate-600">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{activeCoupons}</p>
          <p className="text-sm text-emerald-600">Active</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{expiredCoupons}</p>
          <p className="text-sm text-red-600">Expired</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <AdminCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by coupon code..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'expired'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filterStatus === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </AdminCard>

      {/* Coupons Table */}
      <AdminCard padding="none">
        {coupons.length === 0 ? (
          <AdminEmptyState
            type={hasActiveFilters ? "no-results" : "no-data"}
            title={hasActiveFilters ? "No coupons found" : "No coupons yet"}
            description={
              hasActiveFilters
                ? "No coupons match your search criteria."
                : "Create your first coupon to offer discounts."
            }
            action={
              hasActiveFilters
                ? { label: "Clear Filters", onClick: () => { handleSearchChange(''); handleStatusChange('all'); } }
                : { label: "Create Coupon", onClick: handleCreate }
            }
          />
        ) : (
          <>
            <AdminTable
              columns={columns}
              data={coupons}
              keyExtractor={(coupon) => coupon._id}
            />
            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={paginationInfo.page}
                totalPages={paginationInfo.pages}
                totalItems={paginationInfo.total}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                hasNext={paginationInfo.page < paginationInfo.pages}
                hasPrev={paginationInfo.page > 1}
              />
            </div>
          </>
        )}
      </AdminCard>

      {/* Create/Edit Modal */}
      {showModal && (
        <CouponModal
          coupon={editingCoupon}
          onClose={handleModalClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, coupon: null })}
        title="Delete Coupon"
        description={`Are you sure you want to delete coupon "${deleteModal.coupon?.code}"? This action cannot be undone.`}
        size="sm"
      >
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-mono font-semibold text-slate-900">{deleteModal.coupon?.code}</p>
            <p className="text-sm text-slate-500">
              {deleteModal.coupon?.type === 'percentage' 
                ? `${deleteModal.coupon.value}% off` 
                : `₹${deleteModal.coupon?.value} off`}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModal({ open: false, coupon: null })}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete Coupon
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
