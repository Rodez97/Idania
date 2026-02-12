import type { AstroCookies } from 'astro';

const SESSION_COOKIE_NAME = 'session_user_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export interface Session {
  userId: string;
}

/**
 * Obtener la sesión actual desde las cookies
 */
export function getSession(cookies: AstroCookies): Session | null {
  const userId = cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  return { userId };
}

/**
 * Crear una nueva sesión
 */
export function createSession(cookies: AstroCookies, userId: string): void {
  cookies.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: import.meta.env.PROD, // Solo HTTPS en producción
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Destruir la sesión actual
 */
export function destroySession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE_NAME, {
    path: '/',
  });
}

/**
 * Verificar si el usuario está autenticado
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
  return getSession(cookies) !== null;
}
