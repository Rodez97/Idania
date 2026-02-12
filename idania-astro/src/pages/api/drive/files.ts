import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/session';
import { listFiles } from '../../../lib/drive';

/**
 * Endpoint de ejemplo para listar archivos de Drive del usuario autenticado
 * GET /api/drive/files?pageSize=10&pageToken=xxx
 */
export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    // Verificar autenticación
    const session = getSession(cookies);
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Obtener parámetros de query
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const pageToken = url.searchParams.get('pageToken') || undefined;
    const query = url.searchParams.get('q') || undefined;
    // Permitir especificar userId desde query (para admin view)
    const userId = url.searchParams.get('userId') || session.userId;

    // Listar archivos
    const files = await listFiles(userId, {
      pageSize,
      pageToken,
      query,
    });

    return new Response(JSON.stringify(files), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to list files',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
