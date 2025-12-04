"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Store, Product } from "@/lib/db/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Save, X } from "lucide-react"
import { updatePrice, addPrice, deletePrice } from "./actions"

interface PriceWithProduct {
  store_id: number
  product_id: number
  price: number
  in_stock: boolean
  products: Product
}

export function PriceManager({
  stores,
  prices,
  allProducts,
  selectedStoreId,
}: {
  stores: Store[]
  prices: PriceWithProduct[]
  allProducts: Product[]
  selectedStoreId: number | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null)
  const [editData, setEditData] = useState<{ price: number; inStock: boolean }>({ price: 0, inStock: true })
  const [isAddingPrice, setIsAddingPrice] = useState(false)
  const [newPrice, setNewPrice] = useState<{ productId: number; price: number; inStock: boolean }>({
    productId: 0,
    price: 0,
    inStock: true,
  })

  const handleStoreChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("store_id", value)
    router.push(`/admin/prices?${params.toString()}`)
  }

  const startEdit = (productId: number, price: number, inStock: boolean) => {
    setEditingPriceId(productId)
    setEditData({ price, inStock })
  }

  const cancelEdit = () => {
    setEditingPriceId(null)
    setEditData({ price: 0, inStock: true })
  }

  const saveEdit = async (productId: number) => {
    if (!selectedStoreId) return

    const result = await updatePrice(selectedStoreId, productId, editData.price, editData.inStock)

    if (result.success) {
      setEditingPriceId(null)
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleAddPrice = async () => {
    if (!selectedStoreId || !newPrice.productId) return

    const result = await addPrice(selectedStoreId, newPrice.productId, newPrice.price, newPrice.inStock)

    if (result.success) {
      setIsAddingPrice(false)
      setNewPrice({ productId: 0, price: 0, inStock: true })
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleDeletePrice = async (productId: number) => {
    if (!selectedStoreId) return
    if (!confirm("Are you sure you want to delete this price?")) return

    const result = await deletePrice(selectedStoreId, productId)

    if (result.success) {
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Get products that don't have prices at this store yet
  const productsWithPrices = new Set(prices.map((p) => p.product_id))
  const availableProducts = allProducts.filter((p) => !productsWithPrices.has(p.id))

  return (
    <div>
      {/* Store Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Select store:</span>
          <Select value={selectedStoreId?.toString() || ""} onValueChange={handleStoreChange}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Choose a store..." />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name} ({store.chain})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedStoreId ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Select a store to view and manage prices</p>
        </div>
      ) : (
        <>
          {/* Add Price Button */}
          {availableProducts.length > 0 && !isAddingPrice && (
            <div className="mb-4">
              <Button onClick={() => setIsAddingPrice(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Price
              </Button>
            </div>
          )}

          {/* Add Price Form */}
          {isAddingPrice && (
            <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="mb-3 font-semibold">Add New Price</h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Select
                    value={newPrice.productId.toString()}
                    onValueChange={(value) => setNewPrice({ ...newPrice, productId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} {product.brand ? `(${product.brand})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newPrice.price || ""}
                    onChange={(e) => setNewPrice({ ...newPrice, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newPrice.inStock}
                    onCheckedChange={(checked) => setNewPrice({ ...newPrice, inStock: checked === true })}
                  />
                  <span className="text-sm">In Stock</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button onClick={handleAddPrice} disabled={!newPrice.productId || newPrice.price <= 0}>
                  Add
                </Button>
                <Button variant="outline" onClick={() => setIsAddingPrice(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Prices Table */}
          {prices.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No prices set for this store yet. Add your first price to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Brand</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">In Stock</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((priceEntry) => {
                    const isEditing = editingPriceId === priceEntry.product_id
                    return (
                      <tr key={priceEntry.product_id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-medium">{priceEntry.products.name}</td>
                        <td className="px-4 py-3 text-sm">{priceEntry.products.brand || "-"}</td>
                        <td className="px-4 py-3 text-sm">{priceEntry.products.category || "-"}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={editData.price}
                              onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                              className="w-24"
                            />
                          ) : (
                            <span className="text-sm">${priceEntry.price.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <Checkbox
                              checked={editData.inStock}
                              onCheckedChange={(checked) => setEditData({ ...editData, inStock: checked === true })}
                            />
                          ) : (
                            <span className="text-sm">{priceEntry.in_stock ? "Yes" : "No"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => saveEdit(priceEntry.product_id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEdit(priceEntry.product_id, priceEntry.price, priceEntry.in_stock)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePrice(priceEntry.product_id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
