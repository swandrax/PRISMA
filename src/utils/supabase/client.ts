import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use standard ANON_KEY with fallback to legacy PUBLISHABLE_KEY for backward compatibility
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl!, supabaseKey!);
  }
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl!, supabaseKey!);
  }
  return supabaseInstance;
};

