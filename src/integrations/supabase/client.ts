import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Root-domain cookie adapter for Single Sign-On (SSO) across *.kalvarija.si subdomains
 */
const rootDomainCookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    const name = encodeURIComponent(key) + '=';
    const parts = document.cookie.split(';');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.indexOf(name) === 0) {
        return decodeURIComponent(part.substring(name.length));
      }
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return;
    const isKalvarija = typeof window !== 'undefined' && window.location.hostname.includes('kalvarija.si');
    const domain = isKalvarija ? '; domain=.kalvarija.si' : '';
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/${domain}; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return;
    const isKalvarija = typeof window !== 'undefined' && window.location.hostname.includes('kalvarija.si');
    const domain = isKalvarija ? '; domain=.kalvarija.si' : '';
    document.cookie = `${encodeURIComponent(key)}=; path=/${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};

function createSupabaseClient() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Please check your .env or server environment variables.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: rootDomainCookieStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
