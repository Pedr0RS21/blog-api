import type { Request, Response } from 'express';
import { In } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { User } from '../entity/User.js';
import { Role } from '../entity/Role.js';
import { hashPassword } from '../utils/passwords.js';

function toDTO(u: User) {
  return {
    id: u.id,
    name: u.name,
    lastName: u.lastName,
    userName: u.userName,
    email: u.email,
    phoneNumber: u.phoneNumber,
    activo: u.activo,
    roles: u.roles?.map(r => ({ id: r.id, name: r.name })) ?? [],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export class UsuarioController {
  /** POST /api/usuarios  (crear) */
  static agregarUsuario = async (req: Request, res: Response) => {
    try {
      const { name, lastName, userName, email, password, phoneNumber, rolesIds } = req.body as {
        name: string; lastName: string; userName: string; email: string; password: string;
        phoneNumber?: string | null; rolesIds?: number[];
      };

      const userRepo = AppDataSource.getRepository(User);
      const roleRepo = AppDataSource.getRepository(Role);

      // unicidad
      const dupe = await userRepo.findOne({ where: [{ email }, { userName }] });
      if (dupe) return res.status(409).json({ error: 'Email o userName ya en uso' });

      const user = new User();
      user.name = name;
      user.lastName = lastName;
      user.userName = userName;
      user.email = email;
      user.passwordHash = await hashPassword(password);
      user.phoneNumber = phoneNumber ?? null;
      user.activo = true;

      // roles opcionales vía IDs
      if (rolesIds && Array.isArray(rolesIds) && rolesIds.length > 0) {
        const roles = await roleRepo.find({ where: { id: In(rolesIds), active: true } });
        if (roles.length === 0) {
          return res.status(400).json({ error: 'No se encontraron roles válidos con los IDs proporcionados.' });
        }
        user.roles = roles;
      } else {
        user.roles = [];
      }

      await userRepo.save(user);
      return res.status(201).json(toDTO(user));
    } catch (error) {
      console.error('[UsuarioController.agregarUsuario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al agregar al usuario.' });
    }
  };

  /** GET /api/usuarios  (listar activos) */
  static obtenerUsuarios = async (_req: Request, res: Response) => {
    try {
      const repo = AppDataSource.getRepository(User);
      const usuarios = await repo.find({
        where: { activo: true },
      });
      return res.status(200).json(usuarios.map(toDTO));
    } catch (error) {
      console.error('[UsuarioController.obtenerUsuarios]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los usuarios.' });
    }
  };

  /** GET /api/usuarios/:idUsuario */
  static obtenerUsuarioPorId = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idUsuario);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido' });

      const repo = AppDataSource.getRepository(User);
      const usuario = await repo.findOne({ where: { id, activo: true } });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      return res.status(200).json(toDTO(usuario));
    } catch (error) {
      console.error('[UsuarioController.obtenerUsuarioPorId]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener el usuario.' });
    }
  };

  /** PUT /api/usuarios/:idUsuario */
  static editarUsuario = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idUsuario);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido' });

      const { name, lastName, userName, email, password, phoneNumber, rolesIds, activo } = req.body as {
        name?: string; lastName?: string; userName?: string; email?: string; password?: string;
        phoneNumber?: string | null; rolesIds?: number[] | null; activo?: boolean;
      };

      const userRepo = AppDataSource.getRepository(User);
      const roleRepo = AppDataSource.getRepository(Role);

      const usuario = await userRepo.findOne({ where: { id } });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      // unicidad si cambian email/userName
      if (email && email !== usuario.email) {
        const dupeEmail = await userRepo.findOne({ where: { email } });
        if (dupeEmail) return res.status(409).json({ error: 'Email ya en uso' });
        usuario.email = email;
      }
      if (userName && userName !== usuario.userName) {
        const dupeUN = await userRepo.findOne({ where: { userName } });
        if (dupeUN) return res.status(409).json({ error: 'userName ya en uso' });
        usuario.userName = userName;
      }

      if (name) usuario.name = name;
      if (lastName) usuario.lastName = lastName;
      if (typeof phoneNumber !== 'undefined') usuario.phoneNumber = phoneNumber ?? null;
      if (typeof activo === 'boolean') usuario.activo = activo;
      if (password) usuario.passwordHash = await hashPassword(password);

      // Actualizar roles según rolesIds:
      if (rolesIds !== undefined) {
        if (rolesIds === null || (Array.isArray(rolesIds) && rolesIds.length === 0)) {
          usuario.roles = [];
        } else if (Array.isArray(rolesIds)) {
          const roles = await roleRepo.find({ where: { id: In(rolesIds), active: true } });
          if (rolesIds.length > 0 && roles.length === 0) {
            return res.status(400).json({ error: 'No se encontraron roles válidos con los IDs proporcionados.' });
          }
          usuario.roles = roles;
        }
      }

      await userRepo.save(usuario);
      return res.status(200).json(toDTO(usuario));
    } catch (error) {
      console.error('[UsuarioController.editarUsuario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al editar el usuario.' });
    }
  };

  /** PATCH /api/usuarios/:idUsuario/inactivar */
  static inactivarUsuario = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idUsuario);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido' });

      const repo = AppDataSource.getRepository(User);
      const usuario = await repo.findOne({ where: { id } });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      usuario.activo = false;
      await repo.save(usuario);
      return res.status(200).json(toDTO(usuario));
    } catch (error) {
      console.error('[UsuarioController.inactivarUsuario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al inactivar el usuario.' });
    }
  };

  /** PUT /api/usuarios/:idUsuario/roles  (reemplaza todos los roles) */
  static asignarRoles = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idUsuario);
      const { rolesIds } = req.body as { rolesIds: number[] };

      if (!Array.isArray(rolesIds)) {
        return res.status(400).json({ error: 'Debe proporcionar un array de IDs de roles.' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const roleRepo = AppDataSource.getRepository(Role);

      const usuario = await userRepo.findOne({ where: { id } });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

      const roles = await roleRepo.find({ where: { id: In(rolesIds), active: true } });
      if (rolesIds.length > 0 && roles.length === 0) {
        return res.status(400).json({ error: 'No se encontraron roles válidos con los IDs proporcionados.' });
      }

      usuario.roles = roles;
      await userRepo.save(usuario);

      return res.status(200).json({ success: true, data: toDTO(usuario), message: 'Roles asignados exitosamente' });
    } catch (error) {
      console.error('[UsuarioController.asignarRoles]', error);
      return res.status(500).json({ error: 'Ocurrió un error al asignar los roles.' });
    }
  };

  /** POST /api/usuarios/:idUsuario/roles  (agrega sin quitar los existentes) */
  static agregarRoles = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idUsuario);
      const { rolesIds } = req.body as { rolesIds: number[] };

      if (!Array.isArray(rolesIds)) {
        return res.status(400).json({ error: 'Debe proporcionar un array de IDs de roles.' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const roleRepo = AppDataSource.getRepository(Role);

      const usuario = await userRepo.findOne({ where: { id }, relations: ['roles'] });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

      const nuevosRoles = await roleRepo.find({ where: { id: In(rolesIds), active: true } });
      if (rolesIds.length > 0 && nuevosRoles.length === 0) {
        return res.status(400).json({ error: 'No se encontraron roles válidos con los IDs proporcionados.' });
      }

      const existentesIds = (usuario.roles ?? []).map(r => r.id);
      const paraAgregar = nuevosRoles.filter(r => !existentesIds.includes(r.id));

      usuario.roles = [...(usuario.roles ?? []), ...paraAgregar];
      await userRepo.save(usuario);

      return res.status(200).json({
        success: true,
        data: toDTO(usuario),
        rolesAgregados: paraAgregar.length,
        message: 'Roles agregados exitosamente',
      });
    } catch (error) {
      console.error('[UsuarioController.agregarRoles]', error);
      return res.status(500).json({ error: 'Ocurrió un error al agregar los roles.' });
    }
  };

  /** DELETE /api/usuarios/:idUsuario/roles  (remueve roles dados) */
  static removerRoles = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idUsuario);
      const { rolesIds } = req.body as { rolesIds: number[] };

      if (!Array.isArray(rolesIds)) {
        return res.status(400).json({ error: 'Debe proporcionar un array de IDs de roles a remover.' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const usuario = await userRepo.findOne({ where: { id }, relations: ['roles'] });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

      const originales = usuario.roles?.length ?? 0;
      usuario.roles = (usuario.roles ?? []).filter(r => !rolesIds.includes(r.id));
      const rolesRemovidos = originales - (usuario.roles?.length ?? 0);

      await userRepo.save(usuario);
      return res.status(200).json({ success: true, data: toDTO(usuario), rolesRemovidos, message: 'Roles removidos' });
    } catch (error) {
      console.error('[UsuarioController.removerRoles]', error);
      return res.status(500).json({ error: 'Ocurrió un error al remover los roles.' });
    }
  };

  /** DELETE /api/usuarios/:idUsuario/roles/todos */
  static removerTodosLosRoles = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idUsuario);
      const userRepo = AppDataSource.getRepository(User);
      const usuario = await userRepo.findOne({ where: { id }, relations: ['roles'] });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

      const rolesRemovidos = usuario.roles?.length ?? 0;
      usuario.roles = [];
      await userRepo.save(usuario);

      return res.status(200).json({ success: true, data: toDTO(usuario), rolesRemovidos, message: 'Todos los roles removidos' });
    } catch (error) {
      console.error('[UsuarioController.removerTodosLosRoles]', error);
      return res.status(500).json({ error: 'Ocurrió un error al remover los roles.' });
    }
  };

  /** GET /api/usuarios/:idUsuario/privilegios */
  static obtenerPrivilegiosDeUsuario = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idUsuario);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido' });

      const userRepo = AppDataSource.getRepository(User);
      const usuario = await userRepo.findOne({ where: { id, activo: true } });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

      const privilegios = new Set<string>();
      (usuario.roles ?? []).forEach(rol => {
        if (rol.active && Array.isArray(rol.privilegios)) {
          rol.privilegios.forEach(p => privilegios.add(p));
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          usuario: toDTO(usuario),
          privilegios: Array.from(privilegios),
          totalPrivilegios: privilegios.size,
        },
      });
    } catch (error) {
      console.error('[UsuarioController.obtenerPrivilegiosDeUsuario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los privilegios.' });
    }
  };
}
