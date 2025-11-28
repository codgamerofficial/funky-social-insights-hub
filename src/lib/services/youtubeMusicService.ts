/**
 * YouTube Music API Service
 * Integration with YouTube Music for search and streaming
 */

import {
    YouTubeMusicSearchResult,
    YouTubeMusicTrack,
    MusicTrack,
    MusicSearchFilters,
    MusicSearchResults
} from '@/types/music';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_MUSIC_BASE = 'https://music.youtube.com/youtubei/v1';

export interface YouTubeMusicConfig {
    apiKey: string;
    clientId?: string;
    clientSecret?: string;
    maxResults?: number;
}

class YouTubeMusicService {
    private config: YouTubeMusicConfig;
    private accessToken?: string;

    constructor(config: YouTubeMusicConfig) {
        this.config = {
            maxResults: 50,
            ...config,
        };
    }

    /**
     * Set access token for authenticated requests
     */
    setAccessToken(token: string) {
        this.accessToken = token;
    }

    /**
     * Search for music content on YouTube
     */
    async searchMusic(
        query: string,
        filters?: MusicSearchFilters,
        maxResults: number = 25
    ): Promise<YouTubeMusicSearchResult> {
        try {
            const searchParams = new URLSearchParams({
                key: this.config.apiKey,
                q: query,
                type: 'video',
                videoCategoryId: '10', // Music category
                part: 'snippet',
                maxResults: maxResults.toString(),
                order: 'relevance',
                safeSearch: 'moderate',
            });

            const response = await fetch(`${YOUTUBE_API_BASE}/search?${searchParams}`);

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();

            return this.processSearchResults(data.items || []);
        } catch (error) {
            console.error('YouTube Music search error:', error);
            throw new Error('Failed to search music on YouTube');
        }
    }

    /**
     * Get music videos by category
     */
    async getMusicByCategory(
        category: 'trending' | 'new' | 'top' | 'playlists',
        maxResults: number = 25
    ): Promise<YouTubeMusicTrack[]> {
        try {
            let order = 'relevance';
            let publishedAfter: string | undefined;

            switch (category) {
                case 'trending':
                    order = 'viewCount';
                    break;
                case 'new':
                    publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                    break;
                case 'top':
                    order = 'viewCount';
                    break;
            }

            const searchParams = new URLSearchParams({
                key: this.config.apiKey,
                type: 'video',
                videoCategoryId: '10', // Music category
                part: 'snippet',
                maxResults: maxResults.toString(),
                order,
            });

            if (publishedAfter) {
                searchParams.append('publishedAfter', publishedAfter);
            }

            const response = await fetch(`${YOUTUBE_API_BASE}/search?${searchParams}`);

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();
            return this.processVideoResults(data.items || []);
        } catch (error) {
            console.error('YouTube Music category error:', error);
            throw new Error('Failed to fetch music by category');
        }
    }

    /**
     * Get video details including duration and statistics
     */
    async getVideoDetails(videoIds: string[]): Promise<YouTubeMusicTrack[]> {
        try {
            const searchParams = new URLSearchParams({
                key: this.config.apiKey,
                id: videoIds.join(','),
                part: 'snippet,contentDetails,statistics',
            });

            const response = await fetch(`${YOUTUBE_API_BASE}/videos?${searchParams}`);

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();
            return this.processVideoResults(data.items || []);
        } catch (error) {
            console.error('YouTube video details error:', error);
            throw new Error('Failed to fetch video details');
        }
    }

    /**
     * Search for specific tracks with enhanced metadata
     */
    async searchTracks(
        query: string,
        artist?: string,
        maxResults: number = 10
    ): Promise<MusicTrack[]> {
        try {
            const searchQuery = artist ? `${query} ${artist}` : query;
            const searchParams = new URLSearchParams({
                key: this.config.apiKey,
                q: searchQuery,
                type: 'video',
                videoCategoryId: '10',
                part: 'snippet',
                maxResults: maxResults.toString(),
                order: 'relevance',
            });

            const response = await fetch(`${YOUTUBE_API_BASE}/search?${searchParams}`);

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();
            const tracks = await this.processVideoResults(data.items || []);

            return tracks.map(this.convertToMusicTrack);
        } catch (error) {
            console.error('YouTube track search error:', error);
            throw new Error('Failed to search tracks');
        }
    }

    /**
     * Get playlist tracks
     */
    async getPlaylistTracks(
        playlistId: string,
        maxResults: number = 50
    ): Promise<MusicTrack[]> {
        try {
            const searchParams = new URLSearchParams({
                key: this.config.apiKey,
                playlistId,
                part: 'snippet',
                maxResults: maxResults.toString(),
            });

            const response = await fetch(`${YOUTUBE_API_BASE}/playlistItems?${searchParams}`);

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();
            const videoIds = (data.items || []).map((item: any) => item.snippet?.resourceId?.videoId).filter(Boolean);

            if (videoIds.length === 0) return [];

            const tracks = await this.getVideoDetails(videoIds);
            return tracks.map(this.convertToMusicTrack);
        } catch (error) {
            console.error('YouTube playlist error:', error);
            throw new Error('Failed to fetch playlist tracks');
        }
    }

    /**
     * Process search results into structured data
     */
    private processSearchResults(items: any[]): YouTubeMusicSearchResult {
        const videos: YouTubeMusicVideo[] = [];
        const artists: YouTubeMusicArtist[] = [];
        const albums: YouTubeMusicAlbum[] = [];

        items.forEach(item => {
            if (item.id?.videoId) {
                const video = this.processVideoItem(item);
                videos.push(video);
            }
        });

        return { videos, artists, albums };
    }

    /**
     * Process video items into YouTubeMusicVideo format
     */
    private processVideoItems(items: any[]): YouTubeMusicVideo[] {
        return items.map(item => this.processVideoItem(item));
    }

    /**
     * Process single video item
     */
    private processVideoItem(item: any): YouTubeMusicVideo {
        const snippet = item.snippet;
        return {
            videoId: item.id?.videoId || item.id,
            title: snippet?.title || '',
            artist: this.extractArtistFromTitle(snippet?.title || ''),
            duration: 0, // Will be filled by getVideoDetails
            thumbnail: snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url || '',
            viewCount: 0, // Will be filled by getVideoDetails
            publishedAt: snippet?.publishedAt,
        };
    }

    /**
     * Process video results with detailed information
     */
    private async processVideoResults(items: any[]): Promise<YouTubeMusicTrack[]> {
        const tracks: YouTubeMusicTrack[] = [];

        for (const item of items) {
            if (!item.id?.videoId) continue;

            const snippet = item.snippet;
            const contentDetails = item.contentDetails;
            const statistics = item.statistics;

            // Parse duration from ISO 8601 format (PT4M13S -> 253)
            const duration = this.parseDuration(contentDetails?.duration || 'PT0S');

            tracks.push({
                videoId: item.id.videoId,
                title: snippet?.title || '',
                artist: this.extractArtistFromTitle(snippet?.title || ''),
                duration,
                thumbnail: snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url || '',
                genre: this.extractGenreFromTags(snippet?.tags || []),
                releaseDate: snippet?.publishedAt,
                explicit: this.checkExplicitContent(snippet?.title || ''),
            });
        }

        return tracks;
    }

    /**
     * Convert YouTubeMusicTrack to MusicTrack
     */
    private convertToMusicTrack = (ytTrack: YouTubeMusicTrack): MusicTrack => {
        return {
            id: ytTrack.videoId,
            youtube_id: ytTrack.videoId,
            title: ytTrack.title,
            artist: ytTrack.artist,
            duration: ytTrack.duration,
            thumbnail_url: ytTrack.thumbnail,
            genre: ytTrack.genre,
            release_date: ytTrack.releaseDate,
            is_explicit: ytTrack.explicit,
            popularity: 0, // Will be populated from analytics
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    };

    /**
     * Extract artist name from video title
     */
    private extractArtistFromTitle(title: string): string {
        // Common patterns: "Artist - Song", "Artist: Song", "Song by Artist"
        const patterns = [
            /^(.+?)\s*[-:]\s*(.+)$/, // "Artist - Song"
            /^(.+?)\s+by\s+(.+)$/i,  // "Song by Artist"
            /^(.+?)\s*\|\s*(.+)$/,   // "Artist | Song"
        ];

        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        // If no pattern matches, assume first part is artist
        const parts = title.split(' ');
        return parts.length > 1 ? parts[0] : 'Unknown Artist';
    }

    /**
     * Extract genre from video tags
     */
    private extractGenreFromTags(tags: string[]): string {
        const musicGenres = [
            'pop', 'rock', 'hip hop', 'rap', 'country', 'jazz', 'classical',
            'electronic', 'dance', 'house', 'techno', 'trance', 'ambient',
            'folk', 'blues', 'r&b', 'soul', 'reggae', 'metal', 'punk',
            'indie', 'alternative', 'funk', 'disco', 'techno'
        ];

        const lowerTags = tags.map(tag => tag.toLowerCase());
        const foundGenre = musicGenres.find(genre =>
            lowerTags.some(tag => tag.includes(genre))
        );

        return foundGenre || 'Unknown';
    }

    /**
     * Check if content contains explicit language
     */
    private checkExplicitContent(title: string): boolean {
        const explicitKeywords = [
            'explicit', 'clean', 'radio edit', 'censored', 'uncensored',
            'remix explicit', 'clean version', 'radio version'
        ];

        const lowerTitle = title.toLowerCase();
        return explicitKeywords.some(keyword => lowerTitle.includes(keyword));
    }

    /**
     * Parse ISO 8601 duration to seconds
     */
    private parseDuration(duration: string): number {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;

        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');

        return hours * 3600 + minutes * 60 + seconds;
    }

    /**
     * Search with advanced filters
     */
    async searchWithFilters(
        query: string,
        filters?: MusicSearchFilters,
        maxResults: number = 25
    ): Promise<MusicSearchResults> {
        try {
            let searchQuery = query;

            // Apply filters to search query
            if (filters?.genre && filters.genre.length > 0) {
                searchQuery += ` ${filters.genre.join(' ')}`;
            }

            if (filters?.artist && filters.artist.length > 0) {
                searchQuery += ` ${filters.artist.join(' ')}`;
            }

            const results = await this.searchMusic(searchQuery, undefined, maxResults);

            // Convert to MusicTrack format
            const tracks = await Promise.all(
                results.videos.map(async (video) => {
                    const details = await this.getVideoDetails([video.videoId]);
                    return details.length > 0 ? this.convertToMusicTrack(details[0]) : null;
                })
            );

            const validTracks = tracks.filter(track => track !== null) as MusicTrack[];

            // Apply client-side filtering
            let filteredTracks = validTracks;

            if (filters) {
                if (filters.duration_min) {
                    filteredTracks = filteredTracks.filter(
                        track => (track.duration || 0) >= (filters.duration_min || 0)
                    );
                }

                if (filters.duration_max) {
                    filteredTracks = filteredTracks.filter(
                        track => (track.duration || 0) <= (filters.duration_max || 0)
                    );
                }

                if (filters.explicit !== undefined) {
                    filteredTracks = filteredTracks.filter(
                        track => track.is_explicit === filters.explicit
                    );
                }

                if (filters.popularity_min) {
                    filteredTracks = filteredTracks.filter(
                        track => (track.popularity || 0) >= (filters.popularity_min || 0)
                    );
                }

                if (filters.language && filters.language.length > 0) {
                    filteredTracks = filteredTracks.filter(
                        track => !track.language || filters.language!.includes(track.language)
                    );
                }
            }

            return {
                tracks: filteredTracks,
                artists: [], // TODO: Implement artist search
                albums: [], // TODO: Implement album search
                playlists: [], // TODO: Implement playlist search
                totalResults: filteredTracks.length,
                searchQuery: query,
                filters,
                sortBy: 'relevance',
                sortOrder: 'desc',
            };
        } catch (error) {
            console.error('Filtered search error:', error);
            throw new Error('Failed to search with filters');
        }
    }
}

// Export singleton instance
export const createYouTubeMusicService = (config: YouTubeMusicConfig) =>
    new YouTubeMusicService(config);

export default YouTubeMusicService;