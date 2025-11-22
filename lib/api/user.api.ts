/**
 * User Dashboard API client
 * Handles user dashboard and profile-related API calls
 */

import { getAccessToken } from "@/lib/utils/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  byStatus: Record<string, number>;
}

export interface DashboardOrder {
  orderId: string;
  userId: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardCart {
  itemCount: number;
  subtotal: number;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    qty: number;
    itemTotal: number;
  }>;
}

export interface DashboardActivity {
  type: string;
  orderId: string;
  status: string;
  amount: number;
  date: string;
}

export interface DashboardProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface DashboardData {
  profile: DashboardProfile;
  stats: DashboardStats;
  recentOrders: DashboardOrder[];
  cart: DashboardCart | null;
  recentActivity: DashboardActivity[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}

/**
 * Fetch comprehensive user dashboard data
 * Calls GET /api/user/dashboard with authentication
 *
 * @param page - Page number for recent orders (default: 1)
 * @param limit - Number of recent orders to fetch (default: 5)
 * @returns Dashboard data object
 * @throws Error if request fails or user is not authenticated
 */
export async function getUserDashboard(
  page: number = 1,
  limit: number = 5,
): Promise<DashboardData> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const url = `${API_BASE_URL}/api/user/dashboard?page=${page}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    }

    const result: DashboardApiResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || "Invalid dashboard response");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching user dashboard:", error);
    throw error;
  }
}

/**
 * Fetch paginated list of user's orders
 * Calls GET /api/user/orders with authentication
 *
 * @param page - Page number (default: 1)
 * @param limit - Orders per page (default: 10)
 * @param sort - Sort order (default: '-createdAt')
 * @returns Object with orders array and pagination metadata
 */
export async function getUserOrders(
  page: number = 1,
  limit: number = 10,
  sort: string = "-createdAt",
): Promise<{ orders: any[]; pagination: any }> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const url = `${API_BASE_URL}/api/user/orders?page=${page}&limit=${limit}&sort=${sort}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || "Invalid orders response");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
}
