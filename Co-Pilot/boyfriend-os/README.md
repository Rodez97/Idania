# Boyfriend OS

Tu copiloto para relaciones saludables. Una PWA mobile-first que te ayuda a gestionar recordatorios, reflexiones, y comunicacion en pareja.

## Inicio rapido

### Requisitos previos

- Node.js 20+
- pnpm
- Docker (para PostgreSQL)

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Levantar base de datos

```bash
pnpm db:up
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores (los defaults funcionan para desarrollo local)
```

### 4. Generar Prisma client y migrar

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

### 5. Seed de datos de ejemplo (opcional)

```bash
pnpm prisma:seed
```

Crea un usuario demo: `demo@boyfriendos.com` / `demo123`

### 6. Iniciar en desarrollo

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Scripts disponibles

| Script | Descripcion |
|--------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de produccion |
| `pnpm start` | Iniciar en produccion |
| `pnpm db:up` | Levantar PostgreSQL con Docker |
| `pnpm db:down` | Parar PostgreSQL |
| `pnpm prisma:generate` | Generar Prisma Client |
| `pnpm prisma:migrate` | Ejecutar migraciones |
| `pnpm prisma:seed` | Cargar datos de ejemplo |
| `pnpm reminders:run` | Ejecutar chequeo de recordatorios |
| `pnpm test` | Ejecutar tests (modo watch) |
| `pnpm test:run` | Ejecutar tests (una vez) |
| `pnpm lint` | Ejecutar ESLint |
| `pnpm format` | Formatear con Prettier |

## Funcionalidades

### Dashboard (Hoy)
- Micro-gesto del dia basado en tu mood
- Planes pequenos y pro sugeridos
- Eventos proximos (7 dias)
- Selector rapido de mood

### Eventos y Recordatorios
- CRUD de eventos con categorias
- Recordatorios con offsets configurables
- Notificaciones push y en-app

### Journal
- Entradas con mood, tags, reflexiones
- Modo captura rapida optimizado para movil

### Asistente de Conversacion
- Genera 3 borradores (Calido/Directo/Ligero)
- Detecta banderas de riesgo (frases que podrian escalar)
- Pregunta puente para desescalar
- Version NVC (Observacion-Sentimiento-Necesidad-Peticion)
- Guardrails: nunca sugiere mentir, manipular o amenazar

### Modo Conflicto (Apagar Fuego)
- Wizard para generar mensaje calmado
- Seleccionar objetivo: Reparar / Aclarar / Limite
- Pasos siguientes
- Guardar caso con resolucion y aprendizajes

### PWA y Offline
- Instalable en iOS/Android
- Funciona offline para vistas principales
- Sincronizacion automatica al reconectarse

## Stack Tecnologico

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript (strict)
- **Estilos**: TailwindCSS + shadcn/ui
- **Base de datos**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth (Auth.js) con Credentials
- **Validacion**: Zod
- **Forms**: React Hook Form
- **Offline**: IndexedDB (idb) + Service Worker
- **Notificaciones**: Web Push (VAPID)
- **AI**: OpenAI (opcional, funciona sin API key con MockProvider)
- **Tests**: Vitest

## Variables de entorno

Ver `.env.example` para la lista completa.

| Variable | Requerida | Descripcion |
|----------|-----------|-------------|
| `DATABASE_URL` | Si | URL de PostgreSQL |
| `NEXTAUTH_SECRET` | Si | Secreto para JWT |
| `NEXTAUTH_URL` | Si | URL base de la app |
| `VAPID_PUBLIC_KEY` | No | Clave publica VAPID |
| `VAPID_PRIVATE_KEY` | No | Clave privada VAPID |
| `OPENAI_API_KEY` | No | API key de OpenAI |

Para generar claves VAPID:
```bash
npx web-push generate-vapid-keys
```

## Estructura del proyecto

```
src/
  app/          # Routes y pages (App Router)
  components/   # Componentes reutilizables (shadcn/ui)
  lib/          # Logica de dominio y utilidades
  db/           # Prisma client singleton
  features/     # Server Actions por modulo
  hooks/        # Custom React hooks
  types/        # Tipos compartidos
```
