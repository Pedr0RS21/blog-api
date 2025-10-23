// ======== USUARIOS ========
const USUARIOS = {
  // Crear
  AGREGAR_USUARIO: 'agregar_usuario',
  // Leer
  OBTENER_USUARIOS: 'obtener_usuarios',
  OBTENER_USUARIO_ID: 'obtener_usuario_id',
  // Editar
  EDITAR_USUARIO: 'editar_usuario',
  // Inactivar/Eliminar
  INACTIVAR_USUARIO: 'inactivar_usuario',
  // Roles
  ASIGNAR_ROLES_USUARIO: 'asignar_roles_usuario',           // reemplazar todos
  AGREGAR_ROLES_USUARIO: 'agregar_roles_usuario',           // agregar sin quitar
  REMOVER_ROLES_USUARIO: 'remover_roles_usuario',
  REMOVER_TODOS_ROLES_USUARIO: 'remover_todos_roles_usuario',
  // Privilegios derivados
  OBTENER_PRIVILEGIOS_USUARIO: 'obtener_privilegios_usuario',
} as const;

// ======== ROLES ========
const ROLES = {
  AGREGAR_ROL: 'agregar_rol',
  OBTENER_ROLES: 'obtener_roles',
  OBTENER_ROL_ID: 'obtener_rol_id',
  EDITAR_ROL: 'editar_rol',
  INACTIVAR_ROL: 'inactivar_rol',
  ACTIVAR_ROL: 'activar_rol',
  ASIGNAR_PRIVILEGIOS_A_ROL: 'asignar_privilegios_a_rol',
  REMOVER_PRIVILEGIOS_A_ROL: 'remover_privilegios_a_rol',
  OBTENER_PRIVILEGIOS_POR_ROL: 'obtener_privilegios_por_rol',
} as const;

// ======== POSTS (PUBLICACIONES) ========
const POSTS = {
  AGREGAR_POST: 'agregar_post',
  OBTENER_POSTS: 'obtener_posts',
  OBTENER_POST_ID: 'obtener_post_id',
  OBTENER_POSTS_USUARIO: 'obtener_posts_usuario',
  EDITAR_POST: 'editar_post',
  ELIMINAR_POST: 'eliminar_post',
  PUBLICAR_POST: 'publicar_post',         // si manejas estado publicado/borrador
  DESPUBLICAR_POST: 'despublicar_post',
} as const;

// ======== COMENTARIOS ========
const COMENTARIOS = {
  AGREGAR_COMENTARIO: 'agregar_comentario',
  OBTENER_COMENTARIOS: 'obtener_comentarios',     // por post o global
  OBTENER_COMENTARIO_ID: 'obtener_comentario_id',
  OBTENER_COMENTARIOS_POST: 'obtener_comentarios_post',
  OBTENER_COMENTARIOS_USUARIO: 'obtener_comentarios_usuario',
  EDITAR_COMENTARIO: 'editar_comentario',
  ELIMINAR_COMENTARIO: 'eliminar_comentario',
  MODERAR_COMENTARIO: 'moderar_comentario',       // ocultar/aprobar, si aplica
} as const;

// ======== AUTENTICACIÓN / SISTEMA ========
const SISTEMA = {
  LOGIN: 'login',                     // POST /auth/login
  REGISTER: 'register',               // POST /auth/register
  VER_ME: 'ver_me',                   // acceder a /auth/me (obtener usuario autenticado)
  VER_HEALTH: 'ver_health',           // GET /health (si lo proteges)
} as const;

/**
 * Mapa completo de privilegios de la API
 * Exporta una sola constante con todo
 */
export const PRIVILEGIOS = {
  ...USUARIOS,
  ...ROLES,
  ...POSTS,
  ...COMENTARIOS,
  ...SISTEMA,
} as const;

export type PrivilegioClave = keyof typeof PRIVILEGIOS;
export type PrivilegioValor = (typeof PRIVILEGIOS)[PrivilegioClave];