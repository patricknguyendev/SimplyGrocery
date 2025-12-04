/**
 * Main optimizer orchestrator
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Store, Product } from "@/lib/db/types"
import type { TripRequest, TripResponse, MatchedItem, PlanResult, PlanResponse } from "./types"
import { matchProducts, getPricesForProducts } from "./product-matcher"
import { computeCheapestPlan, computeFastestPlan, computeBalancedPlan, calculateSingleChainTotal } from "./strategies"
import { haversineDistance } from "@/lib/geo/distance"
import { getDistanceMatrix, type DistanceMatrixResult, type LatLng } from "@/lib/google/distance-matrix"

const DEFAULT_RADIUS_KM = 15
const DEFAULT_MAX_STORES = 5

/**
 * Fetch distance data from Google Distance Matrix API
 * Gets distances for:
 *   - User origin → all stores
 *   - All stores → all stores (for routing)
 */
async function fetchDistanceData(
  origin: { lat: number; lon: number },
  stores: Store[],
): Promise<DistanceMatrixResult[]> {
  if (stores.length === 0) return []

  const storeLocations: LatLng[] = stores.map(s => ({ lat: s.lat, lon: s.lon }))
  const allResults: DistanceMatrixResult[] = []

  try {
    // Call 1: Origin to all stores
    const originToStores = await getDistanceMatrix(
      [{ lat: origin.lat, lon: origin.lon }],
      storeLocations,
      { mode: 'driving', units: 'metric' },
    )
    allResults.push(...originToStores)

    // Call 2: All stores to all stores (for multi-store routes)
    if (stores.length > 1) {
      const storeToStore = await getDistanceMatrix(
        storeLocations,
        storeLocations,
        { mode: 'driving', units: 'metric' },
      )
      allResults.push(...storeToStore)
    }

    return allResults
  } catch (error) {
    console.error('[Optimizer] Failed to fetch distance data from Google:', error)
    // Return empty array - strategies will fall back to haversine
    return []
  }
}

/**
 * Main entry point for trip optimization
 */
export async function optimizeTrip(
  supabase: SupabaseClient,
  request: TripRequest,
  userId?: string | null,
): Promise<TripResponse> {
  const { origin, items, preferences } = request

  // Validate origin
  if (!origin.lat || !origin.lon) {
    throw new Error("Origin latitude and longitude are required")
  }

  if (!items || items.length === 0) {
    throw new Error("At least one item is required")
  }

  const maxRadiusKm = preferences?.maxRadiusKm || DEFAULT_RADIUS_KM
  const maxStores = preferences?.maxStores || DEFAULT_MAX_STORES
  const strategy = preferences?.strategy || "ALL"

  // Step 1: Find nearby stores
  const stores = await findNearbyStores(supabase, origin.lat, origin.lon, maxRadiusKm, preferences)

  if (stores.length === 0) {
    throw new Error("No stores found within the specified radius")
  }

  // Step 1.5: Get real driving distances from Google Distance Matrix API
  const distanceData = await fetchDistanceData(origin, stores)

  // Step 2: Match products
  const { matched, unmatched } = await matchProducts(supabase, items)

  if (matched.length === 0) {
    throw new Error("Could not match any items to products in our database")
  }

  // Step 3: Get prices for matched products at nearby stores
  const productIds = matched.map((m) => m.product.id)
  const storeIds = stores.map((s) => s.id)
  const priceMap = await getPricesForProducts(supabase, productIds, storeIds)

  // Step 4: Create trip record
  const tripId = await createTrip(supabase, origin, preferences, userId)

  // Step 5: Create trip items and update matched items with IDs
  const tripItems = await createTripItems(supabase, tripId, matched, unmatched)
  for (let i = 0; i < matched.length; i++) {
    matched[i].tripItemId = tripItems[i].id
  }

  // Step 6: Compute plans based on strategy
  const optimizerInput = {
    origin: { lat: origin.lat, lon: origin.lon },
    items: matched,
    stores,
    priceMap,
    maxStores,
    distanceData, // Pass precomputed Google distances
  }

  const plans: PlanResult[] = []

  if (strategy === "ALL" || strategy === "CHEAPEST") {
    const cheapest = computeCheapestPlan(optimizerInput)
    if (cheapest) plans.push(cheapest)
  }

  if (strategy === "ALL" || strategy === "FASTEST") {
    const fastest = computeFastestPlan(optimizerInput)
    if (fastest) plans.push(fastest)
  }

  if (strategy === "ALL" || strategy === "BALANCED") {
    const balanced = computeBalancedPlan(optimizerInput)
    if (balanced) plans.push(balanced)
  }

  if (plans.length === 0) {
    throw new Error("Could not generate any valid trip plans")
  }

  // Step 7: Calculate savings vs single chains
  const walmartTotal = calculateSingleChainTotal("WALMART", matched, stores, priceMap)
  const targetTotal = calculateSingleChainTotal("TARGET", matched, stores, priceMap)
  const costcoTotal = calculateSingleChainTotal("COSTCO", matched, stores, priceMap)

  // Step 8: Persist plans to database
  const savedPlans = await savePlans(supabase, tripId, plans, { walmartTotal, targetTotal, costcoTotal }, matched)

  // Step 9: Build response
  return buildResponse(tripId, origin, tripItems, matched, savedPlans, stores, distanceData)
}

/**
 * Find stores within radius, applying chain filters
 */
async function findNearbyStores(
  supabase: SupabaseClient,
  lat: number,
  lon: number,
  radiusKm: number,
  preferences?: TripRequest["preferences"],
): Promise<Store[]> {
  // Fetch all stores (in production, use PostGIS for spatial queries)
  let query = supabase.from("stores").select("*")

  if (preferences?.includeChains && preferences.includeChains.length > 0) {
    query = query.in("chain", preferences.includeChains)
  }

  if (preferences?.excludeChains && preferences.excludeChains.length > 0) {
    query = query.not("chain", "in", `(${preferences.excludeChains.join(",")})`)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  // Filter by distance
  return data.filter((store) => {
    const distance = haversineDistance(lat, lon, store.lat, store.lon)
    return distance <= radiusKm
  }) as Store[]
}

/**
 * Create trip record
 */
async function createTrip(
  supabase: SupabaseClient,
  origin: TripRequest["origin"],
  preferences?: TripRequest["preferences"],
  userId?: string | null,
): Promise<number> {
  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: userId || null,
      origin_lat: origin.lat,
      origin_lon: origin.lon,
      origin_zip: origin.zip || null,
      settings: {
        max_stores: preferences?.maxStores,
        radius_km: preferences?.maxRadiusKm,
        include_chains: preferences?.includeChains,
        exclude_chains: preferences?.excludeChains,
      },
    })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(`Failed to create trip: ${error?.message}`)
  }

  return data.id
}

/**
 * Create trip items for matched and unmatched items
 */
async function createTripItems(
  supabase: SupabaseClient,
  tripId: number,
  matched: MatchedItem[],
  unmatched: { rawQuery: string; quantity: number }[],
): Promise<{ id: number; rawQuery: string; productId: number | null }[]> {
  const items = [
    ...matched.map((m) => ({
      trip_id: tripId,
      product_id: m.product.id,
      raw_query: m.rawQuery,
      quantity: m.quantity,
    })),
    ...unmatched.map((u) => ({
      trip_id: tripId,
      product_id: null,
      raw_query: u.rawQuery,
      quantity: u.quantity,
    })),
  ]

  const { data, error } = await supabase.from("trip_items").insert(items).select("id, raw_query, product_id")

  if (error || !data) {
    throw new Error(`Failed to create trip items: ${error?.message}`)
  }

  return data.map((d) => ({
    id: d.id,
    rawQuery: d.raw_query,
    productId: d.product_id,
  }))
}

/**
 * Save plans to database
 */
async function savePlans(
  supabase: SupabaseClient,
  tripId: number,
  plans: PlanResult[],
  chainTotals: { walmartTotal: number | null; targetTotal: number | null; costcoTotal: number | null },
  matched: MatchedItem[],
): Promise<{ plan: PlanResult; planId: number }[]> {
  const savedPlans: { plan: PlanResult; planId: number }[] = []

  for (const plan of plans) {
    // Calculate savings
    const savingsVsWalmart = chainTotals.walmartTotal
      ? Math.round((chainTotals.walmartTotal - plan.totalPrice) * 100) / 100
      : null
    const savingsVsTarget = chainTotals.targetTotal
      ? Math.round((chainTotals.targetTotal - plan.totalPrice) * 100) / 100
      : null
    const savingsVsCostco = chainTotals.costcoTotal
      ? Math.round((chainTotals.costcoTotal - plan.totalPrice) * 100) / 100
      : null

    // Insert plan
    const { data: planData, error: planError } = await supabase
      .from("trip_plans")
      .insert({
        trip_id: tripId,
        label: plan.label,
        strategy: plan.strategy,
        total_price: plan.totalPrice,
        total_distance_km: plan.totalDistanceKm,
        total_travel_time_min: plan.totalTravelTimeMin,
        estimated_instore_time_min: plan.estimatedInstoreTimeMin,
        estimated_total_time_min: plan.estimatedTotalTimeMin,
        savings_vs_walmart: savingsVsWalmart,
        savings_vs_target: savingsVsTarget,
        savings_vs_costco: savingsVsCostco,
        summary: {
          num_stores: plan.storeOrder.length,
          items_by_store: plan.storeOrder.reduce(
            (acc, v) => {
              acc[v.store.name] = v.itemCount
              return acc
            },
            {} as Record<string, number>,
          ),
        },
      })
      .select("id")
      .single()

    if (planError || !planData) {
      throw new Error(`Failed to save plan: ${planError?.message}`)
    }

    const planId = planData.id

    // Insert store visits
    const storeVisits = plan.storeOrder.map((visit) => ({
      trip_plan_id: planId,
      store_id: visit.store.id,
      order_index: visit.orderIndex,
      distance_from_prev_km: visit.distanceFromPrevKm,
      travel_time_from_prev_min: visit.travelTimeFromPrevMin,
    }))

    const { error: storeError } = await supabase.from("trip_plan_stores").insert(storeVisits)

    if (storeError) {
      throw new Error(`Failed to save store visits: ${storeError.message}`)
    }

    // Insert item assignments
    const itemAssignments = plan.assignments.map((a) => {
      // Find the matching tripItemId
      const matchedItem = matched.find((m) => m.product.id === a.productId)
      return {
        trip_plan_id: planId,
        trip_item_id: matchedItem?.tripItemId || a.tripItemId,
        store_id: a.storeId,
        product_id: a.productId,
        unit_price: a.price,
        quantity: a.quantity,
      }
    })

    const { error: assignmentError } = await supabase.from("trip_plan_item_assignments").insert(itemAssignments)

    if (assignmentError) {
      throw new Error(`Failed to save item assignments: ${assignmentError.message}`)
    }

    savedPlans.push({ plan, planId })
  }

  return savedPlans
}

/**
 * Build API response
 */
function buildResponse(
  tripId: number,
  origin: TripRequest["origin"],
  tripItems: { id: number; rawQuery: string; productId: number | null }[],
  matched: MatchedItem[],
  savedPlans: { plan: PlanResult; planId: number }[],
  stores: Store[],
  distanceData: DistanceMatrixResult[],
): TripResponse {
  // Build product lookup
  const productMap = new Map<number, Product>()
  for (const m of matched) {
    productMap.set(m.product.id, m.product)
  }

  // Build store lookup
  const storeMap = new Map<number, Store>()
  for (const s of stores) {
    storeMap.set(s.id, s)
  }

  // Build items response
  const itemsResponse = tripItems.map((ti) => {
    const product = ti.productId ? productMap.get(ti.productId) : null
    return {
      id: ti.id,
      rawQuery: ti.rawQuery || "",
      quantity: matched.find((m) => m.product.id === ti.productId)?.quantity || 1,
      matchedProduct: product
        ? {
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
          }
        : null,
    }
  })

  // Build plans response
  const plansResponse: PlanResponse[] = savedPlans.map(({ plan, planId }) => {
    const storesResponse = plan.storeOrder.map((visit) => {
      const store = storeMap.get(visit.store.id) || visit.store
      const storeItems = plan.assignments
        .filter((a) => a.storeId === store.id)
        .map((a) => {
          const product = productMap.get(a.productId)
          return {
            productId: a.productId,
            productName: product?.name || "Unknown",
            quantity: a.quantity,
            unitPrice: a.price,
            lineTotal: Math.round(a.price * a.quantity * 100) / 100,
          }
        })

      return {
        store: {
          id: store.id,
          name: store.name,
          chain: store.chain,
          address: [store.address_line1, store.city, store.state, store.postal_code].filter(Boolean).join(", "),
          lat: store.lat,
          lon: store.lon,
        },
        orderIndex: visit.orderIndex,
        distanceFromPrevKm: visit.distanceFromPrevKm,
        travelTimeFromPrevMin: visit.travelTimeFromPrevMin,
        distanceSource: visit.distanceSource,
        items: storeItems,
      }
    })

    // Get savings from the persisted plan
    const matchedPlan = matched.find(() => true) // We need to get this from the saved data

    return {
      id: planId,
      label: plan.label,
      strategy: plan.strategy,
      totalPrice: plan.totalPrice,
      totalDistanceKm: plan.totalDistanceKm,
      totalTravelTimeMin: plan.totalTravelTimeMin,
      estimatedInstoreTimeMin: plan.estimatedInstoreTimeMin,
      estimatedTotalTimeMin: plan.estimatedTotalTimeMin,
      savingsVsWalmart: null, // Will be populated from DB
      savingsVsTarget: null,
      savingsVsCostco: null,
      stores: storesResponse,
    }
  })

  // Determine overall distance source
  let googleCount = 0
  let fallbackCount = 0
  for (const plan of savedPlans) {
    for (const visit of plan.plan.storeOrder) {
      if (visit.distanceSource === 'google') googleCount++
      else if (visit.distanceSource === 'fallback') fallbackCount++
    }
  }

  const distanceSource: 'google' | 'fallback' | 'mixed' =
    googleCount > 0 && fallbackCount === 0
      ? 'google'
      : googleCount === 0 && fallbackCount > 0
        ? 'fallback'
        : 'mixed'

  return {
    tripId,
    origin: {
      lat: origin.lat!,
      lon: origin.lon!,
      zip: origin.zip,
    },
    items: itemsResponse,
    plans: plansResponse,
    debug: {
      distanceSource,
    },
  }
}
