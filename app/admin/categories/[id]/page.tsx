"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSingleCategory, updateCategory } from "@/lib/admin";
import ImagePicker from "@/components/ImagePicker";
import { ArrowLeft, Save, X, Layers, FileText, Image as ImageIcon, Home, Hash, Link2, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [homepageOrder, setHomepageOrder] = useState<number | "">("");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Auto-generate slug from category name
  const autoSlug = slugify(name.trim());
  const canBrowseImages = autoSlug.length > 0;

  useEffect(() => {
    async function loadCategory() {
      try {
        const category = await getSingleCategory(id);
        setName(category.name || "");
        setDescription(category.description || "");
        setImageUrl(category.image_url || category.image || "");
        setShowOnHomepage(category.showOnHomepage || false);
        setHomepageOrder(category.homepageOrder || "");
      } catch (err) {
        setStatus("Failed to load category");
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setStatus("Name is required");
      return;
    }

    // Auto-generate slug from name
    const generatedSlug = slugify(name.trim());
    if (!generatedSlug) {
      setStatus("Invalid category name");
      return;
    }

    // Validate homepage fields
    if (showOnHomepage && !homepageOrder) {
      setStatus("Homepage order is required when showing on homepage");
      return;
    }

    setStatus("Updating category...");
    setSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        slug: generatedSlug,
        description: description.trim(),
        image_url: imageUrl.trim() || "",
        showOnHomepage,
        homepageOrder: showOnHomepage && homepageOrder ? Number(homepageOrder) : null,
      };

      await updateCategory(id, payload);
      setStatus("Category updated successfully!");
      setTimeout(() => {
        router.push("/admin/categories");
      }, 1000);
    } catch (err: any) {
      console.error("Category update error:", err);
      const errorMsg = err.message || "Error updating category";
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
              <p className="text-slate-600 font-medium">Loading category...</p>
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
              onClick={() => router.push("/admin/categories")}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Category</h1>
              <p className="text-sm text-slate-500 mt-0.5">Update category information and settings</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-900">Category Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
                />
                {autoSlug && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <Link2 className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">URL Slug:</span>
                    <code className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{autoSlug}</code>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Category Image Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-900">Category Image</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Image Preview */}
                {imageUrl && (
                  <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt="Category image"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Image URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => canBrowseImages && setShowImagePicker(true)}
                      disabled={!canBrowseImages}
                      className={`inline-flex items-center gap-2 px-4 py-3 border rounded-lg font-medium transition-colors ${
                        canBrowseImages
                          ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                          : "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                      }`}
                      title={!canBrowseImages ? "Category slug is required" : "Browse Images"}
                    >
                      <ImageIcon className="w-5 h-5" />
                      Browse
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {canBrowseImages
                      ? "Upload or select a category image from Supabase storage"
                      : "Enter category name to enable image upload"}
                  </p>
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
                    <p className="text-sm text-slate-500">Display this category in the homepage categories section</p>
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
                  Controls the display order on homepage (only 4 categories can be shown)
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
                  Update Category
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>

        {/* Image Picker Modal */}
        <ImagePicker
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={(urls) => {
            // Set the first selected URL as the category image
            if (urls.length > 0) {
              setImageUrl(urls[0]);
            }
          }}
          multiSelect={false}
          maxFiles={1}
          folder="categories"
          slug={autoSlug}
        />
      </div>
    </div>
  );
}
