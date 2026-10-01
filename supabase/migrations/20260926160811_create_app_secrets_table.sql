/*
# Create app_secrets table for storing third-party API credentials

1. New Tables
- `app_secrets`
  - `key` (text, primary key) — the name of the secret (e.g. "airtable_token")
  - `value` (text, not null) — the secret value
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Security
- RLS enabled, NO policies added — the table is completely locked down.
- Only the service role (used by edge functions) can read/write, since it bypasses RLS.
- The anon key used by the frontend cannot access this table at all.

3. Purpose
- Stores the Airtable Personal Access Token and Base ID securely.
- The airtable-proxy edge function reads these values using the service role key.
*/

CREATE TABLE IF NOT EXISTS app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;

-- Insert Airtable credentials
INSERT INTO app_secrets (key, value)
VALUES ('airtable_token', 'patnDpWGL6LPtRCMy.7f57dcd36c51eecb778f61a0ada24e0b808ca24cba36c65cde47461748a31bd6')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO app_secrets (key, value)
VALUES ('airtable_base_id', 'appkmusoT6q3WNs7E')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
