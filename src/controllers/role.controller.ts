import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Role } from '../entity/Role.js';

function toDTO(r: Role) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    active: r.active,
    privilegios: r.privilegios ?? [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export class RoleController {
  /** POST /api/roles (crear) */
  static agregarRole = async (req: Request, res: Response) => {
    try {
      const { name, description, privilegios } = req.body as {
        name: string;
        description?: string | null;
        privilegios?: string[];
      };

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'El nombre del rol es obligatorio.' });
      }

      const roleRepo = AppDataSource.getRepository(Role);

      // Verificar unicidad del nombre
      const dupe = await roleRepo.findOne({ where: { name } });
      if (dupe) {
        return res.status(409).json({ error: 'Ya existe un rol con ese nombre.' });
      }

      const role = new Role();
      role.name = name.trim();
      role.description = description ?? null;
      role.privilegios = Array.isArray(privilegios) ? privilegios : [];
      role.active = true;

      await roleRepo.save(role);
      return res.status(201).json(toDTO(role));
    } catch (error) {
      console.error('[RoleController.agregarRole]', error);
      return res.status(500).json({ error: 'Ocurrió un error al agregar el rol.' });
    }
  };

  /** GET /api/roles (listar activos) */
  static obtenerRoles = async (_req: Request, res: Response) => {
    try {
      const repo = AppDataSource.getRepository(Role);
      const roles = await repo.find({
        where: { active: true },
      });
      return res.status(200).json(roles.map(toDTO));
    } catch (error) {
      console.error('[RoleController.obtenerRoles]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los roles.' });
    }
  };

  /** GET /api/roles/:idRole */
  static obtenerRolePorId = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idRole);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const repo = AppDataSource.getRepository(Role);
      const role = await repo.findOne({ where: { id, active: true } });
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }

      return res.status(200).json(toDTO(role));
    } catch (error) {
      console.error('[RoleController.obtenerRolePorId]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener el rol.' });
    }
  };

  /** PUT /api/roles/:idRole */
  static editarRole = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idRole);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { name, description, privilegios, active } = req.body as {
        name?: string;
        description?: string | null;
        privilegios?: string[];
        active?: boolean;
      };

      const roleRepo = AppDataSource.getRepository(Role);

      const role = await roleRepo.findOne({ where: { id } });
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }

      // Verificar unicidad del nombre si cambia
      if (name && name.trim() !== '' && name !== role.name) {
        const dupeName = await roleRepo.findOne({ where: { name } });
        if (dupeName) {
          return res.status(409).json({ error: 'Ya existe un rol con ese nombre.' });
        }
        role.name = name.trim();
      }

      if (typeof description !== 'undefined') {
        role.description = description ?? null;
      }
      if (Array.isArray(privilegios)) {
        role.privilegios = privilegios;
      }
      if (typeof active === 'boolean') {
        role.active = active;
      }

      await roleRepo.save(role);
      return res.status(200).json(toDTO(role));
    } catch (error) {
      console.error('[RoleController.editarRole]', error);
      return res.status(500).json({ error: 'Ocurrió un error al editar el rol.' });
    }
  };

  /** PATCH /api/roles/:idRole/inactivar */
  static inactivarRole = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idRole);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const repo = AppDataSource.getRepository(Role);
      const role = await repo.findOne({ where: { id } });
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }

      role.active = false;
      await repo.save(role);
      return res.status(200).json(toDTO(role));
    } catch (error) {
      console.error('[RoleController.inactivarRole]', error);
      return res.status(500).json({ error: 'Ocurrió un error al inactivar el rol.' });
    }
  };

  /** PUT /api/roles/:idRole/privilegios (reemplaza todos los privilegios) */
  static asignarPrivilegios = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idRole);
      const { privilegios } = req.body as { privilegios: string[] };

      if (!Array.isArray(privilegios)) {
        return res.status(400).json({ error: 'Debe proporcionar un array de privilegios.' });
      }

      const roleRepo = AppDataSource.getRepository(Role);

      const role = await roleRepo.findOne({ where: { id } });
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado.' });
      }

      role.privilegios = privilegios;
      await roleRepo.save(role);

      return res.status(200).json({
        success: true,
        data: toDTO(role),
        message: 'Privilegios asignados exitosamente',
      });
    } catch (error) {
      console.error('[RoleController.asignarPrivilegios]', error);
      return res.status(500).json({ error: 'Ocurrió un error al asignar los privilegios.' });
    }
  };

  /** POST /api/roles/:idRole/privilegios (agrega sin quitar los existentes) */
  static agregarPrivilegios = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idRole);
      const { privilegios } = req.body as { privilegios: string[] };

      if (!Array.isArray(privilegios)) {
        return res.status(400).json({ error: 'Debe proporcionar un array de privilegios.' });
      }

      const roleRepo = AppDataSource.getRepository(Role);

      const role = await roleRepo.findOne({ where: { id } });
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado.' });
      }

      const privilegiosExistentes = new Set(role.privilegios ?? []);
      const nuevosPrivilegios = privilegios.filter(p => !privilegiosExistentes.has(p));

      role.privilegios = [...(role.privilegios ?? []), ...nuevosPrivilegios];
      await roleRepo.save(role);

      return res.status(200).json({
        success: true,
        data: toDTO(role),
        privilegiosAgregados: nuevosPrivilegios.length,
        message: 'Privilegios agregados exitosamente',
      });
    } catch (error) {
      console.error('[RoleController.agregarPrivilegios]', error);
      return res.status(500).json({ error: 'Ocurrió un error al agregar los privilegios.' });
    }
  };

  /** DELETE /api/roles/:idRole/privilegios (remueve privilegios dados) */
  static removerPrivilegios = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idRole);
      const { privilegios } = req.body as { privilegios: string[] };

      if (!Array.isArray(privilegios)) {
        return res.status(400).json({ error: 'Debe proporcionar un array de privilegios a remover.' });
      }

      const roleRepo = AppDataSource.getRepository(Role);
      const role = await roleRepo.findOne({ where: { id } });
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado.' });
      }

      const privilegiosParaRemover = new Set(privilegios);
      const originales = role.privilegios?.length ?? 0;
      role.privilegios = (role.privilegios ?? []).filter(p => !privilegiosParaRemover.has(p));
      const privilegiosRemovidos = originales - role.privilegios.length;

      await roleRepo.save(role);
      return res.status(200).json({
        success: true,
        data: toDTO(role),
        privilegiosRemovidos,
        message: 'Privilegios removidos',
      });
    } catch (error) {
      console.error('[RoleController.removerPrivilegios]', error);
      return res.status(500).json({ error: 'Ocurrió un error al remover los privilegios.' });
    }
  };

  /** DELETE /api/roles/:idRole/privilegios/todos */
  static removerTodosLosPrivilegios = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idRole);
      const roleRepo = AppDataSource.getRepository(Role);
      const role = await roleRepo.findOne({ where: { id } });
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado.' });
      }

      const privilegiosRemovidos = role.privilegios?.length ?? 0;
      role.privilegios = [];
      await roleRepo.save(role);

      return res.status(200).json({
        success: true,
        data: toDTO(role),
        privilegiosRemovidos,
        message: 'Todos los privilegios removidos',
      });
    } catch (error) {
      console.error('[RoleController.removerTodosLosPrivilegios]', error);
      return res.status(500).json({ error: 'Ocurrió un error al remover los privilegios.' });
    }
  };
}