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

// Scopes necesarios para Google Drive (readonly)
export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.readonly',
];

// Generar URL de autorización
export function getAuthUrl(loginHint?: string) {
  const oauth2Client = getOAuth2Client();

  const authUrlParams: any = {
    access_type: 'offline', // Necesario para obtener refresh token
    scope: SCOPES,
    prompt: 'consent', // Forzar prompt para asegurar que obtenemos refresh token
  };

  // Si se proporciona un email, pre-seleccionar esa cuenta
  if (loginHint) {
    authUrlParams.login_hint = loginHint;
  }

  return oauth2Client.generateAuthUrl(authUrlParams);
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

// Verificar que el token tenga los scopes necesarios
export async function verifyTokenScopes(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const grantedScopes = data.scope.split(' ');

    // Verificar que incluya el scope de drive.readonly
    return grantedScopes.includes('https://www.googleapis.com/auth/drive.readonly');
  } catch (error) {
    console.error('Error verifying token scopes:', error);
    return false;
  }
}

