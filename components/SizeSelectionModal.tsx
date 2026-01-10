'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface Variant {
  _id: string;
  name: string;
  price: number;
  mrp: number;
  stock: number;
  isDefault: boolean;
  isActive: boolean;
}

interface SizeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants: Variant[];
  productTitle: string;
  onSelect: (variant: Variant, quantity: number) => void;
}

export default function SizeSelectionModal({ 
  isOpen, 
  onClose, 
  variants, 
  productTitle, 
  onSelect 
}: SizeSelectionModalProps) {
  const defaultVariant = variants.find(v => v.isDefault) || variants[0];
  const [selectedVariant, setSelectedVariant] = useState<Variant>(defaultVariant);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    onSelect(selectedVariant, quantity);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Select Size</h3>
            <p className="text-sm text-emerald-100 truncate">{productTitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-emerald-700 rounded-full p-1 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Size Options */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {variants.map((variant) => {
            const isSelected = selectedVariant._id === variant._id;
            const isOutOfStock = variant.stock === 0 || !variant.isActive;
            const discount = variant.mrp > variant.price 
              ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
              : 0;

            return (
              <button
                key={variant._id}
                onClick={() => !isOutOfStock && setSelectedVariant(variant)}
                disabled={isOutOfStock}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{variant.name}</span>
                      {variant.isDefault && !isSelected && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{variant.price.toLocaleString()}
                      </span>
                      {variant.mrp > variant.price && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{variant.mrp.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600">
                            {discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    {!isOutOfStock && variant.stock <= 5 && (
                      <p className="text-xs text-orange-600 mt-1">
                        Only {variant.stock} left in stock
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quantity Selector */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition"
              >
                <span className="text-xl font-semibold">−</span>
              </button>
              <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                disabled={quantity >= selectedVariant.stock}
                className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-30"
              >
                <span className="text-xl font-semibold">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-2xl font-bold text-gray-900">
              ₹{(selectedVariant.price * quantity).toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={selectedVariant.stock === 0 || !selectedVariant.isActive}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
