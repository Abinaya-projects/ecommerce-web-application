import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Package,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { orderApi } from '../services/api';
import { Order } from '../types';

export function ProfilePage() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    wishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    moveAllToCart,
    loading: wishlistLoading,
  } = useWishlist();
  const { totalItems: cartCount } = useCart();

  const activeTab = searchParams.get('tab') || 'wishlist';

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlistSearch, setWishlistSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [movingId, setMovingId] = useState<string | null>(null);
  const [movingAll, setMovingAll] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }

    if (activeTab === 'orders') {
      setOrdersLoading(true);
      orderApi
        .getMyOrders()
        .then((res) => setOrders(res.orders || []))
        .catch((err) => console.error('Failed to load orders', err))
        .finally(() => setOrdersLoading(false));
    }
  }, [user, activeTab, navigate]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    wishlist.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [wishlist]);

  const filteredWishlist = useMemo(() => {
    return wishlist.filter((item) => {
      const matchesSearch =
        wishlistSearch.trim() === '' ||
        item.name.toLowerCase().includes(wishlistSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(wishlistSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [wishlist, wishlistSearch, selectedCategory]);

  const handleMoveToCart = async (item: (typeof wishlist)[0]) => {
    setMovingId(item._id);
    await moveToCart(item, 1);
    setMovingId(null);
  };

  const handleMoveAll = async () => {
    setMovingAll(true);
    await moveAllToCart();
    setMovingAll(false);
  };

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  if (!user) return null;

  const inStockWishlistCount = wishlist.filter((item) => item.stock > 0).length;

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Hero Header */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center text-xl font-serif font-bold shadow-xs">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-serif font-semibold text-stone-900">
                    {user.name}
                  </h1>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                      <ShieldCheck className="w-3 h-3" />
                      Administrator
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 border-t sm:border-t-0 sm:border-l border-stone-200 pt-4 sm:pt-0 sm:pl-8 text-center sm:text-left">
              <div>
                <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-medium">
                  Wishlist
                </span>
                <span className="text-lg sm:text-xl font-semibold text-stone-900 tabular-nums">
                  {wishlist.length}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-medium">
                  Bag Items
                </span>
                <span className="text-lg sm:text-xl font-semibold text-stone-900 tabular-nums">
                  {cartCount}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-medium">
                  Account
                </span>
                <span className="text-xs font-semibold text-emerald-700 capitalize mt-1 block">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-stone-200 mt-8 gap-8 text-sm font-medium">
            <button
              onClick={() => setTab('wishlist')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors relative ${
                activeTab === 'wishlist'
                  ? 'border-stone-900 text-stone-950 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  activeTab === 'wishlist' ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                }`}
              />
              <span>My Wishlist</span>
              {wishlist.length > 0 && (
                <span className="ml-1 text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-semibold">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('orders')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-stone-900 text-stone-950 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Package className="w-4 h-4 text-stone-400" />
              <span>Orders & Receipts</span>
            </button>

            <button
              onClick={() => setTab('account')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'account'
                  ? 'border-stone-900 text-stone-950 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <UserIcon className="w-4 h-4 text-stone-400" />
              <span>Account Settings</span>
            </button>
          </div>
        </div>

        {/* Tab 1: My Wishlist View */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            {/* Wishlist Controls Toolbar */}
            {wishlist.length > 0 && (
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                {/* Search & Category Filter */}
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search saved pieces..."
                      value={wishlistSearch}
                      onChange={(e) => setWishlistSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>

                  {categories.length > 2 && (
                    <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
                      <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-1" />
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-md transition-colors text-xs shrink-0 ${
                            selectedCategory === cat
                              ? 'bg-stone-900 text-white font-medium'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Batch Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                  {inStockWishlistCount > 0 && (
                    <button
                      onClick={handleMoveAll}
                      disabled={movingAll}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-stone-50 text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors shadow-xs active:scale-95 disabled:opacity-50"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>
                        {movingAll
                          ? 'Moving...'
                          : `Move All in Stock to Bag (${inStockWishlistCount})`}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                        clearWishlist();
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-stone-200 text-stone-600 text-xs font-medium rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                    title="Clear entire wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Wishlist</span>
                  </button>
                </div>
              </div>
            )}

            {/* Wishlist Grid */}
            {wishlistLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-xl border border-stone-200 p-4 animate-pulse">
                    <div className="aspect-4/3 bg-stone-200 rounded-lg mb-3" />
                    <div className="h-4 bg-stone-200 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : wishlist.length === 0 ? (
              <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <Heart className="w-7 h-7 stroke-1" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-stone-900 mb-1">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-6">
                  Save pieces you love while browsing our curated collection. Click the heart icon on any
                  product to keep track of items for future consideration.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
                >
                  <span>Explore Product Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : filteredWishlist.length === 0 ? (
              <div className="bg-white border border-stone-200/80 rounded-2xl p-8 text-center max-w-md mx-auto">
                <p className="text-xs text-stone-500">
                  No wishlist items matched "{wishlistSearch}" in "{selectedCategory}".
                </p>
                <button
                  onClick={() => {
                    setWishlistSearch('');
                    setSelectedCategory('All');
                  }}
                  className="mt-3 text-xs font-semibold text-stone-900 underline underline-offset-4"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWishlist.map((item) => {
                  const isOutOfStock = item.stock <= 0;
                  const isLowStock = item.stock > 0 && item.stock <= 5;

                  return (
                    <div
                      key={item._id}
                      className="group bg-white rounded-xl border border-stone-200/80 overflow-hidden flex flex-col hover:border-stone-300 hover:shadow-md transition-all duration-200"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                        <Link to={`/products/${item._id}`} className="block w-full h-full">
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60';
                            }}
                          />
                        </Link>

                        {/* Stock Tag */}
                        <div className="absolute top-2.5 left-2.5 text-[11px] font-medium">
                          {isOutOfStock ? (
                            <span className="bg-stone-900/85 text-stone-100 px-2 py-0.5 rounded backdrop-blur-xs">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-amber-950/80 text-amber-200 px-2 py-0.5 rounded backdrop-blur-xs">
                              Only {item.stock} left
                            </span>
                          ) : null}
                        </div>

                        {/* Remove from Wishlist button */}
                        <button
                          onClick={() => removeFromWishlist(item._id)}
                          title="Remove from wishlist"
                          aria-label={`Remove ${item.name} from wishlist`}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 backdrop-blur-xs text-rose-600 rounded-lg hover:bg-white hover:scale-110 transition-all shadow-xs"
                        >
                          <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                            <span className="uppercase tracking-wider text-[11px] font-medium">
                              {item.category}
                            </span>
                            <span className="tabular-nums font-medium text-[11px] text-stone-600">
                              ★ {item.rating.toFixed(1)}
                            </span>
                          </div>

                          <Link
                            to={`/products/${item._id}`}
                            className="block text-sm font-semibold text-stone-900 hover:text-stone-700 line-clamp-1 mb-1 transition-colors"
                          >
                            {item.name}
                          </Link>

                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        </div>

                        {/* Footer: Price & Move to Bag */}
                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs text-stone-400 block font-normal">Price</span>
                            <span className="text-base font-semibold text-stone-900 tabular-nums">
                              ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <button
                            onClick={() => handleMoveToCart(item)}
                            disabled={isOutOfStock || movingId === item._id}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              isOutOfStock
                                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>
                              {isOutOfStock
                                ? 'Sold Out'
                                : movingId === item._id
                                ? 'Moving...'
                                : 'Move to Bag'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders & Receipts */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-serif font-semibold text-stone-900">Order History</h2>
              <Link
                to="/orders"
                className="text-xs text-stone-600 hover:text-stone-950 font-medium inline-flex items-center gap-1 underline underline-offset-4"
              >
                <span>Full Orders View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {ordersLoading ? (
              <div className="p-8 text-center text-xs text-stone-400 animate-pulse">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-stone-200/80 rounded-2xl p-10 text-center max-w-md mx-auto shadow-xs">
                <Package className="w-10 h-10 mx-auto mb-3 text-stone-300" />
                <h3 className="text-base font-serif font-semibold text-stone-900 mb-1">
                  No Orders Yet
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Once you place an order, you will be able to track live shipping progress and download receipts here.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800"
                >
                  <span>Start Shopping</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white border border-stone-200/80 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-stone-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          {order._id}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="sm:text-right">
                        <span className="text-[11px] text-stone-400 block font-medium">Total</span>
                        <span className="text-sm font-semibold text-stone-900 tabular-nums">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors"
                      >
                        <span>View Tracking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account Information */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-serif font-semibold text-stone-900">
                Personal Information
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-400 block mb-0.5">Full Name</span>
                  <span className="font-semibold text-stone-900">{user.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">Registered Email</span>
                  <span className="font-semibold text-stone-900">{user.email}</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">Account Role</span>
                  <span className="font-semibold text-stone-900 capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">User Identification</span>
                  <span className="font-mono text-stone-600">{user._id}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-serif font-semibold text-stone-900">
                Security & Authentication
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your session is secured with JSON Web Tokens (JWT) and passwords are encrypted with
                BCrypt 10-round salted hashes.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
