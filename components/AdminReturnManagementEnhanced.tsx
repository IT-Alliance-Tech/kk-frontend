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
  adminGetAllowedStatuses,
  ReturnRequest,
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

// Status display configuration
const STATUS_CONFIG: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
  return_requested: { label: "Return Requested", variant: "info", icon: <FileText className="w-3 h-3" /> },
  return_approved: { label: "Return Approved", variant: "success", icon: <CheckCircle className="w-3 h-3" /> },
  pickup_scheduled: { label: "Pickup Scheduled", variant: "purple", icon: <Truck className="w-3 h-3" /> },
  product_received: { label: "Product Received", variant: "blue", icon: <Package className="w-3 h-3" /> },
  refund_initiated: { label: "Refund Initiated", variant: "warning", icon: <Banknote className="w-3 h-3" /> },
  refund_completed: { label: "Refund Completed", variant: "success", icon: <CheckCircle className="w-3 h-3" /> },
  return_completed: { label: "Return Completed", variant: "secondary", icon: <CheckCircle className="w-3 h-3" /> },
  return_rejected: { label: "Return Rejected", variant: "danger", icon: <XCircle className="w-3 h-3" /> },
  // Legacy
  pending: { label: "Pending", variant: "info", icon: <Clock className="w-3 h-3" /> },
  approved: { label: "Approved", variant: "success", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: "Rejected", variant: "danger", icon: <XCircle className="w-3 h-3" /> },
  completed: { label: "Completed", variant: "secondary", icon: <CheckCircle className="w-3 h-3" /> },
};

const getStatusDisplay = (status: string) => {
  return STATUS_CONFIG[status] || { label: status, variant: "secondary", icon: <Clock className="w-3 h-3" /> };
};

export default function AdminReturnManagementEnhanced() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterActionType, setFilterActionType] = useState<string>("");
  
  // Selected return for status update
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [allowedStatuses, setAllowedStatuses] = useState<ReturnStatus[]>([]);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load returns with useCallback for performance
  const loadReturns = useCallback(async (pageNum: number = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminGetAllReturnRequests({
        status: filterStatus || undefined,
        actionType: filterActionType as any,
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
  }, [page, filterStatus, filterActionType]);

  useEffect(() => {
    loadReturns(1);
  }, [filterStatus, filterActionType]);

  // Open status update modal
  const openStatusUpdate = async (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setNewStatus("");
    setAdminNotes("");
    setRefundAmount("");
    setShowConfirmModal(false);
    
    try {
      const data = await adminGetAllowedStatuses(returnRequest._id);
      setAllowedStatuses(data.allowedNextStatuses || []);
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
        selectedReturn._id,
        newStatus as ReturnStatus,
        adminNotes || undefined,
        refundAmount ? parseFloat(refundAmount) : undefined
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
    setFilterActionType("");
  };

  const hasActiveFilters = filterStatus || filterActionType;

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
            {returns.filter(r => r.status === 'return_requested' || r.status === 'pending').length}
          </p>
          <p className="text-sm text-blue-600">Pending</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-700">
            {returns.filter(r => ['return_approved', 'pickup_scheduled', 'product_received', 'refund_initiated'].includes(r.status)).length}
          </p>
          <p className="text-sm text-amber-600">In Progress</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-700">
            {returns.filter(r => r.status === 'return_completed' || r.status === 'completed' || r.status === 'refund_completed').length}
          </p>
          <p className="text-sm text-emerald-600">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <AdminFilterSelect
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="All Statuses"
              options={[
                { value: "return_requested", label: "Return Requested" },
                { value: "return_approved", label: "Return Approved" },
                { value: "pickup_scheduled", label: "Pickup Scheduled" },
                { value: "product_received", label: "Product Received" },
                { value: "refund_initiated", label: "Refund Initiated" },
                { value: "refund_completed", label: "Refund Completed" },
                { value: "return_completed", label: "Return Completed" },
                { value: "return_rejected", label: "Return Rejected" },
              ]}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <AdminFilterSelect
              value={filterActionType}
              onChange={setFilterActionType}
              placeholder="All Types"
              options={[
                { value: "return", label: "Return Only" },
                { value: "return_refund", label: "Return + Refund" },
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
                    header: "Return ID",
                    render: (r: ReturnRequest) => (
                      <span className="font-mono text-sm text-slate-600">
                        #{r._id.slice(-8).toUpperCase()}
                      </span>
                    ),
                  },
                  {
                    key: "product",
                    header: "Product",
                    render: (r: ReturnRequest) => (
                      <p className="font-medium text-slate-900 truncate max-w-[200px]">
                        {r.productId?.name || "N/A"}
                      </p>
                    ),
                  },
                  {
                    key: "customer",
                    header: "Customer",
                    className: "hidden md:table-cell",
                    render: (r: ReturnRequest) => (
                      <span className="text-slate-600 text-sm">
                        {(r as any).userId?.name || "N/A"}
                      </span>
                    ),
                  },
                  {
                    key: "type",
                    header: "Type",
                    render: (r: ReturnRequest) => (
                      <AdminBadge variant={r.actionType === "return_refund" ? "purple" : "blue"}>
                        {r.actionType === "return_refund" ? "Return + Refund" : "Return Only"}
                      </AdminBadge>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (r: ReturnRequest) => {
                      const status = getStatusDisplay(r.status);
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
                    render: (r: ReturnRequest) => (
                      <span className="text-slate-600 text-sm">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "w-[80px]",
                    render: (r: ReturnRequest) => (
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
                keyExtractor={(r) => r._id}
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
        description={`Return #${selectedReturn?._id.slice(-8).toUpperCase()}`}
        size="lg"
      >
        {selectedReturn && (
          <div className="space-y-6">
            {/* Current Info */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Product:</span>
                <span className="text-slate-900 font-medium">
                  {selectedReturn.productId?.name || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Type:</span>
                <AdminBadge variant={selectedReturn.actionType === "return_refund" ? "purple" : "blue"}>
                  {selectedReturn.actionType === "return_refund" ? "Return + Refund" : "Return Only"}
                </AdminBadge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Current Status:</span>
                <AdminBadge variant={getStatusDisplay(selectedReturn.status).variant as any} className="flex items-center gap-1">
                  {getStatusDisplay(selectedReturn.status).icon}
                  {getStatusDisplay(selectedReturn.status).label}
                </AdminBadge>
              </div>
            </div>

            {/* Status History */}
            {selectedReturn.statusHistory && selectedReturn.statusHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Status Timeline</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {selectedReturn.statusHistory.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {getStatusDisplay(entry.status).label}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 text-xs">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-slate-600 text-xs mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Admin Notes <span className="text-slate-400 text-xs font-normal">(Optional)</span>
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={updating}
                rows={3}
                maxLength={500}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 resize-none"
                placeholder="Add notes about this status change..."
              />
              <p className="text-xs text-slate-500 mt-1">
                {adminNotes.length}/500 characters
              </p>
            </div>

            {/* Refund Amount (if applicable) */}
            {(newStatus === "refund_initiated" || newStatus === "refund_completed") && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Refund Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  disabled={updating}
                  step="0.01"
                  min="0"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>
            )}

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
                disabled={updating || !newStatus || (["refund_initiated", "refund_completed"].includes(newStatus) && !refundAmount)}
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
