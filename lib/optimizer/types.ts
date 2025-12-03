/**
 * Types for the trip optimizer
 */

import type { Store, Product } from "@/lib/db/types"

// Request types
export interface TripRequest {
  origin: {
    lat?: number
    lon?: number
    zip?: string
  }
  items: TripItemRequest[]
  preferences?: TripPreferences
}

export interface TripItemRequest {
  rawQuery: string
  quantity: number
  constraints?: {
    brandStrict?: boolean
    allowSubstitutions?: boolean
  }
}

export interface TripPreferences {
  maxStores?: number
  maxRadiusKm?: number
  strategy?: "ALL" | "CHEAPEST" | "FASTEST" | "BALANCED"
  includeChains?: string[]
  excludeChains?: string[]
}

// Internal optimizer types
export interface MatchedItem {
  rawQuery: string
  quantity: number
  product: Product
  tripItemId?: number
}

export interface StoreWithDistance extends Store {
  distanceKm: number
}

export interface PriceEntry {
  storeId: number
  productId: number
  price: number
  inStock: boolean
}

export interface ItemAssignment {
  tripItemId: number
  productId: number
  storeId: number
  price: number
  quantity: number
}

export interface PlanResult {
  label: string
  strategy: "CHEAPEST" | "FASTEST" | "BALANCED"
  totalPrice: number
  totalDistanceKm: number
  totalTravelTimeMin: number
  estimatedInstoreTimeMin: number
  estimatedTotalTimeMin: number
  storeOrder: StoreVisit[]
  assignments: ItemAssignment[]
}

export interface StoreVisit {
  store: Store
  orderIndex: number
  distanceFromPrevKm: number
  travelTimeFromPrevMin: number
  itemCount: number
}

// Response types
export interface TripResponse {
  tripId: number
  origin: {
    lat: number
    lon: number
    zip?: string
  }
  items: {
    id: number
    rawQuery: string
    quantity: number
    matchedProduct: {
      id: number
      name: string
      brand: string | null
      category: string | null
    } | null
  }[]
  plans: PlanResponse[]
}

export interface PlanResponse {
  id: number
  label: string
  strategy: string
  totalPrice: number
  totalDistanceKm: number
  totalTravelTimeMin: number
  estimatedInstoreTimeMin: number
  estimatedTotalTimeMin: number
  savingsVsWalmart: number | null
  savingsVsTarget: number | null
  savingsVsCostco: number | null
  stores: {
    store: {
      id: number
      name: string
      chain: string
      address: string
      lat: number
      lon: number
    }
    orderIndex: number
    distanceFromPrevKm: number
    travelTimeFromPrevMin: number
    items: {
      productId: number
      productName: string
      quantity: number
      unitPrice: number
      lineTotal: number
    }[]
  }[]
}
