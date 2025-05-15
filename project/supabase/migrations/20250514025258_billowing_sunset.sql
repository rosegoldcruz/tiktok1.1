/*
  # Monetization System Schema

  1. New Tables
    - monetization_channels: Tracks platform connections and auth
    - revenue_streams: Records all revenue sources
    - affiliate_links: Manages affiliate marketing links
    - sponsorship_deals: Tracks brand sponsorships

  2. Security
    - Enable RLS on all tables
    - Add policies for user-specific access
    - Create indexes for performance optimization

  3. Changes
    - Add timestamp management triggers
    - Create performance optimization indexes
*/

-- Monetization Channels Table
CREATE TABLE IF NOT EXISTS monetization_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  platform text NOT NULL,
  platform_user_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  settings jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE monetization_channels ENABLE ROW LEVEL SECURITY;

-- Revenue Streams Table
CREATE TABLE IF NOT EXISTS revenue_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES monetization_channels(id),
  content_id uuid REFERENCES content_analysis(id),
  stream_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  earned_at timestamptz DEFAULT now(),
  platform_reference text,
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE revenue_streams ENABLE ROW LEVEL SECURITY;

-- Affiliate Links Table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  program text NOT NULL,
  link_id text NOT NULL,
  url text NOT NULL,
  commission_rate numeric DEFAULT 0,
  total_clicks integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- Sponsorship Deals Table
CREATE TABLE IF NOT EXISTS sponsorship_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  brand_name text NOT NULL,
  deal_type text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  contract_value numeric DEFAULT 0,
  payment_schedule jsonb DEFAULT '[]',
  requirements jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sponsorship_deals ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "Users can manage own monetization channels"
    ON monetization_channels
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY IF NOT EXISTS "Users can read own monetization channels"
    ON monetization_channels
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY IF NOT EXISTS "Users can read own revenue streams"
    ON revenue_streams
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM monetization_channels
        WHERE monetization_channels.id = revenue_streams.channel_id
        AND monetization_channels.user_id = auth.uid()
      )
    );

  CREATE POLICY IF NOT EXISTS "Users can manage own affiliate links"
    ON affiliate_links
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY IF NOT EXISTS "Users can read own affiliate links"
    ON affiliate_links
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY IF NOT EXISTS "Users can manage own sponsorship deals"
    ON sponsorship_deals
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY IF NOT EXISTS "Users can read own sponsorship deals"
    ON sponsorship_deals
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS monetization_channels_user_id_idx ON monetization_channels(user_id);
CREATE INDEX IF NOT EXISTS monetization_channels_platform_idx ON monetization_channels(platform);
CREATE INDEX IF NOT EXISTS revenue_streams_channel_id_idx ON revenue_streams(channel_id);
CREATE INDEX IF NOT EXISTS revenue_streams_content_id_idx ON revenue_streams(content_id);
CREATE INDEX IF NOT EXISTS affiliate_links_user_id_idx ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS affiliate_links_program_idx ON affiliate_links(program);
CREATE INDEX IF NOT EXISTS sponsorship_deals_user_id_idx ON sponsorship_deals(user_id);
CREATE INDEX IF NOT EXISTS sponsorship_deals_status_idx ON sponsorship_deals(status);

-- Create triggers for timestamp management
DO $$ BEGIN
  CREATE OR REPLACE TRIGGER update_monetization_channels_timestamp
    BEFORE UPDATE ON monetization_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

  CREATE OR REPLACE TRIGGER update_affiliate_links_timestamp
    BEFORE UPDATE ON affiliate_links
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

  CREATE OR REPLACE TRIGGER update_sponsorship_deals_timestamp
    BEFORE UPDATE ON sponsorship_deals
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
END $$;