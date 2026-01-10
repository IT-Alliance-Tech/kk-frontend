"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct, getBrands, getCategories } from "@/lib/admin";
import ImagePicker from "@/components/ImagePicker";
import GlobalLoader from "@/components/common/GlobalLoader";
import InlineSizeManager from "@/components/admin/InlineSizeManager";

interface Size {
  _id?: string;
  name: string;
  sku?: string;
  price: number;
  mrp: number;
  stock: number;
  isDefault: boolean;
  isActive: boolean;
}

export default function NewProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [hasSizes, setHasSizes] = useState(false);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [status, setStatus] = useState("");
  const [sizeErrors, setSizeErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch brands and categories on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          getBrands(),
          getCategories(),
        ]);

        // API functions now return arrays directly via ensureArray
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error("Failed to fetch brands/categories:", err);
      }
    }
    fetchData();
  }, []);

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

    // Validate sizes if enabled
    if (hasSizes) {
      const errors: string[] = [];
      
      if (sizes.length === 0) {
        errors.push("At least one size is required when 'Has Multiple Sizes' is enabled");
      }
      
      const defaultSizes = sizes.filter(s => s.isDefault);
      if (defaultSizes.length === 0) {
        errors.push("Please mark one size as default");
      } else if (defaultSizes.length > 1) {
        errors.push("Only one size can be marked as default");
      }
      
      sizes.forEach((size, index) => {
        if (!size.name.trim()) {
          errors.push(`Size ${index + 1}: Name is required`);
        }
        if (size.price <= 0) {
          errors.push(`Size ${index + 1}: Price must be greater than 0`);
        }
        if (size.mrp <= 0) {
          errors.push(`Size ${index + 1}: MRP must be greater than 0`);
        }
        if (size.price > size.mrp) {
          errors.push(`Size ${index + 1}: Price cannot be greater than MRP`);
        }
      });

      if (errors.length > 0) {
        setSizeErrors(errors);
        setStatus("Please fix size validation errors");
        return;
      }
      setSizeErrors([]);
    } else {
      // If sizes are not enabled, validate base price/mrp/stock
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
    }

    setStatus("Creating product...");
    setLoading(true);

    try {
      // Parse images (comma-separated URLs or empty)
      const imageArray = images.trim()
        ? images.split(",").map((url) => url.trim()).filter((url) => url.length > 0)
        : [];

      const payload: any = {
        title: title.trim(),
        brandId,
        categoryId,
        description: description.trim(),
        hasSizes,
        images: imageArray,
        isActive,
      };

      // If hasSizes is true, include variants and use dummy values for product-level fields
      if (hasSizes) {
        payload.variants = sizes.map(({ _id, ...rest }) => rest); // Remove _id for new variants
        // Use default variant's price/stock for product-level fields (required by schema)
        const defaultSize = sizes.find(s => s.isDefault) || sizes[0];
        payload.price = defaultSize.price;
        payload.mrp = defaultSize.mrp;
        payload.stock = defaultSize.stock;
      } else {
        // Use form values for product-level fields
        payload.price = parseFloat(price);
        payload.mrp = parseFloat(mrp);
        payload.stock = stock ? parseFloat(stock) : 0;
      }

      const result = await createProduct(payload);

      // Check for success using multiple possible indicators
      if (result?.ok || result?.success) {
        setStatus("Product created successfully!");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1000);
      } else {
        // Use any available error message
        const errorMsg = result?.error || result?.message || "Creation failed";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      setStatus(err?.message || "Error creating product");
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>

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
        {!hasSizes && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required={!hasSizes}
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
                required={!hasSizes}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        )}

        {/* Stock */}
        {!hasSizes && (
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
        )}

        {/* Has Multiple Sizes Toggle */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="hasSizes"
              checked={hasSizes}
              onChange={(e) => {
                setHasSizes(e.target.checked);
                if (!e.target.checked) {
                  setSizes([]);
                  setSizeErrors([]);
                }
              }}
              className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="hasSizes" className="text-sm font-medium">
              Does this product have multiple sizes?
            </label>
          </div>
          {hasSizes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> When sizes are enabled, each size will have its own price, MRP, and stock. 
                You must add at least one size and mark one as the default.
              </p>
            </div>
          )}
        </div>

        {/* Size Manager */}
        {hasSizes && (
          <div>
            <label className="block text-sm font-medium mb-3">Product Sizes *</label>
            <InlineSizeManager 
              sizes={sizes} 
              onChange={setSizes}
              errors={sizeErrors}
            />
          </div>
        )}

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
              onClick={() => setShowImagePicker(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border rounded whitespace-nowrap"
            >
              📷 Browse Images
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            You can paste URLs directly or use the image picker to upload and select images
          </p>
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
            disabled={loading}
            className="px-4 py-2 rounded bg-black text-white disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              <>
                <GlobalLoader size="small" className="border-white" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
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

      {/* Image Picker Modal */}
      <ImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(urls) => {
          // Append selected URLs to existing images field (comma-separated)
          const existingUrls = images.trim() ? images.split(",").map(u => u.trim()).filter(u => u) : [];
          const allUrls = [...existingUrls, ...urls];
          setImages(allUrls.join(", "));
        }}
        multiSelect={true}
        maxFiles={10}
      />
    </div>
  );
}
