# olevium-frontend — Guía para Claude

Ver también: [`../CLAUDE.md`](../CLAUDE.md) para overview del proyecto, flujo de datos y variables de entorno.

---

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **TanStack Query v5** — Estado del servidor (fetch, cache, mutations)
- **Zustand v5** — Estado del cliente (auth store)
- **lucide-react** — Iconos
- **chart.js + react-chartjs-2** — Gráficos (dashboard)
- **Playwright** — Tests E2E (`e2e/`)
- **npm** como package manager (no bun, no yarn)

---

## Estructura de carpetas

```
olevium-frontend/src/
├── app/
│   ├── layout.tsx                  # Layout raíz global
│   ├── page.tsx                    # Redirect a /dashboard o /auth
│   ├── globals.css
│   ├── api/
│   │   └── auth/clear-session/     # Route handler para limpiar cookies de auth
│   ├── landing/                    # Landing page pública
│   │   └── _components/
│   └── (app)/                      # Route group: todas las rutas de la app
│       ├── layout.tsx              # Layout protegido: NavBar + FloatingActions + ClientProviders
│       ├── dashboard/              # Dashboard principal con gráficos y stats
│       │   ├── _api/index.ts       # Fetch server-side de datos del dashboard
│       │   ├── _components/        # DashboardStatsCards, charts, AccountsBalanceList, etc.
│       │   ├── _context/           # DashboardContext (provider con datos iniciales)
│       │   ├── _skeletons/
│       │   └── page.tsx
│       ├── accounts/
│       │   ├── _api/index.ts
│       │   ├── _components/        # AccountsTable, AccountsView, forms...
│       │   ├── _context/           # AccountsContext
│       │   ├── _skeletons/
│       │   ├── [accountId]/        # Detalle de cuenta
│       │   │   ├── _api/
│       │   │   ├── _components/
│       │   │   ├── _context/
│       │   │   └── _skeletons/
│       │   └── page.tsx
│       ├── transactions/           # Lista global de transacciones + filtros
│       ├── categories/             # CRUD categorías (sección user + sección default)
│       ├── recurring-transactions/ # CRUD recurrentes
│       ├── profile/                # Perfil, cambio de contraseña
│       └── auth/                   # Login, signup, verify email, reset password
├── components/
│   ├── layout/                     # NavBar, FeedbackWidget, FloatingActions, WhatsAppWidget
│   ├── providers/                  # ClientProviders (QueryClient, contexts)
│   └── shared/
│       ├── forms/
│       │   └── TransactionForm.tsx # Formulario de transacción compartido
│       └── ui/                     # Sistema de UI propio:
│           ├── buttons/            # Button, ActionButton, ButtonBase
│           ├── content/            # Card, Box, Container, Banner, Chip, AccentSurface
│           ├── inputs/             # Input, DropMenu, FieldWrapper, DateInput, MonthInput
│           ├── wrappers/           # ModalWrapper, FormWrapper, NotificationWrapper, OverlayBase
│           ├── text/               # Typography, Link, AppLink, Tooltip
│           ├── header/             # PageHeader
│           └── feedback/           # Skeleton
├── features/                       # TanStack Query hooks compartidos entre páginas
│   ├── accounts/queries.ts
│   ├── auth/mutations.ts
│   ├── categories/queries.ts
│   ├── recurring-transactions/     # queries.ts, mutations.ts
│   ├── transactions/queries.ts
│   └── user/                       # queries.ts, mutations.ts
├── lib/
│   ├── http.ts                     # apiRequest() — cliente HTTP con fetch + Bearer token
│   ├── api/                        # Funciones de API organizadas por dominio:
│   │   ├── index.ts                # Re-exporta todo
│   │   ├── accounts.ts             # getAccounts, postAccount, putAccount, deleteAccount, etc.
│   │   ├── transactions.ts         # getTransactions, exportTransactionsCsv, etc.
│   │   ├── categories.ts           # getCategories, postCategory, deactivateCategory, etc.
│   │   ├── recurring.ts            # getRecurringTransactions
│   │   └── user.ts                 # getCurrentUser, postFeedback
│   ├── auth.ts                     # login(), signup(), logout(), forgotPassword()
│   ├── server-auth/index.ts        # requireAuth(), redirectIfAuthenticated(), withAuthProtection()
│   ├── stores/
│   │   └── auth.ts                 # Zustand store de auth
│   ├── hooks/
│   │   └── useErrorHandler.ts
│   ├── utils/                      # errorHandling, errorSystem, parser, tokenStorage, transactions
│   ├── format.ts                   # Formateo de moneda, fechas
│   ├── types.ts                    # Tipos de dominio compartidos
│   └── category-presets.ts
├── types/                          # Interfaces TypeScript por dominio
│   ├── index.ts
│   ├── accounts.ts
│   ├── transactions.ts
│   ├── recurring.ts
│   ├── currency.ts
│   ├── user.ts
│   ├── common.ts
│   └── ColorKey.ts
└── context/
    ├── ModalContext.tsx
    ├── NotificationContext.tsx
    └── TransactionContext.tsx
```

---

## Patrón de páginas (App Router server components)

Las páginas de la app usan **server components** con fetch server-side:

```typescript
// page.tsx (server component)
export default async function DashboardPage() {
  await requireAuth();                               // redirige a /auth si no hay sesión
  const result = await withAuthProtection(() => getDashboardPageData());
  const data = await handleProtectedResult(result); // redirige a /api/auth/clear-session si expiró
  return <Provider initialData={data}>...</Provider>;
}

// _api/index.ts — fetches server-side con cookies
export async function getDashboardPageData() {
  const [accounts, transactions] = await Promise.all([getAccounts(), getTransactions()]);
  return { accounts: accounts.data, transactions: transactions.data };
}
```

---

## Autenticación en el frontend

- El token se guarda en **cookies** (`olevium_access_token`, `olevium_refresh_token`) además del store Zustand
- `src/lib/server-auth/index.ts` — helpers para server components: `requireAuth()`, `redirectIfAuthenticated()`, `withAuthProtection()`
- `/api/auth/clear-session` — Next.js route handler que limpia las cookies y redirige a `/auth`
- `src/lib/http.ts` — para client components, inyecta el Bearer token automáticamente desde el store Zustand

---

## Convenciones

- Todas las rutas de la app viven bajo el route group `(app)/`; la landing pública vive en `landing/`
- Co-ubicación por feature: `_api/`, `_components/`, `_context/`, `_skeletons/` dentro de cada ruta
- Las queries TanStack Query van en `src/features/*/queries.ts`; usar `*Keys` para invalidación
- Las funciones de API se importan desde `@/lib/api` (el `index.ts` re-exporta todo)
- Los tipos de dominio van en `src/types/`; los tipos de payload de API en `src/lib/api/types.ts`
- **No usar** shadcn/ui, MUI u otras librerías de UI externas — el proyecto tiene su propio sistema en `src/components/shared/ui/`
- El sistema de UI NO usa Radix, Dialog, ni librerías de accesibilidad externas

---

## Comandos frecuentes

```bash
# Desarrollo
npm run dev        # Puerto 8765

# Build
npm run build

# Lint
npm run lint

# Tests E2E
npx playwright test
```
