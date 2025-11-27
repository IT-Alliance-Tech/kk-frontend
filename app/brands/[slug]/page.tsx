/**
 * Brand detail page - Server Component
 * Displays a single brand with its information and products
 */

import Image from "next/image";
import { notFound } from "next/navigation";
import { getBrand } from "@/lib/api/brands.api";
import { getProductsByBrand } from "@/lib/api/products.api";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";

type Props = {
  params: { slug: string };
};

export default async function BrandPage({ params }: Props) {
  // Validate slug parameter
  if (!params?.slug) {
    notFound();
  }

  let brand;
  let productsData: any[] = [];

  try {
    brand = await getBrand(params.slug);
  } catch (error) {
    console.error("Error fetching brand:", error);
    notFound();
  }

  if (!brand) {
    notFound();
  }

  // Fetch products for this brand using the brand's _id
  try {
    productsData = await getProductsByBrand(brand._id);
  } catch (error) {
    console.error("Error fetching products for brand:", error);
    // Don't fail the page if products fetch fails, just show empty state
    productsData = [];
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Brand Header Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Brand Logo */}
                  <div className="flex-shrink-0">
                    {brand.logoUrl ? (
                      /* TODO: replace with next/image if src is static */
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        width={160}
                        height={160}
                        className="w-40 h-40 object-contain border border-slate-200 rounded-lg p-4 bg-white"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50">
                        <Package className="h-20 w-20 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Brand Info */}
                  <div className="flex-grow text-center md:text-left">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                      {brand.name}
                    </h1>
                    {brand.description && (
                      <p className="text-lg text-slate-600 leading-relaxed">
                        {brand.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Products by {brand.name}
          </h2>
          
          {Array.isArray(productsData) && productsData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {productsData.map((product: any) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                No products available for this brand yet
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
