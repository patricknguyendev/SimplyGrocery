-- GroceryOptimizer Database Schema
-- Run this script to create all tables for the grocery shopping optimizer

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    preferences     JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STORES
CREATE TABLE IF NOT EXISTS stores (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    chain           TEXT NOT NULL, -- e.g., 'WALMART', 'TARGET', 'COSTCO'
    lat             DOUBLE PRECISION NOT NULL,
    lon             DOUBLE PRECISION NOT NULL,
    address_line1   TEXT,
    city            TEXT,
    state           TEXT,
    postal_code     TEXT,
    country         TEXT DEFAULT 'US',
    metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_stores_chain ON stores (chain);
CREATE INDEX IF NOT EXISTS idx_stores_postal_code ON stores (postal_code);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    brand           TEXT,
    category        TEXT,
    size_value      NUMERIC(10, 2),
    size_unit       TEXT,
    upc             TEXT,
    metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);

-- STORE-PRODUCT PRICING
CREATE TABLE IF NOT EXISTS store_product_prices (
    store_id        BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price           NUMERIC(10, 2) NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'USD',
    in_stock        BOOLEAN NOT NULL DEFAULT TRUE,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (store_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_spp_product ON store_product_prices (product_id);
CREATE INDEX IF NOT EXISTS idx_spp_price ON store_product_prices (price);

-- TRIPS
CREATE TABLE IF NOT EXISTS trips (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT REFERENCES users(id) ON DELETE SET NULL,
    origin_lat          DOUBLE PRECISION,
    origin_lon          DOUBLE PRECISION,
    origin_zip          TEXT,
    settings            JSONB DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_user ON trips (user_id);

-- TRIP ITEMS
CREATE TABLE IF NOT EXISTS trip_items (
    id              BIGSERIAL PRIMARY KEY,
    trip_id         BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    product_id      BIGINT REFERENCES products(id) ON DELETE SET NULL,
    raw_query       TEXT,
    quantity        NUMERIC(10, 2) NOT NULL DEFAULT 1,
    constraints     JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_trip_items_trip ON trip_items (trip_id);

-- TRIP PLANS
CREATE TABLE IF NOT EXISTS trip_plans (
    id                          BIGSERIAL PRIMARY KEY,
    trip_id                     BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    label                       TEXT NOT NULL,
    strategy                    TEXT NOT NULL,
    total_price                 NUMERIC(10, 2) NOT NULL,
    total_distance_km           NUMERIC(10, 2),
    total_travel_time_min       NUMERIC(10, 2),
    estimated_instore_time_min  NUMERIC(10, 2),
    estimated_total_time_min    NUMERIC(10, 2),
    savings_vs_walmart          NUMERIC(10, 2),
    savings_vs_target           NUMERIC(10, 2),
    savings_vs_costco           NUMERIC(10, 2),
    summary                     JSONB DEFAULT '{}'::jsonb,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_plans_trip ON trip_plans (trip_id);

-- TRIP PLAN STORES
CREATE TABLE IF NOT EXISTS trip_plan_stores (
    id                          BIGSERIAL PRIMARY KEY,
    trip_plan_id                BIGINT NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    store_id                    BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_index                 INTEGER NOT NULL,
    distance_from_prev_km       NUMERIC(10, 2),
    travel_time_from_prev_min   NUMERIC(10, 2)
);

CREATE INDEX IF NOT EXISTS idx_tps_plan ON trip_plan_stores (trip_plan_id);
CREATE INDEX IF NOT EXISTS idx_tps_plan_order ON trip_plan_stores (trip_plan_id, order_index);

-- TRIP PLAN ITEM ASSIGNMENTS
CREATE TABLE IF NOT EXISTS trip_plan_item_assignments (
    id                  BIGSERIAL PRIMARY KEY,
    trip_plan_id        BIGINT NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    trip_item_id        BIGINT NOT NULL REFERENCES trip_items(id) ON DELETE CASCADE,
    store_id            BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    unit_price          NUMERIC(10, 2) NOT NULL,
    quantity            NUMERIC(10, 2) NOT NULL,
    line_total_price    NUMERIC(10, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED
);

CREATE INDEX IF NOT EXISTS idx_tpia_plan ON trip_plan_item_assignments (trip_plan_id);
CREATE INDEX IF NOT EXISTS idx_tpia_trip_item ON trip_plan_item_assignments (trip_item_id);
CREATE INDEX IF NOT EXISTS idx_tpia_store ON trip_plan_item_assignments (store_id);
