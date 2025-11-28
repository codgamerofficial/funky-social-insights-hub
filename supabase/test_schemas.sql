-- Test script to validate all schemas work correctly
-- This script should run without errors in Supabase SQL editor

-- Test 1: Check if all tables exist and basic structure is correct

-- Test social media analytics tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN (
    'profiles',
    'social_accounts', 
    'analytics_snapshots',
    'posts',
    'ai_insights',
    'reports'
)
ORDER BY table_name, ordinal_position;

-- Test social media connection tables  
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN (
    'platform_connections',
    'video_analytics',
    'account_analytics',
    'scheduled_posts'
)
ORDER BY table_name, ordinal_position;

-- Test music streaming tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN (
    'music_tracks',
    'playlists',
    'playlist_tracks',
    'user_favorites',
    'user_follows',
    'listening_history',
    'user_profiles',
    'music_analytics',
    'music_recommendations',
    'search_history',
    'smart_playlists'
)
ORDER BY table_name, ordinal_position;

-- Test 2: Check if UUID extension is enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'uuid-ossp';

-- Test 3: Check if pgcrypto extension is enabled (for gen_random_uuid compatibility)
SELECT extname, extversion FROM pg_extension WHERE extname = 'pgcrypto';

-- Test 4: Test UUID generation functions
SELECT 
    uuid_generate_v4() as test_uuid_ossp,
    gen_random_uuid() as test_uuid_pgcrypto;

-- Test 5: Check RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 'social_accounts', 'analytics_snapshots', 'posts', 'ai_insights', 'reports',
    'platform_connections', 'video_analytics', 'account_analytics', 'scheduled_posts',
    'music_tracks', 'playlists', 'playlist_tracks', 'user_favorites', 'user_follows',
    'listening_history', 'user_profiles', 'music_analytics', 'music_recommendations',
    'search_history', 'smart_playlists'
)
ORDER BY tablename;

-- Test 6: Check if functions exist
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition IS NOT NULL as has_definition
FROM information_schema.routines 
WHERE routine_name IN (
    'update_updated_at_column',
    'update_playlist_stats',
    'track_listening_analytics'
)
AND routine_schema = 'public'
ORDER BY routine_name;

-- Test 7: Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;