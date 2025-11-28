# ✅ Perfect! You Have All Environment Variables

Your `.env` file is properly configured with all necessary API keys:
- ✅ YouTube API key, Client ID, Client Secret
- ✅ Facebook App ID and App Secret  
- ✅ Supabase URL and Anon Key

## 🎯 Now You Just Need to Run These 2 Database Migrations

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `ileywkgxavikqrjtpurt`
3. Click **"SQL Editor"** in left sidebar

### Step 2: Run Migration 1 (User Profiles)
```sql
-- Copy and paste this entire content:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Simple profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
```
Click **"Run"**

### Step 3: Run Migration 2 (Platform Connections)
```sql
-- Copy and paste this entire content:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Simple platform connections table
CREATE TABLE IF NOT EXISTS platform_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    account_id TEXT,
    account_name TEXT,
    account_username TEXT,
    account_avatar TEXT,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, platform)
);

-- Enable Row Level Security
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own platform connections" 
ON platform_connections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own platform connections" 
ON platform_connections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform connections" 
ON platform_connections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platform connections" 
ON platform_connections FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_connections_user_id 
ON platform_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_platform_connections_platform 
ON platform_connections(platform);
```
Click **"Run"**

### Step 4: Test the Connections
1. Go back to your app
2. Click "Connect" on Facebook
3. Should redirect to Facebook OAuth
4. After authorization, connection should save to database

### Step 5: Verify in Database
```sql
-- Run this in Supabase SQL Editor to check:
SELECT * FROM platform_connections WHERE user_id = 'c9ae5ac3-0fcd-47b4-982f-7ee6d4f21bd0';
```

## Expected Result

After running these migrations:
✅ OAuth connections will save to database
✅ "Connect" buttons will work for all platforms
✅ Connections will persist after page refresh
✅ Debug panel will show "Table exists"

**Your environment variables are perfect - just need these 2 migrations to complete the setup!**