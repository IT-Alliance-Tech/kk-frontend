import { createClient } from "@supabase/supabase-js";

// Guarded Supabase client initialization to prevent build-time errors
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Explanation: Returning null ensures the build won't fail if environment variables are missing.

export type UserRole = "admin" | "seller" | "customer";

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  brand_id?: string;
  category_id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  quantity: number;
  sku: string;
  images: string;
  specifications?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  category?: Category;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  applies_to: "all" | "brand" | "category" | "product";
  applies_to_id?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id?: string;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  shipping_address: any;
  billing_address: any;
  payment_status?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}
