"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { useCart } from "@/components/CartContext";
import { normalizeSrc } from "@/lib/normalizeSrc";
import DefaultProductImage from "@/assets/images/ChatGPT Image Nov 28, 2025, 10_33_10 PM.png";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import QuantitySelector from "@/components/QuantitySelector";
import { Star, ShoppingCart, Heart, Share2, Truck, ShieldCheck } from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, removeItem, updateQty, items } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const cartItem = items.find((item) => item.id === product?._id);
  const currentQty = cartItem?.qty || 0;

  useEffect(() => {
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slug) return;

    const fetchProduct = async () => {
      const data = await apiGet(`/products/${slug}`);
      const p = data?.product || data;
      setProduct(p);

      if (p?.category?._id) {
        const rel = await apiGet(`/products?category=${p.category._id}&limit=4`);
        setRelatedProducts(
          (rel?.products || []).filter((x: any) => x._id !== p._id)
        );
      }

      setLoading(false);
    };

    fetchProduct();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!product) return null;

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map(normalizeSrc)
      : [DefaultProductImage];

  const mainImage = images[selectedImage];

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const inStock = product.stock !== 0;

  const handleQty = (qty: number) => {
    if (qty === 0) removeItem(product._id);
    else if (currentQty === 0)
      addItem({ id: product._id, name: product.title, price: product.price, image_url: mainImage }, qty);
    else updateQty(product._id, qty);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6 lg:p-10">

            {/* LEFT */}
            <div>
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                  priority
                />
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-emerald-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                  4.5 <Star size={12} />
                </span>
                <span className="text-sm text-gray-500">1,234 ratings</span>
              </div>

              <div className="border-y py-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">₹{product.price}</span>
                  {product.mrp && (
                    <span className="line-through text-gray-400">₹{product.mrp}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex gap-3">
                  <Truck className="text-emerald-600" />
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-gray-600">On orders above ₹500</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="text-emerald-600" />
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure</p>
                  </div>
                </div>
              </div>

              {/* ADD TO CART — SAFE VERSION */}
              <div className="mt-6 lg:sticky lg:bottom-0 bg-white pt-4">
                {currentQty > 0 ? (
                  <div className="flex gap-4">
                    <Link
                      href="/cart"
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg text-center font-semibold"
                    >
                      Go to Cart
                    </Link>
                    <QuantitySelector value={currentQty} onChange={handleQty} />
                  </div>
                ) : (
                  <button
                    onClick={() => handleQty(1)}
                    disabled={!inStock}
                    className="w-full bg-black text-white py-3 rounded-lg flex justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* TABS — NEVER TOUCHED */}
        <div className="bg-white rounded-2xl shadow-sm mt-8 p-6">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              {product.description || "No description available."}
            </TabsContent>

            <TabsContent value="specifications" className="mt-4">
              Specs coming soon.
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              No reviews yet.
            </TabsContent>
          </Tabs>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
