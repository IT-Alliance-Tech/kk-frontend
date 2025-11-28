"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { useCart } from "@/components/CartContext";
import { normalizeSrc } from "@/lib/normalizeSrc";
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
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Get current quantity from cart
  const cartItem = items.find((item) => item.id === product?._id);
  const currentQty = cartItem?.qty || 0;

  useEffect(() => {
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

    if (!slug) {
      setLoading(false);
      setProduct(null);
      setError("No product specified.");
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiGet(`/products/${encodeURIComponent(slug)}`);

        const p =
          data?.product ??
          data?.item ??
          data?.data ??
          data?.result ??
          data ??
          null;

        if (!p || typeof p !== "object" || Object.keys(p).length === 0) {
          throw new Error("Product not found");
        }

        if (!cancelled) {
          setProduct(p);
          // Fetch related products (same category)
          if (p.category?._id || p.category?.id) {
            fetchRelatedProducts(p.category._id || p.category.id, p._id);
          }
        }
      } catch (err: any) {
        console.error("Error loading product:", err);
        if (!cancelled) setError(err?.message ?? "Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchRelatedProducts = async (categoryId: string, currentProductId: string) => {
      try {
        const data = await apiGet(`/products?category=${categoryId}&limit=8`);
        const products = data?.products || data?.data || [];
        // Filter out current product and limit to 4
        const filtered = products
          .filter((p: any) => (p._id || p.id) !== currentProductId)
          .slice(0, 4);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("Error loading related products:", err);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-red-600 mb-4 text-lg">{error}</p>
        <button
          onClick={() => router.push("/products")}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          Back to products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-slate-700 text-lg mb-4">Product not found</p>
        <button
          onClick={() => router.push("/products")}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Handle images array
  const images = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img: string) => normalizeSrc(img))
    : [normalizeSrc(product.images) || `https://placehold.co/600x600?text=${encodeURIComponent(product.title || "Product")}`];

  const mainImage = images[selectedImage] || images[0];

  // Calculate discount percentage
  const discountPercent = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  // Stock status
  const inStock = typeof product.stock === "number" ? product.stock > 0 : true;

  const handleQuantityChange = (newQty: number) => {
    if (newQty === 0) {
      removeItem(product._id);
    } else if (currentQty === 0) {
      addItem(
        {
          id: product._id,
          name: product.title,
          price: product.price,
          image_url: mainImage,
        },
        newQty
      );
    } else {
      updateQty(product._id, newQty);
    }
  };

  const handleAddToCart = () => {
    if (currentQty === 0) {
      addItem({
        id: product._id,
        name: product.title,
        price: product.price,
        image_url: mainImage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-emerald-600 transition">Products</Link>
            {product.category?.name && (
              <>
                <span>/</span>
                <Link href={`/categories/${product.category.slug || product.category._id}`} className="hover:text-emerald-600 transition">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-4 sm:p-6 lg:p-10">
            
            {/* LEFT: Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                <Image
                  src={mainImage}
                  alt={product.title || "Product image"}
                  fill
                  className="object-contain p-4"
                  unoptimized={mainImage.startsWith("http")}
                  priority
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discountPercent > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {!inStock && (
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Wishlist & Share */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition ${
                        selectedImage === idx
                          ? "border-emerald-600 ring-2 ring-emerald-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                        unoptimized={img.startsWith("http")}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Details */}
            <div className="flex flex-col">
              {/* Brand & Category */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                {product.brand?.name && (
                  <Link
                    href={`/brands/${product.brand.slug || product.brand._id}`}
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    {product.brand.name}
                  </Link>
                )}
                {product.category?.name && (
                  <>
                    <span className="text-gray-300">|</span>
                    <Link
                      href={`/categories/${product.category.slug || product.category._id}`}
                      className="text-gray-600 hover:text-emerald-600 transition"
                    >
                      {product.category.name}
                    </Link>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
                  <span>4.5</span>
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-gray-600 text-sm">1,234 ratings</span>
              </div>

              {/* Pricing */}
              <div className="border-t border-b py-4 mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.mrp.toLocaleString()}
                      </span>
                      <span className="text-emerald-600 font-semibold text-lg">
                        {discountPercent}% off
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {inStock ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-medium">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Key Features */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Free Delivery</p>
                    <p className="text-sm text-gray-600">On orders above ₹500</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure transactions</p>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              {/* When item in cart: show Go to Cart (green) + move quantity spinner to bottom-right */}
              <div className="sticky bottom-0 bg-white pt-4 border-t lg:border-0 mt-auto">
                {currentQty > 0 ? (
                  <div className="flex items-center gap-4">
                    <Link
                      href="/cart"
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center"
                      aria-label={`Go to cart for ${product?.title}`}
                    >
                      Go to Cart
                    </Link>
                    <QuantitySelector
                      value={currentQty}
                      onChange={handleQuantityChange}
                      size="md"
                    />
                  </div>
                ) : (
                  // Unified Add to Cart button: same markup & classes as /products page
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    aria-label={`Add ${product?.title} to cart`}
                  >
                    <ShoppingCart size={16} />
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section: Description, Specifications, Reviews */}
        <div className="bg-white rounded-2xl shadow-sm mt-6 p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                  <dl className="space-y-2">
                    {product.brand?.name && (
                      <div className="flex justify-between py-2 border-b">
                        <dt className="text-gray-600">Brand</dt>
                        <dd className="font-medium text-gray-900">{product.brand.name}</dd>
                      </div>
                    )}
                    {product.category?.name && (
                      <div className="flex justify-between py-2 border-b">
                        <dt className="text-gray-600">Category</dt>
                        <dd className="font-medium text-gray-900">{product.category.name}</dd>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <dt className="text-gray-600">Price</dt>
                      <dd className="font-medium text-gray-900">₹{product.price?.toLocaleString()}</dd>
                    </div>
                    {product.mrp && (
                      <div className="flex justify-between py-2 border-b">
                        <dt className="text-gray-600">MRP</dt>
                        <dd className="font-medium text-gray-900">₹{product.mrp.toLocaleString()}</dd>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <dt className="text-gray-600">Availability</dt>
                      <dd className={`font-medium ${inStock ? "text-emerald-600" : "text-red-600"}`}>
                        {inStock ? "In Stock" : "Out of Stock"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="text-center py-8 text-gray-600">
                <p>No reviews yet. Be the first to review this product!</p>
                <button className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Write a Review
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
              <Link
                href={`/categories/${product.category?.slug || product.category?._id}`}
                className="text-emerald-600 hover:underline text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id || relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
