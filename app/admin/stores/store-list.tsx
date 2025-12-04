"use client"

import { useState } from "react"
import type { Store } from "@/lib/db/types"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { deleteStore } from "./actions"
import { EditStoreDialog } from "./edit-store-dialog"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function StoreList({ stores }: { stores: Store[] }) {
  const router = useRouter()
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [deletingStoreId, setDeletingStoreId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deletingStoreId) return

    setIsDeleting(true)
    const result = await deleteStore(deletingStoreId)

    if (result.success) {
      setDeletingStoreId(null)
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
    setIsDeleting(false)
  }

  if (stores.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No stores found. Add your first store to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Chain</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Postal Code</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">{store.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{store.name}</td>
                <td className="px-4 py-3 text-sm">{store.chain}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {store.city}, {store.state}
                </td>
                <td className="px-4 py-3 text-sm">{store.postal_code}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingStore(store)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingStoreId(store.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingStore && <EditStoreDialog store={editingStore} onClose={() => setEditingStore(null)} />}

      <AlertDialog open={deletingStoreId !== null} onOpenChange={(open) => !open && setDeletingStoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this store? This action cannot be undone and will also delete all
              associated prices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
