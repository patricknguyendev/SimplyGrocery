-- Admin users table
-- Links to Supabase Auth users and designates them as admins

CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users (user_id);

-- Example: To grant admin access to a user, insert their UUID:
-- INSERT INTO admin_users (user_id) VALUES ('your-user-uuid-here');

-- You can find user UUIDs by querying:
-- SELECT id, email FROM auth.users;
