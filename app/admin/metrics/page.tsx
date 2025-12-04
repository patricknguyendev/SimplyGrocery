import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, TrendingUp, ShoppingCart, DollarSign, Clock, MapPin } from "lucide-react"

async function getMetrics() {
  const supabase = await createClient()

  // Get all trip events
  const { data: events, error } = await supabase.from("trip_events").select("*").order("created_at", { ascending: false })

  if (error || !events) {
    return {
      totalTrips: 0,
      avgItemsPerTrip: 0,
      strategyBreakdown: {
        ALL: 0,
        CHEAPEST: 0,
        FASTEST: 0,
        BALANCED: 0,
      },
    }
  }

  // Calculate metrics
  const totalTrips = events.length
  const totalItems = events.reduce((sum, event) => sum + event.number_of_items, 0)
  const avgItemsPerTrip = totalTrips > 0 ? Math.round((totalItems / totalTrips) * 10) / 10 : 0

  // Count by strategy
  const strategyBreakdown = {
    ALL: events.filter((e) => e.selected_strategy === "ALL").length,
    CHEAPEST: events.filter((e) => e.selected_strategy === "CHEAPEST").length,
    FASTEST: events.filter((e) => e.selected_strategy === "FASTEST").length,
    BALANCED: events.filter((e) => e.selected_strategy === "BALANCED").length,
  }

  return {
    totalTrips,
    avgItemsPerTrip,
    strategyBreakdown,
  }
}

export default async function MetricsPage() {
  const metrics = await getMetrics()

  return (
    <main className="min-h-screen bg-background">
      <section className="section-glow section-glow--primary relative bg-muted/10">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-lg glow-green">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Trip Analytics
                </h1>
              </div>
              <p className="mt-2 text-muted-foreground">Usage metrics and statistics for the trip planner</p>
            </div>

            {/* Overview Stats */}
            <div className="mb-12 grid gap-6 sm:grid-cols-2">
              <Card className="glass rounded-2xl shadow-2xl float-on-hover transition-spring glow-green-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-primary">Total Trips</CardTitle>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 glow-green">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-bold text-primary text-glow-green">{metrics.totalTrips}</p>
                  <p className="mt-2 text-sm text-muted-foreground">All-time trip requests</p>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl shadow-2xl float-on-hover transition-spring glow-cyan-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-accent">Avg Items/Trip</CardTitle>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 glow-cyan">
                      <ShoppingCart className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-bold text-accent text-glow-cyan">{metrics.avgItemsPerTrip}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Average shopping list size</p>
                </CardContent>
              </Card>
            </div>

            {/* Strategy Breakdown */}
            <div>
              <h2 className="mb-6 text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Strategy Selection
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="glass rounded-2xl shadow-2xl border-secondary/40 glow-purple-hover float-on-hover transition-spring">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 glow-purple">
                        <BarChart className="h-5 w-5 text-secondary" />
                      </div>
                      <CardTitle className="text-secondary">All Strategies</CardTitle>
                    </div>
                    <CardDescription>Requested all plan types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-secondary text-glow-purple">{metrics.strategyBreakdown.ALL}</p>
                    <p className="mt-1 text-sm text-muted-foreground">trips</p>
                  </CardContent>
                </Card>

                <Card className="glass rounded-2xl shadow-2xl border-primary/40 glow-green-hover float-on-hover transition-spring">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 glow-green">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-primary">Cheapest</CardTitle>
                    </div>
                    <CardDescription>Only cheapest plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary text-glow-green">{metrics.strategyBreakdown.CHEAPEST}</p>
                    <p className="mt-1 text-sm text-muted-foreground">trips</p>
                  </CardContent>
                </Card>

                <Card className="glass rounded-2xl shadow-2xl border-accent/40 glow-cyan-hover float-on-hover transition-spring">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 glow-cyan">
                        <Clock className="h-5 w-5 text-accent" />
                      </div>
                      <CardTitle className="text-accent">Fastest</CardTitle>
                    </div>
                    <CardDescription>Only fastest plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-accent text-glow-cyan">{metrics.strategyBreakdown.FASTEST}</p>
                    <p className="mt-1 text-sm text-muted-foreground">trips</p>
                  </CardContent>
                </Card>

                <Card className="glass rounded-2xl shadow-2xl border-secondary/40 glow-purple-hover float-on-hover transition-spring">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 glow-purple">
                        <MapPin className="h-5 w-5 text-secondary" />
                      </div>
                      <CardTitle className="text-secondary">Balanced</CardTitle>
                    </div>
                    <CardDescription>Only balanced plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-secondary text-glow-purple">{metrics.strategyBreakdown.BALANCED}</p>
                    <p className="mt-1 text-sm text-muted-foreground">trips</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Info Note */}
            {metrics.totalTrips === 0 && (
              <div className="mt-8 glass rounded-2xl p-6">
                <p className="text-center text-sm text-muted-foreground">
                  No trip data yet. Create some trips to see analytics here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
