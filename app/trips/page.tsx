import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ShoppingCart, MapPin } from "lucide-react"
import { format } from "date-fns"

interface TripWithDetails {
  id: number
  created_at: string
  origin_zip: string | null
  settings: {
    max_stores?: number
    radius_km?: number
  }
  item_count: number
  plan_count: number
}

async function getUserTrips(userId: string) {
  const supabase = await createClient()

  // Get trips with item counts
  const { data: trips, error } = await supabase
    .from("trips")
    .select(
      `
      id,
      created_at,
      origin_zip,
      settings,
      trip_items (count)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching trips:", error)
    return []
  }

  // Get plan counts for each trip
  const tripIds = trips?.map((t) => t.id) || []
  const { data: planCounts } = await supabase
    .from("trip_plans")
    .select("trip_id")
    .in("trip_id", tripIds)

  // Create a map of trip_id to plan count
  const planCountMap = new Map<number, number>()
  planCounts?.forEach((p) => {
    planCountMap.set(p.trip_id, (planCountMap.get(p.trip_id) || 0) + 1)
  })

  // Format the data
  const formattedTrips: TripWithDetails[] = trips?.map((trip) => ({
    id: trip.id,
    created_at: trip.created_at,
    origin_zip: trip.origin_zip,
    settings: trip.settings || {},
    item_count: trip.trip_items?.[0]?.count || 0,
    plan_count: planCountMap.get(trip.id) || 0,
  })) || []

  return formattedTrips
}

export default async function TripsPage() {
  const user = await getCurrentUser()

  // Require authentication
  if (!user) {
    redirect("/login")
  }

  const trips = await getUserTrips(user.id)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Your Trips</h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your grocery shopping trip history
            </p>
          </div>

          {/* Empty State */}
          {trips.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">No trips yet</h2>
                <p className="mt-2 text-center text-muted-foreground">
                  You haven't planned any grocery trips yet.
                  <br />
                  Create your first trip to get started!
                </p>
                <Button asChild className="mt-6" size="lg">
                  <Link href="/trip/new">Plan a New Trip</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* New Trip Button */}
              <div className="mb-6 flex justify-end">
                <Button asChild>
                  <Link href="/trip/new">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Plan a New Trip
                  </Link>
                </Button>
              </div>

              {/* Trips Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                  <Card key={trip.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Trip #{trip.id}</CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(trip.created_at), "MMM d, yyyy - h:mm a")}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ShoppingCart className="h-4 w-4" />
                          <span>
                            {trip.item_count} item{trip.item_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {trip.origin_zip && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>ZIP: {trip.origin_zip}</span>
                          </div>
                        )}
                        {trip.plan_count > 0 && (
                          <div className="text-muted-foreground">
                            {trip.plan_count} plan{trip.plan_count !== 1 ? "s" : ""} generated
                          </div>
                        )}
                      </div>
                      <Button asChild className="mt-4 w-full" variant="outline">
                        <Link href={`/trip/${trip.id}`}>View Trip Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
