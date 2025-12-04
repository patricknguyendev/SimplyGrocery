"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/get-current-user"

export async function updatePrice(storeId: number, productId: number, price: number, inStock: boolean) {
  // Require admin authentication
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from("store_product_prices")
    .update({
      price,
      in_stock: inStock,
      last_updated_at: new Date().toISOString(),
    })
    .eq("store_id", storeId)
    .eq("product_id", productId)

  if (error) {
    console.error("Error updating price:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/prices")
  return { success: true }
}

export async function addPrice(storeId: number, productId: number, price: number, inStock: boolean) {
  // Require admin authentication
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase.from("store_product_prices").insert({
    store_id: storeId,
    product_id: productId,
    price,
    in_stock: inStock,
    currency: "USD",
  })

  if (error) {
    console.error("Error adding price:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/prices")
  return { success: true }
}

export async function deletePrice(storeId: number, productId: number) {
  // Require admin authentication
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from("store_product_prices")
    .delete()
    .eq("store_id", storeId)
    .eq("product_id", productId)

  if (error) {
    console.error("Error deleting price:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/prices")
  return { success: true }
}
