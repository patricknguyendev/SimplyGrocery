"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/get-current-user"

export interface ProductFormData {
  name: string
  brand?: string
  category?: string
  size_value?: number
  size_unit?: string
  upc?: string
}

export async function createProduct(data: ProductFormData) {
  // Require admin authentication
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase.from("products").insert({
    name: data.name,
    brand: data.brand || null,
    category: data.category || null,
    size_value: data.size_value || null,
    size_unit: data.size_unit || null,
    upc: data.upc || null,
    metadata: {},
  })

  if (error) {
    console.error("Error creating product:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  return { success: true }
}

export async function updateProduct(id: number, data: ProductFormData) {
  // Require admin authentication
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      brand: data.brand || null,
      category: data.category || null,
      size_value: data.size_value || null,
      size_unit: data.size_unit || null,
      upc: data.upc || null,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating product:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  return { success: true }
}

export async function deleteProduct(id: number) {
  // Require admin authentication
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  return { success: true }
}
