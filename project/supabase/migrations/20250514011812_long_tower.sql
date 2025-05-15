/*
  # Initial Schema Setup

  1. New Tables
    - `trends`
      - `id` (uuid, primary key)
      - `title` (text)
      - `platform` (text)
      - `category` (text)
      - `growth` (numeric)
      - `engagement` (numeric)
      - `revenue` (numeric)
      - `created_at` (timestamp)
      - `status` (text)
    
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `status` (text)
      - `progress` (integer)
      - `duration` (text)
      - `platform` (text)
      - `created_at` (timestamp)
      - `thumbnail_url` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create trends table
CREATE TABLE IF NOT EXISTS trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform text NOT NULL,
  category text NOT NULL,
  growth numeric NOT NULL DEFAULT 0,
  engagement numeric NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active'
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  progress integer NOT NULL DEFAULT 0,
  duration text,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now(),
  thumbnail_url text
);

-- Enable RLS
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read trends"
  ON trends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert trends"
  ON trends
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);