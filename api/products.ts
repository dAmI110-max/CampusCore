import { Request, Response } from 'express';
import { readDb, writeDb } from './_lib/db';

export default async function productsHandler(req: Request, res: Response) {
  try {
    const db = readDb();

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        products: db.products,
      });
    }

    if (req.method === 'POST') {
      const product = req.body;
      if (!product || !product.title || !product.price) {
        return res.status(400).json({ success: false, message: 'Invalid product payload' });
      }

      const id = product.id || `prod-${Date.now()}`;
      const newProduct = {
        ...product,
        id,
        views: product.views || 1,
        status: product.status || 'active',
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingIndex = db.products.findIndex((p: any) => p.id === id);
      if (existingIndex >= 0) {
        db.products[existingIndex] = newProduct;
      } else {
        db.products.unshift(newProduct);
      }

      writeDb(db);
      return res.status(201).json({ success: true, product: newProduct });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, message: 'Missing product ID' });
      }

      db.products = db.products.filter((p: any) => p.id !== id);
      writeDb(db);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err: any) {
    console.error('productsHandler error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
}
