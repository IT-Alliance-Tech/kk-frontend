"use client";

import { useEffect, useState } from "react";
import { 
  getAdminHomepageBrands, 
  getAdminHomepageCategories,
  updateBrand,
  updateCategory
} from "@/lib/admin";

type HomepageItem = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  showOnHomepage: boolean;
  homepageOrder: number | null;
};

/**
 * Admin Homepage Management
 * Centralized control for homepage brands and categories
 */
export default function AdminHomepagePage() {
  const [brands, setBrands] = useState<HomepageItem[]>([]);
  const [categories, setCategories] = useState<HomepageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [brandsData, categoriesData] = await Promise.all([
        getAdminHomepageBrands(),
        getAdminHomepageCategories()
      ]);
      setBrands(brandsData || []);
      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error("Failed to load homepage data:", error);
      showMessage('error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  // Update brand state
  function updateBrandState(id: string, updates: Partial<HomepageItem>) {
    setBrands(prev => prev.map(b => 
      b._id === id ? { ...b, ...updates } : b
    ));
  }

  // Update category state
  function updateCategoryState(id: string, updates: Partial<HomepageItem>) {
    setCategories(prev => prev.map(c => 
      c._id === id ? { ...c, ...updates } : c
    ));
  }

  // Handle brand save
  async function handleSaveBrand(brand: HomepageItem) {
    // Validation
    if (brand.showOnHomepage && !brand.homepageOrder) {
      showMessage('error', 'Homepage order is required when showing on homepage');
      return;
    }

    // Check max 4 brands
    const enabledBrands = brands.filter(b => b.showOnHomepage);
    if (brand.showOnHomepage && !brands.find(b => b._id === brand._id && b.showOnHomepage) && enabledBrands.length >= 4) {
      showMessage('error', 'Maximum 4 brands can be shown on homepage');
      return;
    }

    setSaving(true);
    try {
      await updateBrand(brand._id, {
        showOnHomepage: brand.showOnHomepage,
        homepageOrder: brand.showOnHomepage ? brand.homepageOrder : null
      });
      showMessage('success', `Brand "${brand.name}" updated successfully`);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update brand');
      // Reload to reset state
      loadData();
    } finally {
      setSaving(false);
    }
  }

  // Handle category save
  async function handleSaveCategory(category: HomepageItem) {
    // Validation
    if (category.showOnHomepage && !category.homepageOrder) {
      showMessage('error', 'Homepage order is required when showing on homepage');
      return;
    }

    // Check max 4 categories
    const enabledCategories = categories.filter(c => c.showOnHomepage);
    if (category.showOnHomepage && !categories.find(c => c._id === category._id && c.showOnHomepage) && enabledCategories.length >= 4) {
      showMessage('error', 'Maximum 4 categories can be shown on homepage');
      return;
    }

    setSaving(true);
    try {
      await updateCategory(category._id, {
        showOnHomepage: category.showOnHomepage,
        homepageOrder: category.showOnHomepage ? category.homepageOrder : null
      });
      showMessage('success', `Category "${category.name}" updated successfully`);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update category');
      // Reload to reset state
      loadData();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Homepage Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Control which brands and categories appear on the homepage and their display order. Maximum 4 items per section.
        </p>
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Content sections */}
      <div className="space-y-8">
        {/* Brands Section */}
        <HomepageSection
          title="Homepage Brands"
          items={brands}
          onUpdate={updateBrandState}
          onSave={handleSaveBrand}
          saving={saving}
        />

        {/* Categories Section */}
        <HomepageSection
          title="Homepage Categories"
          items={categories}
          onUpdate={updateCategoryState}
          onSave={handleSaveCategory}
          saving={saving}
        />
      </div>
    </div>
  );
}

// Reusable section component
function HomepageSection({
  title,
  items,
  onUpdate,
  onSave,
  saving
}: {
  title: string;
  items: HomepageItem[];
  onUpdate: (id: string, updates: Partial<HomepageItem>) => void;
  onSave: (item: HomepageItem) => void;
  saving: boolean;
}) {
  const enabledCount = items.filter(i => i.showOnHomepage).length;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-sm text-gray-500">
            {enabledCount} of 4 slots used
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Show on Homepage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Homepage Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={item.showOnHomepage}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onUpdate(item._id, { 
                        showOnHomepage: checked,
                        homepageOrder: checked ? (item.homepageOrder || 1) : null
                      });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={!item.showOnHomepage && enabledCount >= 4}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={item.homepageOrder || ''}
                    onChange={(e) => onUpdate(item._id, { 
                      homepageOrder: e.target.value ? Number(e.target.value) : null 
                    })}
                    disabled={!item.showOnHomepage}
                    className={`text-sm border rounded px-2 py-1 ${
                      !item.showOnHomepage 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="">Select order...</option>
                    <option value="1">1st Position</option>
                    <option value="2">2nd Position</option>
                    <option value="3">3rd Position</option>
                    <option value="4">4th Position</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onSave(item)}
                    disabled={saving}
                    className="text-blue-600 hover:text-blue-900 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          No items found
        </div>
      )}
    </div>
  );
}
