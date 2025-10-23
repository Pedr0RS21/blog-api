import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation.middleware";
import { requirePrivileges } from "../middlewares/privileges.middleware";
import { PRIVILEGIOS } from '../constants/privilegios';

const postRouter = Router();

// POST /api/posts/crearPost - Crear post
postRouter.post('/crearPost',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.AGREGAR_POST),
    body('title')
        .notEmpty().withMessage('El título es requerido')
        .trim()
        .isLength({ min: 3, max: 180 }).withMessage('El título debe tener entre 3 y 180 caracteres'),
    body('content')
        .notEmpty().withMessage('El contenido es requerido')
        .isLength({ min: 10 }).withMessage('El contenido debe tener mínimo 10 caracteres'),
    body('authorId')
        .notEmpty().withMessage('El ID del autor es requerido')
        .isInt().withMessage('El ID del autor debe ser un número entero'),
    handleInputErrors,
    PostController.crearPost
);

// GET /api/posts/obtenerPosts - Listar todos los posts
postRouter.get('/obtenerPosts',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_POSTS),
    PostController.obtenerPosts
);

// GET /api/posts/obtenerPost/:idPost - Obtener post por ID
postRouter.get('/obtenerPost/:idPost',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_POST_ID),
    param('idPost').isInt().withMessage('ID no válido'),
    handleInputErrors,
    PostController.obtenerPostPorId
);

// GET /api/posts/usuario/:idUsuario - Obtener posts de un usuario
postRouter.get('/usuario/:idUsuario',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_POSTS_USUARIO),
    param('idUsuario').isInt().withMessage('ID de usuario no válido'),
    handleInputErrors,
    PostController.obtenerPostsPorUsuario
);

// PUT /api/posts/editarPost/:idPost - Editar post
postRouter.put('/editarPost/:idPost',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.EDITAR_POST),
    param('idPost').isInt().withMessage('ID no válido'),
    body('title')
        .optional()
        .notEmpty().withMessage('El título no puede estar vacío')
        .trim()
        .isLength({ min: 3, max: 180 }).withMessage('El título debe tener entre 3 y 180 caracteres'),
    body('content')
        .optional()
        .notEmpty().withMessage('El contenido no puede estar vacío')
        .isLength({ min: 10 }).withMessage('El contenido debe tener mínimo 10 caracteres'),
    handleInputErrors,
    PostController.editarPost
);

// DELETE /api/posts/eliminarPost/:idPost - Eliminar post
postRouter.delete('/eliminarPost/:idPost',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.ELIMINAR_POST),
    param('idPost').isInt().withMessage('ID no válido'),
    handleInputErrors,
    PostController.eliminarPost
);

// POST /api/posts/:idPost/comentarios - Agregar comentario a un post
postRouter.post('/:idPost/comentarios',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.AGREGAR_COMENTARIO),
    param('idPost').isInt().withMessage('ID del post no válido'),
    body('content')
        .notEmpty().withMessage('El contenido del comentario es requerido')
        .isLength({ min: 3 }).withMessage('El comentario debe tener mínimo 3 caracteres'),
    body('authorId')
        .notEmpty().withMessage('El ID del autor es requerido')
        .isInt().withMessage('El ID del autor debe ser un número entero'),
    handleInputErrors,
    PostController.agregarComentario
);

// GET /api/posts/:idPost/comentarios - Listar comentarios de un post
postRouter.get('/:idPost/comentarios',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.OBTENER_COMENTARIOS_POST),
    param('idPost').isInt().withMessage('ID del post no válido'),
    handleInputErrors,
    PostController.obtenerComentarios
);

// DELETE /api/posts/:idPost/comentarios/:idComentario - Eliminar comentario
postRouter.delete('/:idPost/comentarios/:idComentario',
    isAuthenticated,
    requirePrivileges(PRIVILEGIOS.ELIMINAR_COMENTARIO),
    param('idPost').isInt().withMessage('ID del post no válido'),
    param('idComentario').isInt().withMessage('ID del comentario no válido'),
    handleInputErrors,
    PostController.eliminarComentario
);

export default postRouter;