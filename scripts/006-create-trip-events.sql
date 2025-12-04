-- Trip Events Table
-- Tracks analytics and usage metrics for each trip request

CREATE TABLE IF NOT EXISTS trip_events (
    id                  BIGSERIAL PRIMARY KEY,
    trip_id             BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    number_of_items     INTEGER NOT NULL,
    selected_strategy   TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_events_trip ON trip_events (trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_events_strategy ON trip_events (selected_strategy);
CREATE INDEX IF NOT EXISTS idx_trip_events_created_at ON trip_events (created_at);
