import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/session';
import { dbOperations } from '../../../lib/db';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Verificar que el usuario esté autenticado
    const session = getSession(cookies);
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Obtener usuario actual
    const currentUser = await dbOperations.getUserById(session.userId);
    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Revocar token en Google si existe
    if (currentUser.photos_access_token) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${currentUser.photos_access_token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      } catch (error) {
        console.error('Error revoking token with Google:', error);
        // Continuar de todos modos para limpiar en la base de datos
      }
    }

    // Eliminar tokens de la base de datos
    await dbOperations.revokePhotosAccess(session.userId);

    console.log(`Google Photos access revoked for user ${currentUser.email}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error revoking Photos access:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to revoke access',
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
