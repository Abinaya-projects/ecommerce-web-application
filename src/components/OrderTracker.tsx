import React from 'react';
import { Check, Clock, Package, Truck, Home, AlertTriangle } from 'lucide-react';
import { OrderStatus } from '../types';

interface OrderTrackerProps {
  status: OrderStatus;
  updatedAt?: string;
}

const STEPS: Array<{ key: OrderStatus; label: string; icon: React.ElementType }> = [
  { key: 'Pending', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: Check },
  { key: 'Processing', label: 'Processing', icon: Package },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Home },
];

export function OrderTracker({ status, updatedAt }: OrderTrackerProps) {
  if (status === 'Cancelled') {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold">Order Cancelled</h4>
          <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
            This order has been cancelled and returned to inventory. If you were charged, your payment will be refunded within 3-5 business days.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="w-full py-4">
      {/* Desktop / Tablet horizontal tracker */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Continuous background bar */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-stone-200 -z-0" />
        {/* Active progress bar */}
        <div
          className="absolute top-5 left-8 h-0.5 bg-emerald-600 transition-all duration-500 -z-0"
          style={{
            width: `${(activeIndex / (STEPS.length - 1)) * 100}%`,
            maxWidth: 'calc(100% - 4rem)',
          }}
        />

        {STEPS.map((step, idx) => {
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isPassed
                    ? 'bg-emerald-600 text-white ring-4 ring-white shadow-xs'
                    : isCurrent
                    ? 'bg-stone-900 text-white ring-4 ring-amber-100 shadow-md scale-110'
                    : 'bg-stone-100 text-stone-400 border border-stone-300'
                }`}
              >
                {isPassed ? <Check className="w-5 h-5 stroke-[2.5]" /> : <StepIcon className="w-4 h-4" />}
              </div>

              <span
                className={`mt-2.5 text-xs text-center font-medium max-w-[80px] leading-tight ${
                  isCurrent ? 'text-stone-950 font-semibold' : isPassed ? 'text-stone-700' : 'text-stone-400'
                }`}
              >
                {step.label}
              </span>

              {isCurrent && (
                <span className="mt-1 text-[10px] text-emerald-700 font-medium tracking-wide">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile vertical tracker */}
      <div className="sm:hidden space-y-4 relative pl-6 border-l-2 border-stone-200 ml-3">
        {STEPS.map((step, idx) => {
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="relative flex items-center gap-3">
              <div
                className={`absolute -left-[31px] w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isPassed
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-stone-900 text-white ring-4 ring-stone-100'
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                {isPassed ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3 h-3" />}
              </div>

              <div>
                <p
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-stone-900' : isPassed ? 'text-stone-700' : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-[11px] text-emerald-600 font-medium">Current Status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {updatedAt && (
        <p className="text-right text-[11px] text-stone-400 mt-4">
          Last status update: {new Date(updatedAt).toLocaleDateString()} {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}
