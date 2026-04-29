# Olevium Frontend — Guía de Desarrollo

## Arquitectura & Diseño de Código

👉 Ver [`ARCHITECTURE.md`](./.claude/ARCHITECTURE.md) para:

- **Stack**: NextJS 16, React 19, Tailwind, TanStack Query, framer-motion, driver.js, etc.
- **Estructura de carpetas** y patrón de co-ubicación
- **Patrón de páginas** (App Router server components)
- **Sistema de autenticación** (cookies, server-auth, auto-refresh)
- **Data flow** y TanStack Query integration
- **Sistema de onboarding** (driver.js tours)
- **Cambios futuros**: Sistema de freemium (paywall + feature gating)

## Convenciones de Desarrollo

- Todas las rutas de la app viven bajo el route group `(app)/`; la landing pública vive en `landing/`
- Co-ubicación por feature: `_api/`, `_components/`, `_context/`, `_skeletons/` dentro de cada ruta
- Las queries TanStack Query van en `src/features/*/queries.ts`; usar `*Keys` para invalidación
- Las funciones de API se importan desde `@/lib/api` (el `index.ts` re-exporta todo)
- Los tipos de dominio van en `src/types/`; los tipos de payload de API en `src/lib/api/types.ts`
- **No usar** shadcn/ui, MUI u otras librerías de UI externas — el proyecto tiene su propio sistema en `src/components/shared/ui/`
- El sistema de UI NO usa Radix, Dialog, ni librerías de accesibilidad externas

---

## Design System

> ⚠️ **Nota**: Este contenido será refactorizado a `DESIGN.md` con detalles completos de look and feel, paleta de colores y guías visuales.

### CSS Custom Properties

En el archivo `global.css` podes encontrar las configuraciones de tokens para tailwind para la paleta de colores.

### Componentes

Siempre preferir componentes de la libreria del proyecto antes que HTML clasico

| En lugar de                     | Usar                                                     |
| ------------------------------- | -------------------------------------------------------- |
| `<h1>`, `<h2>`, `<p>`, `<span>` | `<Typography variant="h1\|h2\|subtitle\|body\|caption">` |
| `<button>`                      | `<Button>` o `<ActionButton>` (icon-only)                |
| `<input>`, `<select>`           | `<Input>`, `<DateInput>`, `<DropMenu>`                   |
| `<div>` estructural             | `<Card>`, `<Box>`, `<Container>`                         |
| `<a>`                           | `<AppLink>` o `<Link>`                                   |
| Modal custom                    | `<ModalWrapper>`                                         |
| Campo de formulario             | `<FieldWrapper>`                                         |

Typography variants: `h1`, `h2`, `subtitle` (→ h3), `body` (→ p), `link` (→ span), `caption` (→ p)

Button `type` prop (`ColorKey`): `primary`, `secondary`, `success`, `accent`, `warning`, `error`, `danger`, `info`, `neutral`

---

## SEO

- **Páginas públicas** (`/landing`, `/`): metadata completo con OG + Twitter Card
- **Páginas autenticadas** (`(app)/`): `robots: { index: false, follow: false }` obligatorio
- `<html lang="es">` en root layout
- Siempre `next/image` para imágenes, `next/font` para fuentes

---

## Comandos frecuentes

```bash
# Desarrollo
npm run dev        # Puerto 8765

# Build
npm run build

# Lint
npm run lint

```
