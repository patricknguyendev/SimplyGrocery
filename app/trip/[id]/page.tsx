import Link from "next/link"
import { ArrowLeft, MapPin, ChevronRight, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TripResponse } from "@/lib/optimizer/types"
import { TripPlansView } from "./trip-plans-view"
import { createClient } from "@/lib/supabase/server"

async function getTrip(id: string): Promise<TripResponse | null> {
  try {
    const tripId = Number.parseInt(id)
    if (isNaN(tripId)) {
      return null
    }

    const supabase = await createClient()

    // Fetch trip
    const { data: trip, error: tripError } = await supabase.from("trips").select("*").eq("id", tripId).single()

    if (tripError || !trip) {
      return null
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
      console.error("Error fetching trip items:", itemsError)
      return null
    }

    // Fetch trip plans
    const { data: plans, error: plansError } = await supabase.from("trip_plans").select("*").eq("trip_id", tripId)

    if (plansError) {
      console.error("Error fetching trip plans:", plansError)
      return null
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

    return {
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
    }
  } catch (error) {
    console.error("Error fetching trip:", error)
    return null
  }
}

function TripNotFoundView() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Trip Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              We couldn&apos;t find the trip you&apos;re looking for. It may have been deleted or the link is incorrect.
            </p>
            <Button asChild className="mt-6">
              <Link href="/trip/new">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Create a New Trip
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default async function TripResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const trip = await getTrip(id)

  if (!trip) {
    return <TripNotFoundView />
  }

  const matchedItemsCount = trip.items.filter((item) => item.matchedProduct).length
  const totalItems = trip.items.length

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/trip/new"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Trip
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Trip #{trip.tripId}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {trip.origin.zip || `${trip.origin.lat.toFixed(2)}, ${trip.origin.lon.toFixed(2)}`}
                </span>
                <span>•</span>
                <span>
                  {matchedItemsCount}/{totalItems} items matched
                </span>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/trip/new">
                Plan Another Trip
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Shopping List Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Shopping List</CardTitle>
            <CardDescription>Items you searched for and their matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {trip.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{item.quantity}x</span>
                    <span className="text-foreground">{item.rawQuery}</span>
                  </div>
                  {item.matchedProduct ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                      {item.matchedProduct.name}
                      {item.matchedProduct.brand && ` (${item.matchedProduct.brand})`}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">No match found</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plans Section */}
        {trip.plans.length > 0 ? (
          <TripPlansView plans={trip.plans} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No trip plans could be generated. Try adding more items or expanding your search radius.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
