You are Claude Code, acting as a senior staff engineer. Generate a complete, production-ready, mobile-first Progressive Web App (PWA) called “Boyfriend OS” that runs on Next.js (App Router) with TypeScript. The app is private (single user) by default but supports multi-user auth. It must be installable on iOS/Android (PWA), work offline for core views, and sync when online. Prioritize clean architecture, correct types, good DX, and a practical MVP.

========================
GOALS (MVP)
========================
Build an installable PWA that helps a user manage relationship support:
1) Today Dashboard (“Hoy”)
   - Show “micro-gesture of the day”, “small plan”, “pro plan”
   - Show upcoming reminders/events (next 7 days)
   - Quick mood selector (Ok / Distant / Tense / Great)
2) Events & Reminders
   - CRUD: events (title, date, category, notes)
   - Reminders: schedule offsets (e.g., 7d, 2d, 0d)
   - Local notifications (Web Push) when possible; fallback to in-app notifications list
3) Journal
   - CRUD journal entries (what happened, how I felt, outcome, tags, mood)
   - Quick capture mode optimized for phone
4) Conversation Assistant (text-in/text-out)
   - User pastes message context and desired intent
   - App proposes 3 response drafts (Warm / Direct / Light humor)
   - Must include “risk flags” (phrases likely to escalate)
   - Guardrails: no lying, no coercion, no manipulation, no gaslighting
   - Provide a “bridge question” to de-escalate
   - Provide a “NVC” version (Observation-Feeling-Need-Request)
5) Conflict Mode (“Apagar fuego”)
   - Wizard flow to generate a calm message and next steps
   - Save a conflict case with resolution + learnings

========================
TECH STACK
========================
- Next.js latest stable with App Router
- TypeScript strict
- TailwindCSS + shadcn/ui components
- Prisma ORM + Postgres (use docker-compose for local dev)
- Auth: NextAuth (Auth.js) with Credentials provider for MVP (email+password) and optional Google OAuth placeholder
- Zod for validation
- React Hook Form for forms
- Server Actions where appropriate
- Service Worker for offline caching + background sync (Workbox or next-pwa; choose one and implement correctly)
- Web Push notifications using VAPID (server routes for subscription management)
- Optional: OpenAI integration behind an interface. Provide a local “mock provider” so app works without keys.

========================
NON-FUNCTIONAL REQUIREMENTS
========================
- Mobile-first, accessible UI, fast
- Offline-first for:
  - Today Dashboard
  - Events list
  - Journal list
- Use IndexedDB (idb library) for offline cache + queue writes, then sync to server on reconnect
- Clear separation:
  - /lib (domain logic)
  - /db (prisma)
  - /app (routes)
  - /components (ui)
  - /features (modules)
- Security:
  - Never log sensitive journal content in server logs
  - Basic rate limit for assistant endpoints
  - CSRF protection via auth, and safe headers
- Tests:
  - Basic unit tests for domain utils (vitest)
  - Minimal e2e smoke (Playwright) optional if time
- Lint/format:
  - ESLint + Prettier
- Provide a .env.example and setup docs

========================
DATA MODEL (PRISMA)
========================
Create Prisma schema with:
- User: id, email, passwordHash, createdAt
- PartnerProfile: id, userId, displayName, loveLanguages (json), triggers (json), calmers (json), preferences (json), boundaries (json), updatedAt
- Event: id, userId, title, dateTime, category, notes, createdAt, updatedAt
- Reminder: id, eventId, offsetMinutes, channel (inApp|push), enabled
- JournalEntry: id, userId, happenedAt, mood (enum), tags (string[]), what, feelings, outcome, createdAt
- ConversationDraft: id, userId, createdAt, inputContext, intent, tone, outputText, riskFlags (json), bridgeQuestion, used (bool)
- ConflictCase: id, userId, createdAt, topic, intensity (1-10), goal (repair|clarify|boundary), generatedMessage, nvcMessage, nextSteps (json), resolutionNotes, learnings (json)

Add indexes on userId and happenedAt/dateTime fields.

========================
FEATURE DETAILS
========================
A) Today suggestions
- Implement a simple rules engine initially:
  - If mood = tense -> suggest calming gestures and “bridge question”
  - If upcoming event in <= 7 days -> suggest plan related
- Later AI can enhance, but MVP must work without AI.

B) Assistant provider interface
- Create an interface:
  - generateConversationDrafts({context,intent}): returns 3 drafts + flags + bridge + NVC
- Implement:
  - MockProvider: deterministic drafts using templates
  - OpenAIProvider: if OPENAI_API_KEY is set (do not hardcode model; use env)

C) Guardrails
- Before returning drafts, run a safety filter:
  - Ban instructions: lie, hide, threaten, guilt-trip, manipulate
  - If detected, replace with a refusal + safe alternatives (empathetic, honest, boundary-setting)
- Add a “Principles” note in UI: honesty, empathy, consent, respect.

D) Notifications
- Implement Web Push subscription:
  - POST /api/push/subscribe
  - POST /api/push/unsubscribe
  - POST /api/push/test
- Schedule reminders:
  - MVP uses a cron-like job runner:
    - Provide a local node script `pnpm reminders:run` that checks due reminders and sends push/in-app
    - In production, user can run via serverless cron; document it
- In-app notifications:
  - Persist Notification entries (create table if needed) or store due reminders in DB and show in UI.

E) Offline sync
- Use IndexedDB to store:
  - events, journalEntries, mood status, lastSyncAt
  - a “queue” table for pending mutations
- On reconnect:
  - flush queue via API
  - conflict resolution: last-write-wins is fine for MVP

========================
PAGES / ROUTES
========================
- / (redirect to /today)
- /today
- /events
- /events/new, /events/[id]/edit
- /journal
- /journal/new, /journal/[id]
- /assistant
- /conflicts
- /conflicts/new
- /profile (partner profile)
- /settings (PWA install help, notifications, provider config)

========================
UI REQUIREMENTS
========================
- Bottom tab navigation on mobile (Today, Events, Journal, Assistant, Profile)
- Use shadcn/ui components
- Use toast notifications for actions
- Use modal sheets for quick add (event/journal)
- Keep typography readable, spacing generous
- Provide dark mode support

========================
DELIVERABLES
========================
1) A complete repository with all code
2) Setup instructions in README:
   - pnpm install
   - docker-compose up -d (postgres)
   - prisma migrate dev
   - pnpm dev
3) .env.example with required vars:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
   - OPENAI_API_KEY (optional)
4) Scripts:
   - pnpm db:up / db:down
   - pnpm prisma:generate / prisma:migrate
   - pnpm reminders:run
5) Ensure PWA:
   - manifest.json (name, icons, theme colors)
   - service worker configured
   - offline caching works and can install

========================
IMPLEMENTATION INSTRUCTIONS (CRUCIAL)
========================
- Output code as real files and patches, not pseudo-code.
- Create a folder structure and write each file completely.
- Use Server Actions and/or API routes as appropriate.
- Ensure TypeScript strict passes.
- Ensure build passes.
- Include minimal seed script to create a demo user and sample events/journal entries.
- Avoid overengineering.

========================
ACCEPTANCE CRITERIA
========================
- App runs locally and can be installed as PWA
- User can sign up/login, create events, reminders, journal entries
- Today shows suggestions and upcoming reminders
- Assistant returns 3 drafts even without OpenAI key (MockProvider)
- Offline mode: events and journal lists still open and show cached data
- Reconnect triggers sync of queued mutations
- No manipulative/unsafe assistant outputs

Now implement the entire project.
Start by listing the file tree you will create, then create the files in logical order.
