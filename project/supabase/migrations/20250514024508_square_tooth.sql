/*
  # Human-AI Collaboration Framework Schema

  1. New Tables
    - `expert_profiles`: Stores subject matter expert information and credentials
    - `knowledge_base`: Repository for expert domain knowledge
    - `content_reviews`: Human feedback and quality assessments
    - `learning_insights`: System improvements based on human feedback
    - `collaboration_sessions`: Records of human-AI content creation sessions

  2. Security
    - Enable RLS on all tables
    - Add policies for expert and reviewer access
    - Implement role-based content access

  3. Changes
    - Add indexes for performance optimization
    - Create triggers for timestamp management
*/

-- Expert Profiles Table
CREATE TABLE IF NOT EXISTS expert_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  expertise_areas text[] NOT NULL,
  credentials jsonb NOT NULL,
  verification_status text DEFAULT 'pending',
  rating numeric DEFAULT 0,
  contribution_count integer DEFAULT 0,
  availability_hours jsonb DEFAULT '{}',
  compensation_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

-- Knowledge Base Table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid REFERENCES expert_profiles(id),
  topic text NOT NULL,
  content jsonb NOT NULL,
  citations text[],
  verification_level text DEFAULT 'unverified',
  usage_count integer DEFAULT 0,
  effectiveness_score numeric DEFAULT 0,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Content Reviews Table
CREATE TABLE IF NOT EXISTS content_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_analysis(id),
  reviewer_id uuid REFERENCES auth.users(id),
  quality_score numeric NOT NULL,
  accuracy_score numeric NOT NULL,
  engagement_prediction numeric NOT NULL,
  improvement_suggestions text[],
  expert_annotations jsonb DEFAULT '{}',
  review_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;

-- Learning Insights Table
CREATE TABLE IF NOT EXISTS learning_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  insight_type text NOT NULL,
  insight_data jsonb NOT NULL,
  confidence_score numeric DEFAULT 0,
  implementation_status text DEFAULT 'pending',
  validation_metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;

-- Collaboration Sessions Table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_analysis(id),
  expert_id uuid REFERENCES expert_profiles(id),
  session_type text NOT NULL,
  expert_input jsonb NOT NULL,
  ai_suggestions jsonb NOT NULL,
  final_decisions jsonb NOT NULL,
  performance_metrics jsonb DEFAULT '{}',
  session_duration interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Experts can manage their own profiles"
  ON expert_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Knowledge base entries viewable by all authenticated users"
  ON knowledge_base
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Experts can manage their knowledge base entries"
  ON knowledge_base
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expert_profiles
      WHERE expert_profiles.id = knowledge_base.expert_id
      AND expert_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expert_profiles
      WHERE expert_profiles.id = knowledge_base.expert_id
      AND expert_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Reviewers can create and manage reviews"
  ON content_reviews
  FOR ALL
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Learning insights viewable by all authenticated users"
  ON learning_insights
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Experts can manage their collaboration sessions"
  ON collaboration_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expert_profiles
      WHERE expert_profiles.id = collaboration_sessions.expert_id
      AND expert_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expert_profiles
      WHERE expert_profiles.id = collaboration_sessions.expert_id
      AND expert_profiles.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_expert_profiles_expertise ON expert_profiles USING gin (expertise_areas);
CREATE INDEX idx_knowledge_base_topic ON knowledge_base (topic);
CREATE INDEX idx_knowledge_base_expert ON knowledge_base (expert_id);
CREATE INDEX idx_content_reviews_content ON content_reviews (content_id);
CREATE INDEX idx_content_reviews_reviewer ON content_reviews (reviewer_id);
CREATE INDEX idx_learning_insights_source ON learning_insights (source_type, source_id);
CREATE INDEX idx_collaboration_sessions_expert ON collaboration_sessions (expert_id);
CREATE INDEX idx_collaboration_sessions_content ON collaboration_sessions (content_id);

-- Create triggers for updated_at
CREATE TRIGGER update_expert_profiles_timestamp
  BEFORE UPDATE ON expert_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_timestamp
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_reviews_timestamp
  BEFORE UPDATE ON content_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_insights_timestamp
  BEFORE UPDATE ON learning_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_timestamp
  BEFORE UPDATE ON collaboration_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();