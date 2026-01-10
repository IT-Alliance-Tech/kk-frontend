/**
 * Admin Return Management Component (Enhanced UX)
 * Displays and manages all return/refund requests
 * Focus: UI/UX improvements, responsive design, performance
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
import GlobalLoader from "@/components/common/GlobalLoader";

// Status display configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  return_requested: { label: "Return Requested", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: "📝" },
  return_approved: { label: "Return Approved", color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: "✅" },
  pickup_scheduled: { label: "Pickup Scheduled", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", icon: "📦" },
  product_received: { label: "Product Received", color: "text-indigo-700", bgColor: "bg-indigo-50 border-indigo-200", icon: "✔️" },
  refund_initiated: { label: "Refund Initiated", color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", icon: "💰" },
  refund_completed: { label: "Refund Completed", color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: "✅" },
  return_completed: { label: "Return Completed", color: "text-slate-700", bgColor: "bg-slate-50 border-slate-200", icon: "✔️" },
  return_rejected: { label: "Return Rejected", color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: "❌" },
  // Legacy
  pending: { label: "Pending", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: "⏳" },
  approved: { label: "Approved", color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: "✅" },
  rejected: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: "❌" },
  completed: { label: "Completed", color: "text-slate-700", bgColor: "bg-slate-50 border-slate-200", icon: "✔️" },
};

const getStatusDisplay = (status: string) => {
  return STATUS_CONFIG[status] || { label: status, color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200", icon: "•" };
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
      <div className="p-3 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <GlobalLoader size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Returns & Refunds</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage customer return and refund requests
          </p>
        </div>
        <button
          onClick={() => loadReturns(page)}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-600">Total Returns</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 shadow-sm">
          <p className="text-xs sm:text-sm text-blue-700 font-medium">Pending</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-900 mt-1">
            {returns.filter(r => r.status === 'return_requested' || r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200 shadow-sm">
          <p className="text-xs sm:text-sm text-yellow-700 font-medium">In Progress</p>
          <p className="text-lg sm:text-2xl font-bold text-yellow-900 mt-1">
            {returns.filter(r => ['return_approved', 'pickup_scheduled', 'product_received', 'refund_initiated'].includes(r.status)).length}
          </p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200 shadow-sm">
          <p className="text-xs sm:text-sm text-green-700 font-medium">Completed</p>
          <p className="text-lg sm:text-2xl font-bold text-green-900 mt-1">
            {returns.filter(r => r.status === 'return_completed' || r.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="return_requested">Return Requested</option>
              <option value="return_approved">Return Approved</option>
              <option value="pickup_scheduled">Pickup Scheduled</option>
              <option value="product_received">Product Received</option>
              <option value="refund_initiated">Refund Initiated</option>
              <option value="refund_completed">Refund Completed</option>
              <option value="return_completed">Return Completed</option>
              <option value="return_rejected">Return Rejected</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select
              value={filterActionType}
              onChange={(e) => setFilterActionType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="return">Return Only</option>
              <option value="return_refund">Return + Refund</option>
            </select>
          </div>
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Returns Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[768px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Return ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Customer
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <span className="text-4xl mb-3">📦</span>
                      <p className="text-sm font-medium">No return requests found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {hasActiveFilters ? "Try adjusting your filters" : "Return requests will appear here"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                returns.map((returnRequest) => {
                  const statusDisplay = getStatusDisplay(returnRequest.status);
                  const productName = returnRequest.productId?.name || "N/A";
                  const userName = (returnRequest as any).userId?.name || "N/A";

                  return (
                    <tr key={returnRequest._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        <span className="font-mono text-gray-600">
                          {returnRequest._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        <p className="font-medium text-gray-900 line-clamp-2">{productName}</p>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                        {userName}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            returnRequest.actionType === "return_refund"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {returnRequest.actionType === "return_refund" ? "Return + Refund" : "Return Only"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.bgColor} ${statusDisplay.color}`}
                        >
                          <span>{statusDisplay.icon}</span>
                          <span className="hidden sm:inline">{statusDisplay.label}</span>
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                        {new Date(returnRequest.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <button
                          onClick={() => openStatusUpdate(returnRequest)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-xs sm:text-sm text-gray-600">
            Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
            {total > 0 && <span className="hidden sm:inline"> · {total} total</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Update Return Status</h2>
              <button
                onClick={closeModal}
                disabled={updating}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold disabled:opacity-50 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
              {/* Current Info */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-gray-700">Return ID:</span>
                  <span className="font-mono text-gray-900">
                    {selectedReturn._id.slice(-12).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-gray-700">Product:</span>
                  <span className="text-gray-900 text-right">
                    {selectedReturn.productId?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900">
                    {selectedReturn.actionType === "return_refund" ? "Return + Refund" : "Return Only"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-gray-700">Current Status:</span>
                  <span className={`font-medium ${getStatusDisplay(selectedReturn.status).color}`}>
                    {getStatusDisplay(selectedReturn.status).label}
                  </span>
                </div>
              </div>

              {/* Status History */}
              {selectedReturn.statusHistory && selectedReturn.statusHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Timeline</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedReturn.statusHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <span className="font-medium text-gray-900">
                              {getStatusDisplay(entry.status).label}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 text-xs">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-gray-600 text-xs mt-1 break-words">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Status Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  New Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={updating}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Select New Status --</option>
                  {allowedStatuses.length === 0 && (
                    <option disabled>No transitions available</option>
                  )}
                  {allowedStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusDisplay(status).icon} {getStatusDisplay(status).label}
                    </option>
                  ))}
                </select>
                {allowedStatuses.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    This return is in a terminal state or no valid transitions available.
                  </p>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Admin Notes <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={updating}
                  rows={3}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  placeholder="Add notes about this status change..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {adminNotes.length}/500 characters
                </p>
              </div>

              {/* Refund Amount (if applicable) */}
              {(newStatus === "refund_initiated" || newStatus === "refund_completed") && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Refund Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    disabled={updating}
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 rounded-b-lg">
              <button
                onClick={closeModal}
                disabled={updating}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={updating || !newStatus || (["refund_initiated", "refund_completed"].includes(newStatus) && !refundAmount)}
                className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-4 sm:p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Status Update</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to change the status to{" "}
                <span className="font-semibold">{getStatusDisplay(newStatus).label}</span>?
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={updating}
                  className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="w-full sm:w-1/2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm transition-colors"
                >
                  {updating ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
