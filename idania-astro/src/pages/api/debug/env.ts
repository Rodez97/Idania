import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/session';
import { dbOperations } from '../../../lib/db';

/**
 * Endpoint de debugging para verificar configuración
 * Solo accesible para usuarios autenticados
 */
export const GET: APIRoute = async ({ cookies }) => {
  try {
    const session = getSession(cookies);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verificar variables de entorno
    const envCheck = {
      firebase: {
        apiKey: !!import.meta.env.FIREBASE_API_KEY,
        authDomain: !!import.meta.env.FIREBASE_AUTH_DOMAIN,
        projectId: !!import.meta.env.FIREBASE_PROJECT_ID,
        storageBucket: !!import.meta.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: !!import.meta.env.FIREBASE_APP_ID,
      },
      google: {
        clientId: !!import.meta.env.GOOGLE_CLIENT_ID,
        clientSecret: !!import.meta.env.GOOGLE_CLIENT_SECRET,
      },
      other: {
        baseUrl: import.meta.env.PUBLIC_BASE_URL,
        sessionSecret: !!import.meta.env.SESSION_SECRET,
      }
    };

    // Intentar operación de base de datos
    let dbStatus = 'unknown';
    let dbError = null;
    let userCount = 0;

    try {
      const users = await dbOperations.getAllUsers();
      userCount = users.length;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
      session: {
        userId: session.userId,
        hasSession: true,
      },
      envVariables: envCheck,
      database: {
        status: dbStatus,
        error: dbError,
        userCount,
      }
    };

    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
