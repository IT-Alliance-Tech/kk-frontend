// Product View page — displays product details with edit controls and size management

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSingleProduct, getBrands, getCategories } from "@/lib/admin";
import DefaultProductImage from "@/assets/images/ChatGPT Image Nov 28, 2025, 10_33_10 PM.png";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import VariantManager from "@/components/admin/VariantManager";

export default function ViewProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // Track delete operation state

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

        // Defensive access to product in response
        // After apiGetAuth unwrapping, check multiple possible paths
        const fetchedProduct = productRes?.product || productRes?.data?.product || null;
        
        if (!fetchedProduct) {
          console.error('Product not found at expected paths', productRes);
        } else {
          // Normalize product: ensure id field exists
          const normalized = { ...fetchedProduct, id: fetchedProduct._id || fetchedProduct.id };
          setProduct(normalized);
        }

        // Load brands and categories for name lookups
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err: any) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchData();
    }
  }, [productId]);

  /**
   * Handle product deletion with confirmation
   * Confirms with user, calls DELETE API, shows feedback, and redirects on success
   */
  const handleDelete = async () => {
    // Confirm deletion with user
    if (!confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      // Get auth token from localStorage (same pattern as lib/admin.ts)
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      
      // Build API URL using the product ID
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://kk-backend-5c11.onrender.com/api";
      const url = `${API_BASE}/admin/products/${productId}`;

      // Make DELETE request to backend
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include', // Include cookies for auth
      });

      // Parse response
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Show error message from server or fallback
        const errorMsg = data.message || data.error?.message || 'Failed to delete product';
        toast.error(errorMsg);
        setIsDeleting(false);
        return;
      }

      // Success: show notification and redirect
      toast.success('Product deleted successfully');
      router.push('/admin/products');
    } catch (err: any) {
      // Handle network errors or unexpected exceptions
      console.error('Delete error:', err);
      toast.error(err.message || 'An error occurred while deleting the product');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-red-600">Product not found</p>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 px-4 py-2 rounded border"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Resolve brand/category names using same lookup strategy as products table
  const brandName = product?.brand?.name 
    ?? brands?.find(b => String(b._id) === String(product.brand))?.name 
    ?? product.brand 
    ?? '-';
  
  const categoryName = product?.category?.name 
    ?? categories?.find(c => String(c._id) === String(product.category))?.name 
    ?? product.category 
    ?? '-';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header with Back and Delete buttons */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">View Product</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded border hover:bg-gray-50 transition"
          >
            Back to Products
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Product Details Card */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <div className="text-base text-gray-900">{product?.title ?? '-'}</div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <div className="text-base text-gray-900 whitespace-pre-wrap">
            {product?.description ?? '-'}
          </div>
        </div>

        {/* Brand and Category Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <div className="text-base text-gray-900">{brandName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="text-base text-gray-900">{categoryName}</div>
          </div>
        </div>

        {/* Price and MRP Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <div className="text-base text-gray-900">₹{product?.price ?? '-'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">MRP</label>
            <div className="text-base text-gray-900">₹{product?.mrp ?? '-'}</div>
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
          <div className="text-base text-gray-900">{product?.stock ?? '-'}</div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
          <div className="flex gap-3 flex-wrap">
            {Array.isArray(product?.images) && product.images.length > 0 ? (
              product.images.map((src: string, i: number) => (
                <Image
                  key={i}
                  src={src}
                  alt={`${product?.title} - Image ${i + 1}`}
                  className="w-32 h-32 object-cover rounded border"
                  width={500}
                  height={500}
                  loading="lazy"
                  onError={(e) => {
                    // use default placeholder when no product image or when replacing dummy import
                    (e.currentTarget as HTMLImageElement).src = typeof DefaultProductImage === 'string' ? DefaultProductImage : DefaultProductImage.src;
                  }}
                />
              ))
            ) : (
              <div className="text-gray-500 text-sm">No images available</div>
            )}
          </div>
        </div>

        {/* Active Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="text-base">
            <span className={`px-3 py-1 rounded-full text-sm ${
              product?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {product?.createdAt 
                ? new Date(product.createdAt).toLocaleString() 
                : '-'}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{' '}
              {product?.updatedAt 
                ? new Date(product.updatedAt).toLocaleString() 
                : '-'}
            </div>
          </div>
        </div>

        {/* Additional Product ID Info */}
        <div className="pt-2 text-xs text-gray-500">
          <span className="font-medium">Product ID:</span> {product?._id || product?.id || '-'}
        </div>

      </div>

      {/* Product Variants Section */}
      {productId && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Available Sizes & Prices</h2>
          <VariantManager productId={productId} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <Link
          href={`/admin/products/${product._id || product.id}`}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Edit Product
        </Link>
        <button
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 rounded border hover:bg-gray-50 transition"
        >
          Back to Products
        </button>
      </div>
    </div>
  );
}
