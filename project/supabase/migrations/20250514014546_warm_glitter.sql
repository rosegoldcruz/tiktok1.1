/*
  # Add monetization system tables

  1. New Tables
    - `monetization_logs`
      - Tracks content performance and revenue data
      - Stores historical data for model training
    - `content_variants`
      - Stores generated content variations
      - Links to original content and performance metrics
    - `scaling_strategies`
      - Stores recommended distribution strategies
      - Includes platform-specific optimizations

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create monetization_logs table
CREATE TABLE IF NOT EXISTS monetization_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_analysis(id),
  views integer DEFAULT 0,
  watch_time numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content_variants table
CREATE TABLE IF NOT EXISTS content_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_analysis(id),
  title text NOT NULL,
  script text NOT NULL,
  style text NOT NULL,
  hook text NOT NULL,
  hashtags text[] DEFAULT '{}',
  format text NOT NULL,
  confidence_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scaling_strategies table
CREATE TABLE IF NOT EXISTS scaling_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_analysis(id),
  recommended_platforms text[] DEFAULT '{}',
  optimal_times text[] DEFAULT '{}',
  hashtag_groups jsonb DEFAULT '[]',
  variant_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE monetization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE scaling_strategies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read monetization logs"
  ON monetization_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert monetization logs"
  ON monetization_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read content variants"
  ON content_variants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert content variants"
  ON content_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read scaling strategies"
  ON scaling_strategies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert scaling strategies"
  ON scaling_strategies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_monetization_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_monetization_logs_timestamp
  BEFORE UPDATE ON monetization_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_monetization_timestamp();

CREATE TRIGGER update_content_variants_timestamp
  BEFORE UPDATE ON content_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_monetization_timestamp();

CREATE TRIGGER update_scaling_strategies_timestamp
  BEFORE UPDATE ON scaling_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_monetization_timestamp();