import type { APIRoute } from 'astro';
import { getSession } from '../../../../lib/session';
import { getDriveClient } from '../../../../lib/drive';

/**
 * Endpoint para obtener thumbnails de archivos de Drive con autenticación
 * GET /api/drive/thumbnail/[fileId]?userId=xxx
 */
export const GET: APIRoute = async ({ cookies, params, url }) => {
  try {
    // Verificar autenticación
    const session = getSession(cookies);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const fileId = params.fileId;
    if (!fileId) {
      return new Response('Invalid file ID', { status: 400 });
    }

    // Permitir especificar userId desde query (para admin view)
    const userId = url.searchParams.get('userId') || session.userId;

    // Obtener cliente de Drive
    const drive = await getDriveClient(userId);

    // Obtener metadatos del archivo para el thumbnailLink
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'thumbnailLink, mimeType',
    });

    if (!fileMetadata.data.thumbnailLink) {
      return new Response('No thumbnail available', { status: 404 });
    }

    // Descargar el thumbnail usando el token de autenticación
    const thumbnailUrl = fileMetadata.data.thumbnailLink;

    // Obtener el token de acceso del usuario
    const { dbOperations } = await import('../../../../lib/db');
    const user = await dbOperations.getUserById(userId);

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Hacer fetch del thumbnail con autenticación
    const response = await fetch(thumbnailUrl, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
      },
    });

    if (!response.ok) {
      return new Response('Failed to fetch thumbnail', { status: response.status });
    }

    // Obtener el blob y devolverlo
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': blob.type || 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch thumbnail',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
