import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { StoreList } from "./store-list"
import { AddStoreDialog } from "./add-store-dialog"

async function getStores() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("stores").select("*").order("name")

  if (error) {
    console.error("Error fetching stores:", error)
    return []
  }

  return data || []
}

export default async function StoresAdminPage() {
  const stores = await getStores()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Stores Management</h1>
              <p className="mt-2 text-muted-foreground">Manage store locations and details</p>
            </div>
            <AddStoreDialog>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Store
              </Button>
            </AddStoreDialog>
          </div>

          {/* Stores List */}
          <Card>
            <CardHeader>
              <CardTitle>All Stores ({stores.length})</CardTitle>
              <CardDescription>View and manage all store locations</CardDescription>
            </CardHeader>
            <CardContent>
              <StoreList stores={stores} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
