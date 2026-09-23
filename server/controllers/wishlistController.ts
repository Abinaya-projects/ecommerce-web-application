import { Response } from 'express';
import { db, ProductDoc } from '../db';
import { AuthRequest } from '../middleware/auth';

function getPopulatedWishlist(userId: string): { wishlist: ProductDoc[]; productIds: string[]; total: number } {
  const wishlistDoc = db.wishlists.findByUserId(userId);
  const validProducts: ProductDoc[] = [];
  const cleanProductIds: string[] = [];

  for (const pid of wishlistDoc.productIds) {
    const product = db.products.findById(pid);
    if (product) {
      validProducts.push(product);
      cleanProductIds.push(pid);
    }
  }

  // Synchronize in case any removed items were pruned
  if (cleanProductIds.length !== wishlistDoc.productIds.length) {
    wishlistDoc.productIds = cleanProductIds;
  }

  return {
    wishlist: validProducts,
    productIds: cleanProductIds,
    total: validProducts.length,
  };
}

export function getWishlist(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'User authorization required.' });
      return;
    }

    const data = getPopulatedWishlist(userId);
    res.json(data);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ message: 'Failed to retrieve wishlist.' });
  }
}

export function toggleWishlist(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'User authorization required.' });
      return;
    }

    const { productId } = req.params;
    if (!productId) {
      res.status(400).json({ message: 'Product ID is required.' });
      return;
    }

    const product = db.products.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    const result = db.wishlists.toggle(userId, productId);
    const populated = getPopulatedWishlist(userId);

    res.json({
      message: result.inWishlist
        ? `Added "${product.name}" to your wishlist.`
        : `Removed "${product.name}" from your wishlist.`,
      inWishlist: result.inWishlist,
      productIds: result.productIds,
      wishlist: populated.wishlist,
      total: populated.total,
    });
  } catch (err) {
    console.error('Error toggling wishlist item:', err);
    res.status(500).json({ message: 'Failed to update wishlist.' });
  }
}

export function addToWishlist(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'User authorization required.' });
      return;
    }

    const productId = req.params.productId || req.body.productId;
    if (!productId) {
      res.status(400).json({ message: 'Product ID is required.' });
      return;
    }

    const product = db.products.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    db.wishlists.add(userId, productId);
    const populated = getPopulatedWishlist(userId);

    res.json({
      message: `Added "${product.name}" to your wishlist.`,
      inWishlist: true,
      productIds: populated.productIds,
      wishlist: populated.wishlist,
      total: populated.total,
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ message: 'Failed to add item to wishlist.' });
  }
}

export function removeFromWishlist(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'User authorization required.' });
      return;
    }

    const { productId } = req.params;
    if (!productId) {
      res.status(400).json({ message: 'Product ID is required.' });
      return;
    }

    db.wishlists.remove(userId, productId);
    const populated = getPopulatedWishlist(userId);

    res.json({
      message: 'Item removed from your wishlist.',
      inWishlist: false,
      productIds: populated.productIds,
      wishlist: populated.wishlist,
      total: populated.total,
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Failed to remove item from wishlist.' });
  }
}

export function clearWishlist(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'User authorization required.' });
      return;
    }

    db.wishlists.clear(userId);

    res.json({
      message: 'Wishlist cleared.',
      inWishlist: false,
      productIds: [],
      wishlist: [],
      total: 0,
    });
  } catch (err) {
    console.error('Error clearing wishlist:', err);
    res.status(500).json({ message: 'Failed to clear wishlist.' });
  }
}
