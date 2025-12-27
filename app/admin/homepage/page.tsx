"use client";

import { useEffect, useState } from "react";
import { 
  getAdminHomepageBrands, 
  getAdminHomepageCategories,
  updateBrand,
  updateCategory
} from "@/lib/admin";
import GlobalLoader from "@/components/common/GlobalLoader";

type HomepageItem = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  showOnHomepage: boolean;
  homepageOrder: number | null;
};

type SlotState = {
  slotNumber: number;
  assignedItemId: string | null;
};

export default function AdminHomepagePage() {
  const [allBrands, setAllBrands] = useState<HomepageItem[]>([]);
  const [allCategories, setAllCategories] = useState<HomepageItem[]>([]);
  const [brandSlots, setBrandSlots] = useState<SlotState[]>([
    { slotNumber: 1, assignedItemId: null },
    { slotNumber: 2, assignedItemId: null },
    { slotNumber: 3, assignedItemId: null },
    { slotNumber: 4, assignedItemId: null },
  ]);
  const [categorySlots, setCategorySlots] = useState<SlotState[]>([
    { slotNumber: 1, assignedItemId: null },
    { slotNumber: 2, assignedItemId: null },
    { slotNumber: 3, assignedItemId: null },
    { slotNumber: 4, assignedItemId: null },
  ]);
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
      
      setAllBrands(brandsData || []);
      setAllCategories(categoriesData || []);
      
      // Initialize brand slots from backend data
      const newBrandSlots = [1, 2, 3, 4].map(slotNum => {
        const assignedBrand = brandsData?.find(
          (b: HomepageItem) => b.showOnHomepage && b.homepageOrder === slotNum
        );
        return {
          slotNumber: slotNum,
          assignedItemId: assignedBrand?._id || null
        };
      });
      setBrandSlots(newBrandSlots);
      
      // Initialize category slots from backend data
      const newCategorySlots = [1, 2, 3, 4].map(slotNum => {
        const assignedCategory = categoriesData?.find(
          (c: HomepageItem) => c.showOnHomepage && c.homepageOrder === slotNum
        );
        return {
          slotNumber: slotNum,
          assignedItemId: assignedCategory?._id || null
        };
      });
      setCategorySlots(newCategorySlots);
      
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

  function assignBrandToSlot(slotNumber: number, itemId: string | null) {
    setBrandSlots(prev => prev.map(slot => 
      slot.slotNumber === slotNumber 
        ? { ...slot, assignedItemId: itemId }
        : slot
    ));
  }

  function assignCategoryToSlot(slotNumber: number, itemId: string | null) {
    setCategorySlots(prev => prev.map(slot => 
      slot.slotNumber === slotNumber 
        ? { ...slot, assignedItemId: itemId }
        : slot
    ));
  }

  async function saveBrandLayout() {
    setSaving(true);
    try {
      // Get current slot assignments (what user wants)
      const assignedBrandIds = new Set(
        brandSlots
          .filter(s => s.assignedItemId !== null)
          .map(s => s.assignedItemId)
      );

      // PHASE 1: CLEAR - Remove all brands currently on homepage that are NOT in the new assignment
      const brandsToRemove = allBrands.filter(
        brand => brand.showOnHomepage && !assignedBrandIds.has(brand._id)
      );

      for (const brand of brandsToRemove) {
        await updateBrand(brand._id, {
          showOnHomepage: false
        });
      }

      // PHASE 2: ASSIGN - Set new positions for all selected brands
      for (const slot of brandSlots) {
        if (slot.assignedItemId) {
          const brand = allBrands.find(b => b._id === slot.assignedItemId);
          if (brand && (brand.homepageOrder !== slot.slotNumber || !brand.showOnHomepage)) {
            await updateBrand(brand._id, {
              showOnHomepage: true,
              homepageOrder: slot.slotNumber
            });
          }
        }
      }

      showMessage('success', 'Brand layout saved successfully');
      await loadData(); // Refresh to ensure sync
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save brand layout');
      await loadData(); // Reload on error to reset state
    } finally {
      setSaving(false);
    }
  }

  async function saveCategoryLayout() {
    setSaving(true);
    try {
      // Get current slot assignments (what user wants)
      const assignedCategoryIds = new Set(
        categorySlots
          .filter(s => s.assignedItemId !== null)
          .map(s => s.assignedItemId)
      );

      // PHASE 1: CLEAR - Remove all categories currently on homepage that are NOT in the new assignment
      const categoriesToRemove = allCategories.filter(
        category => category.showOnHomepage && !assignedCategoryIds.has(category._id)
      );

      for (const category of categoriesToRemove) {
        await updateCategory(category._id, {
          showOnHomepage: false
        });
      }

      // PHASE 2: ASSIGN - Set new positions for all selected categories
      for (const slot of categorySlots) {
        if (slot.assignedItemId) {
          const category = allCategories.find(c => c._id === slot.assignedItemId);
          if (category && (category.homepageOrder !== slot.slotNumber || !category.showOnHomepage)) {
            await updateCategory(category._id, {
              showOnHomepage: true,
              homepageOrder: slot.slotNumber
            });
          }
        }
      }

      showMessage('success', 'Category layout saved successfully');
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save category layout');
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Homepage Management</h1>
        </div>
        <div className="text-center py-12 flex justify-center">
          <GlobalLoader size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Homepage Management</h1>
        <p className="mt-2 text-gray-600">
          Manage what appears on your homepage. Select items for each slot below.
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

      {/* Brands Section */}
      <HomepageSlotSection
        title="Homepage Brands"
        slots={brandSlots}
        allItems={allBrands}
        onSlotChange={assignBrandToSlot}
        onSave={saveBrandLayout}
        saving={saving}
      />

      <div className="h-12" />

      {/* Categories Section */}
      <HomepageSlotSection
        title="Homepage Categories"
        slots={categorySlots}
        allItems={allCategories}
        onSlotChange={assignCategoryToSlot}
        onSave={saveCategoryLayout}
        saving={saving}
      />
    </div>
  );
}

function HomepageSlotSection({
  title,
  slots,
  allItems,
  onSlotChange,
  onSave,
  saving
}: {
  title: string;
  slots: SlotState[];
  allItems: HomepageItem[];
  onSlotChange: (slotNumber: number, itemId: string | null) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const usedSlots = slots.filter(s => s.assignedItemId !== null).length;
  const availableItems = allItems.filter(item => item.isActive);
  
  // Get list of already assigned item IDs for this section
  const assignedItemIds = new Set(slots.map(s => s.assignedItemId).filter(Boolean));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {usedSlots} of 4 slots filled
            </p>
          </div>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {slots.map(slot => {
            const assignedItem = allItems.find(item => item._id === slot.assignedItemId);
            
            return (
              <div
                key={slot.slotNumber}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-300 transition-colors"
              >
                {/* Slot Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Slot {slot.slotNumber}
                  </span>
                  {assignedItem && (
                    <button
                      onClick={() => onSlotChange(slot.slotNumber, null)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                      title="Clear slot"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Slot Content */}
                {assignedItem ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {assignedItem.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {assignedItem.slug}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-xs">Empty</p>
                  </div>
                )}

                {/* Dropdown Selector */}
                <select
                  value={slot.assignedItemId || ''}
                  onChange={(e) => onSlotChange(slot.slotNumber, e.target.value || null)}
                  className="mt-3 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select item...</option>
                  {availableItems.map(item => {
                    const isAssignedElsewhere = assignedItemIds.has(item._id) && item._id !== slot.assignedItemId;
                    return (
                      <option 
                        key={item._id} 
                        value={item._id}
                        disabled={isAssignedElsewhere}
                      >
                        {item.name} {isAssignedElsewhere ? '(In use)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
