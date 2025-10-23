import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation.middleware";
import { requirePrivileges } from "../middlewares/privileges.middleware";
import { PRIVILEGIOS } from '../constants/privilegios';

const roleRouter = Router();

// POST /api/roles - Crear rol
roleRouter.post('/crearRol',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.AGREGAR_ROL),
    body('name')
        .notEmpty().withMessage('El nombre del rol es requerido')
        .trim()
        .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('description')
        .optional(),
    body('privilegios')
        .optional()
        .isArray().withMessage('privilegios debe ser un array'),
    handleInputErrors,
    RoleController.agregarRole
);

// GET /api/roles - Listar roles activos
roleRouter.get('/obtenerRoles',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_ROLES),
    RoleController.obtenerRoles
);

// GET /api/roles/:idRole - Obtener rol por ID
roleRouter.get('obtenerRol/:idRole',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_ROL_ID),
    param('idRole').isInt().withMessage('ID no válido'),
    handleInputErrors,
    RoleController.obtenerRolePorId
);

// PUT /api/roles/:idRole - Editar rol
roleRouter.put('editarRol/:idRole',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.EDITAR_ROL),
    param('idRole').isInt().withMessage('ID no válido'),
    body('name')
        .optional()
        .notEmpty().withMessage('El nombre no puede estar vacío')
        .trim()
        .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('description')
        .optional(),
    body('privilegios')
        .optional()
        .isArray().withMessage('privilegios debe ser un array'),
    body('active')
        .optional()
        .isBoolean().withMessage('active debe ser un valor booleano'),
    handleInputErrors,
    RoleController.editarRole
);

// PATCH /api/roles/:idRole/inactivar - Inactivar rol
roleRouter.patch('/:idRole/inactivar',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.INACTIVAR_ROL),
    param('idRole').isInt().withMessage('ID no válido'),
    handleInputErrors,
    RoleController.inactivarRole
);

// PUT /api/roles/:idRole/privilegios - Asignar privilegios (reemplaza todos)
roleRouter.put('/:idRole/privilegios',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.ASIGNAR_PRIVILEGIOS_A_ROL),
    param('idRole').isInt().withMessage('ID de rol no válido'),
    body('privilegios')
        .notEmpty().withMessage('El array de privilegios es requerido')
        .isArray().withMessage('privilegios debe ser un array'),
    handleInputErrors,
    RoleController.asignarPrivilegios
);

// POST /api/roles/:idRole/privilegios - Agregar privilegios (sin quitar existentes)
roleRouter.post('/:idRole/privilegios',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.ASIGNAR_PRIVILEGIOS_A_ROL),
    param('idRole').isInt().withMessage('ID de rol no válido'),
    body('privilegios')
        .notEmpty().withMessage('El array de privilegios es requerido')
        .isArray().withMessage('privilegios debe ser un array'),
    handleInputErrors,
    RoleController.agregarPrivilegios
);

// DELETE /api/roles/:idRole/privilegios/todos - Remover todos los privilegios
roleRouter.delete('/:idRole/privilegios/todos',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.REMOVER_PRIVILEGIOS_A_ROL),
    param('idRole').isInt().withMessage('ID de rol no válido'),
    handleInputErrors,
    RoleController.removerTodosLosPrivilegios
);

// DELETE /api/roles/:idRole/privilegios - Remover privilegios específicos
roleRouter.delete('/:idRole/privilegios',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.REMOVER_PRIVILEGIOS_A_ROL),
    param('idRole').isInt().withMessage('ID de rol no válido'),
    body('privilegios')
        .notEmpty().withMessage('El array de privilegios es requerido')
        .isArray().withMessage('privilegios debe ser un array'),
    handleInputErrors,
    RoleController.removerPrivilegios
);

export default roleRouter;