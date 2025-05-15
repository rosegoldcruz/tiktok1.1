/*
  # Enterprise Client Portal Schema

  1. New Tables
    - `enterprise_clients`: Stores client organization details
    - `enterprise_users`: Manages client team members
    - `content_requests`: Handles content production workflow
    - `content_approvals`: Tracks approval process
    - `client_analytics`: Stores client-specific metrics
    - `brand_voices`: Manages client voice models

  2. Security
    - Enable RLS on all tables
    - Add policies for client-specific access
    - Implement role-based permissions

  3. Changes
    - Add enterprise-specific fields to existing tables
    - Create necessary indexes for performance
*/

-- Enterprise Clients Table
CREATE TABLE IF NOT EXISTS enterprise_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL,
  subscription_tier text NOT NULL,
  status text DEFAULT 'active',
  brand_settings jsonb DEFAULT '{}',
  billing_details jsonb DEFAULT '{}',
  api_key text,
  webhook_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE enterprise_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own data"
  ON enterprise_clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE enterprise_users.client_id = enterprise_clients.id
      AND enterprise_users.user_id = auth.uid()
    )
  );

-- Enterprise Users Table
CREATE TABLE IF NOT EXISTS enterprise_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  client_id uuid REFERENCES enterprise_clients(id),
  role text NOT NULL,
  permissions jsonb DEFAULT '[]',
  settings jsonb DEFAULT '{}',
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE enterprise_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enterprise data"
  ON enterprise_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Content Requests Table
CREATE TABLE IF NOT EXISTS content_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES enterprise_clients(id),
  requester_id uuid REFERENCES enterprise_users(id),
  title text NOT NULL,
  description text,
  content_type text NOT NULL,
  requirements jsonb NOT NULL,
  deadline timestamptz,
  priority text DEFAULT 'normal',
  status text DEFAULT 'draft',
  assigned_to uuid REFERENCES enterprise_users(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage client content requests"
  ON content_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE enterprise_users.client_id = content_requests.client_id
      AND enterprise_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE enterprise_users.client_id = content_requests.client_id
      AND enterprise_users.user_id = auth.uid()
    )
  );

-- Content Approvals Table
CREATE TABLE IF NOT EXISTS content_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES content_requests(id),
  reviewer_id uuid REFERENCES enterprise_users(id),
  status text DEFAULT 'pending',
  feedback text,
  revision_number integer DEFAULT 1,
  approved_version jsonb,
  review_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage client content approvals"
  ON content_approvals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE enterprise_users.id = content_approvals.reviewer_id
      AND enterprise_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE enterprise_users.id = content_approvals.reviewer_id
      AND enterprise_users.user_id = auth.uid()
    )
  );

-- Client Analytics Table
CREATE TABLE IF NOT EXISTS client_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES enterprise_clients(id),
  date date NOT NULL,
  content_count integer DEFAULT 0,
  approval_rate numeric DEFAULT 0,
  average_turnaround numeric DEFAULT 0,
  engagement_metrics jsonb DEFAULT '{}',
  revenue_metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view client analytics"
  ON client_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE enterprise_users.client_id = client_analytics.client_id
      AND enterprise_users.user_id = auth.uid()
    )
  );

-- Brand Voices Table
CREATE TABLE IF NOT EXISTS brand_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES enterprise_clients(id),
  name text NOT NULL,
  description text,
  parameters jsonb NOT NULL,
  training_data jsonb DEFAULT '[]',
  status text DEFAULT 'training',
  model_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage client brand voices"
  ON brand_voices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE enterprise_users.client_id = brand_voices.client_id
      AND enterprise_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enterprise_users
      WHERE enterprise_users.client_id = brand_voices.client_id
      AND enterprise_users.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_enterprise_users_client ON enterprise_users(client_id);
CREATE INDEX idx_content_requests_client ON content_requests(client_id);
CREATE INDEX idx_content_requests_status ON content_requests(status);
CREATE INDEX idx_content_approvals_request ON content_approvals(request_id);
CREATE INDEX idx_client_analytics_client_date ON client_analytics(client_id, date);
CREATE INDEX idx_brand_voices_client ON brand_voices(client_id);

-- Create triggers for updated_at
CREATE TRIGGER update_enterprise_clients_timestamp
  BEFORE UPDATE ON enterprise_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_users_timestamp
  BEFORE UPDATE ON enterprise_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_requests_timestamp
  BEFORE UPDATE ON content_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_approvals_timestamp
  BEFORE UPDATE ON content_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_voices_timestamp
  BEFORE UPDATE ON brand_voices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();