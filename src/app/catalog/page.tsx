'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { CatalogFilters } from '@/components/CatalogFilters';
import { Pagination } from '@/components/Pagination';
import { getProducts, getCategories } from '@/lib/supabase/products';
import { Product, Category, CatalogFilters as CatalogFiltersType } from '@/lib/types';

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const [filters, setFilters] = useState<CatalogFiltersType>({
    search: '',
    category: '',
    sort: 'newest',
    page: 1,
    limit: 12
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    };
    loadCategories();
  }, []);

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const { products: productsData, totalCount } = await getProducts(filters);
      setProducts(productsData);
      setTotalProducts(totalCount);
      setLoading(false);
    };
    loadProducts();
  }, [filters]);

  const handleFiltersChange = (newFilters: CatalogFiltersType) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const totalPages = Math.ceil(totalProducts / filters.limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-light text-black">Catalog</h1>
        </div>
      </div>

      {/* Filters */}
      <CatalogFilters
        filters={filters}
        categories={categories}
        onFiltersChange={handleFiltersChange}
        totalProducts={totalProducts}
      />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-gray-500">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
