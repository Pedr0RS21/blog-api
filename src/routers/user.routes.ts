import { Router } from "express";
import { UsuarioController } from "../controllers/user.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation.middleware";
import { requirePrivileges } from "../middlewares/privileges.middleware";
import { PRIVILEGIOS } from '../constants/privilegios';

const usuarioRouter = Router();

// POST /api/usuarios - Crear usuario
usuarioRouter.post('/',
    body('name')
        .notEmpty().withMessage('El nombre es requerido'),
    body('lastName')
        .notEmpty().withMessage('El apellido es requerido'),
    body('userName')
        .notEmpty().withMessage('El nombre de usuario es requerido'),
    body('email')
        .notEmpty().withMessage('El correo electrónico es requerido')
        .isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .custom(value => value.length > 7).withMessage('La longitud de la contraseña debe ser mínimo de 8'),
    body('phoneNumber')
        .optional(),
    body('rolesIds')
        .optional()
        .isArray().withMessage('rolesIds debe ser un array'),
    handleInputErrors,
    UsuarioController.agregarUsuario
);

// GET /api/usuarios - Listar usuarios activos
usuarioRouter.get('/',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_USUARIOS),
    UsuarioController.obtenerUsuarios
);

// GET /api/usuarios/:idUsuario/privilegios - Obtener privilegios del usuario
usuarioRouter.get('/:idUsuario/privilegios',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_PRIVILEGIOS_USUARIO),
    param('idUsuario').isInt().withMessage('ID de usuario no válido'),
    handleInputErrors,
    UsuarioController.obtenerPrivilegiosDeUsuario
);

// GET /api/usuarios/:idUsuario - Obtener usuario por ID
usuarioRouter.get('/:idUsuario',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_USUARIO_ID),
    param('idUsuario').isInt().withMessage('ID no válido'),
    handleInputErrors,
    UsuarioController.obtenerUsuarioPorId
);

// PUT /api/usuarios/:idUsuario - Editar usuario
usuarioRouter.put('/:idUsuario',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.EDITAR_USUARIO),
    param('idUsuario').isInt().withMessage('ID no válido'),
    body('name')
        .optional()
        .notEmpty().withMessage('El nombre no puede estar vacío'),
    body('lastName')
        .optional()
        .notEmpty().withMessage('El apellido no puede estar vacío'),
    body('userName')
        .optional()
        .notEmpty().withMessage('El nombre de usuario no puede estar vacío'),
    body('email')
        .optional()
        .isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('password')
        .optional()
        .custom(value => !value || value.length > 7).withMessage('La longitud de la contraseña debe ser mínimo de 8'),
    body('phoneNumber')
        .optional(),
    body('rolesIds')
        .optional(),
    body('activo')
        .optional()
        .isBoolean().withMessage('activo debe ser un valor booleano'),
    handleInputErrors,
    UsuarioController.editarUsuario
);

// PATCH /api/usuarios/:idUsuario/inactivar - Inactivar usuario
usuarioRouter.patch('/:idUsuario/inactivar',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.INACTIVAR_USUARIO),
    param('idUsuario').isInt().withMessage('ID no válido'),
    handleInputErrors,
    UsuarioController.inactivarUsuario
);

// PUT /api/usuarios/:idUsuario/roles - Asignar roles (reemplaza todos)
usuarioRouter.put('/:idUsuario/roles',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.ASIGNAR_ROLES_USUARIO),
    param('idUsuario').isInt().withMessage('ID de usuario no válido'),
    body('rolesIds')
        .notEmpty().withMessage('El array de roles es requerido')
        .isArray().withMessage('rolesIds debe ser un array'),
    handleInputErrors,
    UsuarioController.asignarRoles
);

// POST /api/usuarios/:idUsuario/roles - Agregar roles (sin quitar existentes)
usuarioRouter.post('/:idUsuario/roles',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.AGREGAR_ROLES_USUARIO),
    param('idUsuario').isInt().withMessage('ID de usuario no válido'),
    body('rolesIds')
        .notEmpty().withMessage('El array de roles es requerido')
        .isArray().withMessage('rolesIds debe ser un array'),
    handleInputErrors,
    UsuarioController.agregarRoles
);

// DELETE /api/usuarios/:idUsuario/roles/todos - Remover todos los roles
usuarioRouter.delete('/:idUsuario/roles/todos',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.REMOVER_TODOS_ROLES_USUARIO),
    param('idUsuario').isInt().withMessage('ID de usuario no válido'),
    handleInputErrors,
    UsuarioController.removerTodosLosRoles
);

// DELETE /api/usuarios/:idUsuario/roles - Remover roles específicos
usuarioRouter.delete('/:idUsuario/roles',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.REMOVER_ROLES_USUARIO),
    param('idUsuario').isInt().withMessage('ID de usuario no válido'),
    body('rolesIds')
        .notEmpty().withMessage('El array de roles es requerido')
        .isArray().withMessage('rolesIds debe ser un array'),
    handleInputErrors,
    UsuarioController.removerRoles
);

export default usuarioRouter;