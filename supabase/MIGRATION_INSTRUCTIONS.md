# How to Run Fixed Migrations in Supabase

## The Error You're Seeing
```
Error loading platform connections: Could not find the table 'public.platform_connections' in the schema cache
```

This error occurs because the migrations haven't been executed in your Supabase project yet.

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to "SQL Editor" in the left sidebar

### 2. Run Each Migration in Order
Execute these SQL files one by one in the **exact order**:

#### Migration 1: Instagram & Facebook Analytics
```sql
-- Copy and paste the entire content of:
-- supabase/migrations/20251128084226_create_social_media_analytics_schema.sql
```
Click "Run" and wait for success message.

#### Migration 2: Social Media Connection
```sql
-- Copy and paste the entire content of:
-- supabase/migrations/20251128124400_create_social_media_tables.sql
```
Click "Run" and wait for success message.

#### Migration 3: Music Streaming
```sql
-- Copy and paste the entire content of:
-- supabase/migrations/20251128130600_create_music_streaming_schema.sql
```
Click "Run" and wait for success message.

#### Migration 4: Scheduled Posts
```sql
-- Copy and paste the entire content of:
-- supabase/migrations/20251128140000_create_scheduled_posts_table.sql
```
Click "Run" and wait for success message.

### 3. Verify the Tables Were Created
Run this query to check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'platform_connections', 'video_analytics', 'music_tracks', 'scheduled_posts'
)
ORDER BY table_name;
```

### 4. Test the Schema
Run the test script to validate everything:
```sql
-- Copy and paste the entire content of:
-- supabase/test_schemas.sql
```

## Important Notes

1. **Execute in Order**: Run migrations in the exact order listed above
2. **Wait for Success**: Each migration must complete successfully before running the next
3. **Check for Errors**: Look for any red error messages in Supabase SQL Editor
4. **Schema Cache**: After running migrations, Supabase will automatically update the schema cache
5. **Restart App**: Restart your development server after running all migrations

## If You Still Get Errors

1. **Clear Browser Cache**: Refresh your Supabase dashboard
2. **Check Migration History**: Go to "Database" > "Migrations" to see migration history
3. **Review Logs**: Check "Logs" section in Supabase for any backend errors
4. **Database Permissions**: Ensure your user has permission to create tables

## Expected Tables After Successful Migration
- `profiles`
- `social_accounts` 
- `analytics_snapshots`
- `posts`
- `ai_insights`
- `reports`
- `platform_connections`
- `video_analytics`
- `account_analytics`
- `scheduled_posts`
- `music_tracks`
- `playlists`
- `playlist_tracks`
- `user_favorites`
- And many more...

Your application should now work without the "table not found" error.