import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value props row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-stone-800 text-sm">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-100">Complimentary Shipping</p>
              <p className="text-xs text-stone-400 mt-0.5">On all domestic orders over $100.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-100">30-Day Return Guarantee</p>
              <p className="text-xs text-stone-400 mt-0.5">Hassle-free returns & store credit.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-100">Secure Checkout & Auth</p>
              <p className="text-xs text-stone-400 mt-0.5">BCrypt hashing and verified JWT tokens.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-100">Role-Based Access Control</p>
              <p className="text-xs text-stone-400 mt-0.5">Isolated customer and admin permissions.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          <div className="space-y-4">
            <p className="font-serif text-xl font-semibold text-stone-100 tracking-tight">
              Aura Commerce
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Curated everyday design objects, acoustic precision hardware, and timeless architectural home accents designed to elevate modern living.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-200 mb-4">
              Explore Collections
            </p>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link to="/products?category=Audio+%26+Acoustics" className="hover:text-white transition-colors">
                  Audio & Acoustics
                </Link>
              </li>
              <li>
                <Link to="/products?category=Furniture+%26+Living" className="hover:text-white transition-colors">
                  Furniture & Living
                </Link>
              </li>
              <li>
                <Link to="/products?category=Coffee+%26+Kitchen" className="hover:text-white transition-colors">
                  Coffee & Kitchen
                </Link>
              </li>
              <li>
                <Link to="/products?category=Lighting+%26+Workspace" className="hover:text-white transition-colors">
                  Lighting & Workspace
                </Link>
              </li>
              <li>
                <Link to="/products?category=Timepieces" className="hover:text-white transition-colors">
                  Timepieces & Accents
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-200 mb-4">
              Customer Services
            </p>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/profile?tab=wishlist" className="hover:text-white transition-colors">
                  My Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Complete Catalog
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-200 mb-4">
              Demo Credentials (Pre-Seeded)
            </p>
            <div className="bg-stone-800/80 p-3.5 rounded-lg border border-stone-700 text-xs space-y-2">
              <div>
                <span className="text-amber-400 font-semibold">Admin Account:</span>
                <p className="text-stone-300 font-mono text-[11px]">admin@ecommerce.com</p>
                <p className="text-stone-400 font-mono text-[11px]">password: admin123</p>
              </div>
              <div className="pt-2 border-t border-stone-700">
                <span className="text-emerald-400 font-semibold">Customer Account:</span>
                <p className="text-stone-300 font-mono text-[11px]">user@ecommerce.com</p>
                <p className="text-stone-400 font-mono text-[11px]">password: user123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet copyright */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Aura Commerce Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>REST API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
