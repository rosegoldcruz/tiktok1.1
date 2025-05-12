/*
  # Create subscription management tables

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `tier` (text)
      - `status` (text)
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `cancel_at_period_end` (boolean)
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `usage_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `subscription_id` (uuid, references subscriptions)
      - `feature` (text)
      - `count` (integer)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  tier text NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subscription_id uuid REFERENCES subscriptions NOT NULL,
  feature text NOT NULL,
  count integer DEFAULT 1,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own usage logs"
  ON usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update subscription updated_at
CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();