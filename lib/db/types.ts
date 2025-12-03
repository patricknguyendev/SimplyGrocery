// Database types for GroceryOptimizer

export interface User {
  id: number
  email: string
  password_hash: string
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  max_stores?: number
  default_radius_km?: number
  preferred_chains?: string[]
  avoid_chains?: string[]
}

export interface Store {
  id: number
  name: string
  chain: string
  lat: number
  lon: number
  address_line1: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string
  metadata: StoreMetadata
}

export interface StoreMetadata {
  hours?: string
  type?: string
  membership_required?: boolean
}

export interface Product {
  id: number
  name: string
  brand: string | null
  category: string | null
  size_value: number | null
  size_unit: string | null
  upc: string | null
  metadata: ProductMetadata
}

export interface ProductMetadata {
  organic?: boolean
  gluten_free?: boolean
  vegan?: boolean
  [key: string]: boolean | string | undefined
}

export interface StoreProductPrice {
  store_id: number
  product_id: number
  price: number
  currency: string
  in_stock: boolean
  last_updated_at: string
}

export interface Trip {
  id: number
  user_id: number | null
  origin_lat: number | null
  origin_lon: number | null
  origin_zip: string | null
  settings: TripSettings
  created_at: string
}

export interface TripSettings {
  max_stores?: number
  radius_km?: number
  time_vs_savings_weight?: number // 0 = all savings, 1 = all time
  include_chains?: string[]
  exclude_chains?: string[]
}

export interface TripItem {
  id: number
  trip_id: number
  product_id: number | null
  raw_query: string | null
  quantity: number
  constraints: TripItemConstraints
}

export interface TripItemConstraints {
  brand_strict?: boolean
  allow_substitutions?: boolean
  min_size?: number
  max_size?: number
}

export interface TripPlan {
  id: number
  trip_id: number
  label: string
  strategy: "CHEAPEST" | "FASTEST" | "BALANCED"
  total_price: number
  total_distance_km: number | null
  total_travel_time_min: number | null
  estimated_instore_time_min: number | null
  estimated_total_time_min: number | null
  savings_vs_walmart: number | null
  savings_vs_target: number | null
  savings_vs_costco: number | null
  summary: TripPlanSummary
  created_at: string
}

export interface TripPlanSummary {
  num_stores: number
  items_by_store: Record<string, number>
  [key: string]: unknown
}

export interface TripPlanStore {
  id: number
  trip_plan_id: number
  store_id: number
  order_index: number
  distance_from_prev_km: number | null
  travel_time_from_prev_min: number | null
}

export interface TripPlanItemAssignment {
  id: number
  trip_plan_id: number
  trip_item_id: number
  store_id: number
  product_id: number
  unit_price: number
  quantity: number
  line_total_price: number
}

// Extended types for API responses
export interface StoreWithPrices extends Store {
  prices: StoreProductPrice[]
}

export interface ProductWithPrice extends Product {
  price: number
  store_id: number
  in_stock: boolean
}

export interface TripPlanWithDetails extends TripPlan {
  stores: (TripPlanStore & { store: Store })[]
  item_assignments: (TripPlanItemAssignment & {
    product: Product
    store: Store
  })[]
}
