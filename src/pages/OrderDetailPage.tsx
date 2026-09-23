import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Calendar, PackageCheck, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { orderApi } from '../services/api';
import { OrderTracker } from '../components/OrderTracker';
import { useAuth } from '../context/AuthContext';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderApi
      .getById(id)
      .then((res) => {
        setOrder(res.order);
      })
      .catch((err) => {
        console.error('Error fetching order:', err);
        setError(err.message || 'Could not load order details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-stone-200 rounded w-1/4" />
        <div className="h-32 bg-stone-200 rounded-2xl" />
        <div className="h-48 bg-stone-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-serif font-semibold text-stone-900">Order Unavailable</h2>
        <p className="text-xs text-stone-500 mt-2 mb-6 leading-relaxed">
          {error || 'This order could not be retrieved or you do not have permission to view it.'}
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Orders</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </Link>
        </div>

        {/* Header summary */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                Official Order Receipt
              </span>
              <h1 className="text-2xl font-serif font-semibold text-stone-950 mt-0.5">
                Order #{order._id}
              </h1>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-stone-400 block font-normal">Total Invoiced</span>
              <span className="text-2xl font-bold text-stone-950 tabular-nums">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Visual Order Progress Tracker */}
          <div className="pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Shipment Progress & Real-Time Tracking
            </h3>
            <OrderTracker status={order.status} updatedAt={order.updatedAt} />
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-stone-500" />
              <span>Destination Address</span>
            </div>
            <div className="text-xs text-stone-600 leading-relaxed pt-1">
              <p className="font-semibold text-stone-900 text-sm">{order.shippingAddress.fullName}</p>
              <p className="mt-1">{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p className="mt-2 text-stone-500 font-mono text-[11px]">Phone: {order.shippingAddress.phone}</p>
              <p className="text-stone-500 font-mono text-[11px]">Email: {order.shippingAddress.email}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-stone-500" />
              <span>Payment Details</span>
            </div>
            <div className="text-xs text-stone-600 leading-relaxed pt-1">
              <p className="font-semibold text-stone-900 text-sm">{order.paymentMethod}</p>
              <p className="mt-1 text-stone-500">
                {order.paymentMethod === 'Demo Online Payment'
                  ? 'Payment completed and confirmed via demo mock card gateway.'
                  : 'Payment to be collected in cash upon courier doorstep delivery.'}
              </p>
              <div className="mt-3 p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                <span className="text-stone-500 text-[11px]">Status</span>
                <span className="font-semibold text-stone-900 text-xs">
                  {order.status === 'Cancelled' ? 'Cancelled / Refunded' : 'Authorized'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Products List */}
        <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-stone-100">
          <div className="p-5 sm:p-6 bg-stone-50/50 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Purchased Items ({order.items.length})
            </h3>
            <span className="text-xs text-stone-400">Fixed prices at time of order</span>
          </div>

          <div className="divide-y divide-stone-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm font-semibold text-stone-900 hover:underline block truncate"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Qty {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-semibold text-stone-950 tabular-nums shrink-0">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="p-6 bg-stone-50/40 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-medium text-stone-900 tabular-nums">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Discount {order.promoCode && `(${order.promoCode})`}</span>
                <span className="tabular-nums">-${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Delivery / Shipping</span>
              <span className="font-medium text-stone-900 tabular-nums">
                {order.shippingFee === 0 ? 'Complimentary ($0.00)' : `$${order.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-stone-950">Grand Total</span>
              <span className="text-xl font-bold text-stone-950 tabular-nums">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
