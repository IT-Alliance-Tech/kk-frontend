/**
 * Create Order Client Component
 * Client-side form for creating new orders
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/api/orders.api";
import type { Order, ShippingAddress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";

interface CreateOrderClientProps {
  items: { product: string; qty: number; price?: number }[];
  onSuccess?: (order: Order) => void;
}

export default function CreateOrderClient({
  items,
  onSuccess,
}: CreateOrderClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!shippingAddress.line1?.trim()) {
      setError("Address line 1 is required");
      return false;
    }
    if (!shippingAddress.city?.trim()) {
      setError("City is required");
      return false;
    }
    if (!shippingAddress.postalCode?.trim()) {
      setError("Postal code is required");
      return false;
    }
    if (!shippingAddress.country?.trim()) {
      setError("Country is required");
      return false;
    }
    if (items.length === 0) {
      setError("No items in order");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create order payload
      const payload = {
        items,
        shippingAddress,
      };

      // Call API to create order
      const order = await createOrder(payload);

      // Success
      setSuccess(true);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(order);
      }

      // Redirect to order detail page after a short delay
      setTimeout(() => {
        if (order._id) {
          router.push(`/orders/${order._id}`);
        } else {
          router.push("/orders");
        }
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create order";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
        <CardDescription>
          Enter your shipping address to complete your order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Order placed successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Shipping Address Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input
                id="line1"
                type="text"
                placeholder="Street address"
                value={shippingAddress.line1}
                onChange={(e) => handleInputChange("line1", e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div>
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                type="text"
                placeholder="Apartment, suite, etc. (optional)"
                value={shippingAddress.line2}
                onChange={(e) => handleInputChange("line2", e.target.value)}
                disabled={loading || success}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                  disabled={loading || success}
                />
              </div>

              <div>
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="State"
                  value={shippingAddress.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="ZIP / Postal code"
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  required
                  disabled={loading || success}
                />
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Country"
                  value={shippingAddress.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone number"
                value={shippingAddress.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
            <p className="text-sm text-slate-600">
              {items.length} item{items.length !== 1 ? "s" : ""} in your order
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || success}
            size="lg"
          >
            {loading ? (
              <>
                <GlobalLoader size="small" className="mr-2" />
                Placing Order...
              </>
            ) : success ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Order Placed!
              </>
            ) : (
              "Place Order"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
