/**
 * Social Media Analytics Service
 * Fetches real analytics data from YouTube, Facebook, and Instagram APIs
 */

import { supabase } from '@/integrations/supabase/client';
import { createYouTubeAPI, YouTubeConfig } from '@/lib/api/youtube';
import { createFacebookAPI, FacebookConfig } from '@/lib/api/facebook';
import { createInstagramAPI, InstagramConfig } from '@/lib/api/instagram';

export interface PlatformConnection {
    id: string;
    platform: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
    account_name?: string;
    account_username?: string;
}

export interface VideoAnalytics {
    platform: string;
    video_id: string;
    video_title: string;
    video_url: string;
    published_at: string;
    views: number;
    likes: number;
    dislikes?: number;
    comments: number;
    shares: number;
    saves?: number;
    watch_time_seconds: number;
    average_view_duration: number;
    engagement_rate: number;
    reach?: number;
    impressions?: number;
}

export interface AccountAnalytics {
    platform: string;
    followers: number;
    total_views: number;
    total_videos: number;
    total_posts?: number; // Optional for platforms that don't have posts
    average_views_per_video: number;
    average_engagement_rate: number;
}

class SocialMediaService {
    private async getPlatformConnections(userId: string): Promise<PlatformConnection[]> {
        const { data, error } = await (supabase as any)
            .from('platform_connections')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching platform connections:', error);
            return [];
        }

        return data || [];
    }

    async getYouTubeAnalytics(userId: string): Promise<AccountAnalytics | null> {
        const connections = await this.getPlatformConnections(userId);
        const youtubeConnection = connections.find(conn => conn.platform === 'youtube');

        if (!youtubeConnection || !youtubeConnection.access_token) {
            return null;
        }

        try {
            const config: YouTubeConfig = {
                clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID,
                clientSecret: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET,
                apiKey: import.meta.env.VITE_YOUTUBE_API_KEY,
                redirectUri: `${window.location.origin}/oauth/callback`
            };

            const youtubeAPI = createYouTubeAPI(config);

            // Refresh access token if needed
            let accessToken = youtubeConnection.access_token;
            if (youtubeConnection.expires_at && new Date(youtubeConnection.expires_at) <= new Date()) {
                // In a real implementation, you'd refresh the token here
                console.warn('Access token expired, would need to refresh');
            }

            // Get channel info
            const channelInfo = await youtubeAPI.getChannelInfo(accessToken);

            // Get channel statistics using YouTube Data API
            const statsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelInfo.id}&access_token=${accessToken}`
            );

            if (!statsResponse.ok) {
                throw new Error('Failed to fetch channel statistics');
            }

            const statsData = await statsResponse.json();
            const statistics = statsData.items?.[0]?.statistics || {};

            // Get recent videos
            const videosResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelInfo.id}&order=date&maxResults=10&type=video&access_token=${accessToken}`
            );

            let videoCount = 0;
            let totalVideoViews = 0;

            if (videosResponse.ok) {
                const videosData = await videosResponse.json();
                const videoIds = videosData.items?.map((item: any) => item.id.videoId).filter(Boolean) || [];

                if (videoIds.length > 0) {
                    // Get statistics for each video
                    const videoStatsResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(',')}&access_token=${accessToken}`
                    );

                    if (videoStatsResponse.ok) {
                        const videoStatsData = await videoStatsResponse.json();
                        videoCount = videoStatsData.items?.length || 0;
                        totalVideoViews = videoStatsData.items?.reduce((sum: number, video: any) => {
                            return sum + (parseInt(video.statistics.viewCount) || 0);
                        }, 0) || 0;
                    }
                }
            }

            const analytics: AccountAnalytics = {
                platform: 'youtube',
                followers: parseInt(statistics.subscriberCount) || 0,
                total_views: parseInt(statistics.viewCount) || 0,
                total_videos: videoCount,
                total_posts: videoCount,
                average_views_per_video: videoCount > 0 ? totalVideoViews / videoCount : 0,
                average_engagement_rate: 0, // Would need to calculate from likes, comments, etc.
            };

            return analytics;
        } catch (error) {
            console.error('Error fetching YouTube analytics:', error);
            return null;
        }
    }

    async getFacebookAnalytics(userId: string): Promise<AccountAnalytics | null> {
        const connections = await this.getPlatformConnections(userId);
        const facebookConnection = connections.find(conn => conn.platform === 'facebook');

        if (!facebookConnection || !facebookConnection.access_token) {
            return null;
        }

        try {
            const config: FacebookConfig = {
                appId: import.meta.env.VITE_FACEBOOK_APP_ID,
                appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
                redirectUri: `${window.location.origin}/oauth/callback`
            };

            const facebookAPI = createFacebookAPI(config);

            const accessToken = facebookConnection.access_token;

            // Get user's pages
            const pages = await facebookAPI.getUserPages(accessToken);

            if (pages.length === 0) {
                return null;
            }

            // Get analytics for the first page (in a real app, you'd handle multiple pages)
            const mainPage = pages[0];

            // Get page insights
            const pageInsightsResponse = await fetch(
                `${GRAPH_API_BASE}/${mainPage.id}/insights?metric=page_fans,page_impressions,page_posts_impressions&access_token=${mainPage.access_token}`
            );

            let followers = 0;
            let totalViews = 0;
            let totalPosts = 0;

            if (pageInsightsResponse.ok) {
                const insightsData = await pageInsightsResponse.json();
                const insights = insightsData.data || [];

                const fansMetric = insights.find((m: any) => m.name === 'page_fans');
                followers = fansMetric?.values?.[0]?.value || 0;

                const impressionsMetric = insights.find((m: any) => m.name === 'page_impressions');
                totalViews = impressionsMetric?.values?.[0]?.value || 0;
            }

            // Get recent posts count
            const postsResponse = await fetch(
                `${GRAPH_API_BASE}/${mainPage.id}/posts?limit=50&access_token=${mainPage.access_token}`
            );

            if (postsResponse.ok) {
                const postsData = await postsResponse.json();
                totalPosts = postsData.data?.length || 0;
            }

            const analytics: AccountAnalytics = {
                platform: 'facebook',
                followers,
                total_views: totalViews,
                total_videos: totalPosts,
                total_posts: totalPosts,
                average_views_per_video: totalPosts > 0 ? totalViews / totalPosts : 0,
                average_engagement_rate: 0, // Would need additional insights for engagement
            };

            return analytics;
        } catch (error) {
            console.error('Error fetching Facebook analytics:', error);
            return null;
        }
    }

    async getInstagramAnalytics(userId: string): Promise<AccountAnalytics | null> {
        const connections = await this.getPlatformConnections(userId);
        const instagramConnection = connections.find(conn => conn.platform === 'instagram');

        if (!instagramConnection || !instagramConnection.access_token) {
            return null;
        }

        try {
            const accessToken = instagramConnection.access_token;
            const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

            // Get user's pages to find linked Instagram Business Account
            const { createFacebookAPI } = await import('@/lib/api/facebook');
            const facebookConfig = {
                appId: import.meta.env.VITE_FACEBOOK_APP_ID,
                appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
                redirectUri: `${window.location.origin}/oauth/callback`
            };
            const facebookAPI = createFacebookAPI(facebookConfig);

            // Get user's pages
            const pages = await facebookAPI.getUserPages(accessToken);

            if (pages.length === 0) {
                return null;
            }

            // Find page with linked Instagram Business Account
            let instagramAccountId = null;
            for (const page of pages) {
                try {
                    const pageResponse = await fetch(
                        `${GRAPH_API_BASE}/${page.id}?fields=instagram_business_account&access_token=${accessToken}`
                    );

                    if (pageResponse.ok) {
                        const pageData = await pageResponse.json();
                        if (pageData.instagram_business_account) {
                            instagramAccountId = pageData.instagram_business_account.id;
                            break;
                        }
                    }
                } catch (error) {
                    console.error('Error checking page for Instagram account:', error);
                }
            }

            if (!instagramAccountId) {
                return null;
            }

            // Get Instagram account info
            const accountResponse = await fetch(
                `${GRAPH_API_BASE}/${instagramAccountId}?fields=followers_count,media_count&access_token=${accessToken}`
            );

            let followers = 0;
            let totalPosts = 0;

            if (accountResponse.ok) {
                const accountData = await accountResponse.json();
                followers = accountData.followers_count || 0;
                totalPosts = accountData.media_count || 0;
            }

            // Get recent media to calculate average views
            const mediaResponse = await fetch(
                `${GRAPH_API_BASE}/${instagramAccountId}/media?fields=like_count,comments_count&limit=10&access_token=${accessToken}`
            );

            let totalEngagement = 0;
            if (mediaResponse.ok) {
                const mediaData = await mediaResponse.json();
                const mediaItems = mediaData.data || [];

                for (const item of mediaItems) {
                    totalEngagement += (item.like_count || 0) + (item.comments_count || 0);
                }
            }

            const analytics: AccountAnalytics = {
                platform: 'instagram',
                followers,
                total_views: 0, // Instagram doesn't provide direct view counts via basic API
                total_videos: totalPosts, // Instagram posts include both photos and videos
                total_posts: totalPosts,
                average_views_per_video: 0,
                average_engagement_rate: followers > 0 ? (totalEngagement / followers) * 100 : 0,
            };

            return analytics;
        } catch (error) {
            console.error('Error fetching Instagram analytics:', error);
            return null;
        }
    }

    async getAllPlatformAnalytics(userId: string): Promise<{
        youtube: AccountAnalytics | null;
        facebook: AccountAnalytics | null;
        instagram: AccountAnalytics | null;
    }> {
        const [youtube, facebook, instagram] = await Promise.all([
            this.getYouTubeAnalytics(userId),
            this.getFacebookAnalytics(userId),
            this.getInstagramAnalytics(userId),
        ]);

        return { youtube, facebook, instagram };
    }

    async storeAnalytics(userId: string, analytics: AccountAnalytics) {
        const { error } = await (supabase as any)
            .from('account_analytics')
            .upsert({
                user_id: userId,
                ...analytics,
                date_recorded: new Date().toISOString().split('T')[0],
            });

        if (error) {
            console.error('Error storing analytics:', error);
        }
    }

    async getStoredAnalytics(userId: string, days: number = 30): Promise<{
        youtube: AccountAnalytics[];
        facebook: AccountAnalytics[];
        instagram: AccountAnalytics[];
    }> {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const { data, error } = await (supabase as any)
            .from('account_analytics')
            .select('*')
            .eq('user_id', userId)
            .gte('date_recorded', startDate)
            .order('date_recorded', { ascending: false });

        if (error) {
            console.error('Error fetching stored analytics:', error);
            return { youtube: [], facebook: [], instagram: [] };
        }

        const youtube = data?.filter((d: any) => d.platform === 'youtube') || [];
        const facebook = data?.filter((d: any) => d.platform === 'facebook') || [];
        const instagram = data?.filter((d: any) => d.platform === 'instagram') || [];

        return { youtube, facebook, instagram };
    }

    async isPlatformConnected(userId: string, platform: string): Promise<boolean> {
        const { data, error } = await (supabase as any)
            .from('platform_connections')
            .select('id')
            .eq('user_id', userId)
            .eq('platform', platform)
            .single();

        return !error && !!data;
    }

    async disconnectPlatform(userId: string, platform: string): Promise<boolean> {
        const { error } = await (supabase as any)
            .from('platform_connections')
            .delete()
            .eq('user_id', userId)
            .eq('platform', platform);

        return !error;
    }
}

export const socialMediaService = new SocialMediaService();