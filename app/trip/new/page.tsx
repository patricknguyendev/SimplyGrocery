"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, MapPin, ShoppingCart, Settings2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ShoppingItem {
  id: string
  rawQuery: string
  quantity: number
}

export default function NewTripPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Origin state
  const [zip, setZip] = useState("")
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)

  // Items state
  const [items, setItems] = useState<ShoppingItem[]>([{ id: crypto.randomUUID(), rawQuery: "", quantity: 1 }])

  // Preferences state
  const [maxStores, setMaxStores] = useState(3)
  const [maxRadiusKm, setMaxRadiusKm] = useState(15)
  const [strategy, setStrategy] = useState<"ALL" | "CHEAPEST" | "FASTEST" | "BALANCED">("ALL")

  const useExampleLocation = () => {
    setZip("94040")
    setLat(37.4019)
    setLon(-122.111)
  }

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), rawQuery: "", quantity: 1 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: "rawQuery" | "quantity", value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    const validItems = items.filter((item) => item.rawQuery.trim() !== "")
    if (validItems.length === 0) {
      setError("Please add at least one item to your shopping list.")
      return
    }

    if (!zip && (!lat || !lon)) {
      setError("Please enter a ZIP code or use the example location.")
      return
    }

    // Build request body
    const body = {
      origin: {
        lat: lat ?? 37.4019, // Default to Mountain View if only ZIP provided
        lon: lon ?? -122.111,
        zip: zip || "94040",
      },
      items: validItems.map((item) => ({
        rawQuery: item.rawQuery.trim(),
        quantity: item.quantity,
      })),
      preferences: {
        maxStores,
        maxRadiusKm,
        strategy,
      },
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 || response.status === 422) {
          setError(data.error || "Invalid request. Please check your inputs.")
        } else {
          setError("Something went wrong. Please try again.")
          console.error("Trip creation error:", data)
        }
        return
      }

      // Success - navigate to trip results
      router.push(`/trip/${data.tripId}`)
    } catch (err) {
      setError("Failed to create trip. Please try again.")
      console.error("Network error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Plan Your Trip</h1>
          <p className="mt-2 text-muted-foreground">
            Add your shopping list and preferences to get optimized trip plans.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Origin Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Your Location</CardTitle>
                  <CardDescription>Where are you starting from?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    type="text"
                    placeholder="94040"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    maxLength={10}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={useExampleLocation}
                  className="shrink-0 bg-transparent"
                >
                  Use Mountain View (Demo)
                </Button>
              </div>
              {lat && lon && (
                <p className="text-sm text-muted-foreground">
                  Coordinates: {lat.toFixed(4)}, {lon.toFixed(4)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Shopping List</CardTitle>
                    <CardDescription>
                      Add items you want to buy (e.g., &quot;milk&quot;, &quot;spaghetti&quot;, &quot;eggs&quot;)
                    </CardDescription>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm text-muted-foreground">{index + 1}.</span>
                  <Input
                    placeholder="Item name (e.g., whole milk)"
                    value={item.rawQuery}
                    onChange={(e) => updateItem(item.id, "rawQuery", e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`qty-${item.id}`} className="sr-only">
                      Quantity
                    </Label>
                    <Input
                      id={`qty-${item.id}`}
                      type="number"
                      min={1}
                      max={99}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              ))}
              <p className="pt-2 text-xs text-muted-foreground">
                Tip: Use common product names. The system will match them to products in our database.
              </p>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Settings2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Trip Preferences</CardTitle>
                  <CardDescription>Customize your optimization settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="maxStores">Max Stores</Label>
                  <Input
                    id="maxStores"
                    type="number"
                    min={1}
                    max={10}
                    value={maxStores}
                    onChange={(e) => setMaxStores(Number.parseInt(e.target.value) || 3)}
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of stores to visit</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRadius">Max Radius (km)</Label>
                  <Input
                    id="maxRadius"
                    type="number"
                    min={1}
                    max={50}
                    value={maxRadiusKm}
                    onChange={(e) => setMaxRadiusKm(Number.parseInt(e.target.value) || 15)}
                  />
                  <p className="text-xs text-muted-foreground">Search radius for nearby stores</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strategy">Plan Type</Label>
                  <Select
                    value={strategy}
                    onValueChange={(val) => setStrategy(val as "ALL" | "CHEAPEST" | "FASTEST" | "BALANCED")}
                  >
                    <SelectTrigger id="strategy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Plans</SelectItem>
                      <SelectItem value="CHEAPEST">Cheapest Only</SelectItem>
                      <SelectItem value="FASTEST">Fastest Only</SelectItem>
                      <SelectItem value="BALANCED">Balanced Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Which optimization strategy to use</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Get Trip Plans
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
