/**
 * Admin Products Page - Redesigned
 * Modern product listing with filters, search, and pagination
 */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAdminProducts, deleteProduct, getBrands, getCategories } from "@/lib/admin";
import Link from "next/link";
import { Eye, Pencil, Trash2, Package, Plus, Filter, X } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminTable, TableActionMenu, TableActionButton } from "@/components/admin/ui/AdminTable";
import { AdminBadge, StatusBadge } from "@/components/admin/ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { 
  AdminFilterBar, 
  AdminFilterPanel, 
  AdminFilterField, 
  AdminFilterSelect,
  AdminFilterInput 
} from "@/components/admin/ui/AdminFilterBar";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";
import { AdminConfirmModal } from "@/components/admin/ui/AdminModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [globalSearch, setGlobalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  
  const limit = 10;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce global search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(globalSearch);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [globalSearch]);

  const loadProducts = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      } else if (filterName.trim()) {
        params.search = filterName.trim();
      }
      
      if (filterCategory) params.category = filterCategory;
      if (filterBrand) params.brand = filterBrand;
      if (filterPriceMin) params.priceMin = filterPriceMin;
      if (filterPriceMax) params.priceMax = filterPriceMax;
      
      const response = await getAdminProducts(params);
      
      const productsData = response?.products || response?.data?.products || [];
      const totalCount = response?.total || response?.data?.total || 0;
      const totalPagesCount = response?.totalPages || response?.data?.totalPages || 1;
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setTotal(totalCount);
      setTotalPages(totalPagesCount);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterName, filterCategory, filterBrand, filterPriceMin, filterPriceMax, limit]);

  const loadCategoriesAndBrands = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        getCategories(),
        getBrands(),
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (err) {
      console.error("Failed to load categories/brands:", err);
    }
  };

  useEffect(() => {
    loadCategoriesAndBrands();
  }, []);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || loading) return;
    loadProducts(newPage);
  };

  const handleResetFilters = () => {
    setGlobalSearch("");
    setDebouncedSearch("");
    setFilterName("");
    setFilterCategory("");
    setFilterBrand("");
    setFilterPriceMin("");
    setFilterPriceMax("");
    setShowFilters(false);
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setDeleting(true);
    try {
      await deleteProduct(productToDelete._id);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      loadProducts(currentPage);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setDeleting(false);
    }
  };

  const activeFiltersCount = [
    debouncedSearch,
    filterName,
    filterCategory,
    filterBrand,
    filterPriceMin,
    filterPriceMax,
  ].filter(Boolean).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Table columns configuration
  const columns = [
    {
      key: "title",
      header: "Product",
      render: (product: any) => (
        <div className="flex items-center gap-3">
          {product.images?.[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.title}
              className="w-10 h-10 rounded-lg object-cover bg-slate-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate max-w-[200px]">
              {product.title}
            </p>
            <p className="text-xs text-slate-500">SKU: {product.sku || "N/A"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (product: any) => {
        const categoryName = product?.category?.name 
          ?? categories?.find(c => String(c._id) === String(product.category))?.name 
          ?? product.category 
          ?? '-';
        return <span className="text-slate-600">{categoryName}</span>;
      },
    },
    {
      key: "brand",
      header: "Brand",
      render: (product: any) => {
        const brandName = product?.brand?.name 
          ?? brands?.find(b => String(b._id) === String(product.brand))?.name 
          ?? product.brand 
          ?? '-';
        return <span className="text-slate-600">{brandName}</span>;
      },
    },
    {
      key: "price",
      header: "Price",
      render: (product: any) => (
        <div>
          <p className="font-semibold text-slate-900">{formatPrice(product.price)}</p>
          {product.mrp && product.mrp > product.price && (
            <p className="text-xs text-slate-500 line-through">{formatPrice(product.mrp)}</p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (product: any) => (
        <AdminBadge 
          variant={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "danger"}
          size="sm"
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </AdminBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[120px]",
      render: (product: any) => {
        const pid = product?.id || product?._id;
        return (
          <TableActionMenu>
            <Link href={`/admin/products/view/${pid}`}>
              <TableActionButton 
                onClick={() => {}} 
                icon={<Eye className="w-4 h-4" />} 
                label="View" 
              />
            </Link>
            <Link href={`/admin/products/${pid}`}>
              <TableActionButton 
                onClick={() => {}} 
                icon={<Pencil className="w-4 h-4" />} 
                label="Edit" 
              />
            </Link>
            <TableActionButton 
              onClick={() => handleDeleteClick(product)} 
              icon={<Trash2 className="w-4 h-4" />} 
              label="Delete"
              variant="danger"
            />
          </TableActionMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog"
        primaryAction={{
          label: "Add Product",
          href: "/admin/products/new",
          icon: <Plus className="w-4 h-4 mr-2" />,
        }}
        badge={
          <AdminBadge variant="secondary" size="lg">
            {total} products
          </AdminBadge>
        }
      />

      {/* Filters */}
      <AdminCard>
        <AdminFilterBar
          searchValue={globalSearch}
          searchPlaceholder="Search products by name..."
          onSearchChange={setGlobalSearch}
          showFiltersButton={true}
          filtersOpen={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleResetFilters}
        >
          {/* Quick filter: Category */}
          <AdminFilterSelect
            value={filterCategory}
            onChange={setFilterCategory}
            placeholder="All Categories"
            options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
            className="w-full sm:w-48"
          />
        </AdminFilterBar>

        {/* Advanced Filters Panel */}
        <AdminFilterPanel isOpen={showFilters} className="mt-4">
          <AdminFilterField label="Product Name">
            <AdminFilterInput
              value={filterName}
              onChange={setFilterName}
              placeholder="Filter by name..."
            />
          </AdminFilterField>

          <AdminFilterField label="Brand">
            <AdminFilterSelect
              value={filterBrand}
              onChange={setFilterBrand}
              placeholder="All Brands"
              options={brands.map(brand => ({ value: brand._id, label: brand.name }))}
            />
          </AdminFilterField>

          <AdminFilterField label="Min Price (₹)">
            <AdminFilterInput
              type="number"
              value={filterPriceMin}
              onChange={setFilterPriceMin}
              placeholder="0"
            />
          </AdminFilterField>

          <AdminFilterField label="Max Price (₹)">
            <AdminFilterInput
              type="number"
              value={filterPriceMax}
              onChange={setFilterPriceMax}
              placeholder="99999"
            />
          </AdminFilterField>
        </AdminFilterPanel>
      </AdminCard>

      {/* Products Table */}
      <AdminCard padding="none">
        {loading ? (
          <div className="py-12">
            <AdminLoadingState message="Loading products..." />
          </div>
        ) : products.length === 0 ? (
          <AdminEmptyState
            type={activeFiltersCount > 0 ? "no-results" : "no-data"}
            title={activeFiltersCount > 0 ? "No products found" : "No products yet"}
            description={
              activeFiltersCount > 0
                ? "Try adjusting your filters to find what you're looking for."
                : "Get started by adding your first product."
            }
            action={
              activeFiltersCount > 0
                ? { label: "Clear Filters", onClick: handleResetFilters }
                : { label: "Add Product", href: "/admin/products/new" }
            }
          />
        ) : (
          <>
            <AdminTable
              columns={columns}
              data={products}
              keyExtractor={(product) => product._id}
            />
            
            <div className="px-4 pb-4">
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={total}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </AdminCard>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}