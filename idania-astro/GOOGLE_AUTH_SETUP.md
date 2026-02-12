# Configuración de Autenticación Google con Drive API

Este proyecto incluye autenticación OAuth 2.0 de Google con acceso de solo lectura a Google Drive. Los tokens se almacenan en una base de datos SQLite local para permitir operaciones backend.

## 📋 Requisitos Previos

1. Cuenta de Google Cloud Platform
2. Proyecto creado en Google Cloud Console

## 🔧 Configuración en Google Cloud Console

### 1. Crear/Seleccionar Proyecto

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente

### 2. Habilitar APIs

1. Ve a **APIs & Services** → **Library**
2. Busca y habilita las siguientes APIs:
   - **Google Drive API**
   - **Google+ API** (para obtener información del usuario)

### 3. Configurar Pantalla de Consentimiento OAuth

1. Ve a **APIs & Services** → **OAuth consent screen**
2. Selecciona **External** (o Internal si es G Suite)
3. Completa la información requerida:
   - **App name**: Nombre de tu aplicación
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
4. En **Scopes**, añade:
   - `userinfo.email`
   - `userinfo.profile`
   - `drive.readonly`
5. Guarda y continúa

### 4. Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** → **Credentials**
2. Click en **Create Credentials** → **OAuth client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name**: Un nombre descriptivo
   - **Authorized JavaScript origins**:
     - `http://localhost:4321` (desarrollo)
     - Tu dominio de producción
   - **Authorized redirect URIs**:
     - `http://localhost:4321/api/auth/callback` (desarrollo)
     - `https://tu-dominio.com/api/auth/callback` (producción)
5. Click en **Create**
6. **Guarda el Client ID y Client Secret**

## 🔐 Configuración del Proyecto

### 1. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
PUBLIC_BASE_URL=http://localhost:4321
SESSION_SECRET=genera_un_string_aleatorio_aqui
```

**Importante**: En producción, usa URLs HTTPS y genera un `SESSION_SECRET` seguro.

### 2. Generar SESSION_SECRET

Puedes generar un secret aleatorio con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Uso

### Iniciar el Servidor

```bash
npm run dev
```

### Flujo de Autenticación

1. **Login**: Usuario visita `/api/auth/login`
2. **Autorización**: Usuario autoriza en Google
3. **Callback**: Google redirige a `/api/auth/callback`
4. **Tokens guardados**: Los tokens se almacenan en `auth.db`
5. **Sesión creada**: Cookie de sesión creada
6. **Redireccion**: Usuario redirigido al home

### Endpoints Disponibles

#### Autenticación

- `GET /api/auth/login` - Inicia el flujo OAuth
- `GET /api/auth/callback` - Callback de Google OAuth
- `GET /api/auth/logout` - Cierra sesión

#### Google Drive (requieren autenticación)

- `GET /api/drive/files` - Lista archivos del usuario
  - Query params: `pageSize`, `pageToken`, `q`
- `GET /api/drive/{fileId}` - Obtiene información de un archivo

## 💾 Operaciones Backend

### Usar las Funciones de Drive

```typescript
import { listFiles, getFile, searchFiles } from './src/lib/drive';

// Listar archivos del usuario
const files = await listFiles('user_id', {
  pageSize: 20,
  query: 'trashed=false'
});

// Buscar archivos
const results = await searchFiles('user_id', 'documento');

// Obtener archivo específico
const file = await getFile('user_id', 'file_id_here');
```

### Operaciones Disponibles

Ver [src/lib/drive.ts](src/lib/drive.ts) para todas las funciones:

- `listFiles()` - Listar archivos
- `getFile()` - Obtener información de archivo
- `downloadFile()` - Descargar contenido
- `exportFile()` - Exportar Google Docs/Sheets
- `searchFiles()` - Buscar archivos
- `getRecentFiles()` - Archivos recientes
- `getStorageInfo()` - Información de almacenamiento

### Gestión de Tokens

Los tokens se refrescan automáticamente cuando expiran. El sistema:

1. Verifica si el token está expirado antes de cada operación
2. Si está expirado, usa el refresh token para obtener uno nuevo
3. Actualiza la base de datos con los nuevos tokens

## 📁 Estructura de Archivos

```
src/
├── lib/
│   ├── db.ts              # Base de datos SQLite
│   ├── google-auth.ts     # Configuración OAuth
│   ├── drive.ts           # Operaciones de Drive
│   └── session.ts         # Gestión de sesiones
├── pages/
│   └── api/
│       ├── auth/
│       │   ├── login.ts   # Endpoint de login
│       │   ├── callback.ts # Callback OAuth
│       │   └── logout.ts  # Logout
│       └── drive/
│           ├── files.ts   # Listar archivos
│           └── [fileId].ts # Obtener archivo
└── middleware.ts          # Middleware de autenticación
```

## 🔒 Seguridad

- ✅ Los tokens se almacenan de forma segura en SQLite
- ✅ Las cookies son HttpOnly y Secure (en producción)
- ✅ Los refresh tokens permiten operaciones a largo plazo
- ✅ Scope de solo lectura (readonly) para Drive
- ⚠️ La base de datos `auth.db` está en `.gitignore` - NO la subas a git
- ⚠️ Protege tu `.env` - NUNCA lo subas a git

## 🐛 Solución de Problemas

### Error: "Missing tokens"

Asegúrate de que Google devuelva un refresh token:
- El `access_type` debe ser `'offline'`
- Usa `prompt: 'consent'` para forzar el consentimiento

### Error: "Token expired"

El sistema debería refrescar automáticamente. Si persiste:
1. Revisa que el refresh token esté guardado
2. Verifica que las credenciales sean correctas

### Error: "Unauthorized redirect_uri"

Verifica que la URI de callback esté configurada exactamente como en Google Cloud Console:
- `http://localhost:4321/api/auth/callback` (desarrollo)

## 📝 Notas

- Los tokens tienen una duración limitada (típicamente 1 hora para access tokens)
- Los refresh tokens permiten obtener nuevos access tokens sin reautenticación
- Con scope `drive.readonly` **NO** puedes modificar archivos
- La base de datos se crea automáticamente al iniciar

## 🎯 Próximos Pasos

1. Personaliza las páginas de tu aplicación
2. Implementa la lógica de negocio usando las funciones de Drive
3. Añade más endpoints API según necesites
4. Configura el despliegue en producción con HTTPS
