/**
 * YouTube Data API v3 Integration
 * Handles OAuth, video uploads, and analytics
 */

import { supabase } from '@/integrations/supabase/client';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_UPLOAD_API = 'https://www.googleapis.com/upload/youtube/v3';

export interface YouTubeConfig {
    clientId: string;
    clientSecret: string;
    apiKey: string;
    redirectUri: string;
}

export interface YouTubeVideo {
    id?: string;
    title: string;
    description: string;
    tags?: string[];
    categoryId?: string;
    privacyStatus: 'public' | 'private' | 'unlisted';
    thumbnailUrl?: string;
}

export interface YouTubeAnalytics {
    views: number;
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
    watchTime: number;
    averageViewDuration: number;
    audienceRetention?: any;
}

class YouTubeAPI {
    private config: YouTubeConfig;

    constructor(config: YouTubeConfig) {
        this.config = config;
    }

    /**
     * Initiate OAuth 2.0 flow
     */
    initiateOAuth(): string {
        const scope = [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/yt-analytics.readonly',
        ].join(' ');

        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope,
            access_type: 'offline',
            prompt: 'consent',
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }> {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                redirect_uri: this.config.redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for tokens');
        }

        return response.json();
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
        expires_in: number;
    }> {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                refresh_token: refreshToken,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh access token');
        }

        return response.json();
    }

    /**
     * Upload video to YouTube
     * Uses resumable upload protocol for large files
     */
    async uploadVideo(
        accessToken: string,
        videoFile: File,
        metadata: YouTubeVideo,
        onProgress?: (progress: number) => void
    ): Promise<{ id: string; url: string }> {
        // Step 1: Initialize resumable upload
        const initResponse = await fetch(
            `${YOUTUBE_UPLOAD_API}/videos?uploadType=resumable&part=snippet,status`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Length': videoFile.size.toString(),
                    'X-Upload-Content-Type': videoFile.type,
                },
                body: JSON.stringify({
                    snippet: {
                        title: metadata.title,
                        description: metadata.description,
                        tags: metadata.tags || [],
                        categoryId: metadata.categoryId || '22', // People & Blogs
                    },
                    status: {
                        privacyStatus: metadata.privacyStatus,
                    },
                }),
            }
        );

        if (!initResponse.ok) {
            throw new Error('Failed to initialize video upload');
        }

        const uploadUrl = initResponse.headers.get('Location');
        if (!uploadUrl) {
            throw new Error('No upload URL received');
        }

        // Step 2: Upload video file
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': videoFile.type,
            },
            body: videoFile,
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload video file');
        }

        const result = await uploadResponse.json();

        return {
            id: result.id,
            url: `https://www.youtube.com/watch?v=${result.id}`,
        };
    }

    /**
     * Get video analytics
     */
    async getVideoAnalytics(
        accessToken: string,
        videoId: string,
        startDate: string,
        endDate: string
    ): Promise<YouTubeAnalytics> {
        const params = new URLSearchParams({
            ids: `channel==MINE`,
            startDate,
            endDate,
            metrics: 'views,likes,dislikes,comments,shares,estimatedMinutesWatched,averageViewDuration',
            dimensions: 'video',
            filters: `video==${videoId}`,
        });

        const response = await fetch(
            `https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch video analytics');
        }

        const data = await response.json();
        const row = data.rows?.[0] || [];

        return {
            views: row[0] || 0,
            likes: row[1] || 0,
            dislikes: row[2] || 0,
            comments: row[3] || 0,
            shares: row[4] || 0,
            watchTime: (row[5] || 0) * 60, // convert minutes to seconds
            averageViewDuration: row[6] || 0,
        };
    }

    /**
     * Get channel information
     */
    async getChannelInfo(accessToken: string): Promise<{
        id: string;
        title: string;
        thumbnailUrl: string;
    }> {
        const response = await fetch(
            `${YOUTUBE_API_BASE}/channels?part=snippet&mine=true`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch channel info');
        }

        const data = await response.json();
        const channel = data.items?.[0];

        if (!channel) {
            throw new Error('No channel found');
        }

        return {
            id: channel.id,
            title: channel.snippet.title,
            thumbnailUrl: channel.snippet.thumbnails.default.url,
        };
    }
}

// Export singleton instance
export const createYouTubeAPI = (config: YouTubeConfig) => new YouTubeAPI(config);
