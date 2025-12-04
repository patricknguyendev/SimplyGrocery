import { requireAdmin } from "@/lib/auth/get-current-user"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Store, Package, Tag, BarChart3 } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Require admin authentication - redirects to / if not admin
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-elevated border-b border-glow-green backdrop-glass shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Manage stores, products, and pricing</p>
            </div>
          </div>

          {/* Admin Navigation */}
          <nav className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="glass" size="sm">
              <Link href="/admin" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="glass" size="sm">
              <Link href="/admin/stores" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Stores
              </Link>
            </Button>
            <Button asChild variant="glass" size="sm">
              <Link href="/admin/products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products
              </Link>
            </Button>
            <Button asChild variant="glass" size="sm">
              <Link href="/admin/prices" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Prices
              </Link>
            </Button>
            <Button asChild variant="glass" size="sm">
              <Link href="/admin/metrics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Metrics
              </Link>
            </Button>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
