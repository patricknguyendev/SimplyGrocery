import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ShoppingCart, MapPin, DollarSign, Clock } from "lucide-react"
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

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Smart Grocery Shopping</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Optimize your grocery trips across multiple stores. Find the best prices, minimize travel time, and save
              money with intelligent route planning.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/trip/new">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Start Shopping
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/stores">View Stores</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold text-foreground">How It Works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Add Your List</CardTitle>
                <CardDescription>
                  Enter your shopping list with the items you need. Search from our product catalog or add custom items.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. Set Location</CardTitle>
                <CardDescription>
                  Enter your ZIP code or share your location. We&apos;ll find nearby stores from Walmart, Target,
                  Costco, and more (Coming Soon).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Get Optimized Plans</CardTitle>
                <CardDescription>
                  Choose from cheapest, fastest, or balanced trip plans. See exactly what to buy where and how much
                  you&apos;ll save.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-semibold text-foreground">Database Status</h2>
            <p className="mt-2 text-center text-muted-foreground">Current seed data loaded in the system</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{stats.stores}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Stores</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{stats.products}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Products</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{stats.prices}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Price Records</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            {stats.stores === 0 && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Run the SQL scripts in <code className="rounded bg-muted px-1 py-0.5">scripts/</code> to seed the
                database.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Plan Types Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold text-foreground">Trip Plan Options</h2>
          <p className="mt-2 text-center text-muted-foreground">Choose the plan that fits your needs</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-600">Cheapest</CardTitle>
                </div>
                <CardDescription>
                  Minimize total cost by shopping at multiple stores. Best for budget-conscious shoppers with flexible
                  schedules.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-blue-600">Fastest</CardTitle>
                </div>
                <CardDescription>
                  Single store trip with minimal travel. Best when you&apos;re short on time and convenience matters
                  most.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-purple-600">Balanced</CardTitle>
                </div>
                <CardDescription>
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
