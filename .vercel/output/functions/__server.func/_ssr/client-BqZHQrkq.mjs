import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
const AUTH_CHANNEL_NAME = "kck_auth_sync_channel";
const getAuthBroadcastChannel = () => {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      return new BroadcastChannel(AUTH_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
};
const broadcastAuthChange = (type) => {
  const channel = getAuthBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage({ type, timestamp: Date.now() });
      channel.close();
    } catch {
    }
  }
};
const MAX_CHUNK_SIZE = 3e3;
const rootDomainCookieStorage = {
  getItem: (key) => {
    if (typeof document === "undefined") return null;
    const encodedKey = encodeURIComponent(key);
    const cookies = document.cookie.split(";");
    const namePrefix = `${encodedKey}=`;
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf(namePrefix) === 0) {
        try {
          return decodeURIComponent(c.substring(namePrefix.length));
        } catch {
          return c.substring(namePrefix.length);
        }
      }
    }
    let chunkedValue = "";
    let idx = 0;
    while (true) {
      const chunkPrefix = `${encodeURIComponent(`${key}.${idx}`)}=`;
      let found = false;
      for (let i = 0; i < cookies.length; i++) {
        const c = cookies[i].trim();
        if (c.indexOf(chunkPrefix) === 0) {
          try {
            chunkedValue += decodeURIComponent(c.substring(chunkPrefix.length));
          } catch {
            chunkedValue += c.substring(chunkPrefix.length);
          }
          found = true;
          break;
        }
      }
      if (!found) break;
      idx++;
    }
    if (chunkedValue) {
      return chunkedValue;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    if (typeof document === "undefined") return;
    const isKalvarija = typeof window !== "undefined" && window.location.hostname.includes("kalvarija.si");
    const domainPart = isKalvarija ? "; domain=.kalvarija.si" : "";
    const securePart = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
    const maxAge = 60 * 60 * 24 * 365;
    try {
      localStorage.setItem(key, value);
    } catch {
    }
    const encodedVal = encodeURIComponent(value);
    if (encodedVal.length <= MAX_CHUNK_SIZE) {
      document.cookie = `${encodeURIComponent(key)}=${encodedVal}; path=/; max-age=${maxAge}; SameSite=Lax${domainPart}${securePart}`;
      let idx = 0;
      while (idx < 5) {
        document.cookie = `${encodeURIComponent(`${key}.${idx}`)}=; path=/; max-age=0; SameSite=Lax${domainPart}`;
        idx++;
      }
      return;
    }
    let offset = 0;
    let chunkIdx = 0;
    while (offset < encodedVal.length) {
      const chunk = encodedVal.substring(offset, offset + MAX_CHUNK_SIZE);
      document.cookie = `${encodeURIComponent(`${key}.${chunkIdx}`)}=${chunk}; path=/; max-age=${maxAge}; SameSite=Lax${domainPart}${securePart}`;
      offset += MAX_CHUNK_SIZE;
      chunkIdx++;
    }
    document.cookie = `${encodeURIComponent(key)}=; path=/; max-age=0; SameSite=Lax${domainPart}`;
  },
  removeItem: (key) => {
    if (typeof document === "undefined") return;
    const isKalvarija = typeof window !== "undefined" && window.location.hostname.includes("kalvarija.si");
    const currentHost = typeof window !== "undefined" ? window.location.hostname : "";
    const removeSingle = (k) => {
      const enc = encodeURIComponent(k);
      if (isKalvarija) {
        document.cookie = `${enc}=; path=/; domain=.kalvarija.si; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
      if (currentHost) {
        document.cookie = `${enc}=; path=/; domain=${currentHost}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
      document.cookie = `${enc}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      try {
        localStorage.removeItem(k);
      } catch {
      }
    };
    removeSingle(key);
    for (let i = 0; i < 10; i++) {
      removeSingle(`${key}.${i}`);
    }
  }
};
const performGlobalSignOut = async () => {
  try {
    if (supabase) {
      await supabase.auth.signOut({ scope: "global" }).catch(() => {
      });
    }
  } catch {
  }
  const cookieKeysToWipe = [
    "sb-ptdvcobgplmngnhkjqag-auth-token",
    "sb-ptdvcobgplmngnhkjqag-auth-token-code-verifier",
    "supabase.auth.token",
    "kck_user_session",
    "church_roster_user_v1"
  ];
  cookieKeysToWipe.forEach((k) => rootDomainCookieStorage.removeItem(k));
  try {
    localStorage.removeItem("kck_user_session");
    localStorage.removeItem("church_roster_user_v1");
    localStorage.removeItem("sb-ptdvcobgplmngnhkjqag-auth-token");
    localStorage.removeItem("sb-ptdvcobgplmngnhkjqag-auth-token-code-verifier");
    localStorage.removeItem("supabase.auth.token");
  } catch {
  }
  broadcastAuthChange("GLOBAL_SIGNOUT");
};
function createSupabaseClient() {
  const SUPABASE_URL = typeof import.meta !== "undefined" && "https://ptdvcobgplmngnhkjqag.supabase.co" || typeof process !== "undefined" && process.env?.SUPABASE_URL || "https://ptdvcobgplmngnhkjqag.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = typeof import.meta !== "undefined" && "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZHZjb2JncGxtbmduaGtqcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTIwNzcsImV4cCI6MjEwMjk4ODA3N30.i9-UFVwAavIuDZO51YEkL0-yt6Rzmg6ZkMGqkRl_JMo" || typeof process !== "undefined" && (process.env?.SUPABASE_PUBLISHABLE_KEY || process.env?.VITE_SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZHZjb2JncGxtbmduaGtqcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTIwNzcsImV4cCI6MjEwMjk4ODA3N30.i9-UFVwAavIuDZO51YEkL0-yt6Rzmg6ZkMGqkRl_JMo";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: rootDomainCookieStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce"
    }
  });
}
const supabase = createSupabaseClient();
export {
  broadcastAuthChange as b,
  getAuthBroadcastChannel as g,
  performGlobalSignOut as p,
  supabase as s
};
