/**
 * Product matching using ILIKE-based search
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Product } from "@/lib/db/types"
import type { TripItemRequest, MatchedItem } from "./types"

/**
 * Matches raw query strings to products using ILIKE search
 * Returns best match for each item based on name similarity
 */
export async function matchProducts(
  supabase: SupabaseClient,
  items: TripItemRequest[],
): Promise<{ matched: MatchedItem[]; unmatched: TripItemRequest[] }> {
  const matched: MatchedItem[] = []
  const unmatched: TripItemRequest[] = []

  for (const item of items) {
    const product = await findBestMatch(supabase, item.rawQuery)

    if (product) {
      matched.push({
        rawQuery: item.rawQuery,
        quantity: item.quantity,
        product,
      })
    } else {
      unmatched.push(item)
    }
  }

  return { matched, unmatched }
}

/**
 * Finds the best matching product for a raw query
 * Uses ILIKE with progressively broader matching
 */
async function findBestMatch(supabase: SupabaseClient, rawQuery: string): Promise<Product | null> {
  const normalizedQuery = rawQuery.toLowerCase().trim()

  // Strategy 1: Exact name match (case-insensitive)
  let result = await supabase.from("products").select("*").ilike("name", normalizedQuery).limit(1)

  if (result.data && result.data.length > 0) {
    return result.data[0] as Product
  }

  // Strategy 2: Name contains query
  result = await supabase.from("products").select("*").ilike("name", `%${normalizedQuery}%`).limit(5)

  if (result.data && result.data.length > 0) {
    // Return shortest match (most specific)
    return result.data.sort((a, b) => a.name.length - b.name.length)[0] as Product
  }

  // Strategy 3: Query contains product name words
  const queryWords = normalizedQuery.split(/\s+/)

  for (const word of queryWords) {
    if (word.length < 3) continue // Skip short words
    result = await supabase.from("products").select("*").ilike("name", `%${word}%`).limit(5)

    if (result.data && result.data.length > 0) {
      return result.data[0] as Product
    }
  }

  // Strategy 4: Match by category
  const categoryKeywords: Record<string, string[]> = {
    Dairy: ["milk", "cheese", "yogurt", "butter", "cream", "egg"],
    Produce: ["apple", "banana", "lettuce", "tomato", "onion", "potato", "garlic", "lemon", "avocado", "spinach"],
    Meat: ["beef", "chicken", "pork", "bacon", "sausage"],
    Seafood: ["fish", "salmon", "shrimp", "tuna", "tilapia"],
    Bread: ["bread", "loaf"],
    Pasta: ["pasta", "spaghetti", "penne", "noodle"],
    Beverage: ["juice", "coffee", "water", "soda", "cola"],
    Frozen: ["frozen", "ice cream", "pizza", "waffle"],
    Snacks: ["chips", "nuts", "granola", "almonds"],
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => normalizedQuery.includes(kw))) {
      result = await supabase.from("products").select("*").eq("category", category).limit(1)

      if (result.data && result.data.length > 0) {
        return result.data[0] as Product
      }
    }
  }

  return null
}

/**
 * Gets prices for a list of products across specified stores
 */
export async function getPricesForProducts(
  supabase: SupabaseClient,
  productIds: number[],
  storeIds: number[],
): Promise<Map<string, { price: number; inStock: boolean }>> {
  const { data, error } = await supabase
    .from("store_product_prices")
    .select("store_id, product_id, price, in_stock")
    .in("product_id", productIds)
    .in("store_id", storeIds)

  if (error || !data) {
    return new Map()
  }

  const priceMap = new Map<string, { price: number; inStock: boolean }>()
  for (const row of data) {
    const key = `${row.store_id}-${row.product_id}`
    priceMap.set(key, { price: row.price, inStock: row.in_stock })
  }

  return priceMap
}
