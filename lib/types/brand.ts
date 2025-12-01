/**
 * Brand type definition
 */
export type Brand = {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  _id?: string; // incoming backend might use _id (mongodb) — accept both _id and id
};

/**
 * API response wrapper type
 */
export type BrandsApiResponse = Brand[] | { success: true; data: Brand[] };

export type BrandApiResponse = Brand | { success: true; data: Brand };
