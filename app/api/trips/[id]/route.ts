import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/trips/:id
 * Retrieve a saved trip with all plans and details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const tripId = Number.parseInt(id)

    if (isNaN(tripId)) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch trip
    const { data: trip, error: tripError } = await supabase.from("trips").select("*").eq("id", tripId).single()

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Fetch trip items with products
    const { data: tripItems, error: itemsError } = await supabase
      .from("trip_items")
      .select(`
        id,
        raw_query,
        quantity,
        product_id,
        products (
          id,
          name,
          brand,
          category
        )
      `)
      .eq("trip_id", tripId)

    if (itemsError) {
      return NextResponse.json({ error: "Failed to fetch trip items" }, { status: 500 })
    }

    // Fetch trip plans
    const { data: plans, error: plansError } = await supabase.from("trip_plans").select("*").eq("trip_id", tripId)

    if (plansError) {
      return NextResponse.json({ error: "Failed to fetch trip plans" }, { status: 500 })
    }

    // For each plan, fetch stores and assignments
    const plansWithDetails = await Promise.all(
      (plans || []).map(async (plan) => {
        // Fetch store visits
        const { data: storeVisits } = await supabase
          .from("trip_plan_stores")
          .select(`
            order_index,
            distance_from_prev_km,
            travel_time_from_prev_min,
            stores (
              id,
              name,
              chain,
              lat,
              lon,
              address_line1,
              city,
              state,
              postal_code
            )
          `)
          .eq("trip_plan_id", plan.id)
          .order("order_index")

        // Fetch item assignments
        const { data: assignments } = await supabase
          .from("trip_plan_item_assignments")
          .select(`
            store_id,
            unit_price,
            quantity,
            line_total_price,
            products (
              id,
              name
            )
          `)
          .eq("trip_plan_id", plan.id)

        // Group assignments by store
        const assignmentsByStore = new Map<number, typeof assignments>()
        for (const a of assignments || []) {
          if (!assignmentsByStore.has(a.store_id)) {
            assignmentsByStore.set(a.store_id, [])
          }
          assignmentsByStore.get(a.store_id)!.push(a)
        }

        return {
          id: plan.id,
          label: plan.label,
          strategy: plan.strategy,
          totalPrice: plan.total_price,
          totalDistanceKm: plan.total_distance_km,
          totalTravelTimeMin: plan.total_travel_time_min,
          estimatedInstoreTimeMin: plan.estimated_instore_time_min,
          estimatedTotalTimeMin: plan.estimated_total_time_min,
          savingsVsWalmart: plan.savings_vs_walmart,
          savingsVsTarget: plan.savings_vs_target,
          savingsVsCostco: plan.savings_vs_costco,
          stores: (storeVisits || []).map((sv) => {
            const store = sv.stores as {
              id: number
              name: string
              chain: string
              lat: number
              lon: number
              address_line1: string
              city: string
              state: string
              postal_code: string
            }
            const storeAssignments = assignmentsByStore.get(store.id) || []

            return {
              store: {
                id: store.id,
                name: store.name,
                chain: store.chain,
                address: [store.address_line1, store.city, store.state, store.postal_code].filter(Boolean).join(", "),
                lat: store.lat,
                lon: store.lon,
              },
              orderIndex: sv.order_index,
              distanceFromPrevKm: sv.distance_from_prev_km,
              travelTimeFromPrevMin: sv.travel_time_from_prev_min,
              items: storeAssignments.map((a) => ({
                productId: (a.products as { id: number; name: string }).id,
                productName: (a.products as { id: number; name: string }).name,
                quantity: a.quantity,
                unitPrice: a.unit_price,
                lineTotal: a.line_total_price,
              })),
            }
          }),
        }
      }),
    )

    return NextResponse.json({
      tripId: trip.id,
      origin: {
        lat: trip.origin_lat,
        lon: trip.origin_lon,
        zip: trip.origin_zip,
      },
      items: (tripItems || []).map((ti) => ({
        id: ti.id,
        rawQuery: ti.raw_query,
        quantity: ti.quantity,
        matchedProduct: ti.products
          ? {
              id: (ti.products as { id: number }).id,
              name: (ti.products as { name: string }).name,
              brand: (ti.products as { brand: string | null }).brand,
              category: (ti.products as { category: string | null }).category,
            }
          : null,
      })),
      plans: plansWithDetails,
      createdAt: trip.created_at,
    })
  } catch (error) {
    console.error("Error fetching trip:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
