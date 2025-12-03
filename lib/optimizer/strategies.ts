/**
 * Optimization strategies: Cheapest, Fastest, Balanced
 */

import type { Store } from "@/lib/db/types"
import type { MatchedItem, PlanResult, ItemAssignment, StoreVisit } from "./types"
import { haversineDistance, estimateTravelTime, estimateInstoreTime, nearestNeighborOrder } from "@/lib/geo/distance"

interface OptimizerInput {
  origin: { lat: number; lon: number }
  items: MatchedItem[]
  stores: Store[]
  priceMap: Map<string, { price: number; inStock: boolean }>
  maxStores?: number
}

/**
 * CHEAPEST strategy: Assign each item to the store with the lowest price
 * Then prune stores where travel cost exceeds savings
 */
export function computeCheapestPlan(input: OptimizerInput): PlanResult | null {
  const { origin, items, stores, priceMap, maxStores = 5 } = input

  if (items.length === 0 || stores.length === 0) return null

  // Step 1: Assign each item to cheapest store
  const assignments: ItemAssignment[] = []
  const storeItemCounts = new Map<number, number>()

  for (const item of items) {
    let bestStore: Store | null = null
    let bestPrice = Number.POSITIVE_INFINITY

    for (const store of stores) {
      const key = `${store.id}-${item.product.id}`
      const priceEntry = priceMap.get(key)

      if (priceEntry && priceEntry.inStock && priceEntry.price < bestPrice) {
        bestPrice = priceEntry.price
        bestStore = store
      }
    }

    if (bestStore) {
      assignments.push({
        tripItemId: item.tripItemId || 0,
        productId: item.product.id,
        storeId: bestStore.id,
        price: bestPrice,
        quantity: item.quantity,
      })
      storeItemCounts.set(bestStore.id, (storeItemCounts.get(bestStore.id) || 0) + 1)
    }
  }

  if (assignments.length === 0) return null

  // Step 2: Get unique stores used
  let usedStoreIds = [...new Set(assignments.map((a) => a.storeId))]

  // Step 3: Prune if over max stores - keep stores with most items
  if (usedStoreIds.length > maxStores) {
    const sortedStores = usedStoreIds
      .map((id) => ({ id, count: storeItemCounts.get(id) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, maxStores)
      .map((s) => s.id)

    // Reassign items from pruned stores
    for (const assignment of assignments) {
      if (!sortedStores.includes(assignment.storeId)) {
        // Find best price among remaining stores
        let bestPrice = Number.POSITIVE_INFINITY
        let bestStoreId = sortedStores[0]

        for (const storeId of sortedStores) {
          const key = `${storeId}-${assignment.productId}`
          const priceEntry = priceMap.get(key)
          if (priceEntry && priceEntry.inStock && priceEntry.price < bestPrice) {
            bestPrice = priceEntry.price
            bestStoreId = storeId
          }
        }

        assignment.storeId = bestStoreId
        assignment.price = bestPrice
      }
    }

    usedStoreIds = sortedStores
  }

  // Step 4: Order stores by nearest neighbor
  const usedStores = stores.filter((s) => usedStoreIds.includes(s.id))
  const orderedStores = nearestNeighborOrder(origin, usedStores)

  // Step 5: Build store visits with distances
  const storeVisits = buildStoreVisits(origin, orderedStores, assignments)

  // Step 6: Calculate totals
  const totalPrice = assignments.reduce((sum, a) => sum + a.price * a.quantity, 0)
  const totalDistanceKm = storeVisits.reduce((sum, v) => sum + v.distanceFromPrevKm, 0)
  const totalTravelTimeMin = storeVisits.reduce((sum, v) => sum + v.travelTimeFromPrevMin, 0)
  const estimatedInstoreTimeMin = storeVisits.reduce((sum, v) => sum + estimateInstoreTime(v.itemCount), 0)

  return {
    label: "Cheapest",
    strategy: "CHEAPEST",
    totalPrice: Math.round(totalPrice * 100) / 100,
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    totalTravelTimeMin: Math.round(totalTravelTimeMin),
    estimatedInstoreTimeMin: Math.round(estimatedInstoreTimeMin),
    estimatedTotalTimeMin: Math.round(totalTravelTimeMin + estimatedInstoreTimeMin),
    storeOrder: storeVisits,
    assignments,
  }
}

/**
 * FASTEST strategy: Single store with best availability
 * Picks the nearest store that has all (or most) items in stock
 */
export function computeFastestPlan(input: OptimizerInput): PlanResult | null {
  const { origin, items, stores, priceMap } = input

  if (items.length === 0 || stores.length === 0) return null

  // Score each store by: availability * -distance
  const storeScores: { store: Store; score: number; itemsAvailable: number; totalPrice: number }[] = []

  for (const store of stores) {
    let itemsAvailable = 0
    let totalPrice = 0

    for (const item of items) {
      const key = `${store.id}-${item.product.id}`
      const priceEntry = priceMap.get(key)

      if (priceEntry && priceEntry.inStock) {
        itemsAvailable++
        totalPrice += priceEntry.price * item.quantity
      }
    }

    if (itemsAvailable === 0) continue

    const distance = haversineDistance(origin.lat, origin.lon, store.lat, store.lon)
    // Score: prioritize availability, then proximity
    const score = itemsAvailable * 1000 - distance

    storeScores.push({ store, score, itemsAvailable, totalPrice })
  }

  if (storeScores.length === 0) return null

  // Pick best store
  storeScores.sort((a, b) => b.score - a.score)
  const best = storeScores[0]

  // Build assignments for this single store
  const assignments: ItemAssignment[] = []
  for (const item of items) {
    const key = `${best.store.id}-${item.product.id}`
    const priceEntry = priceMap.get(key)

    if (priceEntry && priceEntry.inStock) {
      assignments.push({
        tripItemId: item.tripItemId || 0,
        productId: item.product.id,
        storeId: best.store.id,
        price: priceEntry.price,
        quantity: item.quantity,
      })
    }
  }

  const distanceKm = haversineDistance(origin.lat, origin.lon, best.store.lat, best.store.lon)
  const travelTimeMin = estimateTravelTime(distanceKm)
  const instoreTimeMin = estimateInstoreTime(assignments.length)

  const storeVisits: StoreVisit[] = [
    {
      store: best.store,
      orderIndex: 0,
      distanceFromPrevKm: Math.round(distanceKm * 100) / 100,
      travelTimeFromPrevMin: Math.round(travelTimeMin),
      itemCount: assignments.length,
    },
  ]

  return {
    label: "Fastest",
    strategy: "FASTEST",
    totalPrice: Math.round(best.totalPrice * 100) / 100,
    totalDistanceKm: Math.round(distanceKm * 100) / 100,
    totalTravelTimeMin: Math.round(travelTimeMin),
    estimatedInstoreTimeMin: Math.round(instoreTimeMin),
    estimatedTotalTimeMin: Math.round(travelTimeMin + instoreTimeMin),
    storeOrder: storeVisits,
    assignments,
  }
}

/**
 * BALANCED strategy: Trade off between cost and convenience
 * Limits stores and weights price against travel time
 */
export function computeBalancedPlan(input: OptimizerInput): PlanResult | null {
  const { origin, items, stores, priceMap, maxStores = 2 } = input

  if (items.length === 0 || stores.length === 0) return null

  // Calculate "value score" for each store based on savings vs travel cost
  const storeValues: {
    store: Store
    avgSavings: number
    distance: number
    valueScore: number
  }[] = []

  // First, find the max price for each product (to calculate savings)
  const maxPrices = new Map<number, number>()
  for (const item of items) {
    let maxPrice = 0
    for (const store of stores) {
      const key = `${store.id}-${item.product.id}`
      const priceEntry = priceMap.get(key)
      if (priceEntry && priceEntry.price > maxPrice) {
        maxPrice = priceEntry.price
      }
    }
    maxPrices.set(item.product.id, maxPrice)
  }

  for (const store of stores) {
    const distance = haversineDistance(origin.lat, origin.lon, store.lat, store.lon)
    let totalSavings = 0
    let itemCount = 0

    for (const item of items) {
      const key = `${store.id}-${item.product.id}`
      const priceEntry = priceMap.get(key)
      const maxPrice = maxPrices.get(item.product.id) || 0

      if (priceEntry && priceEntry.inStock) {
        totalSavings += (maxPrice - priceEntry.price) * item.quantity
        itemCount++
      }
    }

    if (itemCount === 0) continue

    const avgSavings = totalSavings / itemCount
    // Value = savings per km of travel
    const valueScore = avgSavings / Math.max(distance, 0.5)

    storeValues.push({ store, avgSavings, distance, valueScore })
  }

  if (storeValues.length === 0) return null

  // Pick top N stores by value score
  storeValues.sort((a, b) => b.valueScore - a.valueScore)
  const selectedStores = storeValues.slice(0, maxStores).map((v) => v.store)

  // Assign items to cheapest among selected stores
  const assignments: ItemAssignment[] = []
  for (const item of items) {
    let bestStore = selectedStores[0]
    let bestPrice = Number.POSITIVE_INFINITY

    for (const store of selectedStores) {
      const key = `${store.id}-${item.product.id}`
      const priceEntry = priceMap.get(key)

      if (priceEntry && priceEntry.inStock && priceEntry.price < bestPrice) {
        bestPrice = priceEntry.price
        bestStore = store
      }
    }

    if (bestPrice < Number.POSITIVE_INFINITY) {
      assignments.push({
        tripItemId: item.tripItemId || 0,
        productId: item.product.id,
        storeId: bestStore.id,
        price: bestPrice,
        quantity: item.quantity,
      })
    }
  }

  if (assignments.length === 0) return null

  // Get unique stores actually used
  const usedStoreIds = [...new Set(assignments.map((a) => a.storeId))]
  const usedStores = stores.filter((s) => usedStoreIds.includes(s.id))
  const orderedStores = nearestNeighborOrder(origin, usedStores)

  const storeVisits = buildStoreVisits(origin, orderedStores, assignments)

  const totalPrice = assignments.reduce((sum, a) => sum + a.price * a.quantity, 0)
  const totalDistanceKm = storeVisits.reduce((sum, v) => sum + v.distanceFromPrevKm, 0)
  const totalTravelTimeMin = storeVisits.reduce((sum, v) => sum + v.travelTimeFromPrevMin, 0)
  const estimatedInstoreTimeMin = storeVisits.reduce((sum, v) => sum + estimateInstoreTime(v.itemCount), 0)

  return {
    label: "Balanced",
    strategy: "BALANCED",
    totalPrice: Math.round(totalPrice * 100) / 100,
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    totalTravelTimeMin: Math.round(totalTravelTimeMin),
    estimatedInstoreTimeMin: Math.round(estimatedInstoreTimeMin),
    estimatedTotalTimeMin: Math.round(totalTravelTimeMin + estimatedInstoreTimeMin),
    storeOrder: storeVisits,
    assignments,
  }
}

/**
 * Helper to build StoreVisit array with distances
 */
function buildStoreVisits(
  origin: { lat: number; lon: number },
  orderedStores: { id: number; lat: number; lon: number }[],
  assignments: ItemAssignment[],
): StoreVisit[] {
  const storeVisits: StoreVisit[] = []
  let prevLat = origin.lat
  let prevLon = origin.lon

  for (let i = 0; i < orderedStores.length; i++) {
    const store = orderedStores[i] as Store
    const distanceKm = haversineDistance(prevLat, prevLon, store.lat, store.lon)
    const travelTimeMin = estimateTravelTime(distanceKm)
    const itemCount = assignments.filter((a) => a.storeId === store.id).length

    storeVisits.push({
      store,
      orderIndex: i,
      distanceFromPrevKm: Math.round(distanceKm * 100) / 100,
      travelTimeFromPrevMin: Math.round(travelTimeMin),
      itemCount,
    })

    prevLat = store.lat
    prevLon = store.lon
  }

  return storeVisits
}

/**
 * Calculates total cost if buying all items at a single chain
 */
export function calculateSingleChainTotal(
  chain: string,
  items: MatchedItem[],
  stores: Store[],
  priceMap: Map<string, { price: number; inStock: boolean }>,
): number | null {
  const chainStores = stores.filter((s) => s.chain === chain)
  if (chainStores.length === 0) return null

  let total = 0
  for (const item of items) {
    let foundPrice = false
    for (const store of chainStores) {
      const key = `${store.id}-${item.product.id}`
      const priceEntry = priceMap.get(key)
      if (priceEntry && priceEntry.inStock) {
        total += priceEntry.price * item.quantity
        foundPrice = true
        break
      }
    }
    if (!foundPrice) return null // Item not available at this chain
  }

  return Math.round(total * 100) / 100
}
