/**
 * Admin Delivery Management Page
 * Manages delivery statuses for paid orders
 * Mirrors admin/orders page design with delivery-specific features
 */
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGetAuth, apiPatchAuth } from "@/lib/admin";
import { Truck, ChevronDown } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminFilterBar, AdminFilterSelect } from "@/components/admin/ui/AdminFilterBar";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";
import Pagination from "@/components/common/Pagination";

const ITEMS_PER_PAGE = 10;

type DeliveryStatus = "pending" | "shipped" | "out_for_delivery" | "delivered";

const DELIVERY_STATUSES: DeliveryStatus[] = ["pending", "shipped", "out_for_delivery", "delivered"];

const DELIVERY_BADGE_CONFIG: Record<DeliveryStatus, { variant: "default" | "info" | "orange" | "success"; label: string }> = {
    pending: { variant: "default", label: "Pending" },
    shipped: { variant: "info", label: "Shipped" },
    out_for_delivery: { variant: "orange", label: "Out for Delivery" },
    delivered: { variant: "success", label: "Delivered" },
};

function getNextTransitions(current: DeliveryStatus): DeliveryStatus[] {
    const currentIndex = DELIVERY_STATUSES.indexOf(current);
    return DELIVERY_STATUSES.slice(currentIndex + 1);
}

/**
 * Portal-based dropdown for delivery status actions.
 * Renders at document.body level to escape table overflow clipping.
 */
function DeliveryActionDropdown({
    orderId,
    currentStatus,
    isUpdating,
    onUpdate,
}: {
    orderId: string;
    currentStatus: DeliveryStatus;
    isUpdating: boolean;
    onUpdate: (orderId: string, status: DeliveryStatus) => void;
}) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const nextTransitions = getNextTransitions(currentStatus);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (
                btnRef.current && !btnRef.current.contains(e.target as Node) &&
                menuRef.current && !menuRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Close on scroll (table might scroll)
    useEffect(() => {
        if (!open) return;
        const handleScroll = () => setOpen(false);
        window.addEventListener("scroll", handleScroll, true);
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [open]);

    if (nextTransitions.length === 0) {
        return <span className="text-xs text-slate-400 italic">Delivered ✓</span>;
    }

    // Calculate dropdown position from the button's bounding rect
    const getMenuStyle = (): React.CSSProperties => {
        if (!btnRef.current) return {};
        const rect = btnRef.current.getBoundingClientRect();
        return {
            position: "fixed",
            top: rect.bottom + 4,
            left: rect.right - 192, // 192px = w-48
            width: 192,
            zIndex: 9999,
        };
    };

    return (
        <>
            <button
                ref={btnRef}
                disabled={isUpdating}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50"
            >
                {isUpdating ? "Updating..." : "Update Status"}
                <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {open &&
                !isUpdating &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={getMenuStyle()}
                        className="bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
                    >
                        {nextTransitions.map((nextStatus) => {
                            const config = DELIVERY_BADGE_CONFIG[nextStatus];
                            return (
                                <button
                                    key={nextStatus}
                                    onClick={() => {
                                        setOpen(false);
                                        onUpdate(orderId, nextStatus);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition-colors flex items-center gap-2"
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${nextStatus === "shipped"
                                            ? "bg-blue-500"
                                            : nextStatus === "out_for_delivery"
                                                ? "bg-orange-500"
                                                : "bg-green-500"
                                            }`}
                                    />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>,
                    document.body
                )}
        </>
    );
}

export default function AdminDeliveryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [paginationInfo, setPaginationInfo] = useState({
        total: 0,
        page: 1,
        totalPages: 1,
    });

    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set("page", currentPage.toString());
            params.set("limit", ITEMS_PER_PAGE.toString());
            if (statusFilter) params.set("deliveryStatus", statusFilter);

            const res = await apiGetAuth(`/admin/delivery?${params.toString()}`);

            // The admin.ts apiFetchAuth unwraps the envelope → res is json.data (the orders array)
            // But we also need page/totalPages/totalCount which are at the top level
            // Since apiFetchAuth returns json.data when it exists, but our endpoint puts page/totalPages
            // outside of data, we need to handle both scenarios
            let ordersList: any[] = [];
            let page = currentPage;
            let totalPages = 1;
            let totalCount = 0;

            if (Array.isArray(res)) {
                // apiFetchAuth unwrapped to data array — pagination info lost
                // This happens because backend returns { data: [...], page, totalPages, totalCount }
                // and apiFetchAuth sees data !== undefined and returns it
                ordersList = res;
                // Fallback: use array length for display
                totalCount = res.length;
                page = currentPage;
                totalPages = 1;
            } else if (res && typeof res === 'object') {
                ordersList = Array.isArray(res.data) ? res.data : [];
                page = res.page || currentPage;
                totalPages = res.totalPages || 1;
                totalCount = res.totalCount || ordersList.length;
            }

            setOrders(ordersList);
            setPaginationInfo({ total: totalCount, page, totalPages });
        } catch (err) {
            console.error("Failed to load delivery orders", err);
        }
        setLoading(false);
    }, [currentPage, statusFilter]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleStatusUpdate = async (orderId: string, newStatus: DeliveryStatus) => {
        setUpdatingId(orderId);
        try {
            // Optimistic update
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId
                        ? { ...o, deliveryStatus: newStatus, ...(newStatus === "delivered" ? { deliveredAt: new Date().toISOString() } : {}) }
                        : o
                )
            );

            await apiPatchAuth(`/admin/delivery/${orderId}`, { deliveryStatus: newStatus });

            // Re-fetch current page to sync with server
            await loadOrders();
        } catch (err) {
            console.error("Failed to update delivery status", err);
            // Revert on failure
            await loadOrders();
        }
        setUpdatingId(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > paginationInfo.totalPages) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/admin/delivery?${params.toString()}`, { scroll: true });
    };

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        if (value) {
            params.set("deliveryStatus", value);
        } else {
            params.delete("deliveryStatus");
        }
        router.push(`/admin/delivery?${params.toString()}`, { scroll: false });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price || 0);
    };

    const filterOptions = [
        { value: "", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "shipped", label: "Shipped" },
        { value: "out_for_delivery", label: "Out for Delivery" },
        { value: "delivered", label: "Delivered" },
    ];

    const columns = [
        {
            key: "orderId",
            header: "Order #",
            render: (order: any) => (
                <span className="font-mono text-sm text-slate-900">
                    #{order._id.slice(-7).toUpperCase()}
                </span>
            ),
        },
        {
            key: "customer",
            header: "Customer",
            render: (order: any) => (
                <div>
                    <p className="font-medium text-slate-900">
                        {order.shippingAddress?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                        {order.shippingAddress?.phone || "N/A"}
                    </p>
                </div>
            ),
        },
        {
            key: "total",
            header: "Total",
            render: (order: any) => (
                <span className="font-semibold text-slate-900">
                    {formatPrice(order.total)}
                </span>
            ),
        },
        {
            key: "payment",
            header: "Payment",
            className: "hidden md:table-cell",
            render: (order: any) => (
                <AdminBadge variant="success" dot size="sm">
                    {order.payment?.status || "N/A"}
                </AdminBadge>
            ),
        },
        {
            key: "deliveryStatus",
            header: "Delivery Status",
            render: (order: any) => {
                const status = (order.deliveryStatus || "pending") as DeliveryStatus;
                const config = DELIVERY_BADGE_CONFIG[status] || DELIVERY_BADGE_CONFIG.pending;
                return (
                    <AdminBadge variant={config.variant} dot size="sm">
                        {config.label}
                    </AdminBadge>
                );
            },
        },
        {
            key: "actions",
            header: "Action",
            className: "w-[180px]",
            render: (order: any) => (
                <DeliveryActionDropdown
                    orderId={order._id}
                    currentStatus={(order.deliveryStatus || "pending") as DeliveryStatus}
                    isUpdating={updatingId === order._id}
                    onUpdate={handleStatusUpdate}
                />
            ),
        },
    ];

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <AdminLoadingState fullPage message="Loading delivery orders..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <AdminPageHeader
                title="Delivery Management"
                description="Track and update delivery statuses for paid orders"
                badge={
                    <AdminBadge variant="secondary" size="lg">
                        {paginationInfo.total} orders
                    </AdminBadge>
                }
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Pending", value: orders.filter((o) => (o.deliveryStatus || "pending") === "pending").length, color: "bg-slate-100 text-slate-700" },
                    { label: "Shipped", value: orders.filter((o) => o.deliveryStatus === "shipped").length, color: "bg-blue-50 text-blue-700" },
                    { label: "Out for Delivery", value: orders.filter((o) => o.deliveryStatus === "out_for_delivery").length, color: "bg-orange-50 text-orange-700" },
                    { label: "Delivered", value: orders.filter((o) => o.deliveryStatus === "delivered").length, color: "bg-emerald-50 text-emerald-700" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className={`${stat.color} rounded-xl p-3 sm:p-4 text-center`}
                    >
                        <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                        <p className="text-xs sm:text-sm font-medium opacity-80">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <AdminCard>
                <AdminFilterBar
                    searchValue=""
                    searchPlaceholder=""
                    onSearchChange={() => { }}
                >
                    <AdminFilterSelect
                        value={statusFilter}
                        onChange={handleFilterChange}
                        placeholder="All Delivery Statuses"
                        options={filterOptions.slice(1)}
                        className="w-full sm:w-52"
                    />
                </AdminFilterBar>
            </AdminCard>

            {/* Orders Table */}
            <AdminCard padding="none">
                {orders.length === 0 ? (
                    <AdminEmptyState
                        type={statusFilter ? "no-results" : "no-data"}
                        title={statusFilter ? "No orders found" : "No delivery orders yet"}
                        description={
                            statusFilter
                                ? "Try adjusting your delivery status filter."
                                : "Orders with successful payments will appear here."
                        }
                        action={
                            statusFilter
                                ? { label: "Clear Filter", onClick: () => handleFilterChange("") }
                                : undefined
                        }
                    />
                ) : (
                    <>
                        <AdminTable
                            columns={columns}
                            data={orders}
                            keyExtractor={(order) => order._id}
                        />
                        {/* Pagination Controls */}
                        <div className="p-4 border-t border-slate-200">
                            <Pagination
                                currentPage={paginationInfo.page}
                                totalPages={paginationInfo.totalPages}
                                totalItems={paginationInfo.total}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={handlePageChange}
                                hasNext={paginationInfo.page < paginationInfo.totalPages}
                                hasPrev={paginationInfo.page > 1}
                            />
                        </div>
                    </>
                )}
            </AdminCard>
        </div>
    );
}
