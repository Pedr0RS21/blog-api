import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation.middleware";
import { requirePrivileges } from "../middlewares/privileges.middleware";
import { PRIVILEGIOS } from '../constants/privilegios';

const commentRouter = Router();

// POST /api/comentarios/crearComentario - Crear comentario
commentRouter.post('/crearComentario',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.AGREGAR_COMENTARIO),
    body('content')
        .notEmpty().withMessage('El contenido del comentario es requerido')
        .trim()
        .isLength({ min: 3, max: 5000 }).withMessage('El comentario debe tener entre 3 y 5000 caracteres'),
    body('authorId')
        .notEmpty().withMessage('El ID del autor es requerido')
        .isInt().withMessage('El ID del autor debe ser un número entero'),
    body('postId')
        .notEmpty().withMessage('El ID del post es requerido')
        .isInt().withMessage('El ID del post debe ser un número entero'),
    handleInputErrors,
    CommentController.crearComentario
);

// GET /api/comentarios/obtenerComentarios - Listar todos los comentarios
commentRouter.get('/obtenerComentarios',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_COMENTARIOS),
    CommentController.obtenerComentarios
);

// GET /api/comentarios/obtenerComentario/:idComentario - Obtener comentario por ID
commentRouter.get('/obtenerComentario/:idComentario',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_COMENTARIO_ID),
    param('idComentario')
        .isInt().withMessage('ID del comentario no válido'),
    handleInputErrors,
    CommentController.obtenerComentarioPorId
);

// GET /api/comentarios/post/:idPost - Listar comentarios de un post
commentRouter.get('/post/:idPost',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_COMENTARIOS_POST),
    param('idPost')
        .isInt().withMessage('ID del post no válido'),
    handleInputErrors,
    CommentController.obtenerComentariosPorPost
);

// GET /api/comentarios/usuario/:idUsuario - Listar comentarios de un usuario
commentRouter.get('/usuario/:idUsuario',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_COMENTARIOS_USUARIO),
    param('idUsuario')
        .isInt().withMessage('ID del usuario no válido'),
    handleInputErrors,
    CommentController.obtenerComentariosPorUsuario
);

// GET /api/comentarios/post/:idPost/recientes - Obtener comentarios recientes de un post
commentRouter.get('/post/:idPost/recientes',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_COMENTARIOS_POST),
    param('idPost')
        .isInt().withMessage('ID del post no válido'),
    handleInputErrors,
    CommentController.obtenerComentariosRecientesPorPost
);

// PUT /api/comentarios/editarComentario/:idComentario - Editar comentario
commentRouter.put('/editarComentario/:idComentario',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.EDITAR_COMENTARIO),
    param('idComentario')
        .isInt().withMessage('ID del comentario no válido'),
    body('content')
        .notEmpty().withMessage('El contenido del comentario no puede estar vacío')
        .trim()
        .isLength({ min: 3, max: 5000 }).withMessage('El comentario debe tener entre 3 y 5000 caracteres'),
    handleInputErrors,
    CommentController.editarComentario
);

// DELETE /api/comentarios/eliminarComentario/:idComentario - Eliminar comentario
commentRouter.delete('/eliminarComentario/:idComentario',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.ELIMINAR_COMENTARIO),
    param('idComentario')
        .isInt().withMessage('ID del comentario no válido'),
    handleInputErrors,
    CommentController.eliminarComentario
);

// POST /api/comentarios/:idComentario/responder - Responder a un comentario
commentRouter.post('/:idComentario/responder',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.AGREGAR_COMENTARIO),
    param('idComentario')
        .isInt().withMessage('ID del comentario no válido'),
    body('content')
        .notEmpty().withMessage('El contenido de la respuesta es requerido')
        .trim()
        .isLength({ min: 3, max: 5000 }).withMessage('La respuesta debe tener entre 3 y 5000 caracteres'),
    body('authorId')
        .notEmpty().withMessage('El ID del autor es requerido')
        .isInt().withMessage('El ID del autor debe ser un número entero'),
    handleInputErrors,
    CommentController.responderComentario
);

export default commentRouter;