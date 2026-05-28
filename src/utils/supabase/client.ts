import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use standard ANON_KEY with fallback to legacy PUBLISHABLE_KEY for backward compatibility
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Validation on startup
const isDev = process.env.NODE_ENV === "development";

if (!supabaseUrl || !supabaseKey) {
  const errMsg = "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing! Please configure them in your environment.";
  if (isDev) {
    throw new Error(errMsg);
  } else {
    console.error(errMsg);
  }
}

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials are missing! Utilizing fallback mock client to prevent page crashes.");
    
    // Return a structured dummy client that fails gracefully on auth and database calls
    const mockClient = {
      auth: {
        signUp: async () => ({
          data: { user: null },
          error: { message: "Layanan pendaftaran tidak tersedia karena konfigurasi server tidak lengkap. Hubungi admin.", status: 500 }
        }),
        signInWithPassword: async () => ({
          data: { user: null },
          error: { message: "Layanan login tidak tersedia karena konfigurasi server tidak lengkap. Hubungi admin.", status: 500 }
        }),
        signOut: async () => {},
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } }
        }),
        resetPasswordForEmail: async () => ({
          error: { message: "Layanan reset password tidak tersedia karena konfigurasi server tidak lengkap.", status: 500 }
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: { message: "Database tidak tersedia karena konfigurasi server tidak lengkap." }
            })
          }),
          order: () => ({
            limit: async () => ({
              data: [],
              error: { message: "Database tidak tersedia." }
            })
          }),
          async then(resolve: (value: unknown) => void) {
            resolve({ data: [], error: { message: "Database tidak tersedia." } });
          }
        }),
        upsert: async () => ({
          data: null,
          error: { message: "Database tidak tersedia karena konfigurasi server tidak lengkap." }
        }),
        insert: async () => ({
          data: null,
          error: { message: "Database tidak tersedia karena konfigurasi server tidak lengkap." }
        }),
        update: () => ({
          eq: async () => ({
            data: null,
            error: { message: "Database tidak tersedia." }
          })
        }),
        delete: () => ({
          eq: async () => ({
            data: null,
            error: { message: "Database tidak tersedia." }
          })
        })
      })
    };
    return mockClient as unknown as ReturnType<typeof createBrowserClient>;
  }

  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseKey);
  }
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
};

