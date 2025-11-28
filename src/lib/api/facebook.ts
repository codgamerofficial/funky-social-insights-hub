/**
 * Facebook Graph API Integration
 * Handles OAuth, video uploads, and page insights
 */

export interface FacebookConfig {
    appId: string;
    appSecret: string;
    redirectUri: string;
}

export interface FacebookVideo {
    title: string;
    description: string;
    published?: boolean;
    scheduledPublishTime?: number; // Unix timestamp
}

export interface FacebookInsights {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    engagement: number;
}

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

class FacebookAPI {
    private config: FacebookConfig;

    constructor(config: FacebookConfig) {
        this.config = config;
    }

    /**
     * Initiate OAuth flow
     */
    initiateOAuth(): string {
        const scope = [
            'pages_show_list',
            'pages_read_engagement',
            'pages_manage_posts',
            'pages_manage_engagement',
            'instagram_basic',
            'instagram_content_publish',
        ].join(',');

        const params = new URLSearchParams({
            client_id: this.config.appId,
            redirect_uri: this.config.redirectUri,
            scope,
            response_type: 'code',
        });

        return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
    }

    /**
     * Exchange code for access token
     */
    async exchangeCodeForToken(code: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }> {
        const params = new URLSearchParams({
            client_id: this.config.appId,
            client_secret: this.config.appSecret,
            redirect_uri: this.config.redirectUri,
            code,
        });

        const response = await fetch(
            `${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        return response.json();
    }

    /**
     * Get long-lived access token
     */
    async getLongLivedToken(shortLivedToken: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }> {
        const params = new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: this.config.appId,
            client_secret: this.config.appSecret,
            fb_exchange_token: shortLivedToken,
        });

        const response = await fetch(
            `${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error('Failed to get long-lived token');
        }

        return response.json();
    }

    /**
     * Get user's pages
     */
    async getUserPages(accessToken: string): Promise<Array<{
        id: string;
        name: string;
        access_token: string;
    }>> {
        const response = await fetch(
            `${GRAPH_API_BASE}/me/accounts?access_token=${accessToken}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch user pages');
        }

        const data = await response.json();
        return data.data || [];
    }

    /**
     * Upload video to Facebook page
     */
    async uploadVideo(
        pageAccessToken: string,
        pageId: string,
        videoFile: File,
        metadata: FacebookVideo,
        onProgress?: (progress: number) => void
    ): Promise<{ id: string; url: string }> {
        const formData = new FormData();
        formData.append('source', videoFile);
        formData.append('title', metadata.title);
        formData.append('description', metadata.description);

        if (metadata.published !== undefined) {
            formData.append('published', metadata.published.toString());
        }

        if (metadata.scheduledPublishTime) {
            formData.append('scheduled_publish_time', metadata.scheduledPublishTime.toString());
            formData.append('published', 'false');
        }

        const response = await fetch(
            `${GRAPH_API_BASE}/${pageId}/videos?access_token=${pageAccessToken}`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to upload video');
        }

        const result = await response.json();

        return {
            id: result.id,
            url: `https://www.facebook.com/${result.id}`,
        };
    }

    /**
     * Get video insights
     */
    async getVideoInsights(
        accessToken: string,
        videoId: string
    ): Promise<FacebookInsights> {
        const metrics = [
            'total_video_views',
            'total_video_views_unique',
            'total_video_reactions',
            'total_video_comments',
            'total_video_shares',
        ].join(',');

        const response = await fetch(
            `${GRAPH_API_BASE}/${videoId}/video_insights?metric=${metrics}&access_token=${accessToken}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch video insights');
        }

        const data = await response.json();
        const insights = data.data || [];

        const getMetricValue = (name: string) => {
            const metric = insights.find((m: any) => m.name === name);
            return metric?.values?.[0]?.value || 0;
        };

        return {
            views: getMetricValue('total_video_views'),
            likes: getMetricValue('total_video_reactions'),
            comments: getMetricValue('total_video_comments'),
            shares: getMetricValue('total_video_shares'),
            reach: getMetricValue('total_video_views_unique'),
            engagement: 0, // Calculate from likes + comments + shares
        };
    }

    /**
     * Get page information
     */
    async getPageInfo(accessToken: string, pageId: string): Promise<{
        id: string;
        name: string;
        picture: string;
    }> {
        const response = await fetch(
            `${GRAPH_API_BASE}/${pageId}?fields=id,name,picture&access_token=${accessToken}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch page info');
        }

        const data = await response.json();

        return {
            id: data.id,
            name: data.name,
            picture: data.picture?.data?.url || '',
        };
    }
}

export const createFacebookAPI = (config: FacebookConfig) => new FacebookAPI(config);
