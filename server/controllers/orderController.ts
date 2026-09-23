import { Response } from 'express';
import { db, OrderItemDoc, ShippingAddress, OrderDoc } from '../db';
import { AuthRequest } from '../middleware/auth';

export function createOrder(req: AuthRequest, res: Response): void {
  try {
    const user = req.user!;
    const { shippingAddress, paymentMethod, items: customItems, promoCode } = req.body;

    if (!shippingAddress) {
      res.status(400).json({ message: 'Shipping address is required.' });
      return;
    }

    const { fullName, email, phone, address, city, state, pincode } = shippingAddress as ShippingAddress;
    if (!fullName || !email || !phone || !address || !city || !state || !pincode) {
      res.status(400).json({ message: 'Please complete all required shipping address fields.' });
      return;
    }

    if (!paymentMethod || !['Cash on Delivery', 'Demo Online Payment'].includes(paymentMethod)) {
      res.status(400).json({ message: 'Please select a valid payment method.' });
      return;
    }

    // Resolve order items: from request body or from user cart
    let itemsToProcess: Array<{ productId: string; quantity: number }> = [];

    if (Array.isArray(customItems) && customItems.length > 0) {
      itemsToProcess = customItems.map((i: any) => ({
        productId: i.productId || i.product?._id || i._id,
        quantity: Number(i.quantity) || 1,
      }));
    } else {
      const cart = db.carts.findByUserId(user._id);
      itemsToProcess = cart.items;
    }

    if (itemsToProcess.length === 0) {
      res.status(400).json({ message: 'Your shopping cart is empty. Add products before checking out.' });
      return;
    }

    // Validate inventory availability for all items before any changes
    const orderItems: OrderItemDoc[] = [];
    let subtotal = 0;

    for (const item of itemsToProcess) {
      const product = db.products.findById(item.productId);
      if (!product) {
        res.status(400).json({ message: `Product ID "${item.productId}" no longer exists.` });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          message: `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${product.stock}.`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity,
      });
    }

    // Reduce product stock in database
    for (const item of itemsToProcess) {
      const product = db.products.findById(item.productId)!;
      const newStock = Math.max(0, product.stock - item.quantity);
      db.products.findByIdAndUpdate(item.productId, { stock: newStock });
    }

    // Calculate coupon/promo discount if provided
    let discountAmount = 0;
    const normalizedCode = typeof promoCode === 'string' ? promoCode.trim().toUpperCase() : '';
    let shippingFee = subtotal >= 100 ? 0 : 15;

    if (normalizedCode === 'SPRING20') {
      discountAmount = Math.round(subtotal * 0.2 * 100) / 100;
    } else if (normalizedCode === 'AURA15') {
      discountAmount = Math.round(subtotal * 0.15 * 100) / 100;
    } else if (normalizedCode === 'WELCOME10') {
      discountAmount = Math.round(subtotal * 0.1 * 100) / 100;
    } else if (normalizedCode === 'FREESHIP') {
      shippingFee = 0;
    }

    const totalAmount = Math.max(0, Math.round((subtotal - discountAmount + shippingFee) * 100) / 100);

    // Create order document
    const newOrder = db.orders.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      paymentMethod,
      subtotal,
      shippingFee,
      totalAmount,
      promoCode: normalizedCode || undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      status: paymentMethod === 'Demo Online Payment' ? 'Confirmed' : 'Pending',
    });

    // Clear user's cart in database
    db.carts.clearCart(user._id);

    res.status(201).json({
      message: 'Order created successfully.',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order. Please try again.' });
  }
}

export function getMyOrders(req: AuthRequest, res: Response): void {
  try {
    const user = req.user!;
    const orders = db.orders.find({ userId: user._id });
    res.json({ orders, total: orders.length });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to retrieve orders.' });
  }
}

export function getOrderById(req: AuthRequest, res: Response): void {
  try {
    const user = req.user!;
    const { id } = req.params;

    const order = db.orders.findById(id);
    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    // Security check: only order owner or ADMIN can view order
    if (order.userId !== user._id && user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied. You do not have permission to view this order.' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve order details.' });
  }
}
