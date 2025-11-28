# Quick OAuth Diagnosis - Facebook/Instagram Connection Issues

## 🎯 Quick Diagnosis - What Type of Error Are You Getting?

### When you click "Connect" on Facebook/Instagram, what happens?

## Option A: Nothing Happens
**Issue**: OAuth flow doesn't start
**Likely Cause**: Missing environment variables
**Fix**: Check your `.env` file has:
```
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## Option B: Error Page
**Issue**: Redirects to error page
**Likely Cause**: Facebook app configuration issues
**Check**: 
- App ID correct in `.env`?
- Redirect URIs configured in Facebook App?
- App permissions granted?

## Option C: Redirects But Nothing Saves
**Issue**: OAuth completes but connection doesn't persist
**Likely Cause**: Missing database tables
**Fix**: Run the 2 database migrations:
1. `profiles_ONLY.sql`
2. `platform_connections_ONLY.sql`

## Option D: Facebook Login Works, Instagram Doesn't
**Issue**: Instagram requires Facebook Business account
**Fix**: 
- Instagram account must be Business/Creator
- Must be connected to Facebook Page
- Use Facebook's OAuth flow for Instagram

## 🔧 Quick Fixes to Try Now

### 1. Check Environment Variables
```bash
# In your project root, check .env file contains:
grep -E "VITE_FACEBOOK|VITE_YOUTUBE" .env
```

### 2. Run Database Migrations
**In Supabase SQL Editor, run these 2 files:**
```
supabase/migrations/20251128084226_create_profiles_ONLY.sql
supabase/migrations/20251128124400_create_platform_connections_ONLY.sql
```

### 3. Test Simple Connection
Try connecting **YouTube first** (usually simpler):
1. Click "Connect" on YouTube
2. Should redirect to Google
3. Should work if OAuth is configured

### 4. Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Click "Connect" on Facebook/Instagram
4. Look for red error messages

## 📋 Tell Me What You See

Please share:
1. **What happens when you click "Connect" on Facebook?**
2. **What happens when you click "Connect" on Instagram?**
3. **Any error messages in browser console (F12)?**
4. **Do you have a Facebook Developer App set up?**
5. **Is your Instagram account a Business account?**

## 🏃‍♂️ Speed Run Setup (If Starting Fresh)

### Facebook App Setup (5 minutes):
1. Go to https://developers.facebook.com/
2. Create new app → Consumer type
3. Add Facebook Login product
4. Get App ID and App Secret
5. Add redirect URI: `http://localhost:5173/oauth/callback`

### Environment Variables:
```env
VITE_FACEBOOK_APP_ID=your_app_id_here
VITE_FACEBOOK_APP_SECRET=your_app_secret_here
```

### Database:
Run 2 migrations in Supabase SQL Editor

### Test:
Click "Connect" on Facebook - should redirect to OAuth

## The Platform Connections Page is Working! 🎉

The blank page issue is **completely fixed**. OAuth setup is a separate configuration task that we can troubleshoot together.