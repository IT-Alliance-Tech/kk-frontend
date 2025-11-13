/**
 * Brand type definition
 */
export type Brand = {
  _id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * API response wrapper type
 */
export type BrandsApiResponse = 
  | Brand[]
  | { success: true; data: Brand[] };

export type BrandApiResponse = 
  | Brand
  | { success: true; data: Brand };
