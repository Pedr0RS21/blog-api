import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller';
import { zodValidate } from '../middlewares/validation.middleware';
import { isAuthenticated } from '../middlewares/auth.middleware';

// Schemas Zod
const registerSchema = z.object({
  name: z.string().min(2).max(255),
  lastName: z.string().min(2).max(255),
  userName: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phoneNumber: z.string().min(7).max(20).nullable().optional(),
});

const loginSchema = z.object({
  emailOrUserName: z.string().min(3).max(255),
  password: z.string().min(8).max(128),
});

const router = Router();


// Login (acepta email o userName)
router.post('/login', zodValidate(loginSchema), AuthController.login);

export default router;
