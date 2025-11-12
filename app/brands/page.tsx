/**
 * Brands listing page - Server Component
 * Fetches and displays all brands from the backend API
 */

import Link from 'next/link';
import { getBrands } from '@/lib/api/brands.api';
import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Brand } from '@/lib/types';

export default async function BrandsPage() {
  let brands: Brand[] = [];
  let error: string | null = null;

  try {
    brands = await getBrands();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load brands';
    brands = [];
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-4">Shop by Brand</h1>
          <p className="text-sm sm:text-base text-slate-600">Explore products from our trusted brand partners</p>
        </div>
      </section>

      {/* Brands Grid Section */}
      <section className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!error && brands.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">No Brands Found</h2>
              <p className="text-sm sm:text-base text-slate-500">Check back soon for new brand partners</p>
            </div>
          )}

          {/* Brands Grid */}
          {brands.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {brands.map((brand) => (
                <Link 
                  key={brand._id} 
                  href={`/brands/${brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-24 sm:h-28 md:h-32 flex items-center justify-center group">
                    <CardContent className="p-3 sm:p-4 text-center w-full">
                      {brand.logoUrl ? (
                        /* TODO: replace with next/image if src is static */
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="h-8 sm:h-10 md:h-12 mx-auto object-contain mb-1 sm:mb-2 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-8 sm:h-10 md:h-12 flex items-center justify-center mb-1 sm:mb-2">
                          <Package className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </div>
                      )}
                      <p className="font-medium text-xs sm:text-sm text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                        {brand.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
