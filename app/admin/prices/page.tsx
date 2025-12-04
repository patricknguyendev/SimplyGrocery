import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PriceManager } from "./price-manager"

async function getStores() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("stores").select("*").order("name")

  if (error) {
    console.error("Error fetching stores:", error)
    return []
  }

  return data || []
}

async function getPricesForStore(storeId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("store_product_prices")
    .select(
      `
      *,
      products (
        id,
        name,
        brand,
        category
      )
    `,
    )
    .eq("store_id", storeId)
    .order("products(name)")

  if (error) {
    console.error("Error fetching prices:", error)
    return []
  }

  return data || []
}

async function getAllProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*").order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

export default async function PricesAdminPage({ searchParams }: { searchParams: Promise<{ store_id?: string }> }) {
  const params = await searchParams
  const stores = await getStores()
  const allProducts = await getAllProducts()

  const selectedStoreId = params.store_id ? parseInt(params.store_id) : null
  const prices = selectedStoreId ? await getPricesForStore(selectedStoreId) : []

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Prices Management</h1>
            <p className="mt-2 text-muted-foreground">Manage product pricing by store</p>
          </div>

          {/* Prices Manager */}
          <Card>
            <CardHeader>
              <CardTitle>Store Prices</CardTitle>
              <CardDescription>Select a store to view and edit product prices</CardDescription>
            </CardHeader>
            <CardContent>
              <PriceManager
                stores={stores}
                prices={prices}
                allProducts={allProducts}
                selectedStoreId={selectedStoreId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
