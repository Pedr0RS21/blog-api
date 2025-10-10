/** Nombres de rol soportados en el sistema */
export const ROLES = ['admin', 'editor', 'reader'] as const;

/** Tipo literal derivado de la constante */
export type RoleName = typeof ROLES[number];

/** Rol por defecto para nuevos registros */
export const DEFAULT_ROLE: RoleName = 'reader';

/** Type guard: valida que un string sea un RoleName */
export function isRoleName(value: unknown): value is RoleName {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/** Helper: verifica si el usuario posee al menos uno de los roles requeridos */
export function hasAnyRole(userRoles: readonly string[] | undefined, required: readonly RoleName[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return required.some((r) => userRoles.includes(r));
}

/** Grupos de permisos comunes (útil para routers) */
export const ROLE_GROUPS = {
  adminOnly: ['admin'] as const,
  editorOrAdmin: ['editor', 'admin'] as const,
  anyAuth: ['reader', 'editor', 'admin'] as const,
} as const;