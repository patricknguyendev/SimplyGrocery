import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"

/**
 * Creates a Supabase client for server-side operations.
 * Use this in:
 * - Server Components (app/page.tsx, app/trip/[id]/page.tsx, etc.)
 * - API Route Handlers (app/api/.../route.ts)
 * - Server Actions
 *
 * Uses React's cache() to ensure only one client is created per request,
 * preventing "Multiple GoTrueClient instances" warnings.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
    auth: {
      // Disable session persistence on server - we're stateless
      persistSession: false,
      // Don't try to detect session from URL on server
      detectSessionInUrl: false,
      // Reduce polling to minimize client instances
      autoRefreshToken: false,
    },
  })
})
