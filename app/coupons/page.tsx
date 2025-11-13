// app/coupon-code/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  expires_at: string | null;
};

export default function CouponCodePage() {
  const supabase = createClientComponentClient();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoupons() { 
        console.log("Hello this is Rajesh")
    const { data, error } = await supabase.from("coupons").select("*");
      if (!error && data) setCoupons(data);
      setLoading(false);
    }
    fetchCoupons();
    // supabase client is stable, safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Available Coupon Codes
        </h1>

        {coupons.length === 0 ? (
          <p className="text-center text-gray-500">No coupons available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Coupon Code</th>
                  <th className="py-3 px-4 text-left">Discount (%)</th>
                  <th className="py-3 px-4 text-left">Expires At</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-emerald-700">{coupon.code}</td>
                    <td className="py-3 px-4">{coupon.discount_percent}%</td>
                    <td className="py-3 px-4">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString()
                        : "No Expiry"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          coupon.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
