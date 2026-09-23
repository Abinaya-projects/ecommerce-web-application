import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Heart,
  Check,
  Sparkles,
  Award,
} from 'lucide-react';
import { Product } from '../types';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { StarRating } from '../components/StarRating';
import { ProductReviewsSection } from '../components/ProductReviewsSection';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productApi
      .getById(id)
      .then((res) => {
        setProduct(res.product);
        setQuantity(1);

        // Fetch related products in the same category or overall high-rated
        productApi
          .getAll({ category: res.product.category })
          .then((relRes) => {
            const filtered = relRes.products.filter((p) => p._id !== res.product._id).slice(0, 4);
            setRelatedProducts(filtered);
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.error('Error loading product:', err);
        showToast('Product Not Found', 'error', 'The requested item could not be retrieved.');
      })
      .finally(() => setLoading(false));
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
          <div className="lg:col-span-7 aspect-4/3 bg-stone-200 rounded-2xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 bg-stone-200 rounded w-1/4" />
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-200 rounded w-1/3" />
            <div className="h-20 bg-stone-200 rounded" />
            <div className="h-12 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-serif font-semibold text-stone-900">Product Not Found</h2>
        <p className="text-xs text-stone-500 mt-2 mb-6">
          The item you are looking for does not exist or has been removed from our catalog.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    } else {
      showToast('Stock Limit Reached', 'info', `Only ${product.stock} units currently available.`);
    }
  };

  const handleAdd = async () => {
    if (isOutOfStock || adding) return;
    setAdding(true);
    await addToCart(product._id, quantity);
    setAdding(false);
    setJustAdded(true);
    showToast('Added to Cart', 'success', `${quantity}x ${product.name} is now in your shopping bag.`);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </Link>

          <div className="text-xs text-stone-500 font-medium">
            Category: <span className="font-semibold text-stone-800">{product.category}</span>
          </div>
        </div>

        {/* Contiguous Purchase Module PDP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Gallery */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="relative aspect-4/3 sm:aspect-16/11 w-full bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {isOutOfStock && (
                <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center">
                  <span className="text-white text-sm font-bold tracking-wider uppercase px-5 py-2.5 border border-white/40 rounded-xl">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Specs Strip */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-xs">
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Provenance</p>
                <p className="text-xs font-semibold text-stone-800 mt-0.5">Handmade Atelier</p>
              </div>
              <div className="p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-xs">
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Dispatch</p>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">Ships in 24 Hours</p>
              </div>
              <div className="p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-xs">
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Guarantee</p>
                <p className="text-xs font-semibold text-stone-800 mt-0.5">10-Year Warranty</p>
              </div>
            </div>
          </div>

          {/* Right Buy Box */}
          <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
            <div>
              {/* Category tag & Star Rating */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
                  {product.category}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('customer-reviews')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200/60 transition-colors cursor-pointer group"
                  title="Jump to Customer Reviews"
                >
                  <StarRating value={product.rating} size="sm" />
                  <span className="tabular-nums font-bold text-xs text-amber-950">{product.rating.toFixed(1)}</span>
                  <span className="text-[11px] text-stone-500 group-hover:text-amber-800 underline underline-offset-2">
                    ({product.numReviews || product.reviews?.length || 0} reviews)
                  </span>
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 leading-tight">
                {product.name}
              </h1>

              {/* Price & Stock */}
              <div className="mt-4 flex items-baseline justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-xs text-stone-400 block uppercase tracking-wider font-medium">Acquisition Price</span>
                  <span className="text-3xl font-bold text-stone-950 tabular-nums">
                    ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  {!isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{product.stock} In Stock</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500">
                Material & Form Narrative
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector & Add to Bag */}
            {!isOutOfStock ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">Select Quantity</span>
                  <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="p-2.5 text-stone-600 hover:text-stone-900 disabled:text-stone-300 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold tabular-nums text-stone-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock}
                      className="p-2.5 text-stone-600 hover:text-stone-900 disabled:text-stone-300 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAdd}
                    disabled={adding}
                    className={`flex-1 py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-98 ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{adding ? 'Securing Item...' : `Add ${quantity} to Bag · $${(product.price * quantity).toFixed(2)}`}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    aria-label={isInWishlist(product._id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                    title={isInWishlist(product._id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                      isInWishlist(product._id)
                        ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100 shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isInWishlist(product._id) ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <button
                  disabled
                  className="w-full py-4 px-6 bg-stone-200 text-stone-400 rounded-2xl text-xs font-semibold cursor-not-allowed"
                >
                  Item Out of Stock
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`w-full py-3.5 px-4 rounded-2xl border text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isInWishlist(product._id)
                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isInWishlist(product._id) ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  <span>
                    {isInWishlist(product._id)
                      ? 'Saved in your Wishlist'
                      : 'Save to Wishlist for Restock'}
                  </span>
                </button>
              </div>
            )}

            {/* Guarantees */}
            <div className="pt-4 border-t border-stone-100 space-y-3 text-xs text-stone-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Complimentary insured tracked dispatch over $100</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
                <span>30-day unconditioned return window</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Certified authentic craftsmanship guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <ProductReviewsSection
          product={product}
          onProductUpdated={(updatedProduct) => {
            setProduct(updatedProduct);
          }}
        />

        {/* Complementary & Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-stone-200/80">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Complementary Pieces</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 mt-1">
                  You May Also Admire
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs font-semibold text-amber-700 hover:underline"
              >
                Browse all items →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
