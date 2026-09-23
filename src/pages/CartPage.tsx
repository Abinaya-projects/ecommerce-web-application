import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Heart, Tag, Check, Sparkles, Percent } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { totalWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(0);
  const [promoFreeShipping, setPromoFreeShipping] = useState<boolean>(false);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-stone-50 px-4">
        <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-950">Sign in to view your bag</h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Your shopping cart is securely synced with your account across all your devices. Please sign in or create an account to continue.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
            >
              Sign In to Account
            </Link>
            <Link
              to="/register"
              className="w-full py-3 bg-white border border-stone-300 hover:border-amber-300 text-stone-800 text-xs font-semibold rounded-xl hover:bg-amber-50/40 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  // Apply discounts
  const discountAmount = promoDiscountPercent > 0
    ? Math.round(subtotal * (promoDiscountPercent / 100) * 100) / 100
    : 0;

  const freeShippingThreshold = 100;
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold || promoFreeShipping;
  const shippingFee = qualifiesForFreeShipping || subtotal === 0 ? 0 : 15;
  const grandTotal = Math.max(0, Math.round((subtotal - discountAmount + shippingFee) * 100) / 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'SPRING20') {
      setAppliedPromo('SPRING20');
      setPromoDiscountPercent(20);
      setPromoFreeShipping(false);
      showToast('20% Discount Applied!', 'success', 'Code SPRING20 was applied to your order.');
    } else if (code === 'AURA15') {
      setAppliedPromo('AURA15');
      setPromoDiscountPercent(15);
      setPromoFreeShipping(false);
      showToast('15% Discount Applied!', 'success', 'Code AURA15 was applied to your order.');
    } else if (code === 'WELCOME10') {
      setAppliedPromo('WELCOME10');
      setPromoDiscountPercent(10);
      setPromoFreeShipping(false);
      showToast('10% Discount Applied!', 'success', 'Code WELCOME10 was applied to your order.');
    } else if (code === 'FREESHIP') {
      setAppliedPromo('FREESHIP');
      setPromoDiscountPercent(0);
      setPromoFreeShipping(true);
      showToast('Free Delivery Applied!', 'success', 'Code FREESHIP removed the shipping fee.');
    } else {
      showToast('Invalid Promo Code', 'error', 'Please check your code. Try SPRING20 for 20% off.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscountPercent(0);
    setPromoFreeShipping(false);
    setPromoInput('');
  };

  const handleProceedToCheckout = () => {
    if (appliedPromo) {
      navigate(`/checkout?promo=${appliedPromo}`);
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-stone-50 px-4">
        <div className="bg-white border border-stone-200/90 rounded-3xl p-10 max-w-md w-full text-center space-y-5 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-950">Your shopping bag is empty</h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Explore our curated selection of architectural furniture, studio acoustics, and everyday objects.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {totalWishlist > 0 && (
              <Link
                to="/profile?tab=wishlist"
                className="inline-flex items-center gap-2 px-5 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl hover:bg-rose-100 transition-all shadow-xs"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>View Wishlist ({totalWishlist})</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950">
              Your Shopping Bag
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Review and customize your selected acquisitions before proceeding to checkout.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link
              to="/profile?tab=wishlist"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-rose-200 hover:bg-rose-50/50 text-rose-700 text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Wishlist {totalWishlist > 0 && `(${totalWishlist})`}</span>
            </Link>

            <button
              onClick={clearCart}
              className="text-xs text-stone-500 hover:text-rose-600 transition-colors flex items-center gap-1 font-semibold px-3 py-2 rounded-xl hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Bag</span>
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-2">
            <span>
              {qualifiesForFreeShipping ? (
                <strong className="text-emerald-700 font-semibold inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Complimentary Tracked Delivery Unlocked!</span>
                </strong>
              ) : (
                <span>
                  Add <strong className="text-stone-950">${(freeShippingThreshold - subtotal).toFixed(2)}</strong> more to unlock Free Worldwide Shipping!
                </span>
              )}
            </span>
            <span className="font-bold tabular-nums text-stone-900">{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                qualifiesForFreeShipping
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-md divide-y divide-stone-100">
            {items.map(({ product, quantity, subtotal: itemSubtotal }) => {
              const isMaxStock = quantity >= product.stock;

              return (
                <div key={product._id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-stone-50/40 transition-colors">
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${product._id}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 rounded-2xl overflow-hidden shrink-0 border border-stone-200 block shadow-xs group"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="uppercase text-[10px] font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      {product.category}
                    </span>
                    <Link
                      to={`/products/${product._id}`}
                      className="text-sm sm:text-base font-bold text-stone-950 hover:text-amber-700 block truncate mt-1 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-stone-500 mt-0.5 font-medium">
                      ${product.price.toFixed(2)} each
                    </p>

                    {product.stock <= 5 && (
                      <p className="text-[11px] text-orange-700 font-semibold mt-1 inline-flex items-center gap-1">
                        <span>Only {product.stock} units remain</span>
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        className="p-2 text-stone-600 hover:text-stone-950 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold tabular-nums text-stone-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        disabled={isMaxStock}
                        className="p-2 text-stone-600 hover:text-stone-950 disabled:text-stone-300 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="text-base font-bold text-stone-950 tabular-nums">
                        ${itemSubtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Actions: Save to Wishlist & Remove */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={async () => {
                          await toggleWishlist(product._id);
                          await removeFromCart(product._id);
                          showToast('Moved to Wishlist', 'info', `${product.name} saved for later.`);
                        }}
                        className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Save for later in Wishlist"
                        aria-label={`Save ${product.name} to wishlist and remove from bag`}
                      >
                        <Heart className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Remove product"
                        aria-label={`Remove ${product.name} from bag`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 space-y-6 shadow-md sticky top-24">
            <h2 className="text-base font-serif font-bold text-stone-950 pb-3 border-b border-stone-100">
              Order Summary
            </h2>

            {/* Promo Code Input Box */}
            <div>
              {appliedPromo ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">{appliedPromo} Applied</p>
                      <p className="text-[11px] text-emerald-700">
                        {promoDiscountPercent > 0 ? `${promoDiscountPercent}% off items` : 'Free shipping'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-emerald-800 hover:text-rose-600 font-semibold px-2 py-1 rounded hover:bg-white transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-stone-500 block">
                    Have a Promotional Code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SPRING20"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono uppercase text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Try <span className="font-mono text-amber-700 font-bold">SPRING20</span> for 20% off or <span className="font-mono text-amber-700 font-bold">WELCOME10</span>.
                  </p>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs pt-2 border-t border-stone-100">
              <div className="flex justify-between text-stone-600">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-stone-900 tabular-nums">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Promotion ({appliedPromo})</span>
                  </span>
                  <span className="tabular-nums">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Shipping Fee</span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold">Complimentary</span>
                ) : (
                  <span className="font-semibold text-stone-900 tabular-nums">${shippingFee.toFixed(2)}</span>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-950">Estimated Total</span>
                <span className="text-2xl font-bold text-stone-950 tabular-nums">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/products"
                className="w-full py-2 text-center text-xs text-stone-600 hover:text-amber-700 font-semibold block transition-colors"
              >
                Continue Browsing Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
