import type { APIRoute } from 'astro';
import { destroySession } from '../../../lib/session';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Destruir la sesión
  destroySession(cookies);

  // Redirigir al home
  return redirect('/');
};

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // También permitir logout via GET
  destroySession(cookies);
  return redirect('/');
};
