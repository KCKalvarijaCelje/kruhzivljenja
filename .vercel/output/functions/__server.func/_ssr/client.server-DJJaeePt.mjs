import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://ptdvcobgplmngnhkjqag.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZHZjb2JncGxtbmduaGtqcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTIwNzcsImV4cCI6MjEwMjk4ODA3N30.i9-UFVwAavIuDZO51YEkL0-yt6Rzmg6ZkMGqkRl_JMo";
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
let _supabaseAdmin;
const supabaseAdmin = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  }
});
export {
  supabaseAdmin as s
};
