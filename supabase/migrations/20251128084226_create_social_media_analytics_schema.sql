/*
  # IG&FB Analyzer Database Schema
  
  ## Overview
  Complete database schema for Instagram & Facebook Analytics platform with user management,
  social account connections, analytics data, and AI insights.

  ## 1. New Tables
  
  ### `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `social_accounts`
  Connected social media accounts (Instagram & Facebook)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `platform` (text) - 'instagram' or 'facebook'
  - `account_id` (text) - Platform-specific account ID
  - `username` (text) - Account username/handle
  - `display_name` (text) - Account display name
  - `access_token` (text) - Encrypted OAuth access token
  - `refresh_token` (text) - Encrypted OAuth refresh token
  - `token_expires_at` (timestamptz) - Token expiration time
  - `is_connected` (boolean) - Connection status
  - `last_synced_at` (timestamptz) - Last data sync timestamp
  - `created_at` (timestamptz) - Connection creation time
  - `updated_at` (timestamptz) - Last update time

  ### `analytics_snapshots`
  Daily analytics snapshots for social accounts
  - `id` (uuid, primary key)
  - `social_account_id` (uuid, foreign key) - References social_accounts
  - `snapshot_date` (date) - Date of snapshot
  - `followers_count` (integer) - Total followers
  - `following_count` (integer) - Total following
  - `posts_count` (integer) - Total posts
  - `engagement_rate` (numeric) - Overall engagement rate percentage
  - `reach` (integer) - Total reach
  - `impressions` (integer) - Total impressions
  - `profile_views` (integer) - Profile views
  - `created_at` (timestamptz) - Record creation time

  ### `posts`
  Individual posts from connected accounts
  - `id` (uuid, primary key)
  - `social_account_id` (uuid, foreign key) - References social_accounts
  - `platform_post_id` (text) - Platform-specific post ID
  - `post_type` (text) - 'photo', 'video', 'carousel', 'story', 'reel'
  - `caption` (text) - Post caption/text
  - `media_url` (text) - Main media URL
  - `permalink` (text) - Link to post
  - `likes_count` (integer) - Number of likes
  - `comments_count` (integer) - Number of comments
  - `shares_count` (integer) - Number of shares
  - `saves_count` (integer) - Number of saves
  - `reach` (integer) - Post reach
  - `impressions` (integer) - Post impressions
  - `engagement_rate` (numeric) - Post engagement rate
  - `posted_at` (timestamptz) - When post was published
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ### `ai_insights`
  AI-generated insights and recommendations
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `social_account_id` (uuid, foreign key) - References social_accounts (optional)
  - `insight_type` (text) - 'timing', 'content', 'audience', 'growth', 'engagement'
  - `title` (text) - Insight title
  - `description` (text) - Detailed insight description
  - `confidence_score` (integer) - AI confidence (0-100)
  - `priority` (text) - 'low', 'medium', 'high'
  - `is_read` (boolean) - User has viewed insight
  - `created_at` (timestamptz) - Insight generation time
  - `expires_at` (timestamptz) - When insight becomes stale

  ### `reports`
  Generated analytics reports
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `report_type` (text) - 'weekly', 'monthly', 'custom'
  - `title` (text) - Report title
  - `date_from` (date) - Report start date
  - `date_to` (date) - Report end date
  - `data` (jsonb) - Report data and metrics
  - `file_url` (text) - Generated PDF/file URL
  - `created_at` (timestamptz) - Report generation time

  ## 2. Security
  
  ### Row Level Security (RLS)
  - Enable RLS on all tables
  - Users can only access their own data
  - Social accounts restricted to owner
  - Analytics and insights restricted to account owner
  - Service role has full access for background jobs

  ### Policies
  - Separate policies for SELECT, INSERT, UPDATE, DELETE
  - All policies check auth.uid() matches user_id
  - Social accounts check ownership through user_id
  - Analytics check ownership through social_accounts relationship

  ## 3. Indexes
  - User lookups optimized with email index
  - Social account platform and user lookups
  - Analytics snapshots by date and account
  - Posts by account and posted date
  - AI insights by user and type

  ## 4. Notes
  - All timestamps use timestamptz for timezone awareness
  - Sensitive tokens should be encrypted at application layer
  - jsonb used for flexible report data structure
  - Cascading deletes maintain referential integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Social accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('instagram', 'facebook')),
  account_id text NOT NULL,
  username text NOT NULL,
  display_name text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  is_connected boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social accounts"
  ON social_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social accounts"
  ON social_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts"
  ON social_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Analytics snapshots table
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_account_id uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  engagement_rate numeric(5,2) DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  profile_views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(social_account_id, snapshot_date)
);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics snapshots"
  ON analytics_snapshots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = analytics_snapshots.social_account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert analytics snapshots"
  ON analytics_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = analytics_snapshots.social_account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can update analytics snapshots"
  ON analytics_snapshots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = analytics_snapshots.social_account_id
      AND social_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = analytics_snapshots.social_account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_account_id uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform_post_id text NOT NULL,
  post_type text CHECK (post_type IN ('photo', 'video', 'carousel', 'story', 'reel')),
  caption text,
  media_url text,
  permalink text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  saves_count integer DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  engagement_rate numeric(5,2) DEFAULT 0,
  posted_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(social_account_id, platform_post_id)
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = posts.social_account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = posts.social_account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = posts.social_account_id
      AND social_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = posts.social_account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  social_account_id uuid REFERENCES social_accounts(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('timing', 'content', 'audience', 'growth', 'engagement')),
  title text NOT NULL,
  description text NOT NULL,
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert insights"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON ai_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON ai_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'custom')),
  title text NOT NULL,
  date_from date NOT NULL,
  date_to date NOT NULL,
  data jsonb,
  file_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_account_date ON analytics_snapshots(social_account_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_account_posted ON posts(social_account_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON posts(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();