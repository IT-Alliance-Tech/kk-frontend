/**
 * Test page for creating orders
 * This is a demo page to test the order creation flow
 */

"use client";

import CreateOrderClient from '@/app/orders/CreateOrderClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';

export default function CreateOrderTestPage() {
  // Sample items for testing
  const sampleItems = [
    { product: '507f1f77bcf86cd799439011', qty: 2, price: 29.99 },
    { product: '507f1f77bcf86cd799439012', qty: 1, price: 49.99 },
  ];

  const handleSuccess = (order: any) => {
    console.log('Order created successfully:', order);
  };

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Page Header */}
        <Card className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-emerald-600" />
              <div>
                <CardTitle className="text-2xl">Create Test Order</CardTitle>
                <CardDescription className="text-slate-700">
                  Test the order creation flow with sample items
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <h3 className="font-semibold text-sm mb-2">Sample Items in Cart:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                {sampleItems.map((item, index) => (
                  <li key={index}>
                    • Product ID: {item.product} - Qty: {item.qty} - Price: ${item.price}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                Note: Make sure you&apos;re logged in and have a valid auth token in localStorage
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Form */}
        <CreateOrderClient items={sampleItems} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
