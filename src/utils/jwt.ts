import jwt from 'jsonwebtoken';
import type { SignOptions, Secret, JwtPayload as JWTPayloadStd } from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export type JwtPayload = { userId: number; roles: string[] };

const secret: Secret = ENV.JWT.secret;

type Expires = NonNullable<SignOptions['expiresIn']>;
const signOpts: SignOptions = { expiresIn: ENV.JWT.expires as Expires };

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, signOpts);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, secret) as JWTPayloadStd | string;
  if (!decoded || typeof decoded === 'string') throw new Error('Token inválido');
  const { userId, roles } = decoded as any;
  return { userId, roles };
}

export function extractBearer(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}
