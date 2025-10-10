import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Role } from '../entity/Role';
import { hashPassword, comparePassword } from '../utils/passwords';
import { signToken } from '../utils/jwt';
import { DEFAULT_ROLE } from '../constants/roles';

export class AuthController {
  
  static login = async (req: Request, res: Response) => {
    try {
      const { emailOrUserName, password } = req.body as { emailOrUserName: string; password: string };

      const userRepo = AppDataSource.getRepository(User);

      const user = await userRepo.findOne({
        where: [
          { email: emailOrUserName },
          { userName: emailOrUserName },
        ],
      });

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const ok = await comparePassword(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = signToken({ userId: user.id, roles: user.roles.map(r => r.name) });
      return res.json({
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          roles: user.roles.map(r => r.name),
          activo: user.activo,
        },
        token,
      });
    } catch (err) {
      console.error('[AuthController.login]', err);
      return res.status(500).json({ message: 'Error en login' });
    }
  };
}
