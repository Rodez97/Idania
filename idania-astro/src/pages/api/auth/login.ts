import type { APIRoute } from 'astro';
import { getAuthUrl } from '../../../lib/google-auth';

export const GET: APIRoute = async () => {
  try {
    // Generar URL de autorización de Google
    const authUrl = getAuthUrl();

    // Redirigir al usuario a Google OAuth
    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl,
      },
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to initiate authentication',
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
