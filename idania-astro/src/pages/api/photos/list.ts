import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/session';
import { listPhotos, searchPhotos } from '../../../lib/photos';

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
    const mediaType = url.searchParams.get('mediaType') || undefined; // 'photo' or 'video'

    let result;

    // Si hay filtro de tipo de media, usar búsqueda
    if (mediaType) {
      const filters: any = {};

      if (mediaType === 'photo' || mediaType === 'video') {
        filters.mediaTypeFilter = {
          mediaTypes: [mediaType.toUpperCase()],
        };
      }

      result = await searchPhotos(session.userId, filters, pageSize, pageToken);
    } else {
      // Sin filtros, listar todas las fotos
      result = await listPhotos(session.userId, pageSize, pageToken);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch photos',
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
