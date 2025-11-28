# IMMEDIATE FIX REQUIRED: Run Migrations in Supabase

## The Error
```
Error loading platform connections: Could not find the table 'public.platform_connections' in the schema cache
```

**This means: The database tables don't exist yet.**

## Solution: Execute SQL Migrations in Supabase

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar

### Step 2: Execute These 4 SQL Files in Order

**Run each one separately by copying and pasting:**

#### Migration 1: Instagram & Facebook Analytics
```sql
-- Copy the entire content of this file and paste it:
-- supabase/migrations/20251128084226_create_social_media_analytics_schema.sql
```

Click "Run" and wait for success.

#### Migration 2: Social Media Connection Tables  
```sql
-- Copy the entire content of this file and paste it:
-- supabase/migrations/20251128124400_create_social_media_tables.sql
```

Click "Run" and wait for success.

#### Migration 3: Music Streaming
```sql
-- Copy the entire content of this file and paste it:
-- supabase/migrations/20251128130600_create_music_streaming_schema.sql
```

Click "Run" and wait for success.

#### Migration 4: Scheduled Posts
```sql
-- Copy the entire content of this file and paste it:
-- supabase/migrations/20251128140000_create_scheduled_posts_table.sql
```

Click "Run" and wait for success.

### Step 3: Verify Success
After running all migrations, run this query to check if tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'platform_connections';
```

**If it returns "platform_connections", you're done!**

### Step 4: Refresh Your App
1. **Stop your dev server** (Ctrl+C)
2. **Run** `npm run dev` again
3. **Navigate to Platform Connections page**
4. **The blank page error should be gone!**

## What You're Doing
You're creating the database tables that your app expects to exist. Without these tables, your app can't store platform connection data.

## Need the Files?
You have these files in your project:
- `supabase/migrations/20251128084226_create_social_media_analytics_schema.sql`
- `supabase/migrations/20251128124400_create_social_media_tables.sql`
- `supabase/migrations/20251128130600_create_music_streaming_schema.sql`
- `supabase/migrations/20251128140000_create_scheduled_posts_table.sql`

Open each file and copy its entire content to paste into Supabase SQL Editor.

## This Will Fix:
- Platform Connections blank page
- "Table not found" errors
- All database-related issues

**After running the migrations, your Platform Connections page will work perfectly!**