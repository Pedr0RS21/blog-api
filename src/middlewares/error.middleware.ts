import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err);
  const status = (err as any)?.status ?? 500;
  const message = (err as any)?.message ?? (status === 500 ? 'Error interno del servidor' : 'Error');
  res.status(status).json({ message });
};
