import type { APIRoute } from 'astro';
import { getTokensFromCode, getUserInfo } from '../../../lib/google-auth';
import { dbOperations } from '../../../lib/db';
import { createSession } from '../../../lib/session';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  try {
    // Obtener el código de autorización de la query string
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // Verificar si hubo un error en la autorización
    if (error) {
      console.error('OAuth error:', error);
      // Si el usuario rechazó el acceso, redirigir al login con mensaje específico
      if (error === 'access_denied') {
        return redirect('/login?error=access_denied');
      }
      return redirect('/login?error=auth_failed');
    }

    if (!code) {
      return redirect('/?error=no_code');
    }

    // Intercambiar código por tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('Missing tokens:', tokens);
      return redirect('/?error=missing_tokens');
    }

    // Obtener información del usuario
    const userInfo = await getUserInfo(tokens.access_token);

    if (!userInfo.id || !userInfo.email) {
      return redirect('/?error=invalid_user_info');
    }

    // Calcular tiempo de expiración del token
    const expiryTime = Date.now() + (tokens.expiry_date || 3600 * 1000);

    // Guardar o actualizar usuario en la base de datos
    await dbOperations.upsertUser({
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || undefined,
      picture: userInfo.picture || undefined,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: expiryTime,
    });

    // Crear sesión
    createSession(cookies, userInfo.id);

    console.log(`User ${userInfo.email} authenticated successfully`);

    // Redirigir al home
    return redirect('/');
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return redirect('/?error=callback_failed');
  }
};
