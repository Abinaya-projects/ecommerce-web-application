import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: Set<string>;
  totalWishlist: number;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productOrId: Product | string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  moveToCart: (product: Product, quantity?: number) => Promise<boolean>;
  moveAllToCart: () => Promise<{ addedCount: number; outOfStockCount: number }>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const wishlistIds = useMemo(() => new Set(productIds), [productIds]);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setProductIds([]);
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistApi.get();
      setWishlist(res.wishlist || []);
      setProductIds(res.productIds || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlistIds.has(productId);
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productOrId: Product | string): Promise<boolean> => {
      if (!user) {
        showToast(
          'Sign In Required',
          'info',
          'Please sign in to your account to save products to your wishlist.'
        );
        return false;
      }

      const productId = typeof productOrId === 'string' ? productOrId : productOrId._id;
      const productName =
        typeof productOrId === 'string'
          ? wishlist.find((p) => p._id === productOrId)?.name || 'Product'
          : productOrId.name;

      // Optimistic update
      const wasInWishlist = wishlistIds.has(productId);
      const nextInWishlist = !wasInWishlist;

      if (nextInWishlist) {
        setProductIds((prev) => [...prev, productId]);
        if (typeof productOrId !== 'string') {
          setWishlist((prev) => [productOrId, ...prev.filter((p) => p._id !== productId)]);
        }
      } else {
        setProductIds((prev) => prev.filter((id) => id !== productId));
        setWishlist((prev) => prev.filter((p) => p._id !== productId));
      }

      try {
        const res = await wishlistApi.toggle(productId);
        setProductIds(res.productIds);
        setWishlist(res.wishlist);

        if (res.inWishlist) {
          showToast('Added to Wishlist', 'success', `"${productName}" has been saved to your wishlist.`);
        } else {
          showToast('Removed from Wishlist', 'info', `"${productName}" was removed from your wishlist.`);
        }
        return res.inWishlist;
      } catch (err: any) {
        // Rollback on failure
        fetchWishlist();
        showToast('Error', 'error', err.message || 'Could not update wishlist.');
        return wasInWishlist;
      }
    },
    [user, wishlist, wishlistIds, showToast, fetchWishlist]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!user) return;

      const product = wishlist.find((p) => p._id === productId);
      setProductIds((prev) => prev.filter((id) => id !== productId));
      setWishlist((prev) => prev.filter((p) => p._id !== productId));

      try {
        const res = await wishlistApi.remove(productId);
        setProductIds(res.productIds);
        setWishlist(res.wishlist);
        showToast(
          'Removed from Wishlist',
          'info',
          product ? `"${product.name}" removed.` : 'Item removed from wishlist.'
        );
      } catch (err: any) {
        fetchWishlist();
        showToast('Error', 'error', err.message || 'Could not remove item.');
      }
    },
    [user, wishlist, showToast, fetchWishlist]
  );

  const clearWishlist = useCallback(async () => {
    if (!user) return;

    setProductIds([]);
    setWishlist([]);

    try {
      await wishlistApi.clear();
      showToast('Wishlist Cleared', 'info', 'All items have been removed from your wishlist.');
    } catch (err: any) {
      fetchWishlist();
      showToast('Error', 'error', err.message || 'Could not clear wishlist.');
    }
  }, [user, showToast, fetchWishlist]);

  const moveToCart = useCallback(
    async (product: Product, quantity = 1): Promise<boolean> => {
      if (product.stock <= 0) {
        showToast('Item Sold Out', 'error', `"${product.name}" is currently out of stock.`);
        return false;
      }

      try {
        await addToCart(product._id, quantity);
        await removeFromWishlist(product._id);
        showToast('Moved to Bag', 'success', `"${product.name}" moved to your shopping bag.`);
        return true;
      } catch (err: any) {
        showToast('Error', 'error', err.message || 'Could not move item to bag.');
        return false;
      }
    },
    [addToCart, removeFromWishlist, showToast]
  );

  const moveAllToCart = useCallback(async () => {
    if (wishlist.length === 0) return { addedCount: 0, outOfStockCount: 0 };

    let addedCount = 0;
    let outOfStockCount = 0;

    for (const item of wishlist) {
      if (item.stock > 0) {
        try {
          await addToCart(item._id, 1);
          await wishlistApi.remove(item._id);
          addedCount++;
        } catch (e) {
          console.error(`Failed to move ${item.name} to cart`, e);
        }
      } else {
        outOfStockCount++;
      }
    }

    await fetchWishlist();

    if (addedCount > 0) {
      showToast(
        'Items Moved to Bag',
        'success',
        `Successfully transferred ${addedCount} ${addedCount === 1 ? 'item' : 'items'} to your shopping bag.`
      );
    }
    if (outOfStockCount > 0) {
      showToast(
        'Some Items Unavailable',
        'info',
        `${outOfStockCount} ${outOfStockCount === 1 ? 'item is' : 'items are'} currently out of stock and remained in your wishlist.`
      );
    }

    return { addedCount, outOfStockCount };
  }, [wishlist, addToCart, fetchWishlist, showToast]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        totalWishlist: wishlist.length,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        moveToCart,
        moveAllToCart,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
