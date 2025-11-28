-- Simple Platform Connections Table Only
-- This avoids conflicts with other schemas

-- Enable UUID extension
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
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own platform connections" 
ON platform_connections FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform connections" 
ON platform_connections FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platform connections" 
ON platform_connections FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_connections_user_id 
ON platform_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_platform_connections_platform 
ON platform_connections(platform);