import { Request, Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

export function getProducts(req: Request, res: Response): void {
  try {
    const { search, category, sort } = req.query as {
      search?: string;
      category?: string;
      sort?: string;
    };

    const products = db.products.find({ search, category, sort });

    // Collect all available categories dynamically
    const allProducts = db.products.find();
    const categoriesSet = new Set(allProducts.map((p) => p.category));
    const categories = ['All', ...Array.from(categoriesSet)];

    res.json({
      products,
      total: products.length,
      categories,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to retrieve products.' });
  }
}

export function getProductById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const product = db.products.findById(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to retrieve product.' });
  }
}

export function createProduct(req: Request, res: Response): void {
  try {
    const { name, description, price, category, image, stock, rating, featured } = req.body;

    if (!name || price === undefined || stock === undefined || !category) {
      res.status(400).json({ message: 'Product name, price, category, and stock are required.' });
      return;
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    if (isNaN(numPrice) || numPrice < 0) {
      res.status(400).json({ message: 'Price must be a valid positive number.' });
      return;
    }

    if (isNaN(numStock) || numStock < 0) {
      res.status(400).json({ message: 'Stock must be a non-negative number.' });
      return;
    }

    const product = db.products.create({
      name: name.trim(),
      description: description?.trim() || '',
      price: numPrice,
      category: category.trim(),
      image: image?.trim() || '/src/assets/images/hero_ecommerce_showcase_1790145758681.jpg',
      stock: numStock,
      rating: rating ? Number(rating) : 4.8,
      numReviews: 0,
      featured: Boolean(featured),
    });

    res.status(201).json({
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product.' });
  }
}

export function updateProduct(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, stock, rating, featured } = req.body;

    const existing = db.products.findById(id);
    if (!existing) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        res.status(400).json({ message: 'Price must be a valid positive number.' });
        return;
      }
      updateData.price = numPrice;
    }
    if (category !== undefined) updateData.category = category.trim();
    if (image !== undefined) updateData.image = image.trim();
    if (stock !== undefined) {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0) {
        res.status(400).json({ message: 'Stock must be a non-negative number.' });
        return;
      }
      updateData.stock = numStock;
    }
    if (rating !== undefined) updateData.rating = Number(rating);
    if (featured !== undefined) updateData.featured = Boolean(featured);

    const updated = db.products.findByIdAndUpdate(id, updateData);

    res.json({
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product.' });
  }
}

export function deleteProduct(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const deleted = db.products.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product.' });
  }
}

export function addProductReview(req: AuthRequest, res: Response): void {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Authentication required to post a review.' });
      return;
    }

    const { id } = req.params;
    const { rating, title, comment } = req.body;

    const numRating = Number(rating);
    if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ message: 'Please select a star rating between 1 and 5.' });
      return;
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      res.status(400).json({ message: 'Review comment must be at least 5 characters long.' });
      return;
    }

    const result = db.products.addReview(id, {
      userId: user._id,
      userName: user.name,
      rating: numRating,
      title: typeof title === 'string' && title.trim() ? title.trim() : undefined,
      comment: comment.trim(),
    });

    if (!result) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    res.status(201).json({
      message: 'Review submitted successfully.',
      product: result.product,
      review: result.review,
    });
  } catch (error) {
    console.error('Error adding product review:', error);
    res.status(500).json({ message: 'Failed to submit review.' });
  }
}
