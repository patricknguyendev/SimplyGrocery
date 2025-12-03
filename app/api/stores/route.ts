import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { haversineDistance } from "@/lib/geo/distance"

/**
 * GET /api/stores
 * List stores with optional location filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const radiusKm = searchParams.get("radiusKm")
    const chain = searchParams.get("chain")

    const supabase = await createClient()

    let query = supabase.from("stores").select("id, name, chain, lat, lon, address_line1, city, state, postal_code")

    if (chain) {
      query = query.eq("chain", chain.toUpperCase())
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let stores = data || []

    // Filter by distance if lat/lon provided
    if (lat && lon) {
      const originLat = Number.parseFloat(lat)
      const originLon = Number.parseFloat(lon)
      const maxRadius = radiusKm ? Number.parseFloat(radiusKm) : 50

      if (isNaN(originLat) || isNaN(originLon)) {
        return NextResponse.json({ error: "lat and lon must be valid numbers" }, { status: 400 })
      }

      stores = stores
        .map((store) => ({
          ...store,
          distanceKm: Math.round(haversineDistance(originLat, originLon, store.lat, store.lon) * 100) / 100,
        }))
        .filter((store) => store.distanceKm <= maxRadius)
        .sort((a, b) => a.distanceKm - b.distanceKm)
    }

    return NextResponse.json({ stores })
  } catch (error) {
    console.error("Error fetching stores:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
