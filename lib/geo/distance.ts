/**
 * Geographic utility functions for distance and travel time calculations
 */

/**
 * Calculates the Haversine distance between two points on Earth
 * @returns Distance in kilometers
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Estimates travel time based on distance
 * Assumes average speed of 30 km/h for urban driving (accounting for traffic, lights, etc.)
 * @returns Time in minutes
 */
export function estimateTravelTime(distanceKm: number): number {
  const AVG_SPEED_KMH = 30
  return (distanceKm / AVG_SPEED_KMH) * 60
}

/**
 * Estimates in-store shopping time based on number of items
 * Base time + per-item time
 * @returns Time in minutes
 */
export function estimateInstoreTime(numItems: number): number {
  const BASE_TIME = 5 // minutes to park, enter, checkout
  const PER_ITEM_TIME = 1.5 // minutes per item to find and grab
  return BASE_TIME + numItems * PER_ITEM_TIME
}

/**
 * Finds the nearest neighbor order for visiting stores
 * Simple greedy algorithm starting from origin
 */
export function nearestNeighborOrder(
  origin: { lat: number; lon: number },
  stores: { id: number; lat: number; lon: number }[],
): { id: number; lat: number; lon: number }[] {
  if (stores.length === 0) return []
  if (stores.length === 1) return stores

  const result: { id: number; lat: number; lon: number }[] = []
  const remaining = [...stores]
  let current = origin

  while (remaining.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(current.lat, current.lon, remaining[i].lat, remaining[i].lon)
      if (dist < nearestDistance) {
        nearestDistance = dist
        nearestIndex = i
      }
    }

    const nearest = remaining.splice(nearestIndex, 1)[0]
    result.push(nearest)
    current = { lat: nearest.lat, lon: nearest.lon }
  }

  return result
}

/**
 * Calculates total route distance given an ordered list of stores
 */
export function calculateRouteDistance(
  origin: { lat: number; lon: number },
  stores: { lat: number; lon: number }[],
): number {
  if (stores.length === 0) return 0

  let total = haversineDistance(origin.lat, origin.lon, stores[0].lat, stores[0].lon)

  for (let i = 1; i < stores.length; i++) {
    total += haversineDistance(stores[i - 1].lat, stores[i - 1].lon, stores[i].lat, stores[i].lon)
  }

  return total
}
