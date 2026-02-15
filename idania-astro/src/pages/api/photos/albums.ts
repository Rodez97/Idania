import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/session';
import { listAlbums } from '../../../lib/photos';

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    // Verificar sesión
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

    // Obtener parámetros
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    const pageToken = url.searchParams.get('pageToken') || undefined;

    const result = await listAlbums(session.userId, pageSize, pageToken);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch albums',
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
