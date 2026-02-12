# Proyecto Idania - Astro

Este es el proyecto convertido a Astro con autenticación de Google y acceso a Google Drive API.

## 🔑 Google OAuth & Drive API

Este proyecto incluye autenticación completa con Google OAuth 2.0 y acceso readonly a Google Drive. Los tokens se almacenan en una base de datos SQLite local para permitir operaciones backend.

### Configuración Rápida

1. **Configura Google OAuth** siguiendo las instrucciones detalladas en [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md)
2. **Copia las variables de entorno:**
   ```bash
   cp .env.example .env
   ```
3. **Edita `.env`** con tus credenciales de Google Cloud Console

### Endpoints Disponibles

- `GET /api/auth/login` - Iniciar sesión con Google
- `GET /api/auth/callback` - Callback de OAuth
- `GET /api/auth/logout` - Cerrar sesión
- `GET /api/drive/files` - Listar archivos de Drive
- `GET /api/drive/{fileId}` - Obtener info de archivo

### Operaciones Backend

Ejecuta operaciones de Drive desde scripts:

```bash
npm run drive:test
```

Ver [src/lib/drive.ts](src/lib/drive.ts) para todas las funciones disponibles.

## Estructura del proyecto

```
idania-astro/
├── public/
│   └── images/          # Fotos de Idania
├── src/
│   ├── lib/
│   │   ├── db.ts              # Base de datos SQLite
│   │   ├── google-auth.ts     # Configuración OAuth
│   │   ├── drive.ts           # Operaciones de Drive
│   │   └── session.ts         # Gestión de sesiones
│   ├── layouts/
│   │   └── BaseLayout.astro  # Layout base con estilos
│   ├── pages/
│   │   ├── index.astro       # Página principal
│   │   ├── dashboard.astro   # Dashboard del usuario
│   │   ├── timeline.astro    # Timeline de momentos
│   │   └── api/
│   │       ├── auth/         # Endpoints de autenticación
│   │       └── drive/        # Endpoints de Drive API
│   ├── components/
│   │   └── GoogleAuthButton.astro
│   ├── scripts/
│   │   └── example-drive-operations.ts
│   └── middleware.ts          # Middleware de autenticación
├── GOOGLE_AUTH_SETUP.md       # Guía detallada de configuración
├── auth.db                    # Base de datos (no incluida en git)
├── .env                       # Variables de entorno (no incluida en git)
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Comandos disponibles

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de la build de producción
npm run preview

# Ejecutar script de prueba de Google Drive
npm run drive:test
```

## Cómo ejecutar

1. Abre una terminal en la carpeta `idania-astro`
2. Ejecuta: `npm run dev`
3. Abre tu navegador en: http://localhost:4321

## Ventajas de Astro

- ✅ Componentes reutilizables
- ✅ Optimización automática de imágenes
- ✅ Mejor rendimiento (solo carga el JavaScript necesario)
- ✅ Hot reload en desarrollo
- ✅ TypeScript integrado
- ✅ Build optimizado para producción

## Próximos pasos para completar la migración

1. Crear componentes separados:
   - `src/components/Gallery.astro` - Galería de fotos
   - `src/components/Playlist.astro` - Lista de canciones
   - `src/components/Header.astro` - Header reutilizable

2. Migrar el resto de HTML de `index.html` y `timeline.html`

3. Optimizar imágenes con el componente `<Image>` de Astro

4. Añadir más funcionalidades:
   - Lightbox para las fotos
   - Reproductor de música integrado
   - Animaciones con View Transitions
   - PWA para instalar como app

## Notas

- Las imágenes están en `public/images/`
- Los estilos globales están en `BaseLayout.astro`
- Lucide icons ya está configurado
- **Importante:** NO subas `auth.db` ni `.env` a git
- Los tokens se refrescan automáticamente cuando expiran
- El scope `drive.readonly` solo permite lectura

## 🔒 Seguridad

- ✅ Tokens almacenados de forma segura en SQLite
- ✅ Cookies HttpOnly y Secure (en producción)
- ✅ Refresh automático de tokens
- ✅ Scope de solo lectura para Drive

## 📚 Documentación

- [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md) - Guía completa de configuración de OAuth
- [Astro Documentation](https://docs.astro.build)
- [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)
