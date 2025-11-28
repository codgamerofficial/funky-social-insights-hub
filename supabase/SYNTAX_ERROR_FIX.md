# SYNTAX ERROR FIX: Use Corrected Migration File

## The Error You Got
```
Error: Failed to run sql query: ERROR: 42601: syntax error at or near "$" LINE 108
```

**This was caused by a syntax error in the function delimiter.**

## The Fix

**DO NOT USE** the original file:
`supabase/migrations/20251128124400_create_social_media_tables.sql`

**INSTEAD USE** this corrected file:
`supabase/migrations/20251128124400_create_social_media_tables_FIXED.sql`

## Updated Migration Order

**Run these 4 files in Supabase SQL Editor:**

1. ✅ **Use original**: `20251128084226_create_social_media_analytics_schema.sql`
2. ⚠️ **Use FIXED**: `20251128124400_create_social_media_tables_FIXED.sql`  
3. ✅ **Use original**: `20251128130600_create_music_streaming_schema.sql`
4. ✅ **Use original**: `20251128140000_create_scheduled_posts_table.sql`

## What Was Fixed

The syntax error was in the trigger function delimiter:
- **Wrong**: `RETURNS TRIGGER AS $`
- **Correct**: `RETURNS TRIGGER AS $$`

## Files You Need

Open these files and copy their contents:

1. ✅ `supabase/migrations/20251128084226_create_social_media_analytics_schema.sql`
2. ⚠️ **`supabase/migrations/20251128124400_create_social_media_tables_FIXED.sql`**
3. ✅ `supabase/migrations/20251128130600_create_music_streaming_schema.sql`
4. ✅ `supabase/migrations/20251128140000_create_scheduled_posts_table.sql`

## Step-by-Step Instructions

1. Open Supabase Dashboard → SQL Editor
2. **First**: Run the social media analytics schema migration
3. **Second**: Run the **FIXED** social media tables migration
4. **Third**: Run the music streaming schema migration  
5. **Fourth**: Run the scheduled posts migration
6. Verify with: `SELECT table_name FROM information_schema.tables WHERE table_name = 'platform_connections';`
7. Restart your app: `npm run dev`

This corrected file will run without syntax errors and create all the required database tables.