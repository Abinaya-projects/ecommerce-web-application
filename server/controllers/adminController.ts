import { Request, Response } from 'express';
import { db, OrderStatus } from '../db';

const VALID_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export function getUsers(req: Request, res: Response): void {
  try {
    const allUsers = db.users.find();
    const allOrders = db.orders.find();

    const safeUsers = allUsers.map((u) => {
      const userOrders = allOrders.filter((o) => o.userId === u._id);
      const totalSpent = userOrders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        orderCount: userOrders.length,
        totalSpent,
      };
    });

    res.json({
      users: safeUsers,
      total: safeUsers.length,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Failed to retrieve users.' });
  }
}

export function getAllOrders(req: Request, res: Response): void {
  try {
    const orders = db.orders.find();
    res.json({
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Failed to retrieve orders.' });
  }
}

export function updateOrderStatus(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };

    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({
        message: `Invalid order status. Allowed values: ${VALID_STATUSES.join(', ')}.`,
      });
      return;
    }

    const order = db.orders.findById(id);
    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    // If order was cancelled, optionally restore stock
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        const prod = db.products.findById(item.productId);
        if (prod) {
          db.products.findByIdAndUpdate(item.productId, { stock: prod.stock + item.quantity });
        }
      }
    }

    const updated = db.orders.updateStatus(id, status);

    res.json({
      message: `Order status updated to "${status}".`,
      order: updated,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
}

export function getDashboardStats(req: Request, res: Response): void {
  try {
    const products = db.products.find();
    const users = db.users.find();
    const orders = db.orders.find();

    const nonCancelledOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalSales = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const statusCounts: Record<string, number> = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    const lowStockProducts = products
      .filter((p) => p.stock <= 5)
      .map((p) => ({
        _id: p._id,
        name: p.name,
        stock: p.stock,
        category: p.category,
        price: p.price,
      }));

    const recentOrders = orders.slice(0, 5).map((o) => ({
      _id: o._id,
      userName: o.userName,
      totalAmount: o.totalAmount,
      status: o.status,
      itemCount: o.items.length,
      createdAt: o.createdAt,
    }));

    res.json({
      stats: {
        totalProducts: products.length,
        totalUsers: users.length,
        totalOrders: orders.length,
        totalSales,
        statusCounts,
        recentOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard metrics.' });
  }
}
