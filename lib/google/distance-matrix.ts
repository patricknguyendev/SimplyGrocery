/**
 * Google Distance Matrix API wrapper with automatic fallback to haversine calculations
 * Server-side only - never exposes API key to browser
 */

import { haversineDistance, estimateTravelTime } from '@/lib/geo/distance'

export interface LatLng {
  lat: number
  lon: number
}

export interface DistanceMatrixElement {
  distanceMeters: number
  durationSeconds: number
  distanceText: string
  durationText: string
}

export type DistanceMatrixStatus = 'OK' | 'ZERO_RESULTS' | 'ERROR'
export type DistanceMatrixSource = 'google' | 'fallback'

export interface DistanceMatrixResult {
  origin: LatLng
  destination: LatLng
  element: DistanceMatrixElement
  source: DistanceMatrixSource
  status: DistanceMatrixStatus
  errorMessage?: string
}

export interface DistanceMatrixOptions {
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit'
  units?: 'metric' | 'imperial'
}

// Google API response types
interface GoogleDistanceMatrixResponse {
  status: string
  error_message?: string
  rows: Array<{
    elements: Array<{
      status: string
      distance?: {
        value: number // meters
        text: string
      }
      duration?: {
        value: number // seconds
        text: string
      }
    }>
  }>
  origin_addresses: string[]
  destination_addresses: string[]
}

const GOOGLE_MATRIX_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json'
const MAX_ELEMENTS_PER_REQUEST = 100 // Google's limit per request
const MAX_ORIGINS_PER_REQUEST = 25
const MAX_DESTINATIONS_PER_REQUEST = 25

/**
 * Creates fallback result using haversine distance and estimated travel time
 */
function createFallbackResult(
  origin: LatLng,
  destination: LatLng,
  status: DistanceMatrixStatus = 'ERROR',
  errorMessage?: string,
): DistanceMatrixResult {
  const distanceKm = haversineDistance(origin.lat, origin.lon, destination.lat, destination.lon)
  const durationMinutes = estimateTravelTime(distanceKm)
  const distanceMeters = Math.round(distanceKm * 1000)
  const durationSeconds = Math.round(durationMinutes * 60)

  return {
    origin,
    destination,
    element: {
      distanceMeters,
      durationSeconds,
      distanceText: `${distanceKm.toFixed(1)} km`,
      durationText: `${Math.round(durationMinutes)} mins`,
    },
    source: 'fallback',
    status,
    errorMessage,
  }
}

/**
 * Formats coordinates for Google API (lat,lng string)
 */
function formatLatLng(point: LatLng): string {
  return `${point.lat},${point.lon}`
}

/**
 * Calls Google Distance Matrix API for a single batch
 */
async function fetchGoogleDistanceMatrix(
  origins: LatLng[],
  destinations: LatLng[],
  apiKey: string,
  options: DistanceMatrixOptions = {},
): Promise<GoogleDistanceMatrixResponse | null> {
  const params = new URLSearchParams({
    origins: origins.map(formatLatLng).join('|'),
    destinations: destinations.map(formatLatLng).join('|'),
    key: apiKey,
    mode: options.mode || 'driving',
    units: options.units || 'metric',
  })

  const url = `${GOOGLE_MATRIX_API_URL}?${params.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`[Distance Matrix] HTTP error: ${response.status} ${response.statusText}`)
      return null
    }

    const data: GoogleDistanceMatrixResponse = await response.json()

    // Check top-level status
    if (data.status !== 'OK') {
      console.error(`[Distance Matrix] API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`)
      return null
    }

    return data
  } catch (error) {
    console.error('[Distance Matrix] Network/fetch error:', error instanceof Error ? error.message : String(error))
    return null
  }
}

/**
 * Main function: Get distance and duration between multiple origin-destination pairs
 *
 * Features:
 * - Automatic batching for large requests
 * - Graceful fallback to haversine + estimated time on any error
 * - Handles missing API key, quota limits, network errors, ZERO_RESULTS
 * - Server-side only (never exposes API key)
 *
 * @param origins Array of origin coordinates
 * @param destinations Array of destination coordinates
 * @param options Optional: mode (default: driving), units (default: metric)
 * @returns Array of results with distance/duration for each origin-destination pair
 */
export async function getDistanceMatrix(
  origins: LatLng[],
  destinations: LatLng[],
  options: DistanceMatrixOptions = {},
): Promise<DistanceMatrixResult[]> {
  const results: DistanceMatrixResult[] = []

  // Validate inputs
  if (origins.length === 0 || destinations.length === 0) {
    return results
  }

  // Check for API key
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey || apiKey.trim() === '') {
    console.warn('[Distance Matrix] GOOGLE_MAPS_API_KEY not found - using fallback for all pairs')

    // Generate all origin-destination pairs with fallback
    for (const origin of origins) {
      for (const destination of destinations) {
        results.push(createFallbackResult(origin, destination, 'ERROR', 'API key not configured'))
      }
    }
    return results
  }

  // Batch requests if needed (respect Google's limits)
  const batches: { origins: LatLng[]; destinations: LatLng[]; originStartIdx: number; destStartIdx: number }[] = []

  for (let i = 0; i < origins.length; i += MAX_ORIGINS_PER_REQUEST) {
    const originBatch = origins.slice(i, i + MAX_ORIGINS_PER_REQUEST)

    for (let j = 0; j < destinations.length; j += MAX_DESTINATIONS_PER_REQUEST) {
      const destBatch = destinations.slice(j, j + MAX_DESTINATIONS_PER_REQUEST)

      // Check element limit
      const elements = originBatch.length * destBatch.length
      if (elements <= MAX_ELEMENTS_PER_REQUEST) {
        batches.push({
          origins: originBatch,
          destinations: destBatch,
          originStartIdx: i,
          destStartIdx: j,
        })
      } else {
        // Further split if a single batch exceeds element limit
        const maxDests = Math.floor(MAX_ELEMENTS_PER_REQUEST / originBatch.length)
        for (let k = j; k < j + destBatch.length; k += maxDests) {
          batches.push({
            origins: originBatch,
            destinations: destinations.slice(k, k + maxDests),
            originStartIdx: i,
            destStartIdx: k,
          })
        }
      }
    }
  }

  console.log(`[Distance Matrix] Processing ${origins.length}×${destinations.length} = ${origins.length * destinations.length} elements in ${batches.length} batch(es)`)

  // Process each batch
  for (const batch of batches) {
    const googleResponse = await fetchGoogleDistanceMatrix(batch.origins, batch.destinations, apiKey, options)

    if (!googleResponse) {
      // Entire batch failed - fallback for all pairs in this batch
      console.warn(`[Distance Matrix] Batch failed - using fallback for ${batch.origins.length}×${batch.destinations.length} pairs`)

      for (let i = 0; i < batch.origins.length; i++) {
        for (let j = 0; j < batch.destinations.length; j++) {
          results.push(
            createFallbackResult(
              batch.origins[i],
              batch.destinations[j],
              'ERROR',
              'Google API request failed',
            ),
          )
        }
      }
      continue
    }

    // Process successful response
    for (let i = 0; i < batch.origins.length; i++) {
      const row = googleResponse.rows[i]
      if (!row) {
        // Missing row - fallback for all destinations in this origin
        for (let j = 0; j < batch.destinations.length; j++) {
          results.push(
            createFallbackResult(
              batch.origins[i],
              batch.destinations[j],
              'ERROR',
              'Missing row in API response',
            ),
          )
        }
        continue
      }

      for (let j = 0; j < batch.destinations.length; j++) {
        const element = row.elements[j]
        const origin = batch.origins[i]
        const destination = batch.destinations[j]

        if (!element) {
          results.push(createFallbackResult(origin, destination, 'ERROR', 'Missing element in API response'))
          continue
        }

        // Check element status
        if (element.status === 'OK' && element.distance && element.duration) {
          // Success! Use Google data
          results.push({
            origin,
            destination,
            element: {
              distanceMeters: element.distance.value,
              durationSeconds: element.duration.value,
              distanceText: element.distance.text,
              durationText: element.duration.text,
            },
            source: 'google',
            status: 'OK',
          })
        } else if (element.status === 'ZERO_RESULTS') {
          // No route found - use fallback with appropriate status
          results.push(
            createFallbackResult(origin, destination, 'ZERO_RESULTS', 'No route found by Google'),
          )
        } else {
          // Other error status (NOT_FOUND, etc.) - use fallback
          results.push(
            createFallbackResult(origin, destination, 'ERROR', `Google element status: ${element.status}`),
          )
        }
      }
    }
  }

  // Summary logging
  const googleCount = results.filter(r => r.source === 'google').length
  const fallbackCount = results.filter(r => r.source === 'fallback').length
  console.log(`[Distance Matrix] Results: ${googleCount} from Google, ${fallbackCount} fallback`)

  return results
}

/**
 * Convenience function: Get distances from one origin to multiple destinations
 */
export async function getDistancesFromOrigin(
  origin: LatLng,
  destinations: LatLng[],
  options?: DistanceMatrixOptions,
): Promise<DistanceMatrixResult[]> {
  return getDistanceMatrix([origin], destinations, options)
}

/**
 * Convenience function: Get pairwise distances for a route (origin -> stores in order)
 */
export async function getRouteDistances(
  origin: LatLng,
  stores: LatLng[],
  options?: DistanceMatrixOptions,
): Promise<DistanceMatrixResult[]> {
  if (stores.length === 0) return []

  const pairs: { origin: LatLng; destination: LatLng }[] = []

  // First leg: origin -> first store
  pairs.push({ origin, destination: stores[0] })

  // Subsequent legs: store -> next store
  for (let i = 0; i < stores.length - 1; i++) {
    pairs.push({ origin: stores[i], destination: stores[i + 1] })
  }

  // Build flat arrays for the API call
  const origins = pairs.map(p => p.origin)
  const destinations = pairs.map(p => p.destination)

  // Call the main function with paired indices
  const allResults = await getDistanceMatrix(origins, destinations, options)

  // Extract only the diagonal (paired results)
  const routeResults: DistanceMatrixResult[] = []
  for (let i = 0; i < pairs.length; i++) {
    const resultIdx = i * destinations.length + i
    if (allResults[resultIdx]) {
      routeResults.push(allResults[resultIdx])
    }
  }

  return routeResults
}
