/**
 * Admin Return Management Component
 * Displays and manages all return/refund requests
 */

"use client";

import { useState, useEffect } from "react";
import {
  adminGetAllReturnRequests,
  adminUpdateReturnStatus,
  adminGetAllowedStatuses,
  ReturnRequest,
  ReturnStatus,
} from "@/lib/api/returns.api";
import { ApiError } from "@/lib/api";

// Status display configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  return_requested: { label: "Return Requested", color: "text-blue-700", bgColor: "bg-blue-100" },
  return_approved: { label: "Return Approved", color: "text-green-700", bgColor: "bg-green-100" },
  pickup_scheduled: { label: "Pickup Scheduled", color: "text-purple-700", bgColor: "bg-purple-100" },
  product_received: { label: "Product Received", color: "text-indigo-700", bgColor: "bg-indigo-100" },
  refund_initiated: { label: "Refund Initiated", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  refund_completed: { label: "Refund Completed", color: "text-green-700", bgColor: "bg-green-100" },
  return_completed: { label: "Return Completed", color: "text-slate-700", bgColor: "bg-slate-200" },
  return_rejected: { label: "Return Rejected", color: "text-red-700", bgColor: "bg-red-100" },
  // Legacy
  pending: { label: "Pending", color: "text-blue-700", bgColor: "bg-blue-100" },
  approved: { label: "Approved", color: "text-green-700", bgColor: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-100" },
  completed: { label: "Completed", color: "text-slate-700", bgColor: "bg-slate-200" },
};

const getStatusDisplay = (status: string) => {
  return STATUS_CONFIG[status] || { label: status, color: "text-gray-700", bgColor: "bg-gray-100" };
};

export default function AdminReturnManagement() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterActionType, setFilterActionType] = useState<string>("");
  
  // Selected return for status update
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [allowedStatuses, setAllowedStatuses] = useState<ReturnStatus[]>([]);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  // Load returns
  const loadReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminGetAllReturnRequests({
        status: filterStatus || undefined,
        actionType: filterActionType as any,
        page,
        limit: 20,
      });
      setReturns(data.returnRequests);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, [page, filterStatus, filterActionType]);

  // Open status update modal
  const openStatusUpdate = async (returnRequest: ReturnRequest) => {
    setSelectedReturn(returnRequest);
    setNewStatus("");
    setAdminNotes("");
    setRefundAmount("");
    
    try {
      const data = await adminGetAllowedStatuses(returnRequest._id);
      setAllowedStatuses(data.allowedNextStatuses);
    } catch (err) {
      const apiError = err as ApiError;
      alert(`Failed to load allowed statuses: ${apiError.message}`);
    }
  };

  // Close modal
  const closeModal = () => {
    setSelectedReturn(null);
    setAllowedStatuses([]);
    setNewStatus("");
    setAdminNotes("");
    setRefundAmount("");
  };

  // Submit status update
  const handleStatusUpdate = async () => {
    if (!selectedReturn || !newStatus) {
      alert("Please select a status");
      return;
    }

    try {
      setUpdating(true);
      await adminUpdateReturnStatus(
        selectedReturn._id,
        newStatus as ReturnStatus,
        adminNotes || undefined,
        refundAmount ? parseFloat(refundAmount) : undefined
      );
      alert("Status updated successfully");
      closeModal();
      loadReturns();
    } catch (err) {
      const apiError = err as ApiError;
      alert(`Failed to update status: ${apiError.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading && returns.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading return requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Return & Refund Management</h1>
        <button
          onClick={loadReturns}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select
              value={filterActionType}
              onChange={(e) => {
                setFilterActionType(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="return">Return Only</option>
              <option value="return_refund">Return + Refund</option>
            </select>
          </div>
          <button
            onClick={() => {
              setFilterStatus("");
              setFilterActionType("");
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Returns List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Return ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No return requests found
                  </td>
                </tr>
              ) : (
                returns.map((returnRequest) => {
                  const statusDisplay = getStatusDisplay(returnRequest.status);
                  const productName = returnRequest.productId?.name || "N/A";
                  const userName = (returnRequest as any).userId?.name || "N/A";

                  return (
                    <tr key={returnRequest._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                        {returnRequest._id.slice(-8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {productName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {userName}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            returnRequest.actionType === "return_refund"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {returnRequest.actionType === "return_refund"
                            ? "Return + Refund"
                            : "Return Only"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color}`}
                        >
                          {statusDisplay.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(returnRequest.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => openStatusUpdate(returnRequest)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Update Status
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
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Update Return Status</h2>
              <button
                onClick={closeModal}
                disabled={updating}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold disabled:opacity-50"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Current Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Return ID:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {selectedReturn._id.slice(-12)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Product:</span>
                  <span className="text-sm text-gray-900">
                    {selectedReturn.productId?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <span className="text-sm text-gray-900">
                    {selectedReturn.actionType === "return_refund" ? "Return + Refund" : "Return Only"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  <span className={`text-sm font-medium ${getStatusDisplay(selectedReturn.status).color}`}>
                    {getStatusDisplay(selectedReturn.status).label}
                  </span>
                </div>
              </div>

              {/* Status History */}
              {selectedReturn.statusHistory && selectedReturn.statusHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Timeline</h3>
                  <div className="space-y-2">
                    {selectedReturn.statusHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {getStatusDisplay(entry.status).label}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600 text-xs">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-gray-600 text-xs mt-1">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Status Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={updating}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                >
                  <option value="">-- Select Status --</option>
                  {allowedStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusDisplay(status).label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={updating}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                  placeholder="Add notes about this status change..."
                />
              </div>

              {/* Refund Amount (if applicable) */}
              {(newStatus === "refund_initiated" || newStatus === "refund_completed") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Refund Amount ($)
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    disabled={updating}
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={updating}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
