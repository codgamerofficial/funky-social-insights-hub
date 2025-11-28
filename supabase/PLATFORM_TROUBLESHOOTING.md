# Platform Connections Troubleshooting Guide

## Issue: Platform Tab Showing Blank Page

If your Platform Connections page is showing a blank page, this guide will help you identify and fix the issue.

## Step 1: Check the Debug Panel

I've added a red debug panel in the bottom-right corner of the Platform Connections page. This panel shows:

- **User**: Your authentication status
- **Loading**: Whether authentication is still loading
- **Session**: Whether you have an active session
- **DB Status**: Database connection status
- **Table Exists**: Whether the `platform_connections` table exists

## Step 2: Interpret the Results

### If "User: Not logged in"
**Problem**: You're not authenticated
**Solution**: 
1. Click "Sign In" button on the page
2. Sign in with your account
3. Navigate back to Platform Connections

### If "DB Status: Error" 
**Problem**: Database connection issue
**Solutions**:
1. Check your Supabase configuration in `.env` file
2. Ensure your Supabase URL and API key are correct
3. Verify your Supabase project is active

### If "Table Exists: Table does not exist"
**Problem**: Migrations haven't been run
**Solution**: 
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run all the migration files in order:
   - `20251128084226_create_social_media_analytics_schema.sql`
   - `20251128124400_create_social_media_tables.sql`
   - `20251128130600_create_music_streaming_schema.sql`
   - `20251128140000_create_scheduled_posts_table.sql`

### If "Table Exists: Table exists" but still getting blank page
**Problem**: Data or RLS policy issue
**Solutions**:
1. Check browser console for JavaScript errors
2. Verify RLS policies are correctly applied
3. Try signing out and signing back in

## Step 3: Manual Database Test

Click the "Test Table" button in the debug panel to check if you can query the table directly.

## Step 4: Common Error Messages

### "relation 'platform_connections' does not exist"
**Cause**: Table doesn't exist in database
**Fix**: Run the migration files in Supabase SQL Editor

### "new row violates row-level security policy"
**Cause**: RLS policy blocking access
**Fix**: Check that RLS policies are correctly applied

### "invalid JWT token"
**Cause**: Authentication token expired or invalid
**Fix**: Sign out and sign back in

## Step 5: Check Console Logs

Open browser developer tools (F12) and check the Console tab for any red error messages. The debug logging will show what's happening step by step.

## Quick Fixes

1. **Restart the app**: Stop the dev server and run `npm run dev` again
2. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
3. **Re-run migrations**: Run the SQL files in Supabase SQL Editor
4. **Check environment variables**: Verify `.env` file has correct Supabase settings

## Environment Variables Check

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Still Having Issues?

1. Check the console for specific error messages
2. Verify your Supabase project is active and accessible
3. Ensure you've run all migrations in the correct order
4. Try signing out completely and signing back in

The debug panel should help identify exactly where the issue is occurring.