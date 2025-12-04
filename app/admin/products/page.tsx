import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProductList } from "./product-list"
import { AddProductDialog } from "./add-product-dialog"

async function getProducts(category?: string) {
  const supabase = await createClient()
  let query = supabase.from("products").select("*").order("name")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("category").not("category", "is", null)

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  const uniqueCategories = [...new Set(data.map((p) => p.category).filter(Boolean))] as string[]
  return uniqueCategories.sort()
}

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const products = await getProducts(params.category)
  const categories = await getCategories()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Products Management</h1>
              <p className="mt-2 text-muted-foreground">Manage product catalog and details</p>
            </div>
            <AddProductDialog categories={categories}>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Product
              </Button>
            </AddProductDialog>
          </div>

          {/* Products List */}
          <Card>
            <CardHeader>
              <CardTitle>All Products ({products.length})</CardTitle>
              <CardDescription>View and manage product catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductList products={products} categories={categories} selectedCategory={params.category} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
