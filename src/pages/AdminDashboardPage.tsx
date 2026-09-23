import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { Product, Order, User, DashboardStats, OrderStatus } from '../types';
import { adminApi, productApi, seedApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type Tab = 'overview' | 'products' | 'orders' | 'users';

const STATUS_OPTIONS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<Array<User & { orderCount: number; totalSpent: number }>>([]);
  const [loading, setLoading] = useState(true);

  // Modal states for Product Add / Edit
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Audio & Acoustics',
    image: '/src/assets/images/hero_ecommerce_showcase_1790145758681.jpg',
    stock: 10,
    rating: 4.8,
  });

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, productsRes, ordersRes, usersRes] = await Promise.all([
        adminApi.getDashboard(),
        productApi.getAll({ sort: 'newest' }),
        adminApi.getOrders(),
        adminApi.getUsers(),
      ]);

      setStats(statsRes.stats);
      setProducts(productsRes.products);
      setOrders(ordersRes.orders);
      setUsersList(usersRes.users);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      showToast('Admin Load Error', 'error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  // If loading user state
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-stone-500 text-xs">Authenticating administrator permissions...</div>
      </div>
    );
  }

  // FLOW 3: Normal User → Try Admin Dashboard → Access denied
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-stone-50 px-4">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-8 sm:p-10 max-w-md w-full text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-stone-900">403 · Access Denied</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            You are currently signed in as <span className="font-semibold text-stone-800">{user?.email || 'Guest'}</span> ({user?.role || 'UNAUTHENTICATED'}). This area is restricted to administrator accounts only.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login?redirect=/admin"
              className="w-full py-2.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
            >
              Sign In with Admin Credentials
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 bg-white border border-stone-200 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-50"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 95,
      category: 'Audio & Acoustics',
      image: '/src/assets/images/hero_ecommerce_showcase_1790145758681.jpg',
      stock: 15,
      rating: 4.8,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      rating: product.rating,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productApi.update(editingProduct._id, productForm);
        showToast('Product Updated', 'success', `"${productForm.name}" updated successfully.`);
      } else {
        await productApi.create(productForm);
        showToast('Product Created', 'success', `"${productForm.name}" added to inventory.`);
      }
      setIsProductModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showToast('Save Failed', 'error', err.message);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${productName}"?`)) {
      return;
    }
    try {
      await productApi.delete(productId);
      showToast('Product Deleted', 'info', `"${productName}" was removed from catalog.`);
      loadAllAdminData();
    } catch (err: any) {
      showToast('Delete Failed', 'error', err.message);
    }
  };

  const handleUpdateStock = async (product: Product, newStock: number) => {
    if (newStock < 0) return;
    try {
      await productApi.update(product._id, { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, stock: newStock } : p))
      );
      showToast('Stock Adjusted', 'success', `${product.name} stock set to ${newStock}.`);
    } catch (err: any) {
      showToast('Stock Update Failed', 'error', err.message);
    }
  };

  // Handlers for Orders
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      showToast('Status Updated', 'success', `Order #${orderId} marked as ${status}.`);
      // refresh stats
      adminApi.getDashboard().then((res) => setStats(res.stats));
    } catch (err: any) {
      showToast('Update Failed', 'error', err.message);
    }
  };

  // Reseed test helper
  const handleReseed = async () => {
    if (!window.confirm('Reset database to default seed data? Current mock changes will be refreshed.')) {
      return;
    }
    try {
      await seedApi.resetDb();
      showToast('Database Reseeded', 'success', 'Sample products, users, and orders reset.');
      loadAllAdminData();
    } catch (err: any) {
      showToast('Reseed Error', 'error', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded mb-1.5">
              <span>Admin Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-950">
              Operations & Catalog Management
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Signed in as {user.name} ({user.email}) · Full Read/Write Privileges
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReseed}
              className="px-3 py-2 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              title="Reset sample products and test orders"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reseed Demo DB</span>
            </button>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Section 1A compliant: functional buttons with active states) */}
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-stone-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            Orders & Shipments ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            Customer Accounts ({usersList.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Primary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Sales Volume</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-serif font-bold text-stone-950 tabular-nums">
                  ${stats?.totalSales.toFixed(2) || '0.00'}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">Excludes cancelled transactions</p>
              </div>

              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
                  <ShoppingCart className="w-4 h-4 text-sky-600" />
                </div>
                <p className="text-2xl font-serif font-bold text-stone-950 tabular-nums">
                  {stats?.totalOrders || 0}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">Lifetime customer orders</p>
              </div>

              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Catalog Inventory</span>
                  <Package className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-serif font-bold text-stone-950 tabular-nums">
                  {stats?.totalProducts || 0}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">Active products in catalog</p>
              </div>

              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Registered Users</span>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-serif font-bold text-stone-950 tabular-nums">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">Accounts with stored hash & JWT</p>
              </div>
            </div>

            {/* Status Breakdown & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Order Status Breakdown */}
              <div className="lg:col-span-6 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-serif font-semibold text-stone-950 mb-4 pb-2 border-b border-stone-100">
                  Order Status Distribution
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {stats &&
                    Object.entries(stats.statusCounts).map(([status, count]) => (
                      <div key={status} className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                        <span className="text-[11px] text-stone-500 block truncate">{status}</span>
                        <span className="text-lg font-semibold text-stone-900 tabular-nums">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="lg:col-span-6 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-4">
                  <h3 className="text-sm font-serif font-semibold text-stone-950">
                    Low Stock Inventory Alerts (≤ 5 units)
                  </h3>
                  <span className="text-xs text-amber-700 font-medium">
                    {stats?.lowStockProducts.length || 0} alerts
                  </span>
                </div>

                {stats?.lowStockProducts.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4">All catalog items have healthy stock levels (&gt; 5).</p>
                ) : (
                  <div className="space-y-2.5">
                    {stats?.lowStockProducts.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-stone-500">{p.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-amber-900 tabular-nums">{p.stock} remaining</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Management */}
        {activeTab === 'products' && (
          <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-serif font-semibold text-stone-900">
                  Products Management ({products.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Add, modify attributes, adjust stock quantities, and remove catalog items.
                </p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-3.5 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-stone-900 truncate">{product.name}</p>
                            <p className="text-[11px] text-stone-400 font-mono">{product._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">{product.category}</td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900 tabular-nums">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) => handleUpdateStock(product, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-stone-50 border border-stone-300 rounded text-center text-xs font-semibold tabular-nums focus:ring-1 focus:ring-stone-900"
                          />
                          {product.stock <= 3 && (
                            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(product)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders Management */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-6 border-b border-stone-100">
              <h2 className="text-base font-serif font-semibold text-stone-900">
                All Orders & Fulfillment ({orders.length})
              </h2>
              <p className="text-xs text-stone-500">
                Update shipment stages from Confirmed to Shipped, Out for Delivery, or Delivered.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        <Link to={`/orders/${order._id}`} className="hover:underline text-stone-900">
                          {order._id}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-stone-900">{order.userName}</p>
                        <p className="text-[11px] text-stone-500 font-mono">{order.userEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900 tabular-nums">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">{order.paymentMethod}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value as OrderStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : order.status === 'Shipped' || order.status === 'Out for Delivery'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : 'bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Customer Accounts */}
        {activeTab === 'users' && (
          <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-6 border-b border-stone-100">
              <h2 className="text-base font-serif font-semibold text-stone-900">
                Registered Users & Security Roles ({usersList.length})
              </h2>
              <p className="text-xs text-stone-500">
                All passwords securely stored using BCrypt one-way salt hashing.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Lifetime Spend</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-stone-900">{u.name}</td>
                      <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-stone-800 font-medium">
                        {u.orderCount}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-semibold text-stone-950">
                        ${u.totalSpent.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Add/Edit Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-lg font-serif font-semibold text-stone-950">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Product Title / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900"
                    placeholder="e.g. Sculptural Cast Bronze Desk Clock"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Category
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-stone-900"
                    >
                      <option value="Audio & Acoustics">Audio & Acoustics</option>
                      <option value="Coffee & Kitchen">Coffee & Kitchen</option>
                      <option value="Timepieces">Timepieces</option>
                      <option value="Furniture & Living">Furniture & Living</option>
                      <option value="Lighting & Workspace">Lighting & Workspace</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Apparel">Apparel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Retail Price ($ USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Inventory Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Rating (0.0 - 5.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={productForm.rating}
                      onChange={(e) =>
                        setProductForm({ ...productForm, rating: parseFloat(e.target.value) || 4.8 })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Image URL or Local Asset Path
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-stone-900"
                    placeholder="Describe material provenance, dimensions, and craft details..."
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
                  >
                    {editingProduct ? 'Save Modifications' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
