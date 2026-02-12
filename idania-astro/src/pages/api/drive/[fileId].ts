import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/session';
import { getFile } from '../../../lib/drive';

/**
 * Endpoint de ejemplo para obtener información de un archivo específico
 * GET /api/drive/{fileId}
 */
export const GET: APIRoute = async ({ cookies, params }) => {
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

    const fileId = params.fileId;
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Obtener archivo
    const file = await getFile(session.userId, fileId);

    return new Response(JSON.stringify(file), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting file:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to get file',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
