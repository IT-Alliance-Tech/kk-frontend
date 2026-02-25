/**
 * Order type definitions
 */

/**
 * Order item representing a product in an order
 */
export type OrderItem = {
  _id?: string;
  product: string; // Product ID or populated product object
  qty: number;
  price?: number;
  title?: string; // Product name snapshot (stored by backend)
  name?: string; // Alias — some responses use this
  image?: string; // Product image snapshot
  returnRequestedQty?: number;
  returnStatus?: 'none' | 'requested' | 'initiated' | 'in_process' | 'completed';
  returnRequestedAt?: string;
};

/**
 * Shipping address information
 */
export type ShippingAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
};

/**
 * Payment information
 */
export type PaymentInfo = {
  method?: string;
  transactionId?: string;
  status?: string;
  paidAt?: string;
};

/**
 * User information (can be populated or just ID)
 */
export type OrderUser = {
  _id?: string;
  name?: string;
  email?: string;
};

/**
 * Main Order type
 */
export type Order = {
  _id?: string;
  id?: string; // Some APIs might use 'id' instead of '_id'
  user?: string | OrderUser;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  payment?: PaymentInfo;
  total?: number;
  subtotal?: number;
  tax?: number;
  taxAmount?: number;
  totalAmount?: number;
  shipping?: number;
  shippingCost?: number;
  originalTotal?: number;
  finalTotal?: number;
  discountAmount?: number;
  couponCode?: string;
  status?:
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | string;
  deliveryStatus?:
  | "pending"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Payload for creating a new order
 */
export type CreateOrderPayload = {
  items: { product: string; qty: number; price?: number }[];
  shippingAddress: ShippingAddress;
  payment?: PaymentInfo;
};

/**
 * API response wrapper types
 */
export type OrdersApiResponse = Order[] | { success: true; data: Order[] };

export type OrderApiResponse = Order | { success: true; data: Order };

export type CreateOrderApiResponse =
  | Order
  | { success: true; data: Order; message?: string };
