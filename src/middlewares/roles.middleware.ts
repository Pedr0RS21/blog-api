import type { RequestHandler } from 'express';

export const requireRoles = (...roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const userRoles = req.user?.roles ?? [];
    const ok = roles.some((r) => userRoles.includes(r));
    if (!ok) return res.status(403).json({ message: 'Permisos insuficientes' });
    next();
  };
};
