import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowLeft,
  Lock,
  Tag,
  Percent,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderApi } from '../services/api';

export function CheckoutPage() {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Demo Online Payment'>(
    'Demo Online Payment'
  );
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Promo code handling
  const promoFromUrl = searchParams.get('promo')?.trim().toUpperCase() || '';
  const [promoInput, setPromoInput] = useState(promoFromUrl);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(0);
  const [promoFreeShipping, setPromoFreeShipping] = useState<boolean>(false);

  useEffect(() => {
    if (user && !shippingAddress.fullName) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  // Automatically apply promo if present in URL
  useEffect(() => {
    if (promoFromUrl) {
      applyPromoCode(promoFromUrl);
    }
  }, [promoFromUrl]);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SPRING20') {
      setAppliedPromo('SPRING20');
      setPromoDiscountPercent(20);
      setPromoFreeShipping(false);
      showToast('20% Spring Discount Active!', 'success', 'Code SPRING20 was applied to this order.');
    } else if (clean === 'AURA15') {
      setAppliedPromo('AURA15');
      setPromoDiscountPercent(15);
      setPromoFreeShipping(false);
      showToast('15% Discount Active!', 'success', 'Code AURA15 was applied.');
    } else if (clean === 'WELCOME10') {
      setAppliedPromo('WELCOME10');
      setPromoDiscountPercent(10);
      setPromoFreeShipping(false);
      showToast('10% Welcome Discount Active!', 'success', 'Code WELCOME10 was applied.');
    } else if (clean === 'FREESHIP') {
      setAppliedPromo('FREESHIP');
      setPromoDiscountPercent(0);
      setPromoFreeShipping(true);
      showToast('Complimentary Delivery Active!', 'success', 'Code FREESHIP removed the shipping fee.');
    } else {
      showToast('Invalid Code', 'error', 'Code not recognized. Use SPRING20 for 20% off.');
    }
  };

  const handleApplyPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput) {
      applyPromoCode(promoInput);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscountPercent(0);
    setPromoFreeShipping(false);
    setPromoInput('');
  };

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  const discountAmount = promoDiscountPercent > 0
    ? Math.round(subtotal * (promoDiscountPercent / 100) * 100) / 100
    : 0;

  const qualifiesForFreeShipping = subtotal >= 100 || promoFreeShipping;
  const shippingFee = qualifiesForFreeShipping || subtotal === 0 ? 0 : 15;
  const grandTotal = Math.max(0, Math.round((subtotal - discountAmount + shippingFee) * 100) / 100);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center max-w-md shadow-lg">
          <h2 className="text-xl font-serif font-bold text-stone-900">Sign in to checkout</h2>
          <p className="text-xs text-stone-500 mt-2 mb-6">
            You must be logged in to your account to place and track orders.
          </p>
          <Link
            to="/login?redirect=/checkout"
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center max-w-md shadow-lg">
          <h2 className="text-xl font-serif font-bold text-stone-900">Your bag is empty</h2>
          <p className="text-xs text-stone-500 mt-2 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/products"
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
          >
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shippingAddress.email.trim()) errors.email = 'Email address is required';
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone number is required';
    if (!shippingAddress.address.trim()) errors.address = 'Street address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State / Province is required';
    if (!shippingAddress.pincode.trim()) errors.pincode = 'Postal / Zip code is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Validation Error', 'error', 'Please fill in all mandatory shipping address fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await orderApi.create({
        shippingAddress,
        paymentMethod,
        promoCode: appliedPromo || undefined,
      });

      await refreshCart();

      showToast('Order Confirmed!', 'success', `Order ${res.order._id} registered with ${paymentMethod}.`);
      navigate(`/orders/${res.order._id}`);
    } catch (err: any) {
      showToast('Order Failed', 'error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shopping Bag</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 mb-8">
          Express Checkout
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Shipping Details */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h2 className="text-base font-serif font-bold text-stone-950">
                  1. Delivery Destination
                </h2>
                <span className="text-[11px] font-medium text-stone-400">All fields mandatory</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address (For Invoicing)
                  </label>
                  <input
                    type="email"
                    required
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number (Courier Dispatch Notifications)
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Street Address & Suite
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    placeholder="742 Evergreen Terrace, Apt 4B"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                  {formErrors.address && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="Seattle"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                  {formErrors.city && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      State / Region
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="WA"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                    {formErrors.state && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      placeholder="98101"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                    {formErrors.pincode && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h2 className="text-base font-serif font-bold text-stone-950">
                  2. Settlement Instrument
                </h2>
                <span className="text-[11px] text-stone-400 font-medium">Select preferred channel</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`border rounded-2xl p-5 cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                    paymentMethod === 'Demo Online Payment'
                      ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-stone-950">Online Card Settlement</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Demo Online Payment'}
                      onChange={() => setPaymentMethod('Demo Online Payment')}
                      className="accent-amber-600 w-4 h-4"
                    />
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Demo electronic authorization. Instantly confirms payment and dispatches order for tracking.
                  </p>
                </label>

                <label
                  className={`border rounded-2xl p-5 cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-stone-950">Cash on Doorstep Delivery</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => setPaymentMethod('Cash on Delivery')}
                      className="accent-emerald-600 w-4 h-4"
                    />
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Pay in cash upon courier doorstep arrival. Order status is registered as Pending until received.
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review */}
          <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-md sticky top-24">
            <h2 className="text-base font-serif font-bold text-stone-950 pb-3 border-b border-stone-100">
              Order Review ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
            </h2>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
              {items.map(({ product, quantity, subtotal: itemSubtotal }) => (
                <div key={product._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 truncate">{product.name}</p>
                      <p className="text-stone-500 text-[11px]">
                        Qty {quantity} × ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-950 tabular-nums shrink-0">
                    ${itemSubtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code in Checkout */}
            <div className="pt-2 border-t border-stone-100">
              {appliedPromo ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-950">{appliedPromo} Applied</span>
                      <p className="text-[10px] text-emerald-700">
                        {promoDiscountPercent > 0 ? `${promoDiscountPercent}% discount applied` : 'Free shipping'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-emerald-800 hover:text-rose-600 font-semibold px-2 py-0.5"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. SPRING20)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromoSubmit}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900 tabular-nums">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Coupon Savings ({appliedPromo})</span>
                  </span>
                  <span className="tabular-nums">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold">Complimentary</span>
                ) : (
                  <span className="font-semibold text-stone-900 tabular-nums">${shippingFee.toFixed(2)}</span>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-950">Total Settlement</span>
                <span className="text-2xl font-bold text-stone-950 tabular-nums">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Authorizing Order...'
                    : `Confirm & Place Order · $${grandTotal.toFixed(2)}`}
                </span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit encrypted checkout transmission</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
