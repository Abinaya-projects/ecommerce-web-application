import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Eye, Heart, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

// Category aesthetic theme badges
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Audio & Acoustics': { bg: 'bg-indigo-50/80', text: 'text-indigo-700', border: 'border-indigo-200/60', dot: 'bg-indigo-500' },
  'Coffee & Kitchen': { bg: 'bg-amber-50/80', text: 'text-amber-800', border: 'border-amber-200/60', dot: 'bg-amber-500' },
  'Timepieces': { bg: 'bg-emerald-50/80', text: 'text-emerald-800', border: 'border-emerald-200/60', dot: 'bg-emerald-500' },
  'Furniture & Living': { bg: 'bg-orange-50/80', text: 'text-orange-800', border: 'border-orange-200/60', dot: 'bg-orange-500' },
  'Lighting & Workspace': { bg: 'bg-yellow-50/80', text: 'text-yellow-800', border: 'border-yellow-200/60', dot: 'bg-yellow-500' },
  'Home Accents': { bg: 'bg-teal-50/80', text: 'text-teal-800', border: 'border-teal-200/60', dot: 'bg-teal-500' },
  'Accessories': { bg: 'bg-rose-50/80', text: 'text-rose-800', border: 'border-rose-200/60', dot: 'bg-rose-500' },
  'Apparel': { bg: 'bg-purple-50/80', text: 'text-purple-800', border: 'border-purple-200/60', dot: 'bg-purple-500' },
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inWishlist = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const categoryTheme = CATEGORY_COLORS[product.category] || {
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-200',
    dot: 'bg-stone-500',
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    await addToCart(product._id, 1);
    setAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200/90 overflow-hidden flex flex-col hover:border-amber-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden block">
        <Link
          to={`/products/${product._id}`}
          className="block w-full h-full"
        >
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                '/src/assets/images/hero_ecommerce_showcase_1790145758681.jpg';
            }}
          />
        </Link>

        {/* Stock / Availability Status Tag */}
        <div className="absolute top-3 left-3 text-[11px] font-medium tracking-wide pointer-events-none z-10">
          {isOutOfStock ? (
            <span className="bg-stone-900/90 text-white px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-xs shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xs shadow-xs animate-pulse">
              Only {product.stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-white/90 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-xs border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>In Stock</span>
            </span>
          )}
        </div>

        {/* Wishlist Toggle Heart Button with vibrant feedback */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 shadow-xs z-10 ${
            inWishlist
              ? 'bg-white text-rose-600 scale-110 shadow-md ring-1 ring-rose-300'
              : 'bg-white/90 text-stone-500 hover:text-rose-600 hover:bg-white hover:scale-110'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              inWishlist ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category Chip & Star Rating */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${categoryTheme.bg} ${categoryTheme.text} ${categoryTheme.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${categoryTheme.dot}`} />
              <span>{product.category}</span>
            </span>

            <div className="flex items-center gap-1 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/50">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="tabular-nums font-bold text-xs text-amber-900">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-amber-700/80">({product.numReviews})</span>
            </div>
          </div>

          {/* Product Name */}
          <Link
            to={`/products/${product._id}`}
            className="block text-sm font-semibold text-stone-900 group-hover:text-amber-700 line-clamp-1 transition-colors leading-snug"
          >
            {product.name}
          </Link>

          {/* Brief Description */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mt-1">
            {product.description}
          </p>
        </div>

        {/* Footer: Price & Add to Bag Action */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-400 block">
              Investment
            </span>
            <span className="text-base sm:text-lg font-bold text-stone-950 tabular-nums">
              ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/products/${product._id}`}
              className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
              title="View item details"
              aria-label={`View details of ${product.name}`}
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-xs cursor-pointer ${
                isOutOfStock
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-stone-900 text-white hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-600 active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Sold Out' : adding ? 'Adding...' : 'Add to Bag'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
