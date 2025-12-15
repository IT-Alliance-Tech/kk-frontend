"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct, getBrands, getCategories } from "@/lib/admin";

export default function AddProductForm() {
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
  const router = useRouter();

  // Fetch brands and categories on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          getBrands(),
          getCategories()
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

  async function onSubmit(e: React.FormEvent) {
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
    
    setStatus("Saving...");
    try {
      // Parse images (comma-separated URLs or empty)
      const imageArray = images.trim() 
        ? images.split(',').map(url => url.trim()).filter(url => url.length > 0)
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
        isActive
      };

      const result = await createProduct(payload);

      // Check for success using multiple possible indicators
      if (result?.ok || result?.success) {
        setStatus("Created");
        // Reset form
        setTitle("");
        setDescription("");
        setBrandId("");
        setCategoryId("");
        setPrice("");
        setMrp("");
        setStock("");
        setImages("");
        setIsActive(true);
        router.refresh();
      } else {
        // Use any available error message
        const errorMsg = result?.error || result?.message || "Create failed";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      setStatus(err.message || "Error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-2">
      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title *"
        required
        className="border p-2 rounded w-full"
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={3}
        className="border p-2 rounded w-full"
      />

      {/* Brand Dropdown */}
      <select
        value={brandId}
        onChange={(e) => setBrandId(e.target.value)}
        required
        className="border p-2 rounded w-full"
      >
        <option value="">Select Brand *</option>
        {brands.map((brand) => (
          <option key={brand._id} value={brand._id}>
            {brand.name}
          </option>
        ))}
      </select>

      {/* Category Dropdown */}
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
        className="border p-2 rounded w-full"
      >
        <option value="">Select Category *</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Price and MRP */}
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price *"
          required
          className="border p-2 rounded flex-1"
        />
        <input
          type="number"
          step="0.01"
          value={mrp}
          onChange={(e) => setMrp(e.target.value)}
          placeholder="MRP *"
          required
          className="border p-2 rounded flex-1"
        />
      </div>

      {/* Stock */}
      <input
        type="number"
        step="1"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="Stock (default: 0)"
        className="border p-2 rounded w-full"
      />

      {/* Images (optional) */}
      <input
        value={images}
        onChange={(e) => setImages(e.target.value)}
        placeholder="Image URLs (comma-separated, optional)"
        className="border p-2 rounded w-full"
      />

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

      <div>
        <button
          type="submit"
          className="px-3 py-1 rounded bg-blue-600 text-white"
        >
          Add product
        </button>
        <span className="ml-3 text-sm text-gray-600">{status}</span>
      </div>
    </form>
  );
}
