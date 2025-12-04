import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { optimizeTrip } from "@/lib/optimizer"
import type { TripRequest } from "@/lib/optimizer/types"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * POST /api/trips
 * Creates a new trip with optimized plans
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validationError = validateRequest(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const tripRequest: TripRequest = {
      origin: {
        lat: body.origin.lat,
        lon: body.origin.lon,
        zip: body.origin.zip,
      },
      items: body.items.map((item: { rawQuery: string; quantity?: number }) => ({
        rawQuery: item.rawQuery,
        quantity: item.quantity || 1,
      })),
      preferences: {
        maxStores: body.preferences?.maxStores,
        maxRadiusKm: body.preferences?.maxRadiusKm,
        strategy: body.preferences?.strategy || "ALL",
        includeChains: body.preferences?.includeChains,
        excludeChains: body.preferences?.excludeChains,
      },
    }

    const supabase = await createClient()

    // Get current user (optional - guests can still create trips)
    const user = await getCurrentUser()

    const response = await optimizeTrip(supabase, tripRequest, user?.id || null)

    // Log trip event for analytics (non-blocking for the main response)
    try {
      await supabase.from("trip_events").insert({
        trip_id: response.tripId,
        number_of_items: body.items.length,
        selected_strategy: body.preferences?.strategy || "ALL",
      })
    } catch (analyticsError) {
      console.error("Failed to log trip event:", analyticsError)
      // Intentionally do not re-throw; analytics failures should not block trip responses
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating trip:", error)

    if (error instanceof Error) {
      // Handle known errors with appropriate status codes
      if (error.message.includes("required")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (error.message.includes("No stores found")) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes("Could not match")) {
        return NextResponse.json({ error: error.message }, { status: 422 })
      }
      if (error.message.includes("Could not generate")) {
        return NextResponse.json({ error: error.message }, { status: 422 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object"
  }

  const data = body as Record<string, unknown>

  // Validate origin
  if (!data.origin || typeof data.origin !== "object") {
    return "Origin is required"
  }

  const origin = data.origin as Record<string, unknown>

  if (typeof origin.lat !== "number" || typeof origin.lon !== "number") {
    return "Origin must include lat and lon as numbers"
  }

  if (origin.lat < -90 || origin.lat > 90) {
    return "Origin latitude must be between -90 and 90"
  }

  if (origin.lon < -180 || origin.lon > 180) {
    return "Origin longitude must be between -180 and 180"
  }

  // Validate items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    return "Items must be a non-empty array"
  }

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i] as Record<string, unknown>

    if (!item.rawQuery || typeof item.rawQuery !== "string") {
      return `Item at index ${i} must have a rawQuery string`
    }

    if (item.quantity !== undefined && (typeof item.quantity !== "number" || item.quantity <= 0)) {
      return `Item at index ${i} quantity must be a positive number`
    }
  }

  // Validate preferences (optional)
  if (data.preferences && typeof data.preferences === "object") {
    const prefs = data.preferences as Record<string, unknown>

    if (prefs.maxStores !== undefined && (typeof prefs.maxStores !== "number" || prefs.maxStores < 1)) {
      return "maxStores must be a positive number"
    }

    if (prefs.maxRadiusKm !== undefined && (typeof prefs.maxRadiusKm !== "number" || prefs.maxRadiusKm <= 0)) {
      return "maxRadiusKm must be a positive number"
    }

    if (prefs.strategy !== undefined) {
      const validStrategies = ["ALL", "CHEAPEST", "FASTEST", "BALANCED"]
      if (!validStrategies.includes(prefs.strategy as string)) {
        return `strategy must be one of: ${validStrategies.join(", ")}`
      }
    }
  }

  return null
}
