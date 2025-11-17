/**
 * Order type definitions
 */

/**
 * Order item representing a product in an order
 */
export type OrderItem = {
  product: string; // Product ID or populated product object
  qty: number;
  price?: number;
  name?: string; // Product name if populated
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
  shippingCost?: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
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
export type OrdersApiResponse = 
  | Order[]
  | { success: true; data: Order[] };

export type OrderApiResponse = 
  | Order
  | { success: true; data: Order };

export type CreateOrderApiResponse =
  | Order
  | { success: true; data: Order; message?: string };
