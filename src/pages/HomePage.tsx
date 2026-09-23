import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Gem,
  Copy,
  Check,
  Star,
  Tag,
  Mail,
} from 'lucide-react';
import { Product } from '../types';
import { productApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useToast } from '../context/ToastContext';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    productApi
      .getAll({ sort: 'rating' })
      .then((res) => {
        setFeaturedProducts(res.products.slice(0, 6));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('Promo Code Copied!', 'success', `Code "${code}" copied! Paste it in your cart or checkout for 20% off.`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    showToast('Welcome to the Circle!', 'success', 'You are subscribed. Use code WELCOME10 for an extra 10% off.');
  };

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-amber-200 selection:text-amber-950">
      {/* Editorial Storefront Hero with Layered Warm Accents */}
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-gradient-to-b from-amber-50/50 via-stone-50 to-stone-100/60">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/70 text-amber-900 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Spring 2026 Living & Architectural Edit</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-950 leading-[1.12]">
                Artifacts of <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-rose-700 bg-clip-text text-transparent">quiet precision</span> & tactile form.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                Discover everyday acoustic equipment, hand-cast stoneware, and architectural furniture crafted from honest raw materials built to endure for generations.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleCopyCode('SPRING20')}
                  className="px-5 py-3.5 bg-white border border-stone-300/80 hover:border-amber-400 text-stone-800 text-sm font-semibold rounded-xl hover:bg-amber-50/40 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>Use Code <span className="font-mono text-amber-700">SPRING20</span> (20% Off)</span>
                </button>
              </div>

              {/* Trust Indicators with colored badges */}
              <div className="pt-6 border-t border-stone-200/80 grid grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white/80 rounded-xl border border-stone-200/70 shadow-xs">
                  <span className="font-bold text-amber-700 block tabular-nums text-base">12+</span>
                  <span className="text-stone-600 font-medium">Curated Artifacts</span>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-stone-200/70 shadow-xs">
                  <span className="font-bold text-emerald-700 block tabular-nums text-base">100%</span>
                  <span className="text-stone-600 font-medium">Guaranteed Origin</span>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-stone-200/70 shadow-xs">
                  <span className="font-bold text-indigo-700 block tabular-nums text-base">Free</span>
                  <span className="text-stone-600 font-medium">Delivery Over $100</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-6">
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xl bg-stone-200 group">
                <img
                  src="/src/assets/images/hero_ecommerce_showcase_1790145758681.jpg"
                  alt="Architectural studio interior with minimalist furnishings"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex items-end p-6 sm:p-8">
                  <div className="text-white space-y-1">
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-amber-300 bg-amber-950/70 px-2.5 py-1 rounded-full border border-amber-400/30 backdrop-blur-xs">
                      Editorial Highlight
                    </span>
                    <p className="text-lg sm:text-xl font-serif font-semibold text-white pt-1">
                      Sculptural Walnut Living & High-Fidelity Acoustics
                    </p>
                    <p className="text-xs text-stone-300">
                      Designed in Kyoto and Copenhagen · Available for immediate dispatch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Departments with Color Accents */}
      <section className="py-14 border-b border-stone-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                <span>Collections</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950">
                Curated Departments
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Explore specialized ateliers crafted for tactile living and modern ergonomics.
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto hover:underline"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: 'Audio & Acoustics',
                desc: 'Beryllium drivers & planar headphones',
                category: 'Audio & Acoustics',
                image: '/src/assets/images/product_audio_headphones_1790145772052.jpg',
                accent: 'from-indigo-900/80 to-stone-950/90',
                tag: 'High-Fidelity',
                tagColor: 'bg-indigo-500/80 text-white',
              },
              {
                title: 'Coffee & Kitchen',
                desc: 'Handmade drippers & enameled cookware',
                category: 'Coffee & Kitchen',
                image: '/src/assets/images/dutch_oven_1790146844504.jpg',
                accent: 'from-amber-950/80 to-stone-950/90',
                tag: 'Artisan Pour',
                tagColor: 'bg-amber-600/80 text-white',
              },
              {
                title: 'Horology & Watches',
                desc: 'Grade-5 titanium mechanical chronographs',
                category: 'Timepieces',
                image: '/src/assets/images/product_chronograph_watch_1790145796963.jpg',
                accent: 'from-emerald-950/80 to-stone-950/90',
                tag: 'Automatic',
                tagColor: 'bg-emerald-600/80 text-white',
              },
              {
                title: 'Furniture & Living',
                desc: 'Milled solid walnut & Biella merino wool',
                category: 'Furniture & Living',
                image: '/src/assets/images/hero_ecommerce_showcase_1790145758681.jpg',
                accent: 'from-orange-950/80 to-stone-950/90',
                tag: 'Craftsman',
                tagColor: 'bg-orange-600/80 text-white',
              },
            ].map((cat) => (
              <Link
                key={cat.title}
                to={`/products?category=${encodeURIComponent(cat.category)}`}
                className="group relative rounded-2xl border border-stone-200/90 overflow-hidden bg-stone-100 p-5 flex flex-col justify-end aspect-4/3 sm:aspect-5/4 hover:border-amber-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} transition-opacity duration-300`} />
                <div className="relative z-10 text-white space-y-1">
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs ${cat.tagColor}`}>
                    {cat.tag}
                  </span>
                  <p className="text-sm sm:text-base font-semibold leading-tight text-white group-hover:text-amber-200 transition-colors">
                    {cat.title}
                  </p>
                  <p className="text-[11px] text-stone-300 line-clamp-1">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special Promotional Banner (Spring Private Sale) */}
      <section className="py-12 bg-stone-50 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-900 via-stone-900 to-rose-950 text-white shadow-xl border border-amber-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 p-8 sm:p-12 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Limited Season Opportunity</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                  Spring Equinox Private Sale: 20% Off All Orders
                </h2>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Refresh your creative studio and living space with heirloom craftsmanship. Use our exclusive code at checkout to unlock savings across the catalog.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-black/40 border border-amber-400/40 rounded-xl px-4 py-2.5 backdrop-blur-md">
                    <span className="text-xs text-stone-300 uppercase tracking-wider font-medium">Code:</span>
                    <span className="font-mono text-base font-bold text-amber-300 tracking-wider">SPRING20</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode('SPRING20')}
                      className="ml-2 inline-flex items-center gap-1 text-xs text-white hover:text-amber-200 bg-amber-700/60 hover:bg-amber-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <Link
                    to="/products"
                    className="px-6 py-3 bg-white hover:bg-stone-100 text-stone-950 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    Shop The Collection
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 h-64 lg:h-full relative min-h-[300px]">
                <img
                  src="/src/assets/images/spring_editorial_1790146810148.jpg"
                  alt="Spring interior with curated brass lamp and stoneware"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-900/60 via-transparent to-transparent lg:block hidden" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Grid */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Highest Rated Items</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950">
              Featured Acquisitions
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Hand-tested and vetted by our industrial design team.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 hover:underline"
          >
            <span>View all products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-4 animate-pulse">
                <div className="aspect-4/3 bg-stone-200 rounded-xl" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
                <div className="h-8 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why Aura Architecture (Four Pillars with vibrant cards) */}
      <section className="py-16 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950">
              The Aura Living Standard
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2">
              Every detail is engineered to honor genuine craftsmanship and timeless utility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gem className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                Honest Raw Materials
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Solid brass, grade-5 titanium, refractory stoneware, and Biella merino wool. Free of cheap synthetic fillers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                Insured Priority Dispatch
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Complimentary global tracked shipping on all orders over $100. Delivered in 100% recyclable cushioned boxes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                Certified Authenticity
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Serialized authentication marks and official atelier warranty certificates included with every delivery.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-rose-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                30-Day Studio Trial
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Experience the acoustics and tactile presence in your space. Full hassle-free return guarantee within 30 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer & Press Accolades */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Critical Acclaim</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 mt-1">
            Voices of Design & Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">
              “Aura Commerce demonstrates that functional minimalism does not mean cold austerity. Their acoustic headphones and stoneware are masterworks.”
            </p>
            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-900">Architectural Digest</p>
              <p className="text-[10px] text-stone-500">Design Index 2026</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">
              “The titanium chronograph and brushed brass lamp elevate desktop working environments from utilitarian to inspiring sanctuaries.”
            </p>
            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-900">Wallpaper* Magazine</p>
              <p className="text-[10px] text-stone-500">Workspace Selection</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">
              “Order tracking, doorstep arrival, and packaging felt like unwrapping luxury bespoke art. Aura sets the benchmark for e-commerce execution.”
            </p>
            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-900">Julian Hayes</p>
              <p className="text-[10px] text-stone-500">Verified Collector</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter VIP Club Card */}
      <section className="py-14 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold">
            <Mail className="w-3.5 h-3.5 text-amber-200" />
            <span>The Aura Design Circle</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Join the Circle & Receive 10% Off Your First Acquisition
          </h2>

          <p className="text-stone-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Receive private preview access to limited kiln firings, archival releases, and bespoke interior collaborations before public announcement.
          </p>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/40 text-white font-medium text-sm">
              <Check className="w-5 h-5 text-emerald-300" />
              <span>You're subscribed! Use promo code <strong>WELCOME10</strong> on your next purchase.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-3 rounded-xl bg-white text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-300 shadow-inner"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-stone-950 hover:bg-stone-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
