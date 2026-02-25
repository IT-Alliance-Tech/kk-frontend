/**
 * Admin Return Management Component (Enhanced UX)
 * Displays and manages all return/refund requests
 * Redesigned with Admin Design System
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  adminGetAllReturnRequests,
  adminUpdateReturnStatus,
  AdminReturnItem,
  ReturnStatus,
} from "@/lib/api/returns.api";
import { ApiError } from "@/lib/api";
import { RefreshCw, Package, Clock, CheckCircle, XCircle, ArrowRight, FileText, X, AlertTriangle, Truck, Banknote } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminTable, TableActionMenu, TableActionButton } from "@/components/admin/ui/AdminTable";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminFilterBar, AdminFilterSelect } from "@/components/admin/ui/AdminFilterBar";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";
import { AdminModal } from "@/components/admin/ui/AdminModal";

const STATUS_CONFIG: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
  requested: { label: "Requested", variant: "info", icon: <FileText className="w-3 h-3" /> },
  initiated: { label: "Initiated", variant: "purple", icon: <Truck className="w-3 h-3" /> },
  in_process: { label: "In Process", variant: "warning", icon: <Banknote className="w-3 h-3" /> },
  completed: { label: "Completed", variant: "success", icon: <CheckCircle className="w-3 h-3" /> },
};

const getStatusDisplay = (status?: string | null) => {
  if (!status) return { label: "Unknown", variant: "secondary", icon: <Clock className="w-3 h-3" /> };
  return STATUS_CONFIG[status] || { label: status.replace('_', ' '), variant: "secondary", icon: <Clock className="w-3 h-3" /> };
};

export default function AdminReturnManagementEnhanced() {
  const [returns, setReturns] = useState<AdminReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<ReturnStatus | "">("");

  // Selected return for status update
  const [selectedReturn, setSelectedReturn] = useState<AdminReturnItem | null>(null);
  const [allowedStatuses, setAllowedStatuses] = useState<ReturnStatus[]>([]);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadReturns = async (pageNum: number = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminGetAllReturnRequests({
        returnStatus: (filterStatus as ReturnStatus) || undefined,
        page: pageNum,
        limit: 20,
      });
      setReturns(data.returnRequests || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load return requests");
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns(1);
  }, [filterStatus]);

  // Open status update modal
  const openStatusUpdate = async (returnRequest: AdminReturnItem) => {
    setSelectedReturn(returnRequest);
    setNewStatus("");
    setAdminNotes("");
    setRefundAmount("");
    setShowConfirmModal(false);
    try {
      // Hardcoded forward-only allowed statuses based on the state machine
      const RETURN_STATUSES = ['none', 'requested', 'initiated', 'in_process', 'completed'];
      const idx = RETURN_STATUSES.indexOf(returnRequest.returnStatus || 'none');
      setAllowedStatuses(RETURN_STATUSES.slice(idx + 1) as ReturnStatus[]);
    } catch (err) {
      const apiError = err as ApiError;
      setError(`Failed to load allowed statuses: ${apiError.message}`);
    }
  };

  // Close modal
  const closeModal = () => {
    setSelectedReturn(null);
    setAllowedStatuses([]);
    setNewStatus("");
    setAdminNotes("");
    setRefundAmount("");
    setShowConfirmModal(false);
  };

  // Show confirmation before updating
  const confirmStatusUpdate = () => {
    if (!newStatus) {
      setError("Please select a status");
      return;
    }
    setShowConfirmModal(true);
  };

  // Submit status update
  const handleStatusUpdate = async () => {
    if (!selectedReturn || !newStatus) return;

    try {
      setUpdating(true);
      setError(null);
      await adminUpdateReturnStatus(
        selectedReturn.orderId,
        selectedReturn.itemId,
        newStatus as ReturnStatus
      );
      closeModal();
      loadReturns(page);
    } catch (err) {
      const apiError = err as ApiError;
      setError(`Failed to update status: ${apiError.message}`);
    } finally {
      setUpdating(false);
      setShowConfirmModal(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || loading) return;
    loadReturns(newPage);
  };

  const handleResetFilters = () => {
    setFilterStatus("");
  };

  const hasActiveFilters = filterStatus;

  // Loading skeleton
  if (loading && returns.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <AdminLoadingState fullPage message="Loading returns..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Returns & Refunds"
        description="Manage customer return and refund requests"
        badge={
          <AdminBadge variant="secondary" size="lg">
            {total} requests
          </AdminBadge>
        }
        actions={
          <button
            onClick={() => loadReturns(page)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-slate-900">{total}</p>
          <p className="text-sm text-slate-600">Total</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-700">
            {returns.filter(r => r.returnStatus === 'requested').length}
          </p>
          <p className="text-sm text-blue-600">Pending</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-700">
            {returns.filter(r => ['initiated', 'in_process'].includes(r.returnStatus)).length}
          </p>
          <p className="text-sm text-amber-600">In Progress</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-700">
            {returns.filter(r => r.returnStatus === 'completed').length}
          </p>
          <p className="text-sm text-emerald-600">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <AdminFilterSelect
              value={filterStatus as string}
              onChange={(val) => setFilterStatus(val as ReturnStatus | "")}
              placeholder="All Statuses"
              options={[
                { value: "requested", label: "Requested" },
                { value: "initiated", label: "Initiated" },
                { value: "in_process", label: "In Process" },
                { value: "completed", label: "Completed" },
              ]}
              className="w-full"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </AdminCard>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Returns Table */}
      <AdminCard padding="none">
        {returns.length === 0 ? (
          <AdminEmptyState
            type={hasActiveFilters ? "no-results" : "no-data"}
            title={hasActiveFilters ? "No returns found" : "No return requests"}
            description={
              hasActiveFilters
                ? "Try adjusting your filters."
                : "Return requests will appear here when customers submit them."
            }
            action={hasActiveFilters ? { label: "Clear Filters", onClick: handleResetFilters } : undefined}
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
                columns={[
                  {
                    key: "id",
                    header: "Order / Item ID",
                    render: (r: AdminReturnItem) => (
                      <div className="font-mono text-sm text-slate-600 truncate flex flex-col gap-1">
                        <span title={r.orderId}>#{(r.orderId || '').slice(-6).toUpperCase()}</span>
                        <span title={r.itemId} className="text-xs text-slate-400">Pt: {(r.itemId || '').slice(-6).toUpperCase()}</span>
                      </div>
                    ),
                  },
                  {
                    key: "product",
                    header: "Product & Return Qty",
                    render: (r: AdminReturnItem) => (
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-slate-900 truncate max-w-[150px]" title={r.productTitle}>
                          {r.productTitle || "N/A"}
                        </p>
                        <span className="text-xs text-slate-500 font-medium">Return Qty: {r.returnRequestedQty}</span>
                      </div>
                    ),
                  },
                  {
                    key: "customer",
                    header: "Customer",
                    className: "hidden md:table-cell",
                    render: (r: AdminReturnItem) => (
                      <span className="text-slate-600 text-sm">
                        {r.customerName || "N/A"}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (r: AdminReturnItem) => {
                      const status = getStatusDisplay(r.returnStatus);
                      return (
                        <AdminBadge variant={status.variant as any} className="flex items-center gap-1">
                          {status.icon}
                          <span className="hidden sm:inline">{status.label}</span>
                        </AdminBadge>
                      );
                    },
                  },
                  {
                    key: "date",
                    header: "Date",
                    className: "hidden lg:table-cell",
                    render: (r: AdminReturnItem) => (
                      <span className="text-slate-600 text-sm">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "w-[80px]",
                    render: (r: AdminReturnItem) => (
                      <TableActionMenu>
                        <TableActionButton
                          onClick={() => openStatusUpdate(r)}
                          icon={<ArrowRight className="w-4 h-4" />}
                          label="Manage"
                        />
                      </TableActionMenu>
                    ),
                  },
                ]}
                data={returns}
                keyExtractor={(r) => r.itemId}
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-200 px-4 py-3">
                <AdminPagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  itemsPerPage={20}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </AdminCard>

      {/* Status Update Modal */}
      <AdminModal
        isOpen={!!selectedReturn}
        onClose={closeModal}
        title="Update Return Status"
        description={`Item #${(selectedReturn?.itemId || '').slice(-8).toUpperCase()}`}
        size="lg"
      >
        {selectedReturn && (
          <div className="space-y-6">
            {/* Current Info */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Order ID:</span>
                <span className="text-slate-900 font-medium font-mono uppercase">
                  {selectedReturn.orderId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Item ID:</span>
                <span className="text-slate-900 font-medium font-mono uppercase">
                  {selectedReturn.itemId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Product:</span>
                <span className="text-slate-900 font-medium">
                  {selectedReturn.productTitle || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Request Details:</span>
                <span className="text-slate-900 font-medium">
                  {selectedReturn.returnRequestedQty} item(s) from Order total ({selectedReturn.qtyOrdered})
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Current Status:</span>
                <AdminBadge variant={getStatusDisplay(selectedReturn.returnStatus).variant as any} className="flex items-center gap-1">
                  {getStatusDisplay(selectedReturn.returnStatus).icon}
                  {getStatusDisplay(selectedReturn.returnStatus).label}
                </AdminBadge>
              </div>
            </div>

            {/* New Status Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Status <span className="text-red-500">*</span>
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={updating}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">-- Select New Status --</option>
                {allowedStatuses.length === 0 && (
                  <option disabled>No transitions available</option>
                )}
                {allowedStatuses.map((status) => (
                  <option key={status} value={status}>
                    {getStatusDisplay(status).label}
                  </option>
                ))}
              </select>
              {allowedStatuses.length === 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  This return is in a terminal state.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={closeModal}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={updating || !newStatus}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Confirmation Modal */}
      <AdminModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Status Update"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to change the status to{" "}
            <span className="font-semibold">{getStatusDisplay(newStatus).label}</span>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              disabled={updating}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {updating ? "Updating..." : "Confirm"}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
