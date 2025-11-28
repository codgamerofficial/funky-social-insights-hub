-- =============================================================================
-- ORBIT MUSIC STREAMING PLATFORM - COMPREHENSIVE DATABASE SCHEMA
-- =============================================================================
-- This migration creates the complete database schema for the Orbit Music
-- Streaming Platform, supporting tracks, artists, albums, playlists, user
-- interactions, recommendations, and analytics.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =============================================================================
-- CORE MUSIC TABLES
-- =============================================================================

-- Artists table (extracted from YouTube data)
CREATE TABLE IF NOT EXISTS artists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    youtube_artist_id TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    banner_url TEXT,
    follower_count INTEGER DEFAULT 0,
    monthly_listeners INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    genres TEXT[],
    country TEXT,
    formed_year INTEGER,
    popularity_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Albums table (grouping of tracks)
CREATE TABLE IF NOT EXISTS albums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    youtube_playlist_id TEXT UNIQUE,
    youtube_album_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    thumbnail_url TEXT,
    banner_url TEXT,
    release_date DATE,
    album_type TEXT CHECK (album_type IN ('album', 'single', 'EP', 'compilation')),
    total_tracks INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- in seconds
    popularity_score DECIMAL(3,2) DEFAULT 0.0,
    explicit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Music tracks table (YouTube-based music content)
CREATE TABLE IF NOT EXISTS tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    youtube_video_id TEXT UNIQUE NOT NULL,
    youtube_playlist_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    duration INTEGER NOT NULL, -- in seconds
    thumbnail_url TEXT,
    banner_url TEXT,
    genre TEXT,
    subgenre TEXT,
    language TEXT,
    release_date DATE,
    view_count BIGINT DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    popularity_score DECIMAL(3,2) DEFAULT 0.0,
    energy_level DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    danceability DECIMAL(3,2) DEFAULT 0.5,
    valence DECIMAL(3,2) DEFAULT 0.5, -- musical positivity
    tempo DECIMAL(6,2) DEFAULT 120.0, -- BPM
    key_signature TEXT, -- e.g., "C major", "A minor"
    time_signature TEXT DEFAULT "4/4",
    explicit BOOLEAN DEFAULT FALSE,
    instrumental BOOLEAN DEFAULT FALSE,
    live_performance BOOLEAN DEFAULT FALSE,
    cover_version BOOLEAN DEFAULT FALSE,
    remix_version BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- USER MUSIC MANAGEMENT
-- =============================================================================

-- User music library (personal collection)
CREATE TABLE IF NOT EXISTS user_libraries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Library',
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE, -- Default library for new users
    is_public BOOLEAN DEFAULT FALSE,
    cover_image_url TEXT,
    total_tracks INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, is_default) -- Only one default library per user
);

-- User playlists
CREATE TABLE IF NOT EXISTS playlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_collaborative BOOLEAN DEFAULT FALSE,
    is_smart BOOLEAN DEFAULT FALSE, -- AI-generated or algorithm-based
    playlist_type TEXT DEFAULT 'manual' CHECK (playlist_type IN ('manual', 'smart', 'discover', 'top_songs', 'recent', 'favorite')),
    total_tracks INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    play_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Playlist tracks (many-to-many relationship)
CREATE TABLE IF NOT EXISTS playlist_tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(playlist_id, track_id),
    UNIQUE(playlist_id, position)
);

-- User favorites (liked songs)
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, track_id)
);

-- =============================================================================
-- LISTENING HISTORY & ANALYTICS
-- =============================================================================

-- User listening history
CREATE TABLE IF NOT EXISTS listening_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    session_id UUID, -- For grouping continuous listening
    listened_at TIMESTAMPTZ DEFAULT now(),
    duration_listened INTEGER NOT NULL, -- in seconds
    completion_percentage DECIMAL(5,2) DEFAULT 0.0, -- 0.00 to 100.00
    skipped BOOLEAN DEFAULT FALSE,
    replay_count INTEGER DEFAULT 1,
    device_type TEXT, -- 'web', 'mobile', 'tablet'
    context_type TEXT, -- 'playlist', 'search', 'recommendation', 'direct'
    play_source TEXT, -- 'youtube', 'local', 'uploaded'
    quality_setting TEXT, -- 'auto', 'low', 'medium', 'high'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User listening statistics
CREATE TABLE IF NOT EXISTS user_listening_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_listens BIGINT DEFAULT 0,
    total_listening_time BIGINT DEFAULT 0, -- in seconds
    unique_tracks_played INTEGER DEFAULT 0,
    favorite_genre TEXT,
    favorite_artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
    favorite_track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    listening_streak_days INTEGER DEFAULT 0,
    most_active_hour INTEGER, -- 0-23
    most_active_day INTEGER, -- 0-6 (Sunday-Saturday)
    average_session_length INTEGER, -- in minutes
    last_activity_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- =============================================================================
-- RECOMMENDATIONS & DISCOVERY
-- =============================================================================

-- Music recommendations for users
CREATE TABLE IF NOT EXISTS music_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('collaborative', 'content_based', 'trending', 'new_release', 'similar_artist', 'mood_based', 'ai_generated')),
    confidence_score DECIMAL(4,2) DEFAULT 0.0, -- 0.00 to 1.00
    algorithm_version TEXT DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    clicked BOOLEAN DEFAULT FALSE,
    liked BOOLEAN DEFAULT FALSE,
    played BOOLEAN DEFAULT FALSE
);

-- User music preferences
CREATE TABLE IF NOT EXISTS user_music_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_genres TEXT[],
    disliked_genres TEXT[],
    preferred_artists TEXT[], -- Artist names or YouTube channel IDs
    preferred_languages TEXT[],
    explicit_content_allowed BOOLEAN DEFAULT TRUE,
    preferred_audio_quality TEXT DEFAULT 'auto' CHECK (preferred_audio_quality IN ('low', 'medium', 'high', 'auto')),
    crossfade_enabled BOOLEAN DEFAULT FALSE,
    crossfade_duration INTEGER DEFAULT 5, -- in seconds
    autoplay_enabled BOOLEAN DEFAULT TRUE,
    repeat_mode TEXT DEFAULT 'off' CHECK (repeat_mode IN ('off', 'one', 'all')),
    shuffle_enabled BOOLEAN DEFAULT FALSE,
    volume_level DECIMAL(3,2) DEFAULT 0.8, -- 0.0 to 1.0
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- =============================================================================
-- SOCIAL FEATURES
-- =============================================================================

-- User follows (for social discovery)
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Playlist follows
CREATE TABLE IF NOT EXISTS playlist_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, playlist_id)
);

-- Music activity feed
CREATE TABLE IF NOT EXISTS music_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('play', 'like', 'playlist_create', 'playlist_follow', 'playlist_share', 'track_add', 'artist_follow')),
    target_type TEXT NOT NULL CHECK (target_type IN ('track', 'playlist', 'artist', 'album')),
    target_id UUID NOT NULL, -- References the appropriate table based on target_type
    metadata JSONB, -- Additional activity data
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- SEARCH & DISCOVERY OPTIMIZATION
-- =============================================================================

-- Full-text search indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artists_name_gin ON artists USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_artists_genres_gin ON artists USING gin (genres);
CREATE INDEX IF NOT EXISTS idx_tracks_title_gin ON tracks USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tracks_artist_gin ON tracks USING gin (genre);
CREATE INDEX IF NOT EXISTS idx_tracks_explicit ON tracks (explicit);
CREATE INDEX IF NOT EXISTS idx_tracks_popularity ON tracks (popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_release_date ON tracks (release_date DESC);

-- User activity indexes
CREATE INDEX IF NOT EXISTS idx_listening_history_user ON listening_history (user_id, listened_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_history_track ON listening_history (track_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists (user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks (playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_music_recommendations_user ON music_recommendations (user_id, created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all user-related tables
ALTER TABLE user_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_listening_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_music_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_activities ENABLE ROW LEVEL SECURITY;

-- User libraries policies
CREATE POLICY "Users can view own libraries" ON user_libraries
FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can manage own libraries" ON user_libraries
FOR ALL USING (auth.uid() = user_id);

-- Playlists policies
CREATE POLICY "Users can view public playlists and own playlists" ON playlists
FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can manage own playlists" ON playlists
FOR ALL USING (auth.uid() = user_id);

-- Playlist tracks policies
CREATE POLICY "Users can view tracks from accessible playlists" ON playlist_tracks
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM playlists 
        WHERE playlists.id = playlist_tracks.playlist_id 
        AND (playlists.user_id = auth.uid() OR playlists.is_public = TRUE)
    )
);

CREATE POLICY "Users can manage tracks in own playlists" ON playlist_tracks
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM playlists 
        WHERE playlists.id = playlist_tracks.playlist_id 
        AND playlists.user_id = auth.uid()
    )
);

-- User favorites policies
CREATE POLICY "Users can manage own favorites" ON user_favorites
FOR ALL USING (auth.uid() = user_id);

-- Listening history policies
CREATE POLICY "Users can view own listening history" ON listening_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listening history" ON listening_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User listening stats policies
CREATE POLICY "Users can view own stats" ON user_listening_stats
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_listening_stats
FOR UPDATE USING (auth.uid() = user_id);

-- Music recommendations policies
CREATE POLICY "Users can view own recommendations" ON music_recommendations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendation feedback" ON music_recommendations
FOR UPDATE USING (auth.uid() = user_id);

-- User music preferences policies
CREATE POLICY "Users can manage own music preferences" ON user_music_preferences
FOR ALL USING (auth.uid() = user_id);

-- User follows policies
CREATE POLICY "Users can view all follows" ON user_follows
FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can manage own follows" ON user_follows
FOR ALL USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Playlist follows policies
CREATE POLICY "Users can view all playlist follows" ON playlist_follows
FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can manage own playlist follows" ON playlist_follows
FOR ALL USING (auth.uid() = user_id);

-- Music activities policies
CREATE POLICY "Users can view public activities and own activities" ON music_activities
FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create own activities" ON music_activities
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_libraries_updated_at BEFORE UPDATE ON user_libraries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_listening_stats_updated_at BEFORE UPDATE ON user_listening_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_music_preferences_updated_at BEFORE UPDATE ON user_music_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update playlist statistics
CREATE OR REPLACE FUNCTION update_playlist_stats()
RETURNS TRIGGER AS $$
DECLARE
    playlist_uuid UUID;
    track_count INTEGER;
    total_duration INTEGER;
BEGIN
    -- Determine which playlist to update
    IF TG_OP = 'DELETE' THEN
        playlist_uuid := OLD.playlist_id;
    ELSE
        playlist_uuid := NEW.playlist_id;
    END IF;
    
    -- Calculate updated statistics
    SELECT 
        COUNT(*) as track_count,
        COALESCE(SUM(tracks.duration), 0) as total_duration
    INTO track_count, total_duration
    FROM playlist_tracks
    JOIN tracks ON tracks.id = playlist_tracks.track_id
    WHERE playlist_tracks.playlist_id = playlist_uuid;
    
    -- Update the playlist
    UPDATE playlists 
    SET 
        total_tracks = track_count,
        total_duration = total_duration,
        updated_at = now()
    WHERE id = playlist_uuid;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Apply playlist stats trigger
CREATE TRIGGER update_playlist_stats_trigger
    AFTER INSERT OR DELETE ON playlist_tracks
    FOR EACH ROW EXECUTE FUNCTION update_playlist_stats();

-- =============================================================================
-- INITIAL DATA SEEDING
-- =============================================================================

-- Insert default user library for existing users
INSERT INTO user_libraries (user_id, name, is_default)
SELECT 
    id,
    'My Library',
    TRUE
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_libraries 
    WHERE user_libraries.user_id = auth.users.id 
    AND user_libraries.is_default = TRUE
);

-- Insert default music preferences for existing users
INSERT INTO user_music_preferences (user_id)
SELECT id
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_music_preferences 
    WHERE user_music_preferences.user_id = auth.users.id
);

-- Insert default listening stats for existing users
INSERT INTO user_listening_stats (user_id)
SELECT id
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_listening_stats 
    WHERE user_listening_stats.user_id = auth.users.id
);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE artists IS 'Music artists extracted from YouTube data with additional metadata';
COMMENT ON TABLE albums IS 'Music albums grouping tracks from the same artist';
COMMENT ON TABLE tracks IS 'Individual music tracks from YouTube with comprehensive metadata';
COMMENT ON TABLE user_libraries IS 'Personal music libraries for organizing tracks';
COMMENT ON TABLE playlists IS 'User-created and system playlists for music organization';
COMMENT ON TABLE playlist_tracks IS 'Many-to-many relationship between playlists and tracks with ordering';
COMMENT ON TABLE user_favorites IS 'User-liked tracks for quick access';
COMMENT ON TABLE listening_history IS 'Complete listening history with analytics data';
COMMENT ON TABLE user_listening_stats IS 'Aggregated listening statistics per user';
COMMENT ON TABLE music_recommendations IS 'AI and algorithm-generated music recommendations';
COMMENT ON TABLE user_music_preferences IS 'User preferences for music discovery and playback';
COMMENT ON TABLE user_follows IS 'Social following relationships between users';
COMMENT ON TABLE playlist_follows IS 'Users following public playlists for updates';
COMMENT ON TABLE music_activities IS 'Public activity feed for social music features';