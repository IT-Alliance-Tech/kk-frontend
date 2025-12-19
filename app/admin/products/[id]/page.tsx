"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSingleProduct, updateProduct, getBrands, getCategories } from "@/lib/admin";
export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);

  // Fetch product, brands, and categories
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [productRes, brandsData, categoriesData] = await Promise.all([
          getSingleProduct(productId),
          getBrands(),
          getCategories(),
        ]);

        // Log full response for debugging
        console.log('PRODUCT FETCH RESPONSE:', productRes);

        // Defensive access to product in response
        // After apiGetAuth unwrapping, check multiple possible paths
        const product = productRes?.product || productRes?.data?.product || null;
        
        if (!product) {
          console.error('Product not found at expected paths', productRes);
          setStatus("Product not found");
        } else {
          // Normalize product: ensure id field exists
          const p = { ...product, id: product._id || product.id };
          
          setTitle(p.title || "");
          setDescription(p.description || "");
          setBrandId(p.brand?._id || p.brand || "");
          setCategoryId(p.category?._id || p.category || "");
          setPrice(p.price?.toString() || "");
          setMrp(p.mrp?.toString() || "");
          setStock(p.stock?.toString() || "");
          setImages(Array.isArray(p.images) ? p.images.join(", ") : "");
          setIsActive(p.isActive !== undefined ? p.isActive : true);
        }

        // Load brands and categories
        // API functions now return arrays directly via ensureArray
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setStatus(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchData();
    }
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    if (!title.trim()) {
      setStatus("Title is required");
      return;
    }
    if (!brandId) {
      setStatus("Brand is required");
      return;
    }
    if (!categoryId) {
      setStatus("Category is required");
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setStatus("Valid price is required");
      return;
    }
    if (!mrp || parseFloat(mrp) <= 0) {
      setStatus("Valid MRP is required");
      return;
    }
    if (parseFloat(price) > parseFloat(mrp)) {
      setStatus("Price cannot be greater than MRP");
      return;
    }
    if (stock && parseFloat(stock) < 0) {
      setStatus("Stock cannot be negative");
      return;
    }

    setStatus("Updating product...");
    setSaving(true);

    try {
      // Parse images (comma-separated URLs or empty)
      const imageArray = images.trim()
        ? images.split(",").map((url) => url.trim()).filter((url) => url.length > 0)
        : [];

      const payload = {
        title: title.trim(),
        brandId,
        categoryId,
        description: description.trim(),
        price: parseFloat(price),
        mrp: parseFloat(mrp),
        stock: stock ? parseFloat(stock) : 0,
        images: imageArray,
        isActive,
      };

      await updateProduct(productId, payload);

      // Success: API call completed without throwing
      setStatus("Product updated successfully!");
      setSaving(false);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (err: any) {
      // Failure: API call threw an error
      setStatus(err.message || "Error updating product");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!title && status) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-red-600">{status}</p>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 px-4 py-2 rounded border"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product title"
            required
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description"
            rows={4}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Brand Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Brand *</label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price and MRP */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price *</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">MRP *</label>
            <input
              type="number"
              step="0.01"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              placeholder="0.00"
              required
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-1">Image URLs (comma-separated)</label>
          <div className="flex gap-2">
            <input
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              className="border p-2 rounded w-full"
            />
            <button
              type="button"
              onClick={() => setShowImageUploadModal(true)}
              className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1 whitespace-nowrap"
              title="Browse Images"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              Browse
            </button>
          </div>
        </div>

        {/* isActive Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="text-sm">
            Active
          </label>
        </div>

        {/* Status message */}
        {status && (
          <div className={`text-sm ${status.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {status}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-black text-white disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Update Product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Image Upload Modal */}
      {showImageUploadModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowImageUploadModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">Product Image Upload</h2>
            <p className="text-gray-600 text-center mb-6">
              Product image upload coming soon
            </p>
            <button
              onClick={() => setShowImageUploadModal(false)}
              className="w-full px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
