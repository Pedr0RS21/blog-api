import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routers/auth.routes.js';
import userRoutes from './routers/user.routes.js';
import roleRouter from './routers/role.router.js';
import postRouter from './routers/post.routes.js';
import commentRouter from './routers/comment.routes.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Salud
app.get('/health', (_req, res) => res.json({ ok: true, env: ENV.NODE_ENV }));

// Rutas públicas (login)
app.use('/api/auth', authRoutes);
//Ruta para el CRUD de usuarios
app.use('/api/users', userRoutes);
//Ruta para el CRUD de roles
app.use('/api/roles', roleRouter); 
//Ruta para el CRUD de los post
app.use('api/post',postRouter)
//Ruta para el CRUD de los comentarios
app.use('api/comment',commentRouter)

// ERROR 404
app.use((_req, res) => res.status(404).json({ message: 'Recurso no encontrado' }));

// Manejador de errores (último)
app.use(errorHandler);

export default app;
