# OAuth Setup Guide for Social Media Integration

## Required Redirect URIs to Add

### 1. Google Cloud Console (for YouTube & Supabase Google OAuth)
**Project:** Your Google Cloud Console project
**OAuth 2.0 Client ID:** `812941970044-g8n1rd25sj1savb2j4cj158e2eeet8qk.apps.googleusercontent.com`

#### Add these redirect URIs:
- `https://ileywkgxavikqrjtpurt.supabase.co/auth/v1/callback` (for Supabase Google OAuth)
- `http://localhost:8081/` (for development - YouTube OAuth)
- `http://localhost:8081/dashboard` (for development - YouTube OAuth callback)
- `https://funky-social-insights-hub-three.vercel.app/` (production)
- `https://funky-social-insights-hub-three.vercel.app/dashboard` (production callback)

### 2. Facebook/Meta Developer Console
**App ID:** `868501092530484`

#### Add these redirect URIs:
- `http://localhost:8081/` (for development)
- `https://funky-social-insights-hub-three.vercel.app/` (production)

### 3. Supabase Dashboard
**Project URL:** `https://ileywkgxavikqrjtpurt.supabase.co`

#### Add these redirect URLs in Supabase Authentication settings:
- `http://localhost:8081/` (for development)
- `http://localhost:8081/dashboard` (for development)
- `http://localhost:8081/reset-password` (for password reset)
- `https://funky-social-insights-hub-three.vercel.app/` (production)
- `https://funky-social-insights-hub-three.vercel.app/dashboard` (production)
- `https://funky-social-insights-hub-three.vercel.app/reset-password` (production)

## Current Application URLs

Based on your code analysis, your application uses these redirect URLs:

### In AuthContext.tsx:
- Google OAuth: `${window.location.origin}/dashboard`
- Password Reset: `${window.location.origin}/reset-password`

### Current Environment:
- **Development:** `http://localhost:8081`
- **Production:** `https://funky-social-insights-hub-three.vercel.app`

## Setup Steps

### Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID: `812941970044-g8n1rd25sj1savb2j4cj158e2eeet8qk.apps.googleusercontent.com`
4. Click to edit it
5. Under **Authorized redirect URIs**, add the URLs listed above

### Facebook/Meta Developer Console:
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Select your app
3. Go to **Facebook Login** → **Settings**
4. Under **Valid OAuth Redirect URIs**, add the URLs listed above

### Supabase Dashboard:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ileywkgxavikqrjtpurt`
3. Go to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add the URLs listed above

## Important Notes

1. **Development vs Production:** You'll need to add both localhost URLs for development and your production domain URLs.

2. **Platform Integration Status:** Your current OAuth implementation in PlatformConnections.tsx is still a mock (line 51: `// TODO: Implement actual OAuth flow`). You'll need to implement the actual OAuth flows using the API classes in `/src/lib/api/`.

3. **YouTube API:** Make sure YouTube Data API v3 is enabled in your Google Cloud Console project.

4. **Facebook/Instagram:** You need a Facebook Developer app with Facebook Login and Instagram Basic Display/Content Publishing permissions.

## Next Steps

1. Add the redirect URIs as listed above
2. Implement the actual OAuth flows in your PlatformConnections component
3. Test the authentication flows in development
4. Update URLs when deploying to production

## Environment Variables Reference

From your `.env.local` file:
```env
# YouTube
VITE_YOUTUBE_CLIENT_ID=812941970044-g8n1rd25sj1savb2j4cj158e2eeet8qk.apps.googleusercontent.com

# Facebook/Instagram
VITE_FACEBOOK_APP_ID=868501092530484