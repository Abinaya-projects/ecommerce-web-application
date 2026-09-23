import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, ChevronRight, AlertCircle, Heart } from 'lucide-react';
import { Order } from '../types';
import { orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    orderApi
      .getMyOrders()
      .then((res) => {
        setOrders(res.orders);
      })
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center max-w-md">
          <h2 className="text-lg font-serif font-semibold text-stone-900">Sign in to view your orders</h2>
          <p className="text-xs text-stone-500 mt-2 mb-6">
            Track real-time shipment progress and view previous purchases.
          </p>
          <Link to="/login?redirect=/orders" className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Shipped':
      case 'Out for Delivery':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'Processing':
      case 'Confirmed':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Cancelled':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Pending':
      default:
        return 'text-stone-700 bg-stone-100 border-stone-200';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-950">
              Purchase History & Tracking
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Monitor current dispatch statuses, view order receipts, and manage delivered items.
            </p>
          </div>
          <Link
            to="/profile?tab=wishlist"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 hover:border-stone-300 text-stone-800 text-xs font-medium rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>My Saved Wishlist</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse space-y-4">
                <div className="h-4 bg-stone-200 rounded w-1/4" />
                <div className="h-12 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto my-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-semibold text-stone-900">No orders placed yet</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              When you purchase items through our store, your order tracking status and delivery receipt will appear here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 hover:border-stone-300 transition-all shadow-xs"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-stone-900">
                      {order._id}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded border ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <span className="text-sm font-bold text-stone-950 tabular-nums">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-8 flex items-center gap-3 overflow-x-auto">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                        />
                        <div className="text-xs max-w-[150px]">
                          <p className="font-medium text-stone-900 truncate">{item.name}</p>
                          <p className="text-stone-400 text-[11px]">Qty {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sm:col-span-4 flex sm:justify-end">
                    <Link
                      to={`/orders/${order._id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium rounded-lg transition-colors"
                    >
                      <span>Track Order & Receipt</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
