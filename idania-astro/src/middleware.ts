import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/session';
import { dbOperations } from './lib/db';

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
];

export const onRequest = defineMiddleware(async ({ url, cookies, locals, redirect }, next) => {
  const pathname = url.pathname;

  // Obtener sesión
  const session = getSession(cookies);

  // Si hay sesión, agregar información del usuario a locals
  if (session) {
    const user = await dbOperations.getUserById(session.userId);
    if (user) {
      locals.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      };
    }
  }

  // Verificar si la ruta requiere autenticación
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));

  // Si no es ruta pública y no hay sesión, redirigir al login
  if (!isPublicRoute && !session) {
    return redirect('/login');
  }

  return next();
});
