import { Request, Response } from 'express';
import { readDb, writeDb } from './_lib/db';

export default async function usersHandler(req: Request, res: Response) {
  try {
    const db = readDb();

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        users: db.users,
      });
    }

    if (req.method === 'POST') {
      const user = req.body;
      if (!user || (!user.email && !user.username)) {
        return res.status(400).json({ success: false, message: 'Invalid user payload' });
      }

      const id = user.id || `usr-${Date.now()}`;
      const newUser = {
        ...user,
        id,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingIndex = db.users.findIndex(
        (u: any) => u.id === id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
      );

      if (existingIndex >= 0) {
        db.users[existingIndex] = { ...db.users[existingIndex], ...newUser };
      } else {
        db.users.push(newUser);
      }

      writeDb(db);
      return res.status(201).json({ success: true, user: newUser });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updates = req.body;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, message: 'Missing user ID' });
      }

      const userIndex = db.users.findIndex((u: any) => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      db.users[userIndex] = {
        ...db.users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      writeDb(db);
      return res.status(200).json({ success: true, user: db.users[userIndex] });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err: any) {
    console.error('usersHandler error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
}
