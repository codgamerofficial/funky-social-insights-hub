-- Create tables for social media platform connections and analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table to store platform connections (OAuth tokens, etc.)
CREATE TABLE IF NOT EXISTS platform_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    account_id TEXT,
    account_name TEXT,
    account_username TEXT,
    account_avatar TEXT,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, platform)
);

-- Table to store video/content analytics data
CREATE TABLE IF NOT EXISTS video_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram')),
    video_id TEXT NOT NULL,
    video_title TEXT,
    video_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    -- Core metrics
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    -- Time-based metrics
    watch_time_seconds INTEGER DEFAULT 0,
    average_view_duration INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    -- Additional metrics
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    -- Timestamps
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table to store overall channel/page analytics
CREATE TABLE IF NOT EXISTS account_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram')),
    -- Account-level metrics
    followers INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    total_posts INTEGER DEFAULT 0,
    average_views_per_video DECIMAL(10,2) DEFAULT 0,
    average_engagement_rate DECIMAL(5,2) DEFAULT 0,
    -- Timestamps
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, platform, date_recorded)
);

-- Table to store scheduled posts for cross-platform publishing
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram')),
    post_id TEXT, -- ID from the social platform after posting
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posting', 'posted', 'failed')),
    content TEXT NOT NULL,
    media_urls TEXT[], -- Array of media file URLs
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_platform_connections_user_id ON platform_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_platform ON platform_connections(platform);
CREATE INDEX IF NOT EXISTS idx_video_analytics_user_id ON video_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_platform ON video_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(platform, video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_date ON video_analytics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_account_analytics_user_id ON account_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_account_analytics_platform ON account_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_account_analytics_date ON account_analytics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_platform_connections_updated_at 
  BEFORE UPDATE ON platform_connections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_analytics_updated_at 
  BEFORE UPDATE ON video_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_analytics_updated_at 
  BEFORE UPDATE ON account_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at 
  BEFORE UPDATE ON scheduled_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own platform connections" ON platform_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own platform connections" ON platform_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own platform connections" ON platform_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own platform connections" ON platform_connections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own video analytics" ON video_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own video analytics" ON video_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own video analytics" ON video_analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own video analytics" ON video_analytics FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own account analytics" ON account_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own account analytics" ON account_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own account analytics" ON account_analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own account analytics" ON account_analytics FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own scheduled posts" ON scheduled_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scheduled posts" ON scheduled_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scheduled posts" ON scheduled_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scheduled posts" ON scheduled_posts FOR DELETE USING (auth.uid() = user_id);