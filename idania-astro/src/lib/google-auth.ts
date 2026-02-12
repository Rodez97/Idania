import { google } from 'googleapis';

// Configuración del cliente OAuth2
export function getOAuth2Client() {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${import.meta.env.PUBLIC_BASE_URL}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Scopes necesarios para Google Drive readonly
export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.readonly',
];

// Generar URL de autorización
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Necesario para obtener refresh token
    scope: SCOPES,
    prompt: 'consent', // Forzar prompt para asegurar que obtenemos refresh token
  });
}

// Intercambiar código por tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Refrescar access token usando refresh token
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

// Obtener información del usuario
export async function getUserInfo(accessToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  });

  const { data } = await oauth2.userinfo.get();
  return data;
}
