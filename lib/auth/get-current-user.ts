import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

/**
 * Get the currently authenticated user on the server
 * Returns null if no user is logged in
 * Use this in Server Components, API routes, and Server Actions
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Require authentication - throws or redirects if not authenticated
 * Use this when a page/route requires a logged-in user
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

/**
 * Get the currently authenticated admin user
 * Returns the user if they are an admin, otherwise null
 * Use this to conditionally show admin features
 */
export async function getCurrentAdmin(): Promise<User | null> {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const supabase = await createClient()

  // Check if user exists in admin_users table
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    return null
  }

  return user
}

/**
 * Require admin authorization - redirects to home if not admin
 * Use this in Server Components and Server Actions that require admin access
 */
export async function requireAdmin(): Promise<User> {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect("/")
  }

  return admin
}
