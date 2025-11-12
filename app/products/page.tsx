"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  mrp?: number;
  images?: string[];
  brand?: { name: string };
  category?: { name: string };
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/products");
        setProducts(data.items || []); // ✅ always use array
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = Array.isArray(products)
    ? products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];


  const addAndGoToCart = (product: Product) => {
    addItem(
      {
        id: product._id,
        name: product.title,
        price: product.price,
        image_url: product.images?.[0] || "",
      },
      1
    );
    router.push("/cart");
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">All Products</h1>
          <p className="text-slate-600 mb-6">
            Browse our complete collection of kitchen essentials
          </p>

          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-slate-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-200 rounded mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <Card key={product._id} className="group hover:shadow-lg transition-shadow">
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-slate-300" />
                        </div>
                      )}
                      {product.mrp && product.mrp > product.price && (
                        <Badge className="absolute top-2 right-2 bg-red-500">Sale</Badge>
                      )}
                    </div>
                  </Link>
                  <CardHeader>
                    <Link href={`/products/${product.slug}`}>
                      <CardTitle className="text-base line-clamp-2 group-hover:text-emerald-600">
                        {product.title}
                      </CardTitle>
                    </Link>
                    {product.brand && (
                      <p className="text-sm text-slate-500">{product.brand.name}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">
                        ₹{product.price}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-sm text-slate-500 line-through">₹{product.mrp}</span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => addAndGoToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
