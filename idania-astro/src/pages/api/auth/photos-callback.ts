import type { APIRoute } from 'astro';
import { getPhotosTokensFromCode, getUserInfo } from '../../../lib/google-auth';
import { dbOperations } from '../../../lib/db';
import { getSession } from '../../../lib/session';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  try {
    // Verificar que el usuario esté autenticado
    const session = getSession(cookies);
    if (!session) {
      return redirect('/api/auth/login');
    }

    // Obtener el código de autorización de la query string
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // Verificar si hubo un error en la autorización
    if (error) {
      console.error('OAuth error:', error);
      // Si el usuario rechazó el acceso, redirigir con mensaje específico
      if (error === 'access_denied') {
        return redirect('/g-fotos?error=access_denied');
      }
      return redirect('/g-fotos?error=auth_failed');
    }

    if (!code) {
      return redirect('/g-fotos?error=no_code');
    }

    // Intercambiar código por tokens
    const tokens = await getPhotosTokensFromCode(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('Missing tokens:', tokens);
      return redirect('/g-fotos?error=missing_tokens');
    }

    // Obtener información del usuario para verificar identidad
    const userInfo = await getUserInfo(tokens.access_token);

    if (!userInfo.id || !userInfo.email) {
      return redirect('/g-fotos?error=invalid_user_info');
    }

    // Verificar que el usuario que autorizó sea el mismo que está en sesión
    if (userInfo.id !== session.userId) {
      return redirect('/g-fotos?error=user_mismatch');
    }

    // Calcular tiempo de expiración del token
    const expiryTime = Date.now() + (tokens.expiry_date || 3600 * 1000);

    // Actualizar tokens de Google Photos en la base de datos
    await dbOperations.updatePhotosTokens(
      session.userId,
      tokens.access_token,
      tokens.refresh_token,
      expiryTime
    );

    console.log(`Google Photos access granted for user ${userInfo.email}`);

    // Redirigir a la página de Google Photos
    return redirect('/g-fotos?success=true');
  } catch (error) {
    console.error('Error in Photos OAuth callback:', error);
    return redirect('/g-fotos?error=callback_failed');
  }
};
