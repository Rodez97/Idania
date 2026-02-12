# Phase 0: Planning

## Status: COMPLETE
## Date: 2026-02-07

---

## File Tree Architecture

```
boyfriend-os/
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── docker-compose.yml
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json                 # shadcn/ui config
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── sw.js                       # service worker (generated)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (providers, bottom nav)
│   │   ├── page.tsx                # Redirect to /today
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (main)/
│   │   │   ├── layout.tsx          # Main layout with bottom nav
│   │   │   ├── today/page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── journal/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── assistant/page.tsx
│   │   │   ├── conflicts/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── push/
│   │       │   ├── subscribe/route.ts
│   │       │   ├── unsubscribe/route.ts
│   │       │   └── test/route.ts
│   │       ├── events/route.ts
│   │       ├── journal/route.ts
│   │       ├── assistant/route.ts
│   │       ├── conflicts/route.ts
│   │       ├── notifications/route.ts
│   │       ├── mood/route.ts
│   │       └── sync/route.ts
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── bottom-nav.tsx
│   │   ├── mood-selector.tsx
│   │   ├── suggestion-card.tsx
│   │   ├── event-form.tsx
│   │   ├── journal-form.tsx
│   │   ├── assistant-form.tsx
│   │   ├── conflict-wizard.tsx
│   │   ├── draft-card.tsx
│   │   ├── notification-bell.tsx
│   │   ├── offline-indicator.tsx
│   │   ├── install-prompt.tsx
│   │   └── providers.tsx
│   │
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── suggestions.ts          # Rules engine for today
│   │   ├── guardrails.ts           # Safety filter
│   │   ├── assistant/
│   │   │   ├── types.ts
│   │   │   ├── mock-provider.ts
│   │   │   └── openai-provider.ts
│   │   ├── notifications.ts        # Web push helpers
│   │   ├── offline/
│   │   │   ├── db.ts               # IndexedDB setup
│   │   │   ├── sync.ts             # Sync logic
│   │   │   └── queue.ts            # Mutation queue
│   │   ├── validations.ts          # Zod schemas
│   │   └── utils.ts                # Shared utilities
│   │
│   ├── db/
│   │   └── index.ts                # Prisma client singleton
│   │
│   ├── features/
│   │   ├── today/
│   │   │   └── actions.ts
│   │   ├── events/
│   │   │   └── actions.ts
│   │   ├── journal/
│   │   │   └── actions.ts
│   │   ├── assistant/
│   │   │   └── actions.ts
│   │   ├── conflicts/
│   │   │   └── actions.ts
│   │   └── profile/
│   │       └── actions.ts
│   │
│   ├── hooks/
│   │   ├── use-offline.ts
│   │   ├── use-install-prompt.ts
│   │   └── use-notifications.ts
│   │
│   ├── middleware.ts               # Auth middleware
│   │
│   └── types/
│       └── index.ts                # Shared types
│
├── scripts/
│   └── reminders.ts                # Cron-like reminder runner
│
└── __tests__/
    ├── suggestions.test.ts
    ├── guardrails.test.ts
    └── validations.test.ts
```

## Module Boundaries

| Directory | Responsibility | Imports allowed from |
|-----------|---------------|---------------------|
| `/src/app` | Routes, pages, API handlers | components, lib, features, db, types |
| `/src/components` | Reusable UI components | lib, types, hooks |
| `/src/lib` | Domain logic, utilities | types only |
| `/src/db` | Prisma client | prisma schema |
| `/src/features` | Server Actions per module | db, lib, types |
| `/src/hooks` | Client-side React hooks | lib, types |
| `/src/types` | Shared type definitions | none |

## Dependencies

### Core
- next, react, react-dom
- typescript, @types/react, @types/node

### Styling
- tailwindcss, postcss, autoprefixer
- @tailwindcss/typography
- shadcn/ui (via CLI)

### Database
- prisma, @prisma/client

### Auth
- next-auth, @auth/prisma-adapter, bcryptjs, @types/bcryptjs

### Forms & Validation
- zod, react-hook-form, @hookform/resolvers

### PWA & Offline
- next-pwa (or @ducanh2912/next-pwa)
- idb (IndexedDB wrapper)

### Notifications
- web-push, @types/web-push

### AI (optional)
- openai

### Testing
- vitest, @testing-library/react

### Dev Tools
- eslint, prettier, eslint-config-next

## Environment Variables
- DATABASE_URL=postgresql://boyfriend:boyfriend@localhost:5432/boyfriend_os
- NEXTAUTH_SECRET=your-secret-here
- NEXTAUTH_URL=http://localhost:3000
- VAPID_PUBLIC_KEY=
- VAPID_PRIVATE_KEY=
- VAPID_EMAIL=mailto:you@example.com
- OPENAI_API_KEY= (optional)

## Decisions
- Using `@ducanh2912/next-pwa` (actively maintained fork of next-pwa)
- Using `idb` for IndexedDB (small, typed wrapper)
- MockProvider first, OpenAI behind env flag
- Last-write-wins for offline conflict resolution
- Bottom tab nav for mobile, sidebar for desktop (responsive)
