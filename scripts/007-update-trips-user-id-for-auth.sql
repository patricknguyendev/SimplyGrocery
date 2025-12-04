-- Migration to update trips.user_id for Supabase Auth
-- This changes user_id from BIGINT to UUID to work with Supabase Auth

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_user_id_fkey;

-- Step 2: Change user_id column type from BIGINT to UUID
-- Since we likely have no real user data yet (only NULL values), this should be safe
ALTER TABLE trips ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;

-- Step 3: Add foreign key constraint to auth.users
-- Note: auth.users is the Supabase Auth users table
ALTER TABLE trips
ADD CONSTRAINT trips_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;

-- The index already exists from the original schema, but let's ensure it's there
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips (user_id);
