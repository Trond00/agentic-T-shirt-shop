'use client';

import { useState, useEffect } from 'react';
import { Category, CatalogFilters as CatalogFiltersType } from '@/lib/types';

interface CatalogFiltersProps {
  filters: CatalogFiltersType;
  categories: Category[];
  onFiltersChange: (filters: CatalogFiltersType) => void;
  totalProducts: number;
}

export function CatalogFilters({
  filters,
  categories,
  onFiltersChange,
  totalProducts
}: CatalogFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onFiltersChange]);

  const handleSortChange = (sort: CatalogFiltersType['sort']) => {
    onFiltersChange({ ...filters, sort, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      sort: 'newest',
      page: 1,
      limit: 12
    });
    setLocalSearch('');
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-black focus:ring-0 text-sm"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-black focus:ring-0 text-sm min-w-[140px]"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => handleSortChange(e.target.value as CatalogFiltersType['sort'])}
              className="px-3 py-2 border border-gray-300 focus:border-black focus:ring-0 text-sm min-w-[140px]"
            >
              <option value="newest">Newest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
            </select>

            {/* Clear Filters */}
            {(filters.search || filters.category || filters.sort !== 'newest') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-black border border-gray-300 hover:border-gray-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
        </div>
      </div>
    </div>
  );
}
