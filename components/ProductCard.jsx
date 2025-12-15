"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import DefaultProductImage from "@/assets/images/ChatGPT Image Nov 28, 2025, 10_33_10 PM.png"; // use default placeholder when product has no image or to replace dummy imports
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProductCard({ product }) {
  const { addItem, updateQty, removeItem, items } = useCart();

  // Support both id and _id - robust lookup
  const productIdKey = product.id || product._id || product.productId || '';
  const cartItem = items.find((item) => item.id === productIdKey || item.productId === productIdKey);
  // Always ensure quantity is a non-negative number - prevent -1 display bug
  const currentQty = Math.max(0, Number(cartItem?.qty) || 0);

  // Support both title and name
  const productTitle = product.title || product.name || "Untitled Product";

  // Handle images
  // use default placeholder when no product image or when replacing dummy import
  const imgSrc = (() => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    } else if (product.image_url) {
      return product.image_url;
    }
    return DefaultProductImage;
  })();

  const handleQuantityChange = (newQty) => {
    // Ensure newQty is always non-negative
    const safeQty = Math.max(0, Number(newQty) || 0);
    
    if (safeQty === 0) {
      removeItem(productIdKey);
    } else if (currentQty === 0) {
      addItem(
        {
          id: productIdKey,
          name: productTitle,
          price: product.price || 0,
          image_url: imgSrc,
        },
        safeQty
      );
    } else {
      updateQty(productIdKey, safeQty);
    }
  };

  const increaseQty = () => {
    // Safely increment with guard against negative values
    handleQuantityChange(Math.max(0, currentQty) + 1);
  };

  const decreaseQty = () => {
    // Safely decrement with guard - never go below 0
    handleQuantityChange(Math.max(0, currentQty - 1));
  };

  // unified product card layout — match /products page
  return (
    <Card className="group hover:shadow-lg transition flex flex-col h-full">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={product?.title || product?.name || 'Product image'}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = DefaultProductImage.src || DefaultProductImage;
            }}
          />

          {/* removed Sale badge (per new design) */}
        </div>
      </Link>

      <div className="flex-1 flex flex-col">
        <CardHeader>
          <Link href={`/products/${product.slug}`}>
            <CardTitle className="text-base line-clamp-2 group-hover:text-emerald-600">
              {productTitle}
            </CardTitle>
          </Link>

          {product.brand?.name && (
            <p className="text-sm text-slate-500">{product.brand.name}</p>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">₹{product.price || 0}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-sm text-slate-500 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="mt-auto">
        {currentQty === 0 ? (
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            aria-label={`Add ${productTitle} to cart`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2 w-full">
            <Link
              href="/cart"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition text-center text-sm font-medium"
              aria-label={`Go to cart for ${productTitle}`}
            >
              Go to Cart
            </Link>
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-3 py-1.5 shadow-sm">
              <button
                onClick={decreaseQty}
                className="text-red-500 text-lg px-1"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="text-gray-900 text-base font-medium min-w-[1.5rem] text-center">{currentQty}</span>
              <button
                onClick={increaseQty}
                className="text-red-500 text-lg px-1"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
