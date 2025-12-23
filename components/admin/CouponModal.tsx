'use client';

import { useState, useEffect } from 'react';
import { X, Tag, Percent, IndianRupee, Calendar, Users, Package } from 'lucide-react';
import { createCoupon, updateCoupon, type Coupon, type CreateCouponPayload } from '@/lib/api/coupons.api';
import { getBrands, getCategories } from '@/lib/admin';
import type { Brand } from '@/lib/types/brand';
import type { Category } from '@/lib/supabase';

interface CouponModalProps {
  coupon?: Coupon | null;
  onClose: (refresh?: boolean) => void;
}

export default function CouponModal({ coupon, onClose }: CouponModalProps) {
  const isEditMode = !!coupon;

  // Form state
  const [code, setCode] = useState(coupon?.code || '');
  const [type, setType] = useState<'percentage' | 'flat'>(coupon?.type || 'percentage');
  const [value, setValue] = useState(coupon?.value?.toString() || '');
  const [startDate, setStartDate] = useState(
    coupon?.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : ''
  );
  const [expiryDate, setExpiryDate] = useState(
    coupon?.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : ''
  );
  const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit?.toString() || '');
  const [perUserLimit, setPerUserLimit] = useState(coupon?.perUserLimit?.toString() || '');
  const [active, setActive] = useState(coupon?.active ?? true);

  // Applicability - single brand and category (matching Product form)
  const [brandId, setBrandId] = useState<string>(
    coupon?.applicableBrands?.[0] || ''
  );
  const [categoryId, setCategoryId] = useState<string>(
    coupon?.applicableCategories?.[0] || ''
  );

  // Brands and Categories data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch brands and categories on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingData(true);
        const [brandsData, categoriesData] = await Promise.all([
          getBrands(),
          getCategories()
        ]);
        
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Failed to fetch brands/categories:', err);
        setError('Failed to load brands and categories');
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!code.trim()) {
      setError('Coupon code is required');
      return;
    }
    if (!value || parseFloat(value) <= 0) {
      setError('Value must be greater than 0');
      return;
    }
    if (type === 'percentage' && (parseFloat(value) < 1 || parseFloat(value) > 100)) {
      setError('Percentage value must be between 1 and 100');
      return;
    }
    if (!expiryDate) {
      setError('Expiry date is required');
      return;
    }

    const expiryDateObj = new Date(expiryDate);
    if (expiryDateObj <= new Date()) {
      setError('Expiry date must be in the future');
      return;
    }

    if (startDate) {
      const startDateObj = new Date(startDate);
      if (startDateObj >= expiryDateObj) {
        setError('Start date must be before expiry date');
        return;
      }
    }

    try {
      setLoading(true);

      const payload: CreateCouponPayload = {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        expiryDate: new Date(expiryDate).toISOString(),
        active,
      };

      if (startDate) {
        payload.startDate = new Date(startDate).toISOString();
      }

      if (usageLimit && parseInt(usageLimit) > 0) {
        payload.usageLimit = parseInt(usageLimit);
      }

      if (perUserLimit && parseInt(perUserLimit) > 0) {
        payload.perUserLimit = parseInt(perUserLimit);
      }

      // Add selected brand and category (single values like Product form)
      if (brandId) {
        payload.applicableBrands = [brandId];
      }

      if (categoryId) {
        payload.applicableCategories = [categoryId];
      }

      if (isEditMode) {
        await updateCoupon(coupon._id, payload);
      } else {
        await createCoupon(payload);
      }

      onClose(true); // Close and refresh
    } catch (err: any) {
      console.error('Error saving coupon:', err);
      setError(err.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Coupon Code *
              </div>
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., SAVE20, WELCOME10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
              disabled={isEditMode} // Code cannot be changed
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              3-20 characters, alphanumeric with hyphens/underscores allowed
            </p>
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type *
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'percentage' | 'flat')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>

            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  {type === 'percentage' ? (
                    <Percent className="w-4 h-4" />
                  ) : (
                    <IndianRupee className="w-4 h-4" />
                  )}
                  Value *
                </div>
              </label>
              <input
                type="number"
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'percentage' ? '1-100' : 'Amount'}
                min={type === 'percentage' ? 1 : 1}
                max={type === 'percentage' ? 100 : undefined}
                step="any"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </div>
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expiry Date *
                </div>
              </label>
              <input
                type="date"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Usage Limit
                </div>
              </label>
              <input
                type="number"
                id="usageLimit"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="perUserLimit" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Per User Limit
                </div>
              </label>
              <input
                type="number"
                id="perUserLimit"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Applicability */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Applicability (Leave empty for all products)
            </h3>

            {loadingData ? (
              <div className="text-sm text-gray-500">Loading brands and categories...</div>
            ) : (
              <>
                {/* Brand Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id || brand.id} value={brand._id || brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active (coupon can be used)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
