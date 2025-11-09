'use client';

const ACCESS_COOKIE = 'olevium_access_token';
const REFRESH_COOKIE = 'olevium_refresh_token';
const TYPE_COOKIE = 'olevium_token_type';
const ONE_DAY_SECONDS = 60 * 60 * 24;

interface CookieOptions {
  maxAge?: number;
}

const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  if (typeof document === 'undefined') {
    return;
  }

  const { maxAge = ONE_DAY_SECONDS } = options;
  const segments = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'SameSite=Lax'];

  if (maxAge >= 0) {
    segments.push(`Max-Age=${maxAge}`);
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    segments.push('Secure');
  }

  document.cookie = segments.join('; ');
};

const removeCookie = (name: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.slice(name.length + 1));
    }
  }
  return null;
};

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
}

export const tokenStorage = {
  save(tokens: StoredTokens) {
    if (tokens.accessToken) {
      setCookie(ACCESS_COOKIE, tokens.accessToken, { maxAge: ONE_DAY_SECONDS });
    } else {
      removeCookie(ACCESS_COOKIE);
    }

    if (tokens.refreshToken) {
      // Refresh tokens suelen vivir más tiempo (por ejemplo 30 días)
      setCookie(REFRESH_COOKIE, tokens.refreshToken, { maxAge: ONE_DAY_SECONDS * 30 });
    } else {
      removeCookie(REFRESH_COOKIE);
    }

    if (tokens.tokenType) {
      setCookie(TYPE_COOKIE, tokens.tokenType, { maxAge: ONE_DAY_SECONDS * 30 });
    } else {
      removeCookie(TYPE_COOKIE);
    }
  },

  read(): StoredTokens {
    return {
      accessToken: readCookie(ACCESS_COOKIE),
      refreshToken: readCookie(REFRESH_COOKIE),
      tokenType: readCookie(TYPE_COOKIE),
    };
  },

  clear() {
    removeCookie(ACCESS_COOKIE);
    removeCookie(REFRESH_COOKIE);
    removeCookie(TYPE_COOKIE);
  },
};
