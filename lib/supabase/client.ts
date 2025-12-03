import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

/**
 * Creates or returns the singleton Supabase browser client.
 * Use this in all client components ("use client").
 *
 * The singleton pattern ensures only one GoTrueClient instance exists
 * in the browser context, preventing auth state conflicts.
 */
export function createClient(): SupabaseClient {
  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  return browserClient
}

/**
 * Returns the existing browser client without creating a new one.
 * Useful when you need to check if a client already exists.
 */
export function getClient(): SupabaseClient | null {
  return browserClient
}
