/**
 * Order Detail Page
 * Client component that fetches and displays a single order's details
 */

"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/api/orders.api";
import { getReturnRequestsByOrder, type ReturnRequest } from "@/lib/api/returns.api";
import type { Order, OrderUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  User,
  RotateCcw,
} from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";
import ReturnRequestModal from "@/components/ReturnRequestModal";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
    productImage?: string;
    productPrice?: number;
    quantity?: number;
  }>({
    isOpen: false,
    productId: "",
    productName: "",
  });

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setError("Please log in to view order details");
        setLoading(false);
        return;
      }

      const data = await getOrder(id);

      if (!data) {
        setError("Order not found");
      } else {
        setOrder(data);
        // Fetch return requests for this order
        try {
          const returns = await getReturnRequestsByOrder(id);
          setReturnRequests(returns);
        } catch (err) {
          // Silently fail - return requests are optional
          console.error("Failed to fetch return requests:", err);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load order";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id, fetchOrder]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "N/A";
    return `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "shipped":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "processing":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }
  };

  const getUserName = (user?: string | OrderUser): string => {
    if (!user) return "N/A";
    if (typeof user === "string") return user;
    return user.name || user.email || "N/A";
  };

  // Check if a return request exists for a specific product
  const getReturnRequestForProduct = (productId: string): ReturnRequest | undefined => {
    return returnRequests.find((req) => req.productId === productId || req.productId._id === productId);
  };

  // Check if order is eligible for returns (not cancelled, not too old, etc.)
  const isOrderEligibleForReturns = (): boolean => {
    if (!order) return false;
    // Future-safe: Add eligibility checks here (e.g., delivery date, order status)
    const ineligibleStatuses = ["cancelled", "rejected"];
    return !ineligibleStatuses.includes(order.status?.toLowerCase() || "");
  };

  // Open return modal for a specific product
  const openReturnModal = (
    productId: string,
    productName: string,
    productImage?: string,
    productPrice?: number,
    quantity?: number
  ) => {
    setModalState({
      isOpen: true,
      productId,
      productName,
      productImage,
      productPrice,
      quantity,
    });
  };

  // Close return modal
  const closeReturnModal = () => {
    setModalState({
      isOpen: false,
      productId: "",
      productName: "",
    });
  };

  // Handle successful return request submission
  const handleReturnSuccess = () => {
    // Refetch order to update return requests
    fetchOrder();
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-16">
            <GlobalLoader size="large" />
            <span className="ml-3 text-lg text-slate-600 mt-4">
              Loading order details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !order) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center py-16">
                <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {error === "Order not found" ? "Order Not Found" : "Error"}
                </h2>
                <p className="text-slate-600 mb-6">
                  {error || "Unable to load order details"}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => router.push("/orders")}
                    variant="default"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                  </Button>
                  {error !== "Order not found" && (
                    <Button onClick={fetchOrder} variant="outline">
                      Retry
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
        <div className="container mx-auto px-4">
          <Button
            onClick={() => router.push("/orders")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Order #{order._id?.slice(-8).toUpperCase()}
              </h1>
              <p className="text-slate-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge
              className={getStatusColor(order.status)}
              style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
            >
              {order.status || "Pending"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Order Details */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid gap-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item, index) => {
                    const productId = typeof item.product === "string" ? item.product : "";
                    const productName = item.name || "Product";
                    const productImage = undefined; // Image not in OrderItem type
                    const productPrice = item.price;
                    const quantity = item.qty;
                    const returnRequest = getReturnRequestForProduct(productId);

                    return (
                      <div key={index}>
                        <div className="flex items-start justify-between gap-4">
                          {/* Product info */}
                          <div className="flex-grow">
                            <p className="font-medium">{productName}</p>
                            <p className="text-sm text-slate-500">
                              Quantity: {quantity}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(productPrice)}
                            </p>
                          </div>
                        </div>

                        {/* Return status or button */}
                        {returnRequest ? (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`
                                ${
                                  returnRequest.status === "pending"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : returnRequest.status === "approved"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : returnRequest.status === "rejected"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                }
                              `}
                            >
                              Return {returnRequest.actionType}: {returnRequest.status}
                            </Badge>
                          </div>
                        ) : (
                          isOrderEligibleForReturns() && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openReturnModal(
                                    productId,
                                    productName,
                                    productImage,
                                    productPrice,
                                    quantity
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Return / Replace / Refund
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  {order.subtotal !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                  )}
                  {order.tax !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  {order.shippingCost !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Shipping</span>
                      <span>{formatCurrency(order.shippingCost)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-700 space-y-1">
                    {order.shippingAddress.line1 && (
                      <p>{order.shippingAddress.line1}</p>
                    )}
                    {order.shippingAddress.line2 && (
                      <p>{order.shippingAddress.line2}</p>
                    )}
                    <p>
                      {[
                        order.shippingAddress.city,
                        order.shippingAddress.state,
                        order.shippingAddress.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {order.shippingAddress.country && (
                      <p>{order.shippingAddress.country}</p>
                    )}
                    {order.shippingAddress.phone && (
                      <p className="text-sm text-slate-500 mt-2">
                        Phone: {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            {order.payment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.payment.method && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Method</span>
                        <span className="font-medium capitalize">
                          {order.payment.method}
                        </span>
                      </div>
                    )}
                    {order.payment.status && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status</span>
                        <Badge variant="outline" className="capitalize">
                          {order.payment.status}
                        </Badge>
                      </div>
                    )}
                    {order.payment.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Transaction ID</span>
                        <span className="font-mono text-sm">
                          {order.payment.transactionId}
                        </span>
                      </div>
                    )}
                    {order.payment.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Paid At</span>
                        <span className="text-sm">
                          {formatDate(order.payment.paidAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.createdAt && (
                    <div className="flex items-start">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="font-medium">Order Placed</p>
                        <p className="text-sm text-slate-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.updatedAt && order.updatedAt !== order.createdAt && (
                    <div className="flex items-start">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="font-medium">Last Updated</p>
                        <p className="text-sm text-slate-500">
                          {formatDate(order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Return Request Modal */}
      {order && (
        <ReturnRequestModal
          isOpen={modalState.isOpen}
          onClose={closeReturnModal}
          orderId={id}
          productId={modalState.productId}
          productName={modalState.productName}
          productImage={modalState.productImage}
          productPrice={modalState.productPrice}
          quantity={modalState.quantity}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}
