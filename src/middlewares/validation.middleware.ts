import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import type { ZodObject } from 'zod';

/** Middleware para validar req.body con Zod */
export const zodValidate = (schema: ZodObject): RequestHandler => {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ errors });
    }
    // reemplaza body con datos validados/parseados
    req.body = parsed.data;
    next();
  };
};

/** Middleware para manejar errores de express-validator */
export const handleInputErrors: RequestHandler = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  next();
};