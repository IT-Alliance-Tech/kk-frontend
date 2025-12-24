"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface FilterPanelProps {
  products: any[];
  brands: any[];
  categories: any[];
  onFilterChange: (filteredProducts: any[]) => void;
}

interface FilterState {
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: { min: number; max: number };
  inStockOnly: boolean;
}

export default function FilterPanel({
  products,
  brands,
  categories,
  onFilterChange,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
    stock: true,
  });

  const [filters, setFilters] = useState<FilterState>({
    selectedCategories: [],
    selectedBrands: [],
    priceRange: { min: 0, max: 0 },
    inStockOnly: false,
  });

  // Calculate min/max prices from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map((p) => p.price || 0);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      setFilters((prev) => ({
        ...prev,
        priceRange: { min: minPrice, max: maxPrice },
      }));
    }
  }, [products]);

  // Compute which brands and categories have products in current results
  const availableBrandIds = useMemo(() => {
    return new Set(
      products
        .map((p) => p.brand?._id?.toString() || p.brand?.id?.toString())
        .filter(Boolean)
    );
  }, [products]);

  const availableCategoryIds = useMemo(() => {
    return new Set(
      products
        .map((p) => p.category?._id?.toString() || p.category?.id?.toString())
        .filter(Boolean)
    );
  }, [products]);

  // Price range presets - memoized to prevent re-creation
  const priceRanges = useMemo(
    () => [
      { label: "Under ₹500", min: 0, max: 500 },
      { label: "₹500 - ₹1,000", min: 500, max: 1000 },
      { label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
      { label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
      { label: "Over ₹5,000", min: 5000, max: Infinity },
    ],
    []
  );

  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        filters.selectedCategories.includes(
          p.category?._id?.toString() || p.category?.id?.toString() || ""
        )
      );
    }

    // Brand filter
    if (filters.selectedBrands.length > 0) {
      filtered = filtered.filter((p) =>
        filters.selectedBrands.includes(
          p.brand?._id?.toString() || p.brand?.id?.toString() || ""
        )
      );
    }

    // Price range filter
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter((p) => {
        const price = p.price || 0;
        return selectedPriceRanges.some((idx) => {
          const range = priceRanges[idx];
          return price >= range.min && price <= range.max;
        });
      });
    }

    // Stock filter
    if (filters.inStockOnly) {
      filtered = filtered.filter((p) => (p.stock || 0) > 0);
    }

    onFilterChange(filtered);
  }, [
    filters,
    selectedPriceRanges,
    products,
    onFilterChange,
    priceRanges,
  ]);

  const toggleCategory = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter((id) => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  const toggleBrand = (brandId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(brandId)
        ? prev.selectedBrands.filter((id) => id !== brandId)
        : [...prev.selectedBrands, brandId],
    }));
  };

  const togglePriceRange = (index: number) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      selectedCategories: [],
      selectedBrands: [],
      priceRange: filters.priceRange,
      inStockOnly: false,
    });
    setSelectedPriceRanges([]);
  };

  const activeFilterCount =
    filters.selectedCategories.length +
    filters.selectedBrands.length +
    selectedPriceRanges.length +
    (filters.inStockOnly ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter size={20} />
          Filters
          {activeFilterCount > 0 && (
            <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("category")}
            className="w-full flex items-center justify-between mb-2"
          >
            <h3 className="font-medium text-sm">Category</h3>
            {expandedSections.category ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          {expandedSections.category && (
            <div className="space-y-2">
              {categories.map((cat) => {
                const catId =
                  cat._id?.toString() || cat.id?.toString() || "";
                const hasProducts = availableCategoryIds.has(catId);
                return (
                  <label
                    key={catId}
                    className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${
                      !hasProducts ? "opacity-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.selectedCategories.includes(catId)}
                      onChange={() => toggleCategory(catId)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      {cat.name}
                      {!hasProducts && (
                        <span className="text-xs text-gray-400 ml-1">(0)</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("brand")}
            className="w-full flex items-center justify-between mb-2"
          >
            <h3 className="font-medium text-sm">Brand</h3>
            {expandedSections.brand ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          {expandedSections.brand && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {brands.map((brand) => {
                const brandId =
                  brand._id?.toString() || brand.id?.toString() || "";
                const hasProducts = availableBrandIds.has(brandId);
                return (
                  <label
                    key={brandId}
                    className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${
                      !hasProducts ? "opacity-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.selectedBrands.includes(brandId)}
                      onChange={() => toggleBrand(brandId)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      {brand.name}
                      {!hasProducts && (
                        <span className="text-xs text-gray-400 ml-1">(0)</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Price Range Filter */}
      {products.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between mb-2"
          >
            <h3 className="font-medium text-sm">Price Range</h3>
            {expandedSections.price ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          {expandedSections.price && (
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <label
                  key={index}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes(index)}
                    onChange={() => togglePriceRange(index)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stock Filter */}
      <div>
        <button
          onClick={() => toggleSection("stock")}
          className="w-full flex items-center justify-between mb-2"
        >
          <h3 className="font-medium text-sm">Availability</h3>
          {expandedSections.stock ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
        {expandedSections.stock && (
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  inStockOnly: e.target.checked,
                }))
              }
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors"
      >
        <Filter size={20} />
        <span className="font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-white text-emerald-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <FilterContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <FilterContent />
        </div>
      </div>
    </>
  );
}
