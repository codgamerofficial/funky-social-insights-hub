-- Music Streaming Platform Database Schema
-- Created: 2025-11-28
-- Purpose: Complete music streaming platform database structure

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create music_tracks table
CREATE TABLE music_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_id VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    duration INTEGER, -- in seconds
    thumbnail_url TEXT,
    preview_url TEXT, -- YouTube video preview URL
    release_date DATE,
    genre TEXT,
    language TEXT,
    popularity INTEGER DEFAULT 0,
    is_explicit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlists table
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_collaborative BOOLEAN DEFAULT FALSE,
    track_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_tracks junction table
CREATE TABLE playlist_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, position)
);

-- Create user_favorites table
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- Create user_follows table
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Create listening_history table
CREATE TABLE listening_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    position_in_playlist INTEGER,
    listened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_listened INTEGER, -- in seconds
    completion_percentage DECIMAL(5,2) -- 0.00 to 100.00
);

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    country TEXT,
    preferred_language TEXT DEFAULT 'en',
    date_of_birth DATE,
    is_artist BOOLEAN DEFAULT FALSE,
    artist_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create music_analytics table
CREATE TABLE music_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
    total_plays INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    unique_listeners INTEGER DEFAULT 0,
    average_completion_rate DECIMAL(5,2) DEFAULT 0.00,
    last_played_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(track_id)
);

-- Create music_recommendations table
CREATE TABLE music_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL, -- 'based_on_listening', 'trending', 'similar_users'
    confidence_score DECIMAL(5,2), -- 0.00 to 100.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shown_at TIMESTAMP WITH TIME ZONE,
    clicked BOOLEAN DEFAULT FALSE,
    liked BOOLEAN DEFAULT FALSE
);

-- Create search_history table
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_type TEXT DEFAULT 'all', -- 'tracks', 'artists', 'playlists', 'all'
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create smart_playlists table
CREATE TABLE smart_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rules JSONB NOT NULL, -- JSON rules for automatic playlist generation
    last_generated_at TIMESTAMP WITH TIME ZONE,
    auto_update BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_music_tracks_youtube_id ON music_tracks(youtube_id);
CREATE INDEX idx_music_tracks_artist ON music_tracks(artist);
CREATE INDEX idx_music_tracks_title ON music_tracks(title);
CREATE INDEX idx_music_tracks_genre ON music_tracks(genre);
CREATE INDEX idx_music_tracks_popularity ON music_tracks(popularity DESC);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_public ON playlists(is_public);
CREATE INDEX idx_playlists_created ON playlists(created_at DESC);

CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX idx_playlist_tracks_position ON playlist_tracks(playlist_id, position);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_track_id ON user_favorites(track_id);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_track_id ON listening_history(track_id);
CREATE INDEX idx_listening_history_date ON listening_history(listened_at DESC);

CREATE INDEX idx_music_analytics_plays ON music_analytics(total_plays DESC);
CREATE INDEX idx_music_analytics_likes ON music_analytics(total_likes DESC);

CREATE INDEX idx_recommendations_user_id ON music_recommendations(user_id);
CREATE INDEX idx_recommendations_type ON music_recommendations(recommendation_type);

CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_query ON search_history USING gin(to_tsvector('english', query));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_music_tracks_updated_at BEFORE UPDATE ON music_tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_analytics_updated_at BEFORE UPDATE ON music_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_playlists_updated_at BEFORE UPDATE ON smart_playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_playlists ENABLE ROW LEVEL SECURITY;

-- Music tracks are publicly readable
CREATE POLICY "Music tracks are viewable by everyone" ON music_tracks
    FOR SELECT USING (true);

-- Playlists policies
CREATE POLICY "Users can view their own playlists" ON playlists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public playlists are viewable by everyone" ON playlists
    FOR SELECT USING (is_public = true);

-- Playlist tracks policies
CREATE POLICY "Users can manage tracks in their playlists" ON playlist_tracks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view tracks in public playlists" ON playlist_tracks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.is_public = true
        )
    );

-- User favorites policies
CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- User follows policies
CREATE POLICY "Users can view their own follows" ON user_follows
    FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow others" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Listening history policies
CREATE POLICY "Users can view their own listening history" ON listening_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their listening history" ON listening_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

-- Music analytics policies
CREATE POLICY "Music analytics are publicly readable" ON music_analytics
    FOR SELECT USING (true);

-- Recommendations policies
CREATE POLICY "Users can view their own recommendations" ON music_recommendations
    FOR SELECT USING (auth.uid() = user_id);

-- Search history policies
CREATE POLICY "Users can manage their own search history" ON search_history
    FOR ALL USING (auth.uid() = user_id);

-- Smart playlists policies
CREATE POLICY "Users can manage their own smart playlists" ON smart_playlists
    FOR ALL USING (auth.uid() = user_id);

-- Insert some sample data for testing
INSERT INTO music_tracks (youtube_id, title, artist, album, duration, thumbnail_url, genre, popularity) VALUES
('dQw4w9WgXcQ', 'Never Gonna Give You Up', 'Rick Astley', 'Whenever You Need Somebody', 213, 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', 'Pop', 95),
('kJQP7kiw5Fk', 'Despacito', 'Luis Fonsi', 'Vida', 269, 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg', 'Latin Pop', 98),
('fJ9rUzIMcZQ', 'Bohemian Rhapsody', 'Queen', 'A Night at the Opera', 355, 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg', 'Rock', 92),
('3JZ_D3ELwOQ', 'See You Again', 'Wiz Khalifa', 'Furious 7', 229, 'https://img.youtube.com/vi/3JZ_D3ELwOQ/mqdefault.jpg', 'Hip Hop', 97),
('hTWKbfoikeg', 'Smells Like Teen Spirit', 'Nirvana', 'Nevermind', 301, 'https://img.youtube.com/vi/hTWKbfoikeg/mqdefault.jpg', 'Grunge', 89);

-- Create a function to automatically update playlist track count and duration
CREATE OR REPLACE FUNCTION update_playlist_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE playlists 
    SET 
        track_count = (
            SELECT COUNT(*) 
            FROM playlist_tracks 
            WHERE playlist_id = COALESCE(NEW.playlist_id, OLD.playlist_id)
        ),
        total_duration = (
            SELECT COALESCE(SUM(mt.duration), 0)
            FROM playlist_tracks pt
            JOIN music_tracks mt ON pt.track_id = mt.id
            WHERE pt.playlist_id = COALESCE(NEW.playlist_id, OLD.playlist_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.playlist_id, OLD.playlist_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for playlist stats
CREATE TRIGGER update_playlist_stats_insert AFTER INSERT ON playlist_tracks
    FOR EACH ROW EXECUTE FUNCTION update_playlist_stats();

CREATE TRIGGER update_playlist_stats_delete AFTER DELETE ON playlist_tracks
    FOR EACH ROW EXECUTE FUNCTION update_playlist_stats();

-- Create a function to track listening analytics
CREATE OR REPLACE FUNCTION track_listening_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO music_analytics (track_id, total_plays, last_played_at)
    VALUES (NEW.track_id, 1, NOW())
    ON CONFLICT (track_id) 
    DO UPDATE SET 
        total_plays = music_analytics.total_plays + 1,
        last_played_at = NOW(),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for analytics
CREATE TRIGGER track_listening_analytics_trigger AFTER INSERT ON listening_history
    FOR EACH ROW EXECUTE FUNCTION track_listening_analytics();