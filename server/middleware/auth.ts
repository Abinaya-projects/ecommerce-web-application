import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserDoc } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'aura-ecommerce-secure-jwt-key-2026';

export interface AuthenticatedUser {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: Pick<UserDoc, '_id' | 'name' | 'email' | 'role'>): string {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function protect(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required. Please log in to continue.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      name: string;
      email: string;
      role: 'USER' | 'ADMIN';
    };

    const user = db.users.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'User belonging to this token no longer exists.' });
      return;
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token. Please sign in again.' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    return;
  }

  next();
}
