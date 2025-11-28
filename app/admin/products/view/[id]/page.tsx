// Read-only Product View page — displays product details without edit controls

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSingleProduct, getBrands, getCategories } from "@/lib/admin";
import Link from "next/link";

export default function ViewProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.log('VIEW PRODUCT RESPONSE:', productRes);

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
      {/* Header with Back button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">View Product</h1>
        <Link
          href="/admin/products"
          className="px-4 py-2 rounded border hover:bg-gray-50 transition"
        >
          Back to Products
        </Link>
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
                <img
                  key={i}
                  src={src}
                  alt={`${product?.title} - Image ${i + 1}`}
                  className="w-32 h-32 object-cover rounded border"
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
