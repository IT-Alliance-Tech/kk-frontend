/**
 * Admin Dashboard Analytics API
 * Wraps GET /api/admin/dashboard
 */

import { apiGetAuth } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  conversionRate: number;
}

export interface DashboardOrder {
  _id: string;
  customerName: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export interface DashboardRecentOrders {
  data: DashboardOrder[];
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentOrders: DashboardRecentOrders;
}

// ── API calls ──────────────────────────────────────────────────────────────────

/**
 * Fetch summary KPIs only (page=1, limit=0 would skip orders —
 * but we unify into one call with a small limit for initial render).
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const data = await apiGetAuth<DashboardData>("/admin/dashboard?limit=1&page=1");
  return data.summary;
}

/**
 * Fetch paginated recent orders.
 */
export async function fetchRecentOrders(
  page = 1,
  limit = 5
): Promise<DashboardRecentOrders> {
  const data = await apiGetAuth<DashboardData>(
    `/admin/dashboard?page=${page}&limit=${limit}`
  );
  return data.recentOrders;
}

/**
 * Combined initial load — summary + first page of orders in one request.
 */
export async function fetchDashboard(
  page = 1,
  limit = 5
): Promise<DashboardData> {
  return apiGetAuth<DashboardData>(
    `/admin/dashboard?page=${page}&limit=${limit}`
  );
}
