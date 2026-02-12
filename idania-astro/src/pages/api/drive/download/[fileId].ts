import type { APIRoute } from 'astro';
import { getSession } from '../../../../lib/session';
import { downloadFile, exportFile, getFile } from '../../../../lib/drive';
import { validateFileId, isGoogleWorkspaceFile, getExportFormat } from '../../../../lib/drive-utils';

/**
 * Endpoint para descargar archivos de Drive
 * Exporta automáticamente Google Workspace files a formatos apropiados
 * GET /api/drive/download/[fileId]
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

    let stream;
    let mimeType;
    let filename;

    // Determinar si necesita exportación (Google Workspace files)
    if (isGoogleWorkspaceFile(fileMetadata.mimeType || '')) {
      const exportFormat = getExportFormat(fileMetadata.mimeType || '');

      if (exportFormat) {
        // Exportar a formato apropiado
        stream = await exportFile(userId, fileId!, exportFormat.mimeType);
        mimeType = exportFormat.mimeType;
        filename = (fileMetadata.name || 'download') + exportFormat.extension;
      } else {
        return new Response(
          JSON.stringify({
            error: 'Export not available',
            message: 'No se puede exportar este tipo de archivo de Google Workspace',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // Descargar archivo normal
      stream = await downloadFile(userId, fileId!);
      mimeType = fileMetadata.mimeType || 'application/octet-stream';
      filename = fileMetadata.name || 'download';
    }

    // Configurar headers para descarga
    return new Response(stream as any, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);

    // Verificar si es un error de permisos de Drive
    if (error instanceof Error && error.message.includes('403')) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'No tienes permiso para descargar este archivo',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to download file',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
