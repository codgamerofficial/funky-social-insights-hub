-- =====================================================
-- AUTOMATION PLATFORM EXTENSIONS
-- Added for YouTube, Instagram, Facebook automation
-- =====================================================

-- =====================================================
-- VIDEOS TABLE
-- Video content library and metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  file_size BIGINT, -- in bytes
  mime_type TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'published', 'failed')),
  metadata JSONB, -- additional video metadata (resolution, codec, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Users can view their own videos"
  ON videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PLATFORM_CREDENTIALS TABLE
-- OAuth tokens and API credentials for platforms
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram')),
  account_name TEXT,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scope TEXT, -- OAuth scopes granted
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, account_id)
);

-- Enable RLS on platform_credentials
ALTER TABLE platform_credentials ENABLE ROW LEVEL SECURITY;

-- Platform credentials policies
CREATE POLICY "Users can view their own credentials"
  ON platform_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials"
  ON platform_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
  ON platform_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
  ON platform_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PLATFORM_POSTS TABLE
-- Track posts/uploads across platforms
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  credential_id UUID REFERENCES platform_credentials(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram')),
  platform_post_id TEXT, -- ID from the platform (YouTube video ID, etc.)
  platform_url TEXT, -- Direct URL to the post
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'published', 'failed', 'deleted')),
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB, -- platform-specific metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on platform_posts
ALTER TABLE platform_posts ENABLE ROW LEVEL SECURITY;

-- Platform posts policies
CREATE POLICY "Users can view their own posts"
  ON platform_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts"
  ON platform_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON platform_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON platform_posts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CONTENT_TEMPLATES TABLE
-- AI-generated content (titles, descriptions, tags)
-- =====================================================
CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('title', 'description', 'tags', 'thumbnail')),
  content TEXT NOT NULL,
  ai_model TEXT, -- e.g., 'gpt-4', 'gemini-pro'
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  is_selected BOOLEAN DEFAULT false,
  metadata JSONB, -- additional AI generation metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on content_templates
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

-- Content templates policies
CREATE POLICY "Users can view their own templates"
  ON content_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON content_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON content_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON content_templates FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- VIDEO_ANALYTICS TABLE
-- Performance metrics per platform per video
-- =====================================================
CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_post_id UUID NOT NULL REFERENCES platform_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  watch_time INTEGER DEFAULT 0, -- in seconds
  average_view_duration INTEGER DEFAULT 0, -- in seconds
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  audience_retention JSONB, -- retention curve data
  traffic_sources JSONB, -- where views came from
  demographics JSONB, -- age, gender, location data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform_post_id, date)
);

-- Enable RLS on video_analytics
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;

-- Video analytics policies
CREATE POLICY "Users can view their own video analytics"
  ON video_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video analytics"
  ON video_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video analytics"
  ON video_analytics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video analytics"
  ON video_analytics FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- SCHEDULED_JOBS TABLE
-- Background job queue for scheduled posts
-- =====================================================
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  platforms TEXT[] NOT NULL, -- array of platforms to post to
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on scheduled_jobs
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Scheduled jobs policies
CREATE POLICY "Users can view their own scheduled jobs"
  ON scheduled_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled jobs"
  ON scheduled_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled jobs"
  ON scheduled_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled jobs"
  ON scheduled_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- AUTOMATION TRIGGERS
-- =====================================================

-- Trigger for videos updated_at
DROP TRIGGER IF EXISTS set_updated_at_videos ON videos;
CREATE TRIGGER set_updated_at_videos
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for platform_credentials updated_at
DROP TRIGGER IF EXISTS set_updated_at_credentials ON platform_credentials;
CREATE TRIGGER set_updated_at_credentials
  BEFORE UPDATE ON platform_credentials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for platform_posts updated_at
DROP TRIGGER IF EXISTS set_updated_at_posts ON platform_posts;
CREATE TRIGGER set_updated_at_posts
  BEFORE UPDATE ON platform_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for scheduled_jobs updated_at
DROP TRIGGER IF EXISTS set_updated_at_jobs ON scheduled_jobs;
CREATE TRIGGER set_updated_at_jobs
  BEFORE UPDATE ON scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- AUTOMATION INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_credentials_user_id ON platform_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_credentials_platform ON platform_credentials(platform);
CREATE INDEX IF NOT EXISTS idx_platform_credentials_active ON platform_credentials(is_active);

CREATE INDEX IF NOT EXISTS idx_platform_posts_user_id ON platform_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_posts_video_id ON platform_posts(video_id);
CREATE INDEX IF NOT EXISTS idx_platform_posts_platform ON platform_posts(platform);
CREATE INDEX IF NOT EXISTS idx_platform_posts_status ON platform_posts(status);
CREATE INDEX IF NOT EXISTS idx_platform_posts_scheduled ON platform_posts(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_content_templates_video_id ON content_templates(video_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_user_id ON content_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_type ON content_templates(type);

CREATE INDEX IF NOT EXISTS idx_video_analytics_post_id ON video_analytics(platform_post_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_user_id ON video_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_date ON video_analytics(date DESC);

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_user_id ON scheduled_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status ON scheduled_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_scheduled_for ON scheduled_jobs(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_video_id ON scheduled_jobs(video_id);
