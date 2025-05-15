/*
  # Audience Intelligence System Schema

  1. New Tables
    - audience_demographics: Stores audience demographic data
    - engagement_metrics: Tracks detailed engagement statistics
    - content_performance: Links content to audience growth
    - audience_segments: Defines and tracks audience segments
    - sentiment_analysis: Stores comment sentiment data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Changes
    - Add indexes for performance optimization
    - Add triggers for analytics updates
*/

-- Audience Demographics Table
CREATE TABLE IF NOT EXISTS audience_demographics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES creator_accounts(id),
  age_range text,
  gender text,
  location text,
  interests text[],
  language text,
  device_type text,
  percentage numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audience_demographics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their audience demographics"
  ON audience_demographics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = audience_demographics.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  );

-- Engagement Metrics Table
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_analysis(id),
  account_id uuid REFERENCES creator_accounts(id),
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  watch_time numeric DEFAULT 0,
  retention_rate numeric DEFAULT 0,
  bounce_rate numeric DEFAULT 0,
  follower_gain integer DEFAULT 0,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their engagement metrics"
  ON engagement_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = engagement_metrics.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  );

-- Content Performance Table
CREATE TABLE IF NOT EXISTS content_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_analysis(id),
  account_id uuid REFERENCES creator_accounts(id),
  audience_growth integer DEFAULT 0,
  engagement_score numeric DEFAULT 0,
  retention_score numeric DEFAULT 0,
  virality_score numeric DEFAULT 0,
  ltv_impact numeric DEFAULT 0,
  content_type text,
  performance_tags text[],
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their content performance"
  ON content_performance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = content_performance.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  );

-- Audience Segments Table
CREATE TABLE IF NOT EXISTS audience_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES creator_accounts(id),
  segment_name text NOT NULL,
  segment_criteria jsonb NOT NULL,
  segment_size integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  ltv numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their audience segments"
  ON audience_segments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = audience_segments.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creator_accounts
      WHERE creator_accounts.id = audience_segments.account_id
      AND creator_accounts.user_id = auth.uid()
    )
  );

-- Sentiment Analysis Table
CREATE TABLE IF NOT EXISTS sentiment_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_analysis(id),
  comment_text text NOT NULL,
  sentiment_score numeric DEFAULT 0,
  sentiment_magnitude numeric DEFAULT 0,
  toxicity_score numeric DEFAULT 0,
  language text,
  topics text[],
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sentiment_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sentiment analysis"
  ON sentiment_analysis
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_accounts ca
      JOIN content_analysis ca2 ON ca2.id = sentiment_analysis.content_id
      WHERE ca.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_audience_demographics_account ON audience_demographics(account_id);
CREATE INDEX idx_engagement_metrics_content ON engagement_metrics(content_id);
CREATE INDEX idx_engagement_metrics_account ON engagement_metrics(account_id);
CREATE INDEX idx_content_performance_content ON content_performance(content_id);
CREATE INDEX idx_content_performance_account ON content_performance(account_id);
CREATE INDEX idx_audience_segments_account ON audience_segments(account_id);
CREATE INDEX idx_sentiment_analysis_content ON sentiment_analysis(content_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_audience_segments_timestamp
  BEFORE UPDATE ON audience_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();