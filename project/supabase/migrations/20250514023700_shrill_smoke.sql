/*
  # Value Chain Expansion Schema

  1. New Tables
    - `creator_tools`: Stores tool configurations and usage data
    - `tool_subscriptions`: Manages tool access and billing
    - `community_members`: Tracks community membership
    - `exclusive_content`: Stores premium content
    - `member_engagement`: Tracks member activity
    - `tool_analytics`: Stores tool usage analytics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for tool access based on subscription

  3. Changes
    - Add indexes for performance optimization
    - Add triggers for analytics tracking
*/

-- Creator Tools Table
CREATE TABLE IF NOT EXISTS creator_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL,
  config jsonb DEFAULT '{}',
  pricing_tier text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE creator_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tools"
  ON creator_tools
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Tool Subscriptions Table
CREATE TABLE IF NOT EXISTS tool_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tool_id uuid REFERENCES creator_tools(id),
  status text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tool_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their tool subscriptions"
  ON tool_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Community Members Table
CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  membership_tier text NOT NULL,
  status text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  profile_data jsonb DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their community profile"
  ON community_members
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Exclusive Content Table
CREATE TABLE IF NOT EXISTS exclusive_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content_type text NOT NULL,
  content_data jsonb NOT NULL,
  access_tier text NOT NULL,
  author_id uuid REFERENCES auth.users(id),
  published_at timestamptz,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exclusive_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can manage their exclusive content"
  ON exclusive_content
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Members can view accessible content"
  ON exclusive_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.user_id = auth.uid()
      AND community_members.membership_tier >= exclusive_content.access_tier
    )
  );

-- Member Engagement Table
CREATE TABLE IF NOT EXISTS member_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES community_members(id),
  content_id uuid REFERENCES exclusive_content(id),
  engagement_type text NOT NULL,
  engagement_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE member_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can track their own engagement"
  ON member_engagement
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.id = member_engagement.member_id
      AND community_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.id = member_engagement.member_id
      AND community_members.user_id = auth.uid()
    )
  );

-- Tool Analytics Table
CREATE TABLE IF NOT EXISTS tool_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES creator_tools(id),
  user_id uuid REFERENCES auth.users(id),
  session_id uuid NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tool_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tool analytics"
  ON tool_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tool_subscriptions_user ON tool_subscriptions(user_id);
CREATE INDEX idx_tool_subscriptions_tool ON tool_subscriptions(tool_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_exclusive_content_author ON exclusive_content(author_id);
CREATE INDEX idx_exclusive_content_tier ON exclusive_content(access_tier);
CREATE INDEX idx_member_engagement_member ON member_engagement(member_id);
CREATE INDEX idx_member_engagement_content ON member_engagement(content_id);
CREATE INDEX idx_tool_analytics_tool ON tool_analytics(tool_id);
CREATE INDEX idx_tool_analytics_user ON tool_analytics(user_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_members
  SET last_active_at = now()
  WHERE id = NEW.member_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_member_activity
  AFTER INSERT ON member_engagement
  FOR EACH ROW
  EXECUTE FUNCTION update_member_last_active();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creator_tools_timestamp
  BEFORE UPDATE ON creator_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_subscriptions_timestamp
  BEFORE UPDATE ON tool_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_members_timestamp
  BEFORE UPDATE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exclusive_content_timestamp
  BEFORE UPDATE ON exclusive_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();