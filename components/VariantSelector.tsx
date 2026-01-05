'use client';

import React from 'react';

interface Variant {
  _id: string;
  name: string;
  price: number;
  mrp: number;
  stock: number;
  sku?: string;
  attributes?: Record<string, string>;
  isActive: boolean;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onVariantChange: (variant: Variant) => void;
}

export default function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Option
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {variants.map((variant) => (
          <button
            key={variant._id}
            onClick={() => onVariantChange(variant)}
            disabled={variant.stock === 0}
            className={`
              relative px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all
              ${
                selectedVariantId === variant._id
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }
              ${
                variant.stock === 0
                  ? 'opacity-50 cursor-not-allowed line-through'
                  : 'cursor-pointer'
              }
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            `}
          >
            <div className="text-center">
              <div className="font-semibold">{variant.name}</div>
              <div className="text-xs mt-1">
                ₹{variant.price.toLocaleString('en-IN')}
              </div>
              {variant.stock === 0 && (
                <div className="text-xs text-red-600 mt-1">Out of Stock</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
