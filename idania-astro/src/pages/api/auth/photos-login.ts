import type { APIRoute } from 'astro';
import { getPhotosAuthUrl } from '../../../lib/google-auth';
import { getSession } from '../../../lib/session';
import { dbOperations } from '../../../lib/db';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  try {
    // Verificar que el usuario esté autenticado
    const session = getSession(cookies);
    if (!session) {
      return redirect('/api/auth/login');
    }

    // Obtener usuario actual
    const currentUser = await dbOperations.getUserById(session.userId);
    if (!currentUser) {
      return redirect('/api/auth/login');
    }

    // Generar URL de autorización de Google Photos con el email del usuario
    const authUrl = getPhotosAuthUrl(currentUser.email);

    // Redirigir al usuario a Google OAuth
    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl,
      },
    });
  } catch (error) {
    console.error('Error generating photos auth URL:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to initiate Photos authentication',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
