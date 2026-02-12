import type { APIRoute } from 'astro';
import { getSession } from '../../../../lib/session';
import { downloadFile, getFile } from '../../../../lib/drive';
import { isPreviewable, validateFileId } from '../../../../lib/drive-utils';

/**
 * Endpoint para previsualizar archivos de Drive
 * Solo permite preview de imágenes y videos
 * GET /api/drive/preview/[fileId]
 */
export const GET: APIRoute = async ({ cookies, params, url }) => {
  try {
    // Verificar autenticación
    const session = getSession(cookies);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Validar fileId
    const fileId = params.fileId;
    if (!validateFileId(fileId)) {
      return new Response('Invalid file ID', { status: 400 });
    }

    // Permitir especificar userId desde query (para admin view)
    const userId = url.searchParams.get('userId') || session.userId;

    // Obtener metadatos del archivo primero
    const fileMetadata = await getFile(userId, fileId!);

    if (!fileMetadata) {
      return new Response('File not found', { status: 404 });
    }

    // Verificar que el archivo sea previsualizable (solo imágenes y videos)
    if (!isPreviewable(fileMetadata.mimeType || '')) {
      return new Response(
        JSON.stringify({
          error: 'Preview not available',
          message: 'Solo se pueden previsualizar imágenes y videos',
          mimeType: fileMetadata.mimeType,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Descargar el archivo como stream
    const stream = await downloadFile(userId, fileId!);

    // Configurar headers apropiados para preview
    return new Response(stream as any, {
      status: 200,
      headers: {
        'Content-Type': fileMetadata.mimeType || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600', // Cache por 1 hora
        // No usar Content-Disposition para que se muestre en browser
      },
    });
  } catch (error) {
    console.error('Error previewing file:', error);

    // Verificar si es un error de permisos de Drive
    if (error instanceof Error && error.message.includes('403')) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'No tienes permiso para ver este archivo',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to preview file',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
