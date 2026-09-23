import { Product, Cart, Order, DashboardStats, User, OrderStatus, WishlistResponse, ToggleWishlistResponse, Review } from '../types';

const TOKEN_KEY = 'aura_commerce_jwt';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const authApi = {
  register: (payload: { name: string; email: string; password: string; confirmPassword?: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),
};

export const productApi = {
  getAll: (params?: { search?: string; category?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.sort) query.set('sort', params.sort);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ products: Product[]; total: number; categories: string[] }>(`/api/products${qs}`);
  },

  getById: (id: string) => request<{ product: Product }>(`/api/products/${id}`),

  create: (payload: Partial<Product>) =>
    request<{ message: string; product: Product }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<Product>) =>
    request<{ message: string; product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  addReview: (productId: string, payload: { rating: number; title?: string; comment: string }) =>
    request<{ message: string; product: Product; review: Review }>(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const cartApi = {
  get: () => request<{ cart: Cart }>('/api/cart'),

  add: (productId: string, quantity = 1) =>
    request<{ message: string; cart: Cart }>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  update: (productId: string, quantity: number) =>
    request<{ message: string; cart: Cart }>(`/api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  remove: (productId: string) =>
    request<{ message: string; cart: Cart }>(`/api/cart/${productId}`, {
      method: 'DELETE',
    }),

  clear: () =>
    request<{ message: string; cart: Cart }>('/api/cart', {
      method: 'DELETE',
    }),
};

export const orderApi = {
  create: (payload: {
    shippingAddress: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    paymentMethod: 'Cash on Delivery' | 'Demo Online Payment';
    items?: Array<{ productId: string; quantity: number }>;
    promoCode?: string;
  }) =>
    request<{ message: string; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyOrders: () => request<{ orders: Order[]; total: number }>('/api/orders'),

  getById: (id: string) => request<{ order: Order }>(`/api/orders/${id}`),
};

export const wishlistApi = {
  get: () => request<WishlistResponse>('/api/wishlist'),

  toggle: (productId: string) =>
    request<ToggleWishlistResponse>(`/api/wishlist/toggle/${productId}`, {
      method: 'POST',
    }),

  add: (productId: string) =>
    request<ToggleWishlistResponse>(`/api/wishlist/${productId}`, {
      method: 'POST',
    }),

  remove: (productId: string) =>
    request<ToggleWishlistResponse>(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    }),

  clear: () =>
    request<{ message: string; inWishlist: boolean; productIds: string[]; wishlist: Product[]; total: number }>(
      '/api/wishlist',
      {
        method: 'DELETE',
      }
    ),
};

export const adminApi = {
  getDashboard: () => request<{ stats: DashboardStats }>('/api/admin/dashboard'),

  getUsers: () =>
    request<{
      users: Array<
        User & {
          orderCount: number;
          totalSpent: number;
        }
      >;
      total: number;
    }>('/api/admin/users'),

  getOrders: () => request<{ orders: Order[]; total: number }>('/api/admin/orders'),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<{ message: string; order: Order }>(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

export const seedApi = {
  resetDb: () => request<{ message: string }>('/api/seed/reset', { method: 'POST' }),
};
