"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/get-current-user"

export interface StoreFormData {
  name: string
  chain: string
  lat: number
  lon: number
  address_line1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export async function createStore(data: StoreFormData) {
  // Require admin authentication
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase.from("stores").insert({
    name: data.name,
    chain: data.chain,
    lat: data.lat,
    lon: data.lon,
    address_line1: data.address_line1 || null,
    city: data.city || null,
    state: data.state || null,
    postal_code: data.postal_code || null,
    country: data.country || "US",
    metadata: {},
  })

  if (error) {
    console.error("Error creating store:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/stores")
  return { success: true }
}

export async function updateStore(id: number, data: StoreFormData) {
  // Require admin authentication
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from("stores")
    .update({
      name: data.name,
      chain: data.chain,
      lat: data.lat,
      lon: data.lon,
      address_line1: data.address_line1 || null,
      city: data.city || null,
      state: data.state || null,
      postal_code: data.postal_code || null,
      country: data.country || "US",
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating store:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/stores")
  return { success: true }
}

export async function deleteStore(id: number) {
  // Require admin authentication
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase.from("stores").delete().eq("id", id)

  if (error) {
    console.error("Error deleting store:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/stores")
  return { success: true }
}
