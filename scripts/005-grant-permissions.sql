-- Grant permissions to the anon and authenticated roles
-- This is required for Supabase PostgREST to access the tables

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT, INSERT, UPDATE, DELETE on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant usage on all sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

-- Specifically grant on our tables (in case defaults don't apply retroactively)
GRANT SELECT, INSERT, UPDATE, DELETE ON 
  users, 
  stores, 
  products, 
  store_product_prices, 
  trips, 
  trip_items, 
  trip_plans, 
  trip_plan_stores, 
  trip_plan_item_assignments 
TO anon, authenticated;

GRANT USAGE, SELECT ON 
  users_id_seq,
  stores_id_seq,
  products_id_seq,
  trips_id_seq,
  trip_items_id_seq,
  trip_plans_id_seq,
  trip_plan_stores_id_seq,
  trip_plan_item_assignments_id_seq
TO anon, authenticated;
