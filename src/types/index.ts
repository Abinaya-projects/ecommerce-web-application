export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  numReviews: number;
  featured?: boolean;
  createdAt: string;
  reviews?: Review[];
}

export interface CartItem {
  productId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category: string;
  };
  quantity: number;
  subtotal: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  totalItems: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'Cash on Delivery' | 'Demo Online Payment';
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  promoCode?: string;
  discountAmount?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
  statusCounts: Record<OrderStatus, number>;
  recentOrders: Array<{
    _id: string;
    userName: string;
    totalAmount: number;
    status: OrderStatus;
    itemCount: number;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    stock: number;
    category: string;
    price: number;
  }>;
}

export interface WishlistResponse {
  wishlist: Product[];
  productIds: string[];
  total: number;
}

export interface ToggleWishlistResponse {
  message: string;
  inWishlist: boolean;
  productIds: string[];
  wishlist: Product[];
  total: number;
}

