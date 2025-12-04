/**
 * Product matching using ILIKE-based search with synonym support
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Product } from "@/lib/db/types"
import type { TripItemRequest, MatchedItem } from "./types"

// Synonym map for common product names
const SYNONYMS: Record<string, string[]> = {
  "spaghetti sauce": ["marinara sauce", "pasta sauce", "tomato sauce"],
  "marinara sauce": ["spaghetti sauce", "pasta sauce", "tomato sauce"],
  "ground beef": ["minced beef", "beef mince"],
  "minced beef": ["ground beef", "beef mince"],
  "green beans": ["string beans"],
  "string beans": ["green beans"],
  "bell pepper": ["sweet pepper", "capsicum"],
  "soda": ["pop", "soft drink", "cola"],
  "pop": ["soda", "soft drink", "cola"],
  "orange juice": ["oj"],
  "oj": ["orange juice"],
  "chips": ["crisps"],
  "crisps": ["chips"],
  "cookies": ["biscuits"],
  "biscuits": ["cookies"],
  "cilantro": ["coriander"],
  "coriander": ["cilantro"],
  "scallions": ["green onions"],
  "green onions": ["scallions"],
}

interface ScoredProduct {
  product: Product
  score: number
  matchType: "exact" | "synonym" | "word" | "partial" | "category"
}

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
    const result = await findBestMatch(supabase, item.rawQuery)

    if (result) {
      matched.push({
        rawQuery: item.rawQuery,
        quantity: item.quantity,
        product: result.product,
        matchedName: result.product.name,
      })
    } else {
      unmatched.push(item)
    }
  }

  return { matched, unmatched }
}

/**
 * Expands a query with synonyms
 */
function expandQueryWithSynonyms(query: string): string[] {
  const normalized = query.toLowerCase().trim()
  const expansions = [normalized]

  // Check if the query or any substring matches a synonym key
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (normalized.includes(key)) {
      expansions.push(...synonyms)
    }
  }

  return expansions
}

/**
 * Scores a product match based on how well it matches the query
 * Higher scores are better
 */
function scoreMatch(productName: string, query: string): { score: number; matchType: ScoredProduct["matchType"] } {
  const normalizedProduct = productName.toLowerCase().trim()
  const normalizedQuery = query.toLowerCase().trim()

  // Exact match (case-insensitive)
  if (normalizedProduct === normalizedQuery) {
    return { score: 1000, matchType: "exact" }
  }

  // Check for synonym match
  const synonyms = expandQueryWithSynonyms(normalizedQuery)
  for (const synonym of synonyms.slice(1)) {
    // Skip first which is original query
    if (normalizedProduct === synonym) {
      return { score: 900, matchType: "synonym" }
    }
  }

  const productWords = normalizedProduct.split(/\s+/)
  const queryWords = normalizedQuery.split(/\s+/)

  // Exact word match - all query words appear as complete words in product name
  const allWordsMatch = queryWords.every((qw) => productWords.includes(qw))
  if (allWordsMatch) {
    // Higher score if lengths match (more specific)
    const lengthRatio = queryWords.length / productWords.length
    return { score: 800 + lengthRatio * 100, matchType: "word" }
  }

  // Check if any query word matches product words exactly
  const matchingWords = queryWords.filter((qw) => productWords.includes(qw))
  if (matchingWords.length > 0) {
    const wordMatchRatio = matchingWords.length / queryWords.length
    return { score: 600 + wordMatchRatio * 100, matchType: "word" }
  }

  // Partial substring match
  if (normalizedProduct.includes(normalizedQuery)) {
    // Prefer shorter products (more specific)
    const specificity = 1 / (normalizedProduct.length - normalizedQuery.length + 1)
    return { score: 400 + specificity * 100, matchType: "partial" }
  }

  // Query contains product name
  if (normalizedQuery.includes(normalizedProduct)) {
    return { score: 300, matchType: "partial" }
  }

  // Check if any significant word (>2 chars) from query appears in product
  const significantWords = queryWords.filter((w) => w.length > 2)
  const partialMatches = significantWords.filter((qw) => normalizedProduct.includes(qw))
  if (partialMatches.length > 0) {
    const partialRatio = partialMatches.length / significantWords.length
    return { score: 200 + partialRatio * 100, matchType: "partial" }
  }

  return { score: 0, matchType: "partial" }
}

/**
 * Finds the best matching product for a raw query
 * Uses scoring system that prefers exact matches and synonyms
 */
async function findBestMatch(
  supabase: SupabaseClient,
  rawQuery: string,
): Promise<{ product: Product; score: number } | null> {
  const normalizedQuery = rawQuery.toLowerCase().trim()
  const queryExpansions = expandQueryWithSynonyms(normalizedQuery)

  const scoredProducts: ScoredProduct[] = []

  // Strategy 1: Try exact matches and synonym matches
  for (const expansion of queryExpansions) {
    const result = await supabase.from("products").select("*").ilike("name", expansion).limit(1)

    if (result.data && result.data.length > 0) {
      const product = result.data[0] as Product
      const matchScore = scoreMatch(product.name, expansion)
      scoredProducts.push({
        product,
        score: matchScore.score,
        matchType: matchScore.matchType,
      })
    }
  }

  // Strategy 2: Broad search - get candidates and score them
  const result = await supabase.from("products").select("*").ilike("name", `%${normalizedQuery}%`).limit(20)

  if (result.data && result.data.length > 0) {
    for (const product of result.data as Product[]) {
      const matchScore = scoreMatch(product.name, normalizedQuery)
      if (matchScore.score > 0) {
        scoredProducts.push({
          product,
          score: matchScore.score,
          matchType: matchScore.matchType,
        })
      }
    }
  }

  // Strategy 3: Try individual words
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 2)
  for (const word of queryWords) {
    const result = await supabase.from("products").select("*").ilike("name", `%${word}%`).limit(10)

    if (result.data && result.data.length > 0) {
      for (const product of result.data as Product[]) {
        const matchScore = scoreMatch(product.name, normalizedQuery)
        if (matchScore.score > 0) {
          scoredProducts.push({
            product,
            score: matchScore.score,
            matchType: matchScore.matchType,
          })
        }
      }
    }
  }

  // Strategy 4: Category fallback
  if (scoredProducts.length === 0) {
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
        const result = await supabase.from("products").select("*").eq("category", category).limit(5)

        if (result.data && result.data.length > 0) {
          for (const product of result.data as Product[]) {
            scoredProducts.push({
              product,
              score: 100, // Low score for category match
              matchType: "category",
            })
          }
        }
      }
    }
  }

  if (scoredProducts.length === 0) {
    return null
  }

  // Remove duplicates (same product ID)
  const uniqueProducts = new Map<number, ScoredProduct>()
  for (const sp of scoredProducts) {
    const existing = uniqueProducts.get(sp.product.id)
    if (!existing || sp.score > existing.score) {
      uniqueProducts.set(sp.product.id, sp)
    }
  }

  // Get all products with the highest score
  const maxScore = Math.max(...Array.from(uniqueProducts.values()).map((sp) => sp.score))
  const topMatches = Array.from(uniqueProducts.values()).filter((sp) => sp.score === maxScore)

  // If there's a tie, pick the cheapest one
  if (topMatches.length > 1) {
    // Get prices for all top matches to find the cheapest
    const productIds = topMatches.map((m) => m.product.id)
    const { data: prices } = await supabase
      .from("store_product_prices")
      .select("product_id, price")
      .in("product_id", productIds)
      .eq("in_stock", true)

    if (prices && prices.length > 0) {
      // Calculate min price for each product
      const minPrices = new Map<number, number>()
      for (const p of prices) {
        const currentMin = minPrices.get(p.product_id)
        if (!currentMin || p.price < currentMin) {
          minPrices.set(p.product_id, p.price)
        }
      }

      // Find the product with the lowest minimum price
      let cheapest = topMatches[0]
      let lowestPrice = minPrices.get(cheapest.product.id) ?? Infinity

      for (const match of topMatches.slice(1)) {
        const price = minPrices.get(match.product.id) ?? Infinity
        if (price < lowestPrice) {
          lowestPrice = price
          cheapest = match
        }
      }

      return { product: cheapest.product, score: cheapest.score }
    }
  }

  // Return the best match
  return { product: topMatches[0].product, score: topMatches[0].score }
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
