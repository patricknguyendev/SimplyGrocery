# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SimplyGrocery is a grocery trip optimization application that analyzes shopping lists, matches products to a database, finds nearby stores, and computes three optimization strategies (Cheapest, Fastest, Balanced) to help users save money and time on grocery shopping.

## Development Commands

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)

# Build and Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Active Development TODOs

### Current Sprint: UI Visibility & Polish
- [x] Add text shimmer and drip animations to globals.css
- [x] Replace hero ShoppingCart icon with animated "SimplyGrocery" text
- [x] Improve "Start a Trip" button visibility with brightness enhancement
- [x] Update header logo icon color for better contrast
- [x] Fix hero wordmark: make "Simply" static emerald, keep "Grocery" animated
- [x] Enhance "Start a trip" CTA button with high-contrast solid emerald background

### Backlog: Web3 Redesign Completion
- [ ] Redesign Trip Creation page (`app/trip/new/page.tsx`) with glass form panels
- [ ] Redesign Trip Results page (`app/trip/[id]/page.tsx`) with neon plan cards
- [ ] Update Trip components (`components/trip/*`) with glass styling
- [ ] Redesign Admin dashboard and management pages
- [ ] Redesign Auth pages (login/signup) with floating glass cards
- [ ] Add remaining UI components (Dialog, Select, Badge, etc.) with Web3 styling

## Database Setup

The application uses Supabase (PostgreSQL). Run SQL scripts in order:

```bash
# Execute in Supabase SQL Editor or via CLI:
scripts/001-create-schema.sql           # Core tables
scripts/002-seed-stores.sql             # Store data
scripts/003-seed-products.sql           # Product catalog
scripts/004-seed-prices.sql             # Store-product pricing
scripts/005-grant-permissions.sql       # RLS policies
scripts/006-create-trip-events.sql      # Analytics table
```

**Environment Variables Required:**
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Architecture

### High-Level System Flow

```
User Interface (/trip/new)
    ↓
POST /api/trips (API Route)
    ↓
Trip Optimizer (lib/optimizer/)
    ├─ Product Matching (fuzzy search + synonyms)
    ├─ Store Discovery (haversine distance)
    ├─ Price Fetching (multi-store lookup)
    └─ Strategy Computation (3 algorithms)
    ↓
Database Persistence (Supabase)
    ├─ trips, trip_items
    ├─ trip_plans, trip_plan_stores
    └─ trip_plan_item_assignments
    ↓
Results Display (/trip/[id])
```

### Trip Optimizer System (`lib/optimizer/`)

The optimizer is a 9-step pipeline:

1. **Store Discovery**: Find nearby stores within radius using haversine distance
2. **Product Matching**: Convert raw queries ("milk") to database products using:
   - Synonym expansion (e.g., "ground beef" → "minced beef")
   - Scoring system: exact match (1000) > synonym (900) > word match (800+) > partial (300-600)
   - Tie-breaking: selects cheapest product when scores match
3. **Price Fetching**: Get all prices for matched products at nearby stores
4. **Trip Record Creation**: Save trip metadata to database
5. **Trip Items Creation**: Create trip_items records
6. **Plan Computation**: Run 1-3 optimization strategies
7. **Savings Calculation**: Compare against single-chain alternatives
8. **Database Persistence**: Save plans, store visits, and item assignments
9. **Response Building**: Transform persisted data into API response

### Optimization Strategies (`lib/optimizer/strategies.ts`)

**CHEAPEST**: Assigns each item to the store with lowest price. If too many stores, prunes to keep stores with most items. Orders remaining stores by nearest-neighbor algorithm.

**FASTEST**: Scores stores by `(items_available × 1000) - distance`. Selects single store with highest score for minimal travel time.

**BALANCED**: Calculates value score `(total_savings / item_count) / distance` for each store. Selects top N stores by value, assigns items to cheapest among selected.

**Common Calculations:**
- Distance: Haversine formula (Earth radius = 6371 km)
- Travel time: 30 km/h average urban speed
- In-store time: 5 min base + 1.5 min per item
- Store ordering: Nearest-neighbor greedy algorithm

### Product Matching (`lib/optimizer/product-matcher.ts`)

**Synonym Map**: 21+ synonym pairs including:
- spaghetti sauce ↔ marinara sauce ↔ pasta sauce
- ground beef ↔ minced beef
- soda ↔ pop ↔ soft drink

**Matching Strategies** (executed in order):
1. Exact matches across all synonym expansions
2. Broad ILIKE search with relevance scoring
3. Individual word matching
4. Category fallback (e.g., "milk" → Dairy category)

**Scoring Algorithm**:
- Exact match: 1000
- Synonym match: 900
- All query words match product words: 800-900
- Some query words match: 600-700
- Product contains query substring: 400-500
- Category fallback: 100

The `matchedName` field in `MatchedItem` tracks which product was selected for debugging/display.

### Database Schema

**Core Tables**:
- `stores`: Store locations with lat/lon, chain, address
- `products`: Product catalog with name, brand, category, metadata (organic, vegan, etc.)
- `store_product_prices`: Pricing per store-product pair with in_stock flag
- `trips`: Trip metadata with origin, settings (JSONB)
- `trip_items`: Individual items in a trip (raw_query, matched product_id, quantity)
- `trip_plans`: Computed plans with strategy, totals, savings vs chains
- `trip_plan_stores`: Store visit order with distances and travel times
- `trip_plan_item_assignments`: What products to buy at which stores
- `trip_events`: Analytics events for metrics tracking

**Key Relationships**:
- Trip (1) → (Many) Trip Items
- Trip (1) → (Many) Trip Plans
- Trip Plan (1) → (Many) Trip Plan Stores (ordered route)
- Trip Plan (1) → (Many) Item Assignments (what to buy where)

All foreign keys use CASCADE DELETE for trip-related tables.

### API Routes (`app/api/`)

**POST /api/trips**
- Request: origin (lat/lon/zip), items array, preferences (maxStores, maxRadiusKm, strategy)
- Validation: lat/lon ranges, non-empty items, valid strategy enum
- Returns: tripId, matched items, plans array
- Logs event to trip_events table for analytics
- Status codes: 400 (validation), 404 (no stores), 422 (matching failures), 500 (errors)

**GET /api/products/search**
- Query params: q (min 2 chars), category (optional), limit (max 50)
- Returns: products array sorted by relevance (exact matches first, then by name length)

### Frontend Structure

**Next.js App Router** with server components for data fetching, client components for interactivity.

**Key Pages**:
- `/` - Home page with hero, stats, plan type previews
- `/trip/new` - Trip creation form (client component with React Hook Form)
- `/trip/[id]` - Trip results with plan selection and detailed breakdown
- `/admin/metrics` - Analytics dashboard (strategy counts, avg items per trip)

**Form State** (`/trip/new`):
- Uses React Hook Form + Zod for validation
- Saved lists stored in localStorage via `useSavedLists` hook
- Example location presets for quick testing

**Components** (`components/trip/`):
- `PlanSummaryHeader`: Selected plan metrics display
- `PlanSelector`: Cards for choosing between strategies
- `StoreVisitList`: Detailed store breakdown with items and prices
- `SingleStoreComparison`: Savings comparison against single-chain alternatives

### Geographic Utilities (`lib/geo/distance.ts`)

- `haversineDistance(lat1, lon1, lat2, lon2)`: Great-circle distance in km
- `estimateTravelTime(distanceKm)`: Minutes at 30 km/h average
- `estimateInstoreTime(numItems)`: 5 min base + 1.5 min per item
- `nearestNeighborOrder(origin, stores)`: Greedy route ordering
- `calculateRouteDistance(origin, stores)`: Total route distance

### Supabase Integration

**Server Client** (`lib/supabase/server.ts`):
- Uses React `cache()` for request-level singleton
- Prevents "Multiple GoTrueClient instances" error
- Use in Server Components and API Routes

**Browser Client** (`lib/supabase/client.ts`):
- Browser-level singleton pattern
- Use in Client Components

### Naming Conventions

- **Components**: PascalCase (PlanSelector, TripPlansView)
- **Functions**: camelCase (optimizeTrip, matchProducts)
- **Constants**: UPPER_SNAKE_CASE (DEFAULT_RADIUS_KM, SYNONYMS)
- **Types**: PascalCase interfaces (TripRequest, PlanResult)
- **Database columns**: snake_case (origin_lat, created_at)
- **Files**: kebab-case (product-matcher.ts, use-saved-lists.ts)

## UI/UX Design System

### Web3 Glassmorphic Theme

SimplyGrocery uses a premium Web3-inspired design system featuring:

**Color Palette:**
- Background: `#0D0D0F` (deep dark)
- Neon Green (Primary): `#6BFFB8`
- Neon Purple (Secondary): `#A970FF`
- Neon Cyan (Accent): `#4BDFFF`
- Neon Pink (Destructive): `#FF4ED8`

**Visual Effects:**
- Glassmorphism: Semi-transparent surfaces with backdrop-filter blur
- Neon glows: Box-shadow effects on hover/focus
- Animated gradients: Multi-point radial gradients with keyframe animations
- Text effects: Shimmer animations, color drip effects
- Spring easing: cubic-bezier(0.34, 1.56, 0.64, 1) for bouncy transitions

**Key CSS Utilities:** (`app/globals.css`)
- `.glass`, `.glass-elevated`, `.glass-subtle` - Glassmorphism variants
- `.glow-green-hover`, `.glow-purple-hover`, etc. - Neon glow on hover
- `.gradient-animated` - Orbiting multi-color gradient
- `.text-shimmer` - Sweeping shimmer across text
- `.text-drip` - Vertical color-flow animation
- `.float-subtle`, `.float-on-hover` - Floating animations
- `.breathing-glow` - Pulsing glow effect

**Component Styling:**
- **Buttons**: Glass backgrounds, neon glows, breathing effects
- **Cards**: Glassmorphic with float-on-hover, rounded-2xl
- **Inputs**: Glass background with neon focus glow
- **Header**: Elevated glass with backdrop blur
- **Footer**: Glass bar with gradient branding

### Branding Elements

**Logo/Brand Text:**
- Hero section: Large "SimplyGrocery" text split into "Simply" (shimmer effect) and "Grocery" (drip effect)
- Header: ShoppingCart icon in neon green with glow
- Typography: Geist sans, bold weights for headings

**Button Hierarchy:**
- Primary CTA: `variant="neon"` - bright gradient with high contrast
- Secondary: `variant="glass"` - transparent with border glow
- Tertiary: `variant="ghost"` - minimal with hover glass effect

## Important Implementation Details

### Error Handling
- API routes return structured errors with appropriate HTTP status codes
- Client-side form validation before submission
- Database errors caught and logged with meaningful messages

### Type Safety
- Strict TypeScript mode enabled
- Type imports: `import type { ... }`
- Database types in `lib/db/types.ts` mirror SQL schema
- JSON metadata (preferences, settings, summary) uses `JSONB` in database with type safety at application layer

### Performance Considerations
- Product matching queries limited (5-20 results per strategy)
- Nearest-neighbor ordering is O(n²) but acceptable for small store counts (3-5)
- Price map uses string keys `${storeId}-${productId}` for O(1) lookups
- Server components handle data fetching, client components only for interactivity

### Key Files to Understand

When working on specific features, focus on these core files:

**Trip Optimization**:
- `lib/optimizer/index.ts` - Main orchestrator (9-step pipeline)
- `lib/optimizer/strategies.ts` - Three optimization algorithms
- `lib/optimizer/product-matcher.ts` - Fuzzy matching with synonyms

**API Layer**:
- `app/api/trips/route.ts` - Trip creation endpoint with validation

**Database**:
- `scripts/001-create-schema.sql` - Complete schema definition
- `lib/db/types.ts` - TypeScript types matching database schema

**Frontend**:
- `app/trip/new/page.tsx` - Trip creation form (complex client component)
- `app/trip/[id]/page.tsx` - Results display with plan selection

**Utilities**:
- `lib/geo/distance.ts` - All geographic calculations
- `lib/use-saved-lists.ts` - localStorage hook for saved shopping lists
