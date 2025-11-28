# Facebook & Instagram OAuth Connection Troubleshooting

## Issue: Cannot Connect Facebook/Instagram Accounts

If the Platform Connections page loads but you can't connect Facebook/Instagram accounts, here's how to fix it:

## Step 1: Check Environment Variables

Make sure your `.env` file contains these variables:

```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

## Step 2: Run Database Migrations

You need the database tables to store OAuth connections. Run these 2 migrations in Supabase SQL Editor:

### Migration 1: User Profiles
```sql
-- Open: supabase/migrations/20251128084226_create_profiles_ONLY.sql
-- Copy content and run in Supabase SQL Editor
```

### Migration 2: Platform Connections  
```sql
-- Open: supabase/migrations/20251128124400_create_platform_connections_ONLY.sql
-- Copy content and run in Supabase SQL Editor
```

## Step 3: Facebook App Setup

### Go to Facebook Developers:
1. Visit: https://developers.facebook.com/
2. Create/select your app
3. Add "Facebook Login" product

### Configure OAuth Settings:
- **Valid OAuth Redirect URIs**: Add your domain
  ```
  https://your-domain.com/oauth/callback
  http://localhost:5173/oauth/callback (for development)
  ```

### Required Permissions:
- `email`
- `public_profile`
- `pages_show_list`
- `pages_read_engagement`
- `instagram_basic`
- `instagram_content_publish`

## Step 4: Instagram Business Account

### Prerequisites:
- Facebook Page connected to Instagram Business Account
- Instagram Business/Creator account (not personal)

### Linking Process:
1. Go to Instagram Settings
2. Tap "Account"
3. Tap "Professional account"
4. Follow prompts to connect to Facebook Page

## Step 5: Test OAuth Flow

### YouTube Connection:
1. Click "Connect" on YouTube
2. Should redirect to Google OAuth
3. After authorization, should return to your app
4. Connection should show as "Connected"

### Facebook Connection:
1. Click "Connect" on Facebook
2. Should redirect to Facebook OAuth
3. Should show permission requests
4. After authorization, should return to your app

### Instagram Connection:
1. Click "Connect" on Instagram
2. Uses Facebook's OAuth flow
3. Should request Instagram permissions
4. After authorization, should return to your app

## Common OAuth Issues & Solutions

### Issue: "Invalid redirect URI"
**Solution**: Add your domain to Facebook App's valid redirect URIs

### Issue: "App not approved for public use"
**Solution**: Submit app for review or use test users

### Issue: "Missing permissions"
**Solution**: Request required permissions in OAuth flow

### Issue: "Connection doesn't save"
**Solution**: Run the database migrations first

### Issue: "404 on /oauth/callback"
**Solution**: Check if OAuthCallback component exists and route is correct

## Debug Steps

### Check Browser Console:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for OAuth-related errors when clicking Connect

### Check Network Tab:
1. Open Developer Tools (F12)
2. Go to Network tab
3. Monitor requests when clicking Connect
4. Look for failed requests (red entries)

### Verify App Configuration:
1. Facebook App ID must match your environment variable
2. Redirect URIs must include your current domain
3. App must be in "Development" or "Live" mode

## Quick Test

After running migrations, test with:
```sql
SELECT * FROM platform_connections WHERE user_id = 'your-user-id';
```
Should show connected accounts if OAuth works.

## Need Help?

If you're still having issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Confirm Facebook app configuration
4. Test with a simple Facebook login first

The Platform Connections page is now working - OAuth setup is the final step!