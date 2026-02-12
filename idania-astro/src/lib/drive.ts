import { google, drive_v3 } from 'googleapis';
import { getOAuth2Client, refreshAccessToken } from './google-auth';
import { dbOperations } from './db';

// Obtener cliente de Drive autenticado para un usuario
export async function getDriveClient(userId: string): Promise<drive_v3.Drive> {
  const user = await dbOperations.getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Verificar si el token ha expirado
  const now = Date.now();
  let accessToken = user.access_token;
  let refreshToken = user.refresh_token;

  if (now >= user.token_expiry) {
    // Token expirado, refrescar
    console.log(`Token expired for user ${userId}, refreshing...`);
    const newTokens = await refreshAccessToken(user.refresh_token);

    accessToken = newTokens.access_token!;
    if (newTokens.refresh_token) {
      refreshToken = newTokens.refresh_token;
    }

    // Actualizar tokens en la base de datos
    const newExpiry = now + (newTokens.expiry_date || 3600 * 1000);
    await dbOperations.updateTokens(userId, accessToken, refreshToken, newExpiry);
  }

  // Crear cliente OAuth2 con el token
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Retornar cliente de Drive
  return google.drive({
    version: 'v3',
    auth: oauth2Client,
  });
}

// Utilidades para operaciones comunes de Drive

/**
 * Listar archivos de Drive del usuario
 */
export async function listFiles(
  userId: string,
  options?: {
    pageSize?: number;
    pageToken?: string;
    query?: string;
    orderBy?: string;
  }
) {
  const drive = await getDriveClient(userId);

  const response = await drive.files.list({
    pageSize: options?.pageSize || 10,
    pageToken: options?.pageToken,
    q: options?.query,
    orderBy: options?.orderBy || 'modifiedTime desc',
    fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, thumbnailLink)',
  });

  return response.data;
}

/**
 * Obtener información de un archivo específico
 */
export async function getFile(userId: string, fileId: string) {
  const drive = await getDriveClient(userId);

  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, modifiedTime, size, webViewLink, iconLink, thumbnailLink, description, parents',
  });

  return response.data;
}

/**
 * Descargar contenido de un archivo
 */
export async function downloadFile(userId: string, fileId: string) {
  const drive = await getDriveClient(userId);

  const response = await drive.files.get(
    {
      fileId,
      alt: 'media',
    },
    {
      responseType: 'stream',
    }
  );

  return response.data;
}

/**
 * Exportar un Google Doc/Sheet/Slide a un formato específico
 */
export async function exportFile(
  userId: string,
  fileId: string,
  mimeType: string
) {
  const drive = await getDriveClient(userId);

  const response = await drive.files.export(
    {
      fileId,
      mimeType,
    },
    {
      responseType: 'stream',
    }
  );

  return response.data;
}

/**
 * Buscar archivos por nombre o query
 */
export async function searchFiles(userId: string, searchTerm: string) {
  return listFiles(userId, {
    query: `name contains '${searchTerm}' and trashed=false`,
    pageSize: 20,
  });
}

/**
 * Obtener archivos recientes
 */
export async function getRecentFiles(userId: string, limit: number = 10) {
  return listFiles(userId, {
    pageSize: limit,
    orderBy: 'modifiedTime desc',
    query: 'trashed=false',
  });
}

/**
 * Obtener información del espacio de almacenamiento
 */
export async function getStorageInfo(userId: string) {
  const drive = await getDriveClient(userId);

  const response = await drive.about.get({
    fields: 'storageQuota, user',
  });

  return response.data;
}
