import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que deberían redirigir a /dashboard si hay sesión activa
const PUBLIC_ROUTES_REDIRECT_WHEN_AUTHED = ['/', '/auth', '/landing'];

// Rutas que siempre son públicas (no redirigir)
const ALWAYS_PUBLIC = [
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/verify-cta',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar archivos estáticos y API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // archivos con extensión (favicon.ico, etc.)
  ) {
    return NextResponse.next();
  }

  // Verificar si es una ruta que siempre es pública
  if (ALWAYS_PUBLIC.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar tokens de autenticación
  const accessToken = request.cookies.get('olevium_access_token')?.value;
  const refreshToken = request.cookies.get('olevium_refresh_token')?.value;
  const hasSession = Boolean(accessToken || refreshToken);

  // Si hay sesión y está en una ruta pública, redirigir a dashboard
  if (hasSession && PUBLIC_ROUTES_REDIRECT_WHEN_AUTHED.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
