# Guía de Despliegue en Vercel

## Pre-requisitos

1. Cuenta en Vercel (usa tu cuenta de GitHub)
2. Proyecto en Google Cloud Console configurado
3. Proyecto en Firebase configurado

## Pasos para Desplegar

### 1. Instalar Dependencias

```bash
npm install @astrojs/vercel
```

### 2. Preparar el Repositorio

Asegúrate de que todos los cambios estén commiteados:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 3. Configurar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Astro

### 4. Configurar Variables de Entorno

En la configuración del proyecto en Vercel, agrega estas variables de entorno:

#### Variables Requeridas:

```
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_secret_de_google
PUBLIC_BASE_URL=https://tu-dominio.vercel.app
SESSION_SECRET=genera_un_string_aleatorio_seguro
```

#### Variables de Firebase:

```
FIREBASE_API_KEY=tu_firebase_api_key
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id
```

**⚠️ IMPORTANTE:** Para `SESSION_SECRET`, genera un string aleatorio seguro. Puedes usar:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Actualizar URIs de Redirección en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Selecciona tu proyecto
3. Ve a "Credentials" > selecciona tu OAuth 2.0 Client ID
4. En "Authorized redirect URIs", agrega:
   ```
   https://tu-dominio.vercel.app/api/auth/callback
   ```

### 6. Configurar Firebase

Asegúrate de que tu configuración de Firebase en Vercel coincida con la de tu proyecto Firebase:

1. Ve a Firebase Console > Project Settings
2. Copia todas las credenciales del SDK
3. Agrégalas como variables de entorno en Vercel

### 7. Desplegar

1. En Vercel, haz clic en "Deploy"
2. Espera a que termine el build (puede tomar 2-3 minutos)
3. Una vez completado, visita tu URL de Vercel

## Verificar el Despliegue

1. Visita `https://tu-dominio.vercel.app`
2. Intenta hacer login con Google
3. Verifica que puedas acceder a `/dashboard`
4. Verifica que `/priv-id-2002` funcione correctamente

## Solución de Problemas

### Error: "Redirect URI mismatch"
- Verifica que la URL en `PUBLIC_BASE_URL` coincida exactamente con la configurada en Google Cloud Console
- Asegúrate de no tener una barra final `/` en la URL

### Error: "Session validation failed"
- Verifica que `SESSION_SECRET` esté configurado en Vercel
- Asegúrate de que no sea el valor por defecto del `.env.example`

### Error de Firebase
- Verifica que todas las variables de Firebase estén correctamente configuradas
- Asegúrate de que tu proyecto Firebase tenga Firestore habilitado

### Build Failures
- Revisa los logs de build en Vercel
- Asegúrate de que todas las dependencias estén en `package.json`
- Verifica que no haya errores de TypeScript con `npm run build` localmente

## Redeploy Automático

Vercel redesplegará automáticamente cada vez que hagas push a tu rama principal (main/master). Para deployments manuales:

1. Ve al proyecto en Vercel
2. Haz clic en "Redeploy"

## Dominios Personalizados

Si quieres usar tu propio dominio:

1. Ve a Settings > Domains en Vercel
2. Agrega tu dominio
3. Configura los DNS según las instrucciones
4. Actualiza `PUBLIC_BASE_URL` con tu nuevo dominio
5. Actualiza los URIs de redirección en Google Cloud Console

## Variables de Entorno para Producción vs Preview

Vercel permite configurar diferentes variables para:
- **Production**: Usadas cuando despliegas a main
- **Preview**: Usadas en branches de feature
- **Development**: Usadas localmente

Puedes configurarlas en: Settings > Environment Variables
