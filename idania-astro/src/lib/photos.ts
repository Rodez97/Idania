import { dbOperations } from './db';
import { refreshAccessToken } from './google-auth';

// Tipos para Google Photos
export interface PhotosMediaItem {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: {
      cameraMake?: string;
      cameraModel?: string;
      focalLength?: number;
      apertureFNumber?: number;
      isoEquivalent?: number;
    };
    video?: {
      fps: number;
      status: string;
    };
  };
  filename: string;
}

export interface PhotosListResponse {
  mediaItems: PhotosMediaItem[];
  nextPageToken?: string;
}

/**
 * Obtener cliente autenticado de Google Photos para un usuario
 */
async function getAuthenticatedPhotosClient(userId: string) {
  const user = await dbOperations.getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.photos_access_token || !user.photos_refresh_token) {
    throw new Error('User has not granted Photos access');
  }

  // Verificar si el token ha expirado
  const now = Date.now();
  let accessToken = user.photos_access_token;

  if (user.photos_token_expiry && now >= user.photos_token_expiry) {
    // Refrescar el token
    const newTokens = await refreshAccessToken(user.photos_refresh_token);

    if (!newTokens.access_token) {
      throw new Error('Failed to refresh access token');
    }

    accessToken = newTokens.access_token;

    // Actualizar en la base de datos
    await dbOperations.updatePhotosTokens(
      userId,
      newTokens.access_token,
      user.photos_refresh_token,
      now + (newTokens.expiry_date || 3600 * 1000)
    );
  }

  return accessToken;
}

/**
 * Listar fotos del usuario
 */
export async function listPhotos(
  userId: string,
  pageSize: number = 50,
  pageToken?: string
): Promise<PhotosListResponse> {
  const accessToken = await getAuthenticatedPhotosClient(userId);

  const params = new URLSearchParams({
    pageSize: pageSize.toString(),
  });

  if (pageToken) {
    params.append('pageToken', pageToken);
  }

  const response = await fetch(
    `https://photoslibrary.googleapis.com/v1/mediaItems?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch photos: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    mediaItems: data.mediaItems || [],
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Buscar fotos con filtros
 */
export async function searchPhotos(
  userId: string,
  filters: {
    albumId?: string;
    contentFilter?: {
      includedContentCategories?: string[];
    };
    dateFilter?: {
      ranges?: Array<{
        startDate: { year: number; month: number; day: number };
        endDate: { year: number; month: number; day: number };
      }>;
    };
    mediaTypeFilter?: {
      mediaTypes?: string[]; // 'PHOTO' | 'VIDEO'
    };
  },
  pageSize: number = 50,
  pageToken?: string
): Promise<PhotosListResponse> {
  const accessToken = await getAuthenticatedPhotosClient(userId);

  const body: any = {
    pageSize,
    filters,
  };

  if (pageToken) {
    body.pageToken = pageToken;
  }

  const response = await fetch(
    'https://photoslibrary.googleapis.com/v1/mediaItems:search',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to search photos: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    mediaItems: data.mediaItems || [],
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Listar álbumes del usuario
 */
export async function listAlbums(
  userId: string,
  pageSize: number = 50,
  pageToken?: string
) {
  const accessToken = await getAuthenticatedPhotosClient(userId);

  const params = new URLSearchParams({
    pageSize: pageSize.toString(),
  });

  if (pageToken) {
    params.append('pageToken', pageToken);
  }

  const response = await fetch(
    `https://photoslibrary.googleapis.com/v1/albums?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch albums: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    albums: data.albums || [],
    nextPageToken: data.nextPageToken,
  };
}
