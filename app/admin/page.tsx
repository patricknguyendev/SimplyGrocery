import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, Package, Tag, BarChart3, ArrowRight, ShoppingCart } from "lucide-react"

async function getAdminStats() {
  const supabase = await createClient()

  const [storesResult, productsResult, pricesResult, tripsResult] = await Promise.all([
    supabase.from("stores").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("store_product_prices").select("store_id", { count: "exact", head: true }),
    supabase.from("trips").select("id", { count: "exact", head: true }),
  ])

  return {
    stores: storesResult.count ?? 0,
    products: productsResult.count ?? 0,
    prices: pricesResult.count ?? 0,
    trips: tripsResult.count ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <section className="section-glow section-glow--primary relative bg-muted/10 -m-6 p-6">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage stores, products, prices, and view metrics for SimplyGrocery
          </p>
        </div>

      {/* Stats Summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass rounded-2xl shadow-2xl float-on-hover transition-spring glow-accent-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 shadow-xl glow-cyan">
                <Store className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stores</p>
                <p className="text-3xl font-bold text-accent text-glow-cyan">{stats.stores}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl shadow-2xl float-on-hover transition-spring glow-purple-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/20 shadow-xl glow-purple">
                <Package className="h-7 w-7 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-3xl font-bold text-secondary text-glow-purple">{stats.products}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl shadow-2xl float-on-hover transition-spring glow-pink-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/20 shadow-xl glow-pink">
                <Tag className="h-7 w-7 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prices</p>
                <p className="text-3xl font-bold text-destructive text-glow-pink">{stats.prices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl shadow-2xl float-on-hover transition-spring glow-green-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 shadow-xl glow-green">
                <ShoppingCart className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trips</p>
                <p className="text-3xl font-bold text-primary text-glow-green">{stats.trips}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass rounded-2xl shadow-2xl border-accent/40 float-on-hover transition-spring glow-cyan-hover">
          <CardHeader>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20 shadow-lg glow-cyan">
              <Store className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="mt-4 text-accent">Manage Stores</CardTitle>
            <CardDescription>
              Add, edit, or remove store locations. Update addresses and coordinates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="glass" className="w-full">
              <Link href="/admin/stores">
                Go to Stores
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl shadow-2xl border-primary/40 float-on-hover transition-spring glow-green-hover">
          <CardHeader>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 shadow-lg glow-green">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="mt-4 text-primary">Manage Products</CardTitle>
            <CardDescription>
              Maintain the product catalog. Add new items, update details, and manage inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="glass" className="w-full">
              <Link href="/admin/products">
                Go to Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl shadow-2xl border-secondary/40 float-on-hover transition-spring glow-purple-hover">
          <CardHeader>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/20 shadow-lg glow-purple">
              <Tag className="h-7 w-7 text-secondary" />
            </div>
            <CardTitle className="mt-4 text-secondary">Manage Prices</CardTitle>
            <CardDescription>
              Update pricing and availability for products at different stores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="glass" className="w-full">
              <Link href="/admin/prices">
                Go to Prices
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl shadow-2xl border-destructive/40 float-on-hover transition-spring glow-pink-hover">
          <CardHeader>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/20 shadow-lg glow-pink">
              <BarChart3 className="h-7 w-7 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-destructive">View Metrics</CardTitle>
            <CardDescription>
              Analytics dashboard with trip statistics and system health metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="glass" className="w-full">
              <Link href="/admin/metrics">
                Go to Metrics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information Banner */}
      {stats.stores === 0 && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Store className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Database Setup Required</h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  No stores found in the database. Run the SQL seed scripts in the{" "}
                  <code className="rounded bg-amber-100 px-1 py-0.5 dark:bg-amber-900">scripts/</code> directory to
                  populate the database with initial data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </section>
  )
}
