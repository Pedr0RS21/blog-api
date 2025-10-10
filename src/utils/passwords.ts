import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';

/** Hashea una contraseña en texto plano usando rounds de .env (BCRYPT_SALT_ROUNDS) */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(ENV.BCRYPT_ROUNDS);
  return bcrypt.hash(plain, salt);
}

/** Compara la contraseña en texto plano contra el hash almacenado */
export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
