"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSingleBrand, updateBrand } from "@/lib/admin";
import { ArrowLeft, Save, X, Tag, Link2, Image as ImageIcon, Home, Hash, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [homepageOrder, setHomepageOrder] = useState<number | "">("");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadBrand() {
      try {
        const brand = await getSingleBrand(id);
        setName(brand.name || "");
        setSlug(brand.slug || "");
        setLogoUrl(brand.logoUrl || "");
        setShowOnHomepage(brand.showOnHomepage || false);
        setHomepageOrder(brand.homepageOrder || "");
      } catch (err) {
        setStatus("Failed to load brand");
      } finally {
        setLoading(false);
      }
    }
    loadBrand();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setStatus("Name is required");
      return;
    }
    if (!slug.trim()) {
      setStatus("Slug is required");
      return;
    }

    // Validate homepage fields
    if (showOnHomepage && !homepageOrder) {
      setStatus("Homepage order is required when showing on homepage");
      return;
    }

    setStatus("Updating brand...");
    setSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        slug: slug.trim(),
        logoUrl: logoUrl.trim() || undefined,
        showOnHomepage,
        homepageOrder: showOnHomepage && homepageOrder ? Number(homepageOrder) : null,
      };

      await updateBrand(id, payload);
      setStatus("Brand updated successfully!");
      setTimeout(() => {
        router.push("/admin/brands");
      }, 1000);
    } catch (err: any) {
      console.error("Brand update error:", err);
      const errorMsg = err.message || "Error updating brand";
      setStatus(errorMsg);
      
      // Handle 401 Unauthorized - redirect to login
      if (err.status === 401 || errorMsg.includes("Invalid user") || errorMsg.includes("Not authenticated")) {
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      }
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-slate-600 font-medium">Loading brand...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/brands")}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Brand</h1>
              <p className="text-sm text-slate-500 mt-0.5">Update brand information and settings</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-900">Brand Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter brand name"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Link2 className="w-4 h-4 inline mr-1" />
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="brand-slug"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400 font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Used in URLs. Use lowercase letters, numbers, and hyphens only.
                </p>
              </div>
            </div>
          </div>

          {/* Logo Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-900">Brand Logo</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Logo Preview */}
                {logoUrl && (
                  <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={logoUrl}
                      alt="Brand logo"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Logo URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowImageUploadModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                      title="Browse Images"
                    >
                      <ImageIcon className="w-5 h-5" />
                      Browse
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Homepage Visibility Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-900">Homepage Visibility</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Show on Homepage Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Show on Homepage</p>
                    <p className="text-sm text-slate-500">Display this brand in the homepage brands section</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="showOnHomepage"
                    checked={showOnHomepage}
                    onChange={(e) => {
                      setShowOnHomepage(e.target.checked);
                      if (!e.target.checked) {
                        setHomepageOrder("");
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Homepage Order */}
              <div className={`transition-opacity ${!showOnHomepage ? 'opacity-50' : ''}`}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Homepage Order (1-4) {showOnHomepage && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={homepageOrder}
                  onChange={(e) => setHomepageOrder(e.target.value ? Number(e.target.value) : "")}
                  disabled={!showOnHomepage}
                  className={`w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 bg-white ${!showOnHomepage ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select order...</option>
                  <option value="1">1st Position</option>
                  <option value="2">2nd Position</option>
                  <option value="3">3rd Position</option>
                  <option value="4">4th Position</option>
                </select>
                <p className="text-xs text-slate-500 mt-1.5">
                  Controls the display order on homepage (only 4 brands can be shown)
                </p>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`flex items-center gap-3 p-4 rounded-xl ${
              status.includes("successfully") 
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700" 
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {status.includes("successfully") ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{status}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Brand
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/brands")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>

        {/* Image Upload Modal */}
        {showImageUploadModal && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageUploadModal(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-slate-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-center text-slate-900 mb-2">Brand Logo Upload</h2>
              <p className="text-slate-500 text-center mb-6">
                Brand logo upload coming soon
              </p>
              <button
                onClick={() => setShowImageUploadModal(false)}
                className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
