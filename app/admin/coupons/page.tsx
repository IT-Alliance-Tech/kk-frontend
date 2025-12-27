'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { listCoupons, deleteCoupon, type Coupon } from '@/lib/api/coupons.api';
import { Plus, Pencil, Trash2, Search, Calendar, Tag, TrendingUp } from 'lucide-react';
import GlobalLoader from '@/components/common/GlobalLoader';

const CouponModal = dynamic(() => import('@/components/admin/CouponModal'), { ssr: false });

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await listCoupons({ limit: 100 });
      const couponsList = result.coupons || result;
      setCoupons(couponsList);
      setFilteredCoupons(couponsList);
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Filter coupons based on search and status
  useEffect(() => {
    let filtered = [...coupons];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((coupon) =>
        coupon.code.toLowerCase().includes(search)
      );
    }

    // Status filter
    const now = new Date();
    if (filterStatus === 'active') {
      filtered = filtered.filter((coupon) => {
        const isExpired = new Date(coupon.expiryDate) < now;
        return coupon.active && !isExpired;
      });
    } else if (filterStatus === 'expired') {
      filtered = filtered.filter((coupon) => {
        const isExpired = new Date(coupon.expiryDate) < now;
        return isExpired;
      });
    }

    setFilteredCoupons(filtered);
  }, [searchTerm, filterStatus, coupons]);

  const handleCreate = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      return;
    }

    try {
      await deleteCoupon(id);
      setCoupons(coupons.filter((c) => c._id !== id));
    } catch (err: any) {
      alert(`Failed to delete coupon: ${err.message}`);
    }
  };

  const handleModalClose = (refresh?: boolean) => {
    setShowModal(false);
    setEditingCoupon(null);
    if (refresh) {
      fetchCoupons();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getApplicabilityText = (coupon: Coupon) => {
    if (
      coupon.applicableProducts.length === 0 &&
      coupon.applicableCategories.length === 0 &&
      coupon.applicableBrands.length === 0
    ) {
      return 'All Products';
    }

    const parts = [];
    if (coupon.applicableProducts.length > 0) {
      parts.push(`${coupon.applicableProducts.length} Products`);
    }
    if (coupon.applicableCategories.length > 0) {
      parts.push(`${coupon.applicableCategories.length} Categories`);
    }
    if (coupon.applicableBrands.length > 0) {
      parts.push(`${coupon.applicableBrands.length} Brands`);
    }

    return parts.join(', ');
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <GlobalLoader size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage discount coupons and promotions</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'expired'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applies To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all'
                      ? 'No coupons match your filters'
                      : 'No coupons yet. Create your first coupon!'}
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const expired = isExpired(coupon.expiryDate);
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-emerald-600" />
                          <span className="font-mono font-semibold text-gray-900">
                            {coupon.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {coupon.type === 'percentage' ? 'Percentage' : 'Flat'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-gray-900 font-semibold">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          {coupon.type === 'percentage'
                            ? `${coupon.value}%`
                            : `₹${coupon.value}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getApplicabilityText(coupon)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(coupon.expiryDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {coupon.usedCount}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {expired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Expired
                          </span>
                        ) : coupon.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id, coupon.code)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CouponModal
          coupon={editingCoupon}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
