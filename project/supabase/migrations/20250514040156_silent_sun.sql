/*
  # Optimization and Testing Tables

  1. New Tables
    - `optimization_results`: Stores optimization recommendations
    - `ab_test_assignments`: Tracks A/B test variant assignments
    - `ab_test_results`: Stores A/B test results
    - `workflow_rules`: Defines workflow optimization rules
    - `model_metrics`: Tracks model performance metrics
    - `model_alerts`: Stores model performance alerts

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    
  3. Performance
    - Add indexes for commonly queried columns
    - Add trigger for updated_at timestamps
*/

-- Optimization Results Table
CREATE TABLE IF NOT EXISTS optimization_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  recommended_source text NOT NULL,
  confidence numeric NOT NULL,
  expected_revenue numeric NOT NULL,
  reasoning text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE optimization_results ENABLE ROW LEVEL SECURITY;

-- A/B Test Assignments Table
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment text NOT NULL,
  content_id text NOT NULL,
  variant text NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(experiment, content_id)
);

ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- A/B Test Results Table
CREATE TABLE IF NOT EXISTS ab_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment text NOT NULL,
  content_id text NOT NULL,
  variant text NOT NULL,
  metrics jsonb NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

-- Workflow Rules Table
CREATE TABLE IF NOT EXISTS workflow_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  conditions jsonb NOT NULL,
  priority integer NOT NULL,
  reasoning text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;

-- Model Metrics Table
CREATE TABLE IF NOT EXISTS model_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  rmse numeric NOT NULL,
  r2 numeric NOT NULL,
  mean_drift numeric NOT NULL,
  sample_size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE model_metrics ENABLE ROW LEVEL SECURITY;

-- Model Alerts Table
CREATE TABLE IF NOT EXISTS model_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  rmse numeric NOT NULL,
  r2 numeric NOT NULL,
  mean_drift numeric NOT NULL,
  sample_size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE model_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'optimization_results' 
    AND policyname = 'Anyone can view optimization results'
  ) THEN
    CREATE POLICY "Anyone can view optimization results"
      ON optimization_results
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ab_test_assignments' 
    AND policyname = 'Anyone can view AB test assignments'
  ) THEN
    CREATE POLICY "Anyone can view AB test assignments"
      ON ab_test_assignments
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ab_test_results' 
    AND policyname = 'Anyone can view AB test results'
  ) THEN
    CREATE POLICY "Anyone can view AB test results"
      ON ab_test_results
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workflow_rules' 
    AND policyname = 'Anyone can view workflow rules'
  ) THEN
    CREATE POLICY "Anyone can view workflow rules"
      ON workflow_rules
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'model_metrics' 
    AND policyname = 'Anyone can view model metrics'
  ) THEN
    CREATE POLICY "Anyone can view model metrics"
      ON model_metrics
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'model_alerts' 
    AND policyname = 'Anyone can view model alerts'
  ) THEN
    CREATE POLICY "Anyone can view model alerts"
      ON model_alerts
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_optimization_results_content ON optimization_results(content_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_experiment ON ab_test_assignments(experiment, content_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_experiment ON ab_test_results(experiment, variant);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_priority ON workflow_rules(priority);
CREATE INDEX IF NOT EXISTS idx_model_metrics_version ON model_metrics(model_version);
CREATE INDEX IF NOT EXISTS idx_model_alerts_version ON model_alerts(model_version);

-- Create trigger for updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_workflow_rules_timestamp'
  ) THEN
    CREATE TRIGGER update_workflow_rules_timestamp
      BEFORE UPDATE ON workflow_rules
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;