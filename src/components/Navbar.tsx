import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, LogOut, Menu, X, ShieldCheck, Heart, Sparkles, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('Promo Code Copied!', 'success', `Code "${code}" copied to clipboard. Apply it at checkout for 20% off!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 transition-colors">
      {/* Colorful Top Announcement Marquee Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-600 text-white text-xs font-medium py-1.5 px-3 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-0.5 bg-white/20 rounded-full text-white">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
            </span>
            <span>
              <strong className="font-semibold text-white tracking-wide">Spring Design Festival:</strong> Enjoy <span className="underline decoration-white/60 underline-offset-2">20% off</span> across the entire curated collection!
            </span>
          </div>

          <div className="flex items-center gap-3 self-center ml-auto">
            <div className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20 transition-colors">
              <span className="text-[11px] font-mono tracking-wider font-semibold text-amber-200">SPRING20</span>
              <button
                type="button"
                onClick={() => copyPromoCode('SPRING20')}
                className="inline-flex items-center gap-1 text-[11px] text-white hover:text-amber-100 font-medium cursor-pointer"
                title="Copy coupon code"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-300" />
                    <span className="text-emerald-200 text-[10px]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <span className="hidden sm:inline-block text-white/70">·</span>
            <span className="hidden sm:inline-block text-[11px] text-white/90">
              Free insured delivery over $100
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Distinctive Brand Wordmark with jewel highlight */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="group flex items-center gap-2 text-xl sm:text-2xl font-serif font-bold tracking-tight text-stone-950 transition-opacity"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 inline-block shadow-xs group-hover:scale-125 transition-transform" />
              <span>Aura</span>
              <span className="text-amber-600 font-sans font-light tracking-wide text-lg sm:text-xl">Commerce</span>
            </Link>
          </div>

          {/* Zone 2: Clean Text Navigation Links with active accent styling */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <Link
              to="/"
              className={`transition-colors hover:text-amber-600 ${
                isActive('/')
                  ? 'text-stone-950 font-semibold border-b-2 border-amber-600 pb-0.5'
                  : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`transition-colors hover:text-amber-600 ${
                isActive('/products')
                  ? 'text-stone-950 font-semibold border-b-2 border-amber-600 pb-0.5'
                  : ''
              }`}
            >
              Catalog
            </Link>
            {user && (
              <Link
                to="/orders"
                className={`transition-colors hover:text-amber-600 ${
                  isActive('/orders')
                    ? 'text-stone-950 font-semibold border-b-2 border-amber-600 pb-0.5'
                    : ''
                }`}
              >
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all text-amber-900 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300/80 hover:shadow-xs font-semibold text-xs ${
                  isActive('/admin') ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* Zone 3: Actions - Wishlist, Cart & User */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Wishlist Link with Rose Accent */}
            <Link
              to="/profile?tab=wishlist"
              aria-label="View saved wishlist"
              title="My Wishlist"
              className={`relative p-2 rounded-xl transition-all ${
                isActive('/profile') || isActive('/wishlist')
                  ? 'text-rose-600 bg-rose-50 ring-1 ring-rose-200'
                  : 'text-stone-700 hover:text-rose-600 hover:bg-rose-50/60'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  totalWishlist > 0 ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              {totalWishlist > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[11px] font-bold h-5 min-w-5 px-1 rounded-full flex items-center justify-center tabular-nums shadow-sm">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Cart Link with Amber Accent */}
            <Link
              to="/cart"
              aria-label="View shopping bag"
              className={`relative p-2 rounded-xl transition-all ${
                isActive('/cart')
                  ? 'text-amber-600 bg-amber-50 ring-1 ring-amber-200'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[11px] font-bold h-5 min-w-5 px-1 rounded-full flex items-center justify-center tabular-nums shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-stone-200">
                <Link
                  to="/profile"
                  className="text-right group block hover:opacity-90 transition-opacity"
                  title="View Account Profile & Wishlist"
                >
                  <p className="text-xs font-semibold text-stone-900 leading-tight truncate max-w-[120px] group-hover:text-amber-600">
                    {user.name}
                  </p>
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-amber-600 rounded-lg hover:bg-amber-50/50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-lg transition-all shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-stone-700 hover:text-stone-950 md:hidden rounded-lg hover:bg-stone-100"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/') ? 'bg-stone-200 text-stone-900' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/products') ? 'bg-stone-200 text-stone-900' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              Products Catalog
            </Link>
            {user && (
              <>
                <Link
                  to="/profile?tab=wishlist"
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                    isActive('/profile') || isActive('/wishlist')
                      ? 'bg-stone-200 text-stone-900'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Heart
                      className={`w-4 h-4 ${
                        totalWishlist > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-500'
                      }`}
                    />
                    <span>My Wishlist</span>
                  </div>
                  {totalWishlist > 0 && (
                    <span className="text-xs bg-rose-600 text-white font-semibold px-2 py-0.5 rounded-full">
                      {totalWishlist}
                    </span>
                  )}
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/orders') ? 'bg-stone-200 text-stone-900' : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  My Orders
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-amber-900 bg-amber-100/80 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-stone-100 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-stone-900">{user.name}</p>
                  <p className="text-[11px] text-stone-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 font-medium hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 px-3 text-xs font-medium border border-stone-300 rounded-lg hover:bg-stone-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 px-3 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
