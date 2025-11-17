/**
 * PaymentOrderSummary Component
 * 
 * Purpose: Displays a summary of order items, quantities, prices, and totals
 * in the payment result page.
 * 
 * Usage: Used in the Payment Result page to show what the customer purchased.
 */

"use client";

import { Package } from "lucide-react";
import type { Order, OrderItem } from "@/lib/types/order";

interface PaymentOrderSummaryProps {
  order: Order;
}

export default function PaymentOrderSummary({
  order,
}: PaymentOrderSummaryProps) {
  const subtotal = order.subtotal || 0;
  const tax = order.tax || 0;
  const shippingCost = order.shippingCost || 0;
  const total = order.total || subtotal + tax + shippingCost;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-red-600" aria-hidden="true" />
        Order Summary
      </h2>

      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {order.items && order.items.length > 0 ? (
          order.items.map((item: OrderItem, index: number) => (
            <div
              key={index}
              className="flex items-start sm:items-center gap-3 sm:gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
            >
              {/* Product Icon */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" aria-hidden="true" />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                  {item.name || `Product ${index + 1}`}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Quantity: {item.qty}
                </p>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  ${((item.price || 0) * item.qty).toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  ${(item.price || 0).toFixed(2)} each
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm">No items found</p>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>Shipping</span>
          <span className="font-medium">${shippingCost.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between text-base sm:text-lg font-bold">
          <span className="text-gray-900">Total</span>
          <span className="text-red-600">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
