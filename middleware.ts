import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ACCESS_COOKIE = 'olevium_access_token';
const REFRESH_COOKIE = 'olevium_refresh_token';

const DASHBOARD_PATH = '/dashboard';
const AUTH_PREFIX = '/auth';

const isAuthRoute = (pathname: string) =>
  pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`);

const isLandingRoute = (pathname: string) =>
  pathname === '/' || pathname.startsWith('/landing') || pathname.startsWith('/app-demo');

const isLegacyDashboardRoute = (pathname: string) =>
  pathname === '/app' || pathname.startsWith('/app/');

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const isAuthenticated = Boolean(accessToken || refreshToken);

  if (isAuthenticated) {
    if (isLandingRoute(pathname) || isAuthRoute(pathname) || isLegacyDashboardRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = DASHBOARD_PATH;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (isAuthRoute(pathname) || pathname === '/') {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map|txt|woff|woff2|ttf|eot)$).*)'],
};
