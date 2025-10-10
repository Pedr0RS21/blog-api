import type { RequestHandler } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

export const requirePrivileges = (...privileges: string[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ 
        where: { id: userId, activo: true },
        relations: ['roles']
      });

      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      // Recolectar todos los privilegios de los roles activos del usuario
      const userPrivileges = new Set<string>();
      (user.roles ?? []).forEach(role => {
        if (role.active && Array.isArray(role.privilegios)) {
          role.privilegios.forEach(p => userPrivileges.add(p));
        }
      });

      // Verificar si el usuario tiene al menos uno de los privilegios requeridos
      const hasPrivilege = privileges.some(p => userPrivileges.has(p));
      
      if (!hasPrivilege) {
        return res.status(403).json({ message: 'Permisos insuficientes' });
      }

      next();
    } catch (error) {
      console.error('[requirePrivileges]', error);
      return res.status(500).json({ message: 'Error al verificar privilegios' });
    }
  };
};