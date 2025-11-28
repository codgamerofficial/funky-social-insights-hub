# 🚨 OAuth 404 Error Fix Instructions

## Problem
You're getting `404: NOT_FOUND` error after Google login because the redirect URIs are not properly configured.

## 🔧 Solution Steps

### 1. Update Google Cloud Console (URGENT)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID: `812941970044-g8n1rd25sj1savb2j4cj158e2eeet8qk.apps.googleusercontent.com`
4. Click to **edit** it
5. Under **Authorized redirect URIs**, add:
   ```
   https://ileywkgxavikqrjtpurt.supabase.co/auth/v1/callback
   ```
6. **Save** the changes

### 2. Update Supabase Authentication Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ileywkgxavikqrjtpurt`
3. Go to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add:
   - `http://localhost:8081/` (for development)
   - `http://localhost:8081/dashboard` (for development)
   - `https://funky-social-insights-hub-three.vercel.app/` (for production)
   - `https://funky-social-insights-hub-three.vercel.app/dashboard` (for production)

### 3. Restart Your Application

After making the changes above:
1. **Stop** your development server (Ctrl+C)
2. **Start** it again: `npm run dev`

## 🎯 What This Fixes

- **Google OAuth Flow**: Now properly redirects to Supabase
- **Authentication Callback**: Supabase can receive the authorization code
- **User Session**: You'll be able to log in and access protected routes

## ✅ Expected Result

After these changes:
1. Click "Sign in with Google" 
2. You'll be redirected to Google login
3. After login, you'll be redirected back to your app
4. You'll be logged in and can access the dashboard

## 🔍 If You Still Get Errors

Check the browser console for specific error messages:
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Try logging in again
4. Look for red error messages

## 📞 Still Need Help?

If the issue persists, please share:
1. The exact error message from the browser console
2. What step you got stuck on
3. Any specific error codes