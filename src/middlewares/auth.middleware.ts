import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt.js';

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization ?? '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Token requerido' });
  try {
    const payload = verifyToken(auth.slice(7)); // { userId, roles }
    req.user = { id: payload.userId, roles: payload.roles };
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
