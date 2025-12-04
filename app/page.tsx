import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { ShoppingCart, MapPin, DollarSign, Clock, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function getStats() {
  const supabase = await createClient()

  const [storesResult, productsResult, pricesResult] = await Promise.all([
    supabase.from("stores").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("store_product_prices").select("store_id", { count: "exact", head: true }),
  ])

  return {
    stores: storesResult.count ?? 0,
    products: productsResult.count ?? 0,
    prices: pricesResult.count ?? 0,
  }
}

export default async function HomePage() {
  const stats = await getStats()
  const user = await getCurrentUser()

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="section-glow section-glow--primary relative bg-muted/10">
        <div className="container relative mx-auto px-6 py-32 sm:py-40">
          <div className="mx-auto max-w-4xl text-center fade-in-up">
            <div className="relative mb-8 inline-block">
              {/* Isometric hero tiles */}
              <div
                className="iso-tile iso-tile--green iso-orbit-slow -left-28 -top-10 hidden md:block opacity-80"
                aria-hidden="true"
              />
              <div
                className="iso-tile iso-tile--purple iso-orbit-fast left-20 top-8 hidden lg:block opacity-75"
                aria-hidden="true"
              />

              {/* Brand text with static "Simply" and animated "Grocery" */}
              <div className="hero-brand float-subtle">
                <span className="text-emerald-300">Simply</span>
                <span className="text-drip">Grocery</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl mb-6">
              Smarter grocery trips.{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Less time, more savings.
              </span>
            </h1>
            <p className="mt-8 text-xl leading-8 text-muted-foreground max-w-2xl mx-auto">
              SimplyGrocery plans your grocery run across nearby stores, so you know exactly where to go, what to buy,
              how much it will cost, and how much you&apos;ll save before you leave home.
            </p>
            <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
              <Button asChild size="lg" variant="neon">
                <Link href="/trip/new">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Start a trip
                </Link>
              </Button>
              {user && (
                <Button asChild size="lg" variant="glass">
                  <Link href="/trips">
                    <History className="mr-2 h-5 w-5" />
                    My Trips
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-glow section-glow--primary relative bg-background">
        <div className="container mx-auto px-6 py-24 relative">
          <div className="relative mb-16">
            <h2 className="text-center text-4xl font-bold text-foreground mb-4">How SimplyGrocery works</h2>
            <p className="text-center text-muted-foreground text-lg mb-4">Three simple steps to smarter shopping</p>
            {/* Section isometric accent */}
            <div
              className="pointer-events-none absolute -right-24 -top-10 hidden md:block"
              aria-hidden="true"
            >
              <div className="iso-tile iso-tile--purple iso-orbit-slow opacity-65" />
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <Card className="group hover:scale-105 transition-spring">
              <CardHeader>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-green-cyan shadow-xl glow-green">
                  <ShoppingCart className="h-8 w-8 text-background" />
                </div>
                <CardTitle className="text-xl">1. Enter your list & location</CardTitle>
                <CardDescription className="text-base">
                  Type your shopping list and ZIP code (or use the Mountain View demo) so we know what you need and
                  where you are starting from.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:scale-105 transition-spring">
              <CardHeader>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-secondary shadow-xl glow-cyan">
                  <MapPin className="h-8 w-8 text-background" />
                </div>
                <CardTitle className="text-xl">2. We compare nearby stores</CardTitle>
                <CardDescription className="text-base">
                  We look up prices at nearby stores and build trip options that balance cost, travel time, and number
                  of stops.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:scale-105 transition-spring">
              <CardHeader>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-purple-pink shadow-xl glow-purple">
                  <DollarSign className="h-8 w-8 text-background" />
                </div>
                <CardTitle className="text-xl">3. Get your optimized trip</CardTitle>
                <CardDescription className="text-base">
                  See cheapest, fastest, and balanced plans with a clear route, store stops, total cost, and how much
                  you&apos;ll save.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Static example summary cards */}
          <div className="mt-20 grid gap-6 sm:grid-cols-3">
            <Card className="border-primary/50 glow-green-hover group transition-spring hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-lg">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-primary text-xl">Cheapest Plan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary text-glow-green">$52.30</span>
                  <span className="text-sm text-muted-foreground">total cost</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>3 stores</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>22 min trip</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary">Saves $12.10</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs italic text-muted-foreground">Example data</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/50 glow-cyan-hover group transition-spring hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 shadow-lg">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-accent text-xl">Fastest Plan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-accent text-glow-cyan">$64.40</span>
                  <span className="text-sm text-muted-foreground">total cost</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>1 store</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-accent">8 min trip</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <DollarSign className="h-5 w-5 text-accent" />
                    <span>No extra stops</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs italic text-muted-foreground">Example data</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-secondary/50 glow-purple-hover group transition-spring hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20 shadow-lg">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-secondary text-xl">Balanced Plan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-secondary text-glow-purple">$56.80</span>
                  <span className="text-sm text-muted-foreground">total cost</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-secondary" />
                    <span>2 stores</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-5 w-5 text-secondary" />
                    <span>15 min trip</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-secondary" />
                    <span className="font-semibold text-secondary">Saves $7.60</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs italic text-muted-foreground">Example data</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Coverage Section */}
      <section className="section-glow section-glow--alt relative bg-muted/10">
        <div className="container mx-auto px-6 py-24 relative">
          <div className="mx-auto max-w-5xl">
            <div className="relative mb-16">
              <h2 className="text-center text-4xl font-bold text-foreground mb-4">Coverage & Data</h2>
              <p className="mt-2 text-center text-muted-foreground text-lg">
                Currently supporting the Bay Area with demo data
              </p>
              {/* Section isometric accent */}
              <div
                className="pointer-events-none absolute -left-24 -top-8 hidden md:block"
                aria-hidden="true"
              >
                <div className="iso-tile iso-tile--green iso-orbit-fast opacity-60" />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="group hover:glow-green transition-spring">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <p className="text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                      {stats.stores}
                    </p>
                    <p className="mt-3 text-base text-muted-foreground font-medium">Store Locations</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:glow-cyan transition-spring">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <p className="text-5xl font-bold bg-gradient-to-br from-accent to-secondary bg-clip-text text-transparent">
                      {stats.products}
                    </p>
                    <p className="mt-3 text-base text-muted-foreground font-medium">Products Tracked</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:glow-purple transition-spring">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <p className="text-5xl font-bold bg-gradient-to-br from-secondary to-destructive bg-clip-text text-transparent">
                      {stats.prices}
                    </p>
                    <p className="mt-3 text-base text-muted-foreground font-medium">Active Prices</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Our demo currently covers Mountain View, Sunnyvale, and surrounding areas.
              </p>
              <p className="text-sm text-muted-foreground">
                Prices and availability are sample data for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Types Preview */}
      <section className="section-glow section-glow--primary relative bg-background">
        <div className="container mx-auto px-6 py-24 relative">
          <div className="relative mb-16 mx-auto max-w-6xl">
            <h2 className="text-center text-4xl font-bold text-foreground mb-4">Trip Plan Options</h2>
            <p className="mt-2 text-center text-muted-foreground text-lg">
              Choose the plan that fits your needs
            </p>
            {/* Section isometric accent */}
            <div
              className="pointer-events-none absolute -right-24 -top-10 hidden md:block"
              aria-hidden="true"
            >
              <div className="iso-tile iso-tile--purple iso-orbit-fast opacity-60" />
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 max-w-6xl mx-auto">
            <Card className="border-primary/40 glow-green-hover group transition-spring hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-primary/20 p-3 shadow-lg">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-primary text-2xl">Cheapest</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  Minimize total cost by shopping at multiple stores. Best for budget-conscious shoppers with flexible
                  schedules.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/40 glow-cyan-hover group transition-spring hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-accent/20 p-3 shadow-lg">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-accent text-2xl">Fastest</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  Single store trip with minimal travel. Best when you&apos;re short on time and convenience matters
                  most.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/40 glow-purple-hover group transition-spring hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-secondary/20 p-3 shadow-lg">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-secondary text-2xl">Balanced</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  Smart trade-off between savings and convenience. Visit 2-3 stores for significant savings without
                  excessive travel.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
