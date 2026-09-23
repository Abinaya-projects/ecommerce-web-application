import { Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

function formatPopulatedCart(userId: string) {
  const cartDoc = db.carts.findByUserId(userId);
  const populatedItems: Array<{
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
  }> = [];

  let subtotal = 0;
  let totalItems = 0;

  // Filter out any stale items whose products were deleted
  const validItems = [];
  for (const item of cartDoc.items) {
    const product = db.products.findById(item.productId);
    if (product) {
      // Ensure quantity doesn't exceed current available stock if stock decreased
      const safeQuantity = Math.min(item.quantity, Math.max(0, product.stock));
      validItems.push({ productId: item.productId, quantity: safeQuantity });

      const itemSubtotal = product.price * safeQuantity;
      subtotal += itemSubtotal;
      totalItems += safeQuantity;

      populatedItems.push({
        productId: product._id,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          category: product.category,
        },
        quantity: safeQuantity,
        subtotal: itemSubtotal,
      });
    }
  }

  // Update cart in DB if items changed
  cartDoc.items = validItems.filter((i) => i.quantity > 0);
  db.carts.saveCart(cartDoc);

  return {
    _id: cartDoc._id,
    userId: cartDoc.userId,
    items: populatedItems,
    subtotal,
    total: subtotal,
    totalItems,
  };
}

export function getCart(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user!._id;
    const cart = formatPopulatedCart(userId);
    res.json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to retrieve cart.' });
  }
}

export function addToCart(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user!._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ message: 'Product ID is required.' });
      return;
    }

    const qtyToAdd = Number(quantity) || 1;
    if (qtyToAdd <= 0) {
      res.status(400).json({ message: 'Quantity must be at least 1.' });
      return;
    }

    const product = db.products.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    if (product.stock <= 0) {
      res.status(400).json({ message: `"${product.name}" is currently out of stock.` });
      return;
    }

    const cartDoc = db.carts.findByUserId(userId);
    const existingIndex = cartDoc.items.findIndex((i) => i.productId === productId);

    const currentQtyInCart = existingIndex >= 0 ? cartDoc.items[existingIndex].quantity : 0;
    const targetQty = currentQtyInCart + qtyToAdd;

    if (targetQty > product.stock) {
      res.status(400).json({
        message: `Only ${product.stock} items available in stock. You already have ${currentQtyInCart} in your bag.`,
      });
      return;
    }

    if (existingIndex >= 0) {
      cartDoc.items[existingIndex].quantity = targetQty;
    } else {
      cartDoc.items.push({ productId, quantity: targetQty });
    }

    db.carts.saveCart(cartDoc);
    const updatedCart = formatPopulatedCart(userId);

    res.json({
      message: `Added "${product.name}" to cart.`,
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart.' });
  }
}

export function updateCartItem(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user!._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const numQty = Number(quantity);
    if (isNaN(numQty)) {
      res.status(400).json({ message: 'Valid quantity is required.' });
      return;
    }

    const cartDoc = db.carts.findByUserId(userId);

    if (numQty <= 0) {
      cartDoc.items = cartDoc.items.filter((i) => i.productId !== productId);
      db.carts.saveCart(cartDoc);
      res.json({
        message: 'Item removed from cart.',
        cart: formatPopulatedCart(userId),
      });
      return;
    }

    const product = db.products.findById(productId);
    if (!product) {
      cartDoc.items = cartDoc.items.filter((i) => i.productId !== productId);
      db.carts.saveCart(cartDoc);
      res.status(404).json({ message: 'Product is no longer available.' });
      return;
    }

    if (numQty > product.stock) {
      res.status(400).json({
        message: `Cannot increase quantity beyond available stock of ${product.stock}.`,
      });
      return;
    }

    const itemIndex = cartDoc.items.findIndex((i) => i.productId === productId);
    if (itemIndex >= 0) {
      cartDoc.items[itemIndex].quantity = numQty;
    } else {
      cartDoc.items.push({ productId, quantity: numQty });
    }

    db.carts.saveCart(cartDoc);
    res.json({
      message: 'Cart updated.',
      cart: formatPopulatedCart(userId),
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart.' });
  }
}

export function removeFromCart(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user!._id;
    const { productId } = req.params;

    const cartDoc = db.carts.findByUserId(userId);
    cartDoc.items = cartDoc.items.filter((i) => i.productId !== productId);
    db.carts.saveCart(cartDoc);

    res.json({
      message: 'Item removed from cart.',
      cart: formatPopulatedCart(userId),
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove item.' });
  }
}

export function clearCart(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user!._id;
    db.carts.clearCart(userId);

    res.json({
      message: 'Cart cleared.',
      cart: {
        _id: '',
        userId,
        items: [],
        subtotal: 0,
        total: 0,
        totalItems: 0,
      },
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart.' });
  }
}
