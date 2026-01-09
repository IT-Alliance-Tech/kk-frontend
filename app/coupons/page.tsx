// app/coupons/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getActiveCoupons } from "@/lib/api/coupons.api";
import { Tag, Calendar, Percent, IndianRupee } from "lucide-react";

type Coupon = {
  _id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  applicableProducts?: any[];
  applicableCategories?: any[];
  applicableBrands?: any[];
  expiryDate: string;
  startDate?: string;
};

export default function CouponCodePage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const data = await getActiveCoupons();
        setCoupons(data);
      } catch (err: any) {
        console.error('Error fetching coupons:', err);
        setError(err.message || 'Failed to load coupons');
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500">Loading coupons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow-md rounded-lg max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Available Coupon Codes
          </h1>
          <p className="text-gray-600">
            Save more on your purchases with these active coupons
          </p>
        </div>

        {coupons.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-12 text-center">
            <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No coupons available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for exciting offers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const isGlobal = 
                (!coupon.applicableProducts || coupon.applicableProducts.length === 0) &&
                (!coupon.applicableCategories || coupon.applicableCategories.length === 0) &&
                (!coupon.applicableBrands || coupon.applicableBrands.length === 0);

              return (
                <div
                  key={coupon._id}
                  className="bg-white shadow-md rounded-lg p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-lg"
                >
                  {/* Coupon Code Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm text-gray-500 font-medium">COUPON CODE</span>
                    </div>
                  </div>

                  {/* Code Display */}
                  <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-lg p-4 mb-4">
                    <p className="text-2xl font-bold text-emerald-700 text-center tracking-wider font-mono">
                      {coupon.code}
                    </p>
                  </div>

                  {/* Discount Info */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {coupon.type === 'percentage' ? (
                      <>
                        <Percent className="w-5 h-5 text-emerald-600" />
                        <span className="text-xl font-semibold text-gray-800">
                          {coupon.value}% OFF
                        </span>
                      </>
                    ) : (
                      <>
                        <IndianRupee className="w-5 h-5 text-emerald-600" />
                        <span className="text-xl font-semibold text-gray-800">
                          ₹{coupon.value} OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Applicability */}
                  <div className="mb-4">
                    {isGlobal ? (
                      <p className="text-sm text-center text-emerald-600 font-medium">
                        Valid on all products
                      </p>
                    ) : (
                      <div className="text-sm text-gray-600 space-y-1">
                        {coupon.applicableBrands && coupon.applicableBrands.length > 0 && (
                          <p>
                            <span className="font-medium">Brands:</span>{' '}
                            {coupon.applicableBrands.map((b: any) => b.name).join(', ')}
                          </p>
                        )}
                        {coupon.applicableCategories && coupon.applicableCategories.length > 0 && (
                          <p>
                            <span className="font-medium">Categories:</span>{' '}
                            {coupon.applicableCategories.map((c: any) => c.name).join(', ')}
                          </p>
                        )}
                        {coupon.applicableProducts && coupon.applicableProducts.length > 0 && (
                          <p>
                            <span className="font-medium">Products:</span>{' '}
                            {coupon.applicableProducts.map((p: any) => p.name).join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 border-t pt-3">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Valid until {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                      alert(`Coupon code "${coupon.code}" copied to clipboard!`);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                  >
                    Copy Code
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
