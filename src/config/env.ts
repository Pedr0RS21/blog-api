import { config } from 'dotenv';
config();

/**
 * Normaliza nombres distintos de contraseña:
 * - producción/dev: BD_PASSWORD o BD_CONTRASENA
 * - test: BDTEST_CONTRASENA o BDTEST_PASSWORD
 */
function pickPassword(isTest: boolean) {
  if (isTest) {
    return process.env.BDTEST_CONTRASENA ?? process.env.BDTEST_PASSWORD ?? '';
  }
  return process.env.BD_PASSWORD ?? process.env.BD_CONTRASENA ?? '';
}

const isTest = process.env.NODE_ENV === 'test';

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),

  // DB: usa el prefijo BD* o BDTEST* según NODE_ENV
  DB: {
    type: (process.env.DB_TYPE as any) ?? 'mariadb', // pon 'mysql' si usas mysql2
    host: isTest ? (process.env.BDTEST_HOST ?? 'localhost') : (process.env.BD_HOST ?? 'localhost'),
    name: isTest ? (process.env.BDTEST_NOMBRE ?? 'blog_api_test') : (process.env.BD_NOMBRE ?? 'blog_api'),
    user: isTest ? (process.env.BDTEST_USUARIO ?? 'root') : (process.env.BD_USUARIO ?? 'root'),
    pass: pickPassword(isTest),
    port: Number(process.env.DB_PORT ?? 3306),
  },

  JWT: {
    secret: process.env.JWT_SECRET ?? 'change_me',
    expires: process.env.JWT_EXPIRES ?? '1d',
  },

  CORS_ORIGIN: process.env.FRONTEND_URL ?? 'http://localhost:8080',
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
};
