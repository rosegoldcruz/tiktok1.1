/*
  # Add Content Analysis Tables

  1. New Tables
    - `content_analysis`
      - `id` (uuid, primary key)
      - `content_id` (text)
      - `variants` (jsonb)
      - `estimates` (jsonb)
      - `strategy` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS content_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  variants jsonb NOT NULL,
  estimates jsonb NOT NULL,
  strategy jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read content analysis"
  ON content_analysis
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert content analysis"
  ON content_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_content_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_analysis_timestamp
  BEFORE UPDATE ON content_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_content_analysis_timestamp();