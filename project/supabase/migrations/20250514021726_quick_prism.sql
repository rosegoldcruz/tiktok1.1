/*
  # Multi-Account Management Schema

  1. New Tables
    - `creator_accounts`
      - Stores creator account information and platform connections
    - `content_distribution`
      - Manages content distribution across accounts
    - `account_analytics`
      - Tracks account-level performance metrics
    - `posting_schedules`
      - Manages optimal posting times per account
    - `rate_limits`
      - Tracks API rate limits and usage

  2. Security
    - Enable RLS on all tables
    - Add policies for account-level access control
*/

-- Creator Accounts Table
CREATE TABLE IF NOT EXISTS creator_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  platform_name text NOT NULL,
  account_name text NOT NULL,
  niche text NOT NULL,
  audience_size integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  auth_status text DEFAULT 'pending',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE creator_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own creator accounts"
  ON creator_accounts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Content Distribution Table
CREATE TABLE IF NOT EXISTS content_distribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_analysis(id),
  account_id uuid REFERENCES creator_accounts(id),
  status text DEFAULT 'pending',
  scheduled_time timestamptz,
  posted_time timestamptz,
  performance_metrics jsonb DEFAULT '{}',
  variation_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_distribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their content distribution"
  ON content_distribution
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = content_distribution.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = content_distribution.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  );

-- Account Analytics Table
CREATE TABLE IF NOT EXISTS account_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES creator_accounts(id),
  date date NOT NULL,
  followers integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE account_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their account analytics"
  ON account_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = account_analytics.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  );

-- Posting Schedules Table
CREATE TABLE IF NOT EXISTS posting_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES creator_accounts(id),
  day_of_week integer NOT NULL,
  time_of_day time NOT NULL,
  priority integer DEFAULT 1,
  engagement_score numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posting_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their posting schedules"
  ON posting_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = posting_schedules.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = posting_schedules.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  );

-- Rate Limits Table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES creator_accounts(id),
  endpoint text NOT NULL,
  requests_made integer DEFAULT 0,
  requests_limit integer NOT NULL,
  reset_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their rate limits"
  ON rate_limits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = rate_limits.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_creator_accounts_updated_at
  BEFORE UPDATE ON creator_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_distribution_updated_at
  BEFORE UPDATE ON content_distribution
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posting_schedules_updated_at
  BEFORE UPDATE ON posting_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_creator_accounts_user_id ON creator_accounts(user_id);
CREATE INDEX idx_creator_accounts_platform ON creator_accounts(platform_name);
CREATE INDEX idx_content_distribution_account ON content_distribution(account_id);
CREATE INDEX idx_content_distribution_status ON content_distribution(status);
CREATE INDEX idx_account_analytics_account_date ON account_analytics(account_id, date);
CREATE INDEX idx_posting_schedules_account ON posting_schedules(account_id);
CREATE INDEX idx_rate_limits_account ON rate_limits(account_id);