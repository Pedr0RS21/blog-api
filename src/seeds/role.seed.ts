import 'reflect-metadata';
import { PRIVILEGIOS } from "../constants/privilegios.js";
import { AppDataSource } from "../data-source.js";
import { Role } from "../entity/Role.js";
import { User } from "../entity/User.js";
import bcrypt from 'bcryptjs';

async function hashContrasena(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function seedPrivilegios() {
  try {
    const repoRol = AppDataSource.getRepository(Role);
    const repoUsuario = AppDataSource.getRepository(User);

    // Obtener todos los privilegios del sistema
    const todosLosPrivilegios = Object.values(PRIVILEGIOS);

    // Buscar o crear el rol 'Administrador'
    let adminRol = await repoRol.findOne({ 
      where: { name: 'Administrador' } 
    });

    if (!adminRol) {
      adminRol = repoRol.create({
        name: 'Administrador',
        description: 'Rol con acceso completo al sistema. Tiene todos los privilegios disponibles.',
        active: true,
        privilegios: todosLosPrivilegios
      });
    } else {
      adminRol.privilegios = todosLosPrivilegios;
      adminRol.description = 'Rol con acceso completo al sistema. Tiene todos los privilegios disponibles.';
      adminRol.active = true;
    }

    await repoRol.save(adminRol);

    // Verificar y crear el usuario administrador
    let adminUsuario = await repoUsuario.findOne({ 
      where: { userName: 'admin' },
      relations: ['roles']
    });

    if (!adminUsuario) {
      const contrasenaHasheada = await hashContrasena('Admin123');
      
      adminUsuario = repoUsuario.create({
        name: 'Administrador',
        lastName: 'Sistema',
        userName: 'admin',
        passwordHash: contrasenaHasheada,
        email: 'admin@blog.mx',
        phoneNumber: null,
        activo: true,
        roles: [adminRol]  
      });

      await repoUsuario.save(adminUsuario);
      console.log('Usuario admin creado');
    } else {
      // Verificar que tenga el rol de administrador
      const tieneRolAdmin = adminUsuario.roles?.some(r => r.id === adminRol.id);
      
      if (!tieneRolAdmin) {
        if (!adminUsuario.roles) {
          adminUsuario.roles = [];
        }
        adminUsuario.roles.push(adminRol);
        await repoUsuario.save(adminUsuario);
      }
    }

    return {
      rol: adminRol,
      usuario: adminUsuario,
      totalPrivilegios: adminRol.privilegios.length
    };

  } catch (error) {
    console.error('Error durante el seed:', error);
    throw error;
  }
}