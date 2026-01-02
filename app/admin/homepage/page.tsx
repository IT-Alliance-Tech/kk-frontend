"use client";

import { useEffect, useState } from "react";
import { 
  getAdminHomepageBrands, 
  getAdminHomepageCategories,
  updateBrand,
  updateCategory,
  apiGetAuth,
  apiPostAuth,
  apiPutAuth,
  apiDeleteAuth
} from "@/lib/admin";
import GlobalLoader from "@/components/common/GlobalLoader";
import Image from "next/image";

type HomepageItem = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  showOnHomepage: boolean;
  homepageOrder: number | null;
};

type HeroImage = {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
};

type SlotState = {
  slotNumber: number;
  assignedItemId: string | null;
};

export default function AdminHomepagePage() {
  const [allBrands, setAllBrands] = useState<HomepageItem[]>([]);
  const [allCategories, setAllCategories] = useState<HomepageItem[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // ==================== HERO IMAGES MANAGEMENT ====================
  
  async function loadHeroImages() {
    try {
      const data = await apiGetAuth("/admin/hero-images");
      const images = Array.isArray(data) ? data : (data?.data || []);
      return images;
    } catch (error) {
      console.error("Failed to load hero images:", error);
      return [];
    }
  }

  async function handleHeroUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://kk-backend-5c11.onrender.com/api";
      
      const res = await fetch(`${API_BASE}/admin/hero-images`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error("Upload failed");

      form.reset();
      const heroData = await loadHeroImages();
      setHeroImages(heroData);
      showMessage('success', 'Hero image uploaded successfully!');
    } catch (err: any) {
      console.error("Upload error:", err);
      showMessage('error', err.message || 'Failed to upload hero image');
    } finally {
      setUploading(false);
    }
  }

  async function toggleHeroActive(id: string, currentStatus: boolean) {
    try {
      await apiPutAuth(`/admin/hero-images/${id}`, { isActive: !currentStatus });
      const heroData = await loadHeroImages();
      setHeroImages(heroData);
      showMessage('success', 'Hero image status updated');
    } catch (err: any) {
      console.error("Toggle error:", err);
      showMessage('error', err.message || 'Failed to update status');
    }
  }

  async function updateHeroOrder(id: string, newOrder: number) {
    try {
      await apiPutAuth(`/admin/hero-images/${id}`, { displayOrder: newOrder });
      const heroData = await loadHeroImages();
      setHeroImages(heroData);
      showMessage('success', 'Display order updated');
    } catch (err: any) {
      console.error("Update error:", err);
      showMessage('error', err.message || 'Failed to update order');
    }
  }

  async function deleteHeroImage(id: string) {
    if (!confirm("Delete this hero image? This cannot be undone.")) return;

    try {
      await apiDeleteAuth(`/admin/hero-images/${id}`);
      const heroData = await loadHeroImages();
      setHeroImages(heroData);
      showMessage('success', 'Hero image deleted');
    } catch (err: any) {
      console.error("Delete error:", err);
      showMessage('error', err.message || 'Failed to delete image');
    }
  }

  // ==================== DATA LOADING ====================

  async function loadData() {
    setLoading(true);
    try {
      const [brandsData, categoriesData, heroData] = await Promise.all([
        getAdminHomepageBrands(),
        getAdminHomepageCategories(),
        loadHeroImages()
      ]);
      
      setAllBrands(brandsData || []);
      setAllCategories(categoriesData || []);
      setHeroImages(heroData || []);
      
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

      {/* Hero Section */}
      <HeroSectionManagement
        heroImages={heroImages}
        onUpload={handleHeroUpload}
        onToggleActive={toggleHeroActive}
        onUpdateOrder={updateHeroOrder}
        onDelete={deleteHeroImage}
        uploading={uploading}
      />

      <div className="h-12" />

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

// ==================== HERO SECTION MANAGEMENT COMPONENT ====================

function HeroSectionManagement({
  heroImages,
  onUpload,
  onToggleActive,
  onUpdateOrder,
  onDelete,
  uploading
}: {
  heroImages: HeroImage[];
  onUpload: (e: React.FormEvent<HTMLFormElement>) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onUpdateOrder: (id: string, newOrder: number) => void;
  onDelete: (id: string) => void;
  uploading: boolean;
}) {
  const activeCount = heroImages.filter(img => img.isActive).length;
  const sortedImages = [...heroImages].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Homepage Hero Section</h2>
            <p className="mt-1 text-sm text-gray-500">
              {activeCount} active image{activeCount !== 1 ? 's' : ''} • {heroImages.length} total
            </p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Upload New Hero Image</h3>
        <form onSubmit={onUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image File *
              </label>
              <input
                type="file"
                name="files"
                accept="image/*"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="mt-1 text-xs text-gray-500">Recommended: 1920x600px, landscape</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Big Sale"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle (Optional)
            </label>
            <input
              type="text"
              name="subtitle"
              placeholder="e.g., Up to 70% off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Hero Image'}
          </button>
        </form>
      </div>

      {/* Hero Images List */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Current Hero Images</h3>

        {heroImages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No hero images uploaded yet.</p>
            <p className="text-xs mt-1">Upload your first hero image using the form above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedImages.map((img) => (
              <div
                key={img._id}
                className={`border rounded-lg p-4 flex gap-4 items-start transition-all ${
                  img.isActive ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Image Preview */}
                <div className="relative w-48 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={img.imageUrl}
                    alt={img.title || "Hero"}
                    fill
                    className="object-cover"
                  />
                  {!img.isActive && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Inactive</span>
                    </div>
                  )}
                </div>

                {/* Image Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">
                    {img.title || "(No title)"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {img.subtitle || "(No subtitle)"}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    {/* Display Order */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-600">Order:</label>
                      <input
                        type="number"
                        min="0"
                        value={img.displayOrder}
                        onChange={(e) => onUpdateOrder(img._id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        img.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {img.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => onToggleActive(img._id, img.isActive)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      img.isActive
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {img.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => onDelete(img._id)}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
