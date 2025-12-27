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
import ReviewsSection from "@/components/ReviewsSection";
import { Star, ShoppingCart, Heart, Share2, Truck, ShieldCheck } from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, removeItem, updateQty, items } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const cartItem = items.find((item) => item.id === product?._id);
  const currentQty = cartItem?.qty || 0;

  useEffect(() => {
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slug) return;

    const fetchProduct = async () => {
      const data = await apiGet(`/products/${slug}`);
      const p = data?.product || data;
      setProduct(p);

      // Fetch similar products using new API endpoint
      if (p?._id) {
        setLoadingSimilar(true);
        try {
          const similarData = await apiGet(`/products/${p._id}/similar?limit=8`);
          setSimilarProducts(similarData || []);
        } catch (error) {
          console.error('Failed to fetch similar products:', error);
          setSimilarProducts([]);
        } finally {
          setLoadingSimilar(false);
        }
      }

      setLoading(false);
    };

    fetchProduct();
  }, [params?.slug]);

  if (loading) {
    return <GlobalLoader fullPage />;
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
    <div className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 min-h-screen relative overflow-hidden">
      {/* Layered radial gradients for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating orbs with sophisticated blur */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-200/50 to-emerald-300/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-200/40 to-slate-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-15 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      
      {/* Content wrapper with elevated z-index */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative z-10">
        
        {/* Main Product Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* LEFT: Image Gallery */}
            <div className="p-8 lg:p-10 bg-gradient-to-br from-gray-50 to-white border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="sticky top-8">
                {/* Main Image */}
                <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm mb-5 ring-1 ring-gray-100">
                  <Image
                    src={mainImage}
                    alt={product.title}
                    fill
                    className="object-contain p-8"
                    priority
                  />
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                      -{discount}% OFF
                    </span>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-18 h-18 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          selectedImage === idx
                            ? "border-emerald-600 shadow-md ring-2 ring-emerald-100"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} view ${idx + 1}`}
                          width={72}
                          height={72}
                          className="object-contain w-full h-full p-1.5 bg-white"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div className="p-8 lg:p-10 flex flex-col">
              
              {/* Title & Rating */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-3 flex-wrap">
                  {product.attributes?.ratingAvg > 0 && (
                    <>
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                        <span>{product.attributes.ratingAvg.toFixed(1)}</span>
                        <Star size={14} fill="currentColor" />
                      </div>
                      {product.attributes?.ratingCount > 0 && (
                        <span className="text-sm text-gray-600 font-medium">
                          {product.attributes.ratingCount} {product.attributes.ratingCount === 1 ? "rating" : "ratings"}
                        </span>
                      )}
                    </>
                  )}
                  {product.category?.name && (
                    <>
                      {product.attributes?.ratingAvg > 0 && <span className="text-gray-300">•</span>}
                      <span className="text-sm text-emerald-700 font-semibold">
                        {product.category.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Pricing Section */}
              <div className="py-5 mb-6 border-y border-gray-200 bg-gray-50/50 -mx-8 lg:-mx-10 px-8 lg:px-10">
                <div className="flex items-baseline gap-3 flex-wrap mb-1.5">
                  <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <>
                      <span className="text-xl line-through text-gray-400 font-medium">
                        ₹{product.mrp.toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                        Save ₹{(product.mrp - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {inStock ? (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    In Stock — Ready to Ship
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-800 bg-red-50 px-3.5 py-2 rounded-lg border border-red-200">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl p-5 mb-8 space-y-4 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Truck className="text-emerald-600" size={22} />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="font-bold text-gray-900 text-sm mb-0.5">Free Delivery</p>
                    <p className="text-xs text-gray-600 leading-relaxed">On orders above ₹500</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldCheck className="text-blue-600" size={22} />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="font-bold text-gray-900 text-sm mb-0.5">Secure Payment</p>
                    <p className="text-xs text-gray-600 leading-relaxed">100% secure transactions</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-6 border-t border-gray-200">
                {currentQty > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <QuantitySelector value={currentQty} onChange={handleQty} />
                      <Link
                        href="/cart"
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3.5 px-6 rounded-xl text-center font-bold transition-all shadow-md hover:shadow-lg text-base"
                      >
                        Go to Cart
                      </Link>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleQty(1)}
                    disabled={!inStock}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 text-base active:scale-[0.98]"
                  >
                    <ShoppingCart size={20} strokeWidth={2.5} />
                    Add to Cart
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mt-8 overflow-hidden border border-gray-100">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b-2 border-gray-100 rounded-none bg-gradient-to-r from-gray-50 to-white p-0 h-auto">
              <TabsTrigger 
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:text-emerald-700 px-8 py-4 font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:text-emerald-700 px-8 py-4 font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:text-emerald-700 px-8 py-4 font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="px-8 py-8 text-gray-700 leading-relaxed text-[15px]">
              {product.description || (
                <p className="text-gray-400 italic text-center py-6">No description available for this product.</p>
              )}
            </TabsContent>

            <TabsContent value="specifications" className="px-8 py-8">
              <div className="text-gray-400 italic text-center py-6">
                Detailed specifications coming soon.
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="px-8 py-8">
              {product?._id ? (
                <ReviewsSection productId={product._id} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Unable to load reviews</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products */}
        {loadingSimilar ? (
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 h-80 animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : similarProducts.length > 0 ? (
          <div className="mt-10 pt-8 border-t border-gray-200">
            {/* Header row with title and Explore more CTA */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Similar Products</h2>
              <button 
                onClick={() => {
                  const categoryName = product?.category?.name;
                  if (categoryName) {
                    router.push(`/search?q=${encodeURIComponent(categoryName)}`);
                  } else {
                    router.push('/search');
                  }
                }}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium hover:underline transition-colors whitespace-nowrap cursor-pointer"
              >
                Explore more →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {similarProducts.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
