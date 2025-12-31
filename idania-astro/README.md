# Proyecto Idania - Astro

Este es el proyecto convertido a Astro para tener más funcionalidades y mejor rendimiento.

## Estructura del proyecto

```
idania-astro/
├── public/
│   └── images/          # Fotos de Idania
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro  # Layout base con estilos
│   └── pages/
│       ├── index.astro       # Página principal
│       └── timeline.astro    # Timeline de momentos
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Comandos disponibles

```bash
# Instalar dependencias (ya están instaladas)
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de la build de producción
npm run preview
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
