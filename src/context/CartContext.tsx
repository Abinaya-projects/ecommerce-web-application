import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart } from '../types';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  totalItems: number;
  subtotal: number;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.get();
      setCart(res.cart);
    } catch (err: any) {
      console.warn('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1): Promise<boolean> => {
    if (!user) {
      showToast('Please sign in', 'info', 'Create an account or log in to add items to your bag.');
      return false;
    }

    try {
      setLoading(true);
      const res = await cartApi.add(productId, quantity);
      setCart(res.cart);
      showToast('Added to bag', 'success', res.message);
      return true;
    } catch (err: any) {
      showToast('Could not add item', 'error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const res = await cartApi.update(productId, quantity);
      setCart(res.cart);
      return true;
    } catch (err: any) {
      showToast('Update failed', 'error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const res = await cartApi.remove(productId);
      setCart(res.cart);
      showToast('Item removed', 'info', 'Item was removed from your bag.');
      return true;
    } catch (err: any) {
      showToast('Could not remove item', 'error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const res = await cartApi.clear();
      setCart(res.cart);
      return true;
    } catch (err: any) {
      showToast('Could not clear bag', 'error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cart?.totalItems || 0;
  const subtotal = cart?.subtotal || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
