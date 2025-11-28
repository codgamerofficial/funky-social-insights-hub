/**
 * Instagram Graph API Integration
 * Handles OAuth (via Facebook), Reels/IGTV uploads, and insights
 */

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface InstagramConfig {
    appId: string;
    appSecret: string;
    redirectUri: string;
}

export interface InstagramVideo {
    caption: string;
    coverUrl?: string; // Thumbnail URL
    shareToFeed?: boolean;
    locationId?: string;
    collaborators?: string[];
}

export interface InstagramInsights {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    engagement: number;
}

class InstagramAPI {
    private config: InstagramConfig;

    constructor(config: InstagramConfig) {
        this.config = config;
    }

    /**
     * Get Instagram Business Account ID from Facebook Page
     */
    async getInstagramAccountId(
        pageAccessToken: string,
        pageId: string
    ): Promise<string> {
        const response = await fetch(
            `${GRAPH_API_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Instagram account');
        }

        const data = await response.json();

        if (!data.instagram_business_account) {
            throw new Error('No Instagram Business Account linked to this page');
        }

        return data.instagram_business_account.id;
    }

    /**
     * Upload Reel to Instagram
     * Note: Instagram requires a two-step process
     */
    async uploadReel(
        accessToken: string,
        instagramAccountId: string,
        videoUrl: string, // Must be publicly accessible URL
        metadata: InstagramVideo,
        onProgress?: (progress: number) => void
    ): Promise<{ id: string; url: string }> {
        // Step 1: Create media container
        const containerParams = new URLSearchParams({
            media_type: 'REELS',
            video_url: videoUrl,
            caption: metadata.caption,
            share_to_feed: metadata.shareToFeed ? 'true' : 'false',
            access_token: accessToken,
        });

        if (metadata.coverUrl) {
            containerParams.append('cover_url', metadata.coverUrl);
        }

        if (metadata.locationId) {
            containerParams.append('location_id', metadata.locationId);
        }

        const containerResponse = await fetch(
            `${GRAPH_API_BASE}/${instagramAccountId}/media`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: containerParams.toString(),
            }
        );

        if (!containerResponse.ok) {
            const error = await containerResponse.json();
            throw new Error(error.error?.message || 'Failed to create media container');
        }

        const containerData = await containerResponse.json();
        const containerId = containerData.id;

        // Step 2: Wait for video processing (poll status)
        await this.waitForVideoProcessing(accessToken, containerId, onProgress);

        // Step 3: Publish the media
        const publishResponse = await fetch(
            `${GRAPH_API_BASE}/${instagramAccountId}/media_publish`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    creation_id: containerId,
                    access_token: accessToken,
                }).toString(),
            }
        );

        if (!publishResponse.ok) {
            const error = await publishResponse.json();
            throw new Error(error.error?.message || 'Failed to publish media');
        }

        const publishData = await publishResponse.json();

        return {
            id: publishData.id,
            url: `https://www.instagram.com/reel/${publishData.id}`,
        };
    }

    /**
     * Wait for video processing to complete
     */
    private async waitForVideoProcessing(
        accessToken: string,
        containerId: string,
        onProgress?: (progress: number) => void,
        maxAttempts: number = 30
    ): Promise<void> {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const response = await fetch(
                `${GRAPH_API_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`
            );

            if (!response.ok) {
                throw new Error('Failed to check video status');
            }

            const data = await response.json();
            const status = data.status_code;

            if (status === 'FINISHED') {
                if (onProgress) onProgress(100);
                return;
            }

            if (status === 'ERROR') {
                throw new Error('Video processing failed');
            }

            // Update progress
            if (onProgress) {
                const progress = Math.min(90, (attempt / maxAttempts) * 90);
                onProgress(progress);
            }

            // Wait 2 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        throw new Error('Video processing timeout');
    }

    /**
     * Get Reel insights
     */
    async getReelInsights(
        accessToken: string,
        mediaId: string
    ): Promise<InstagramInsights> {
        const metrics = [
            'plays',
            'likes',
            'comments',
            'shares',
            'saved',
            'reach',
            'total_interactions',
        ].join(',');

        const response = await fetch(
            `${GRAPH_API_BASE}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch reel insights');
        }

        const data = await response.json();
        const insights = data.data || [];

        const getMetricValue = (name: string) => {
            const metric = insights.find((m: any) => m.name === name);
            return metric?.values?.[0]?.value || 0;
        };

        return {
            views: getMetricValue('plays'),
            likes: getMetricValue('likes'),
            comments: getMetricValue('comments'),
            shares: getMetricValue('shares'),
            saves: getMetricValue('saved'),
            reach: getMetricValue('reach'),
            engagement: getMetricValue('total_interactions'),
        };
    }

    /**
     * Get Instagram account information
     */
    async getAccountInfo(
        accessToken: string,
        instagramAccountId: string
    ): Promise<{
        id: string;
        username: string;
        name: string;
        profilePictureUrl: string;
    }> {
        const response = await fetch(
            `${GRAPH_API_BASE}/${instagramAccountId}?fields=id,username,name,profile_picture_url&access_token=${accessToken}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch account info');
        }

        const data = await response.json();

        return {
            id: data.id,
            username: data.username,
            name: data.name,
            profilePictureUrl: data.profile_picture_url || '',
        };
    }

    /**
     * Get user's media (recent posts)
     */
    async getUserMedia(
        accessToken: string,
        instagramAccountId: string,
        limit: number = 25
    ): Promise<Array<{
        id: string;
        mediaType: string;
        mediaUrl: string;
        permalink: string;
        caption: string;
        timestamp: string;
    }>> {
        const response = await fetch(
            `${GRAPH_API_BASE}/${instagramAccountId}/media?fields=id,media_type,media_url,permalink,caption,timestamp&limit=${limit}&access_token=${accessToken}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch user media');
        }

        const data = await response.json();
        return data.data || [];
    }
}

export const createInstagramAPI = (config: InstagramConfig) => new InstagramAPI(config);
