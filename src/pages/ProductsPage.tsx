import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, PackageX } from 'lucide-react';
import { Product } from '../types';
import { productApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  // Filters from URL or defaults
  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const [searchInput, setSearchInput] = useState(currentSearch);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getAll({
        category: currentCategory,
        search: currentSearch,
        sort: currentSort,
      });
      setProducts(res.products);
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentCategory, currentSearch, currentSort]);

  // Debounced or on-submit search handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('search', searchInput.trim());
    } else {
      next.delete('search');
    }
    setSearchParams(next);
  };

  const handleCategorySelect = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === 'All') {
      next.delete('category');
    } else {
      next.set('category', category);
    }
    setSearchParams(next);
  };

  const handleSortChange = (sort: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', sort);
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="border-b border-stone-200 pb-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                Store Catalog
              </p>
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-stone-950">
                All Acquisitions
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                Browse our complete collection of functional objects, architectural fixtures, and audio hardware.
              </p>
            </div>

            {/* Total items badge */}
            <div className="text-xs text-stone-500 self-start md:self-auto font-medium">
              Showing <span className="text-stone-900 font-semibold tabular-nums">{products.length}</span> items
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products by name, material, or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 shadow-2xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-stone-900 text-white rounded-md text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white border border-stone-300 text-stone-800 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 shadow-2xs font-medium cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = (cat === 'All' && !searchParams.get('category')) || currentCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md scale-105'
                      : 'bg-white border border-stone-200/90 text-stone-700 hover:text-stone-950 hover:bg-amber-50/50 hover:border-amber-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}

            {(currentCategory !== 'All' || currentSearch) && (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-2 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200/70 flex items-center gap-1.5 font-semibold transition-colors ml-2 whitespace-nowrap shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Grid / Loading / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-4 space-y-3 animate-pulse">
                <div className="aspect-4/3 bg-stone-200 rounded-lg" />
                <div className="h-4 bg-stone-200 rounded w-2/3" />
                <div className="h-3 bg-stone-200 rounded w-1/3" />
                <div className="h-7 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto my-12">
            <PackageX className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-base font-serif font-semibold text-stone-900">No matching products found</h3>
            <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed">
              We couldn’t find any items matching your current filters. Try changing your search query or selecting a different category.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
