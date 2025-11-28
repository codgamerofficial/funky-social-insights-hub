/**
 * Music Discovery and Recommendations Service
 * Advanced recommendation engine based on user behavior and trends
 */

import {
    MusicTrack,
    UserProfile,
    MusicRecommendation,
    MusicAnalytics,
    ListeningHistory,
    UserMusicStats,
    GenreStats,
    ArtistStats,
    YouTubeMusicTrack
} from '@/types/music';
import { createYouTubeMusicService } from './youtubeMusicService';

interface RecommendationConfig {
    maxRecommendations: number;
    diversityWeight: number;
    popularityWeight: number;
    noveltyWeight: number;
    userHistoryWeight: number;
}

interface ListeningPattern {
    genrePreferences: Record<string, number>;
    artistPreferences: Record<string, number>;
    timeOfDayPreferences: Record<number, number>;
    dayOfWeekPreferences: Record<number, number>;
    sessionLength: number;
    completionRate: number;
}

class MusicRecommendationService {
    private youtubeMusicService;
    private config: RecommendationConfig;

    constructor() {
        this.youtubeMusicService = createYouTubeMusicService({
            apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
        });

        this.config = {
            maxRecommendations: 20,
            diversityWeight: 0.3,
            popularityWeight: 0.2,
            noveltyWeight: 0.2,
            userHistoryWeight: 0.3,
        };
    }

    /**
     * Generate personalized music recommendations for a user
     */
    async generateRecommendations(
        userId: string,
        userHistory: ListeningHistory[],
        userProfile: UserProfile | null,
        excludeTrackIds: string[] = []
    ): Promise<MusicRecommendation[]> {
        try {
            // Analyze user listening patterns
            const listeningPatterns = await this.analyzeListeningPatterns(userHistory);

            // Get user's favorite genres and artists
            const genrePreferences = this.extractGenrePreferences(userHistory);
            const artistPreferences = this.extractArtistPreferences(userHistory);

            // Generate different types of recommendations
            const recommendations: MusicRecommendation[] = [];

            // 1. Collaborative filtering (similar users)
            const collaborativeRecs = await this.getCollaborativeRecommendations(
                userId,
                userHistory,
                excludeTrackIds
            );
            recommendations.push(...collaborativeRecs);

            // 2. Content-based recommendations
            const contentRecs = await this.getContentBasedRecommendations(
                genrePreferences,
                artistPreferences,
                excludeTrackIds
            );
            recommendations.push(...contentRecs);

            // 3. Trending music
            const trendingRecs = await this.getTrendingRecommendations(excludeTrackIds);
            recommendations.push(...trendingRecs);

            // 4. New releases
            const newReleaseRecs = await this.getNewReleaseRecommendations(excludeTrackIds);
            recommendations.push(...newReleaseRecs);

            // 5. Mood-based recommendations
            const moodRecs = await this.getMoodBasedRecommendations(
                listeningPatterns,
                excludeTrackIds
            );
            recommendations.push(...moodRecs);

            // Remove duplicates and sort by confidence score
            const uniqueRecs = this.deduplicateRecommendations(recommendations);
            const sortedRecs = uniqueRecs.sort((a, b) =>
                (b.confidence_score || 0) - (a.confidence_score || 0)
            );

            return sortedRecs.slice(0, this.config.maxRecommendations);

        } catch (error) {
            console.error('Failed to generate recommendations:', error);
            throw new Error('Failed to generate music recommendations');
        }
    }

    /**
     * Get personalized discovery feed with mixed content types
     */
    async getDiscoveryFeed(
        userId: string,
        userHistory: ListeningHistory[],
        limit: number = 50
    ): Promise<{
        trending: MusicTrack[];
        newReleases: MusicTrack[];
        recommended: MusicTrack[];
        genres: MusicTrack[];
        similarArtists: MusicTrack[];
    }> {
        try {
            const excludeTrackIds = userHistory.map(h => h.track_id);

            // Get trending music
            const trendingTracks = await this.youtubeMusicService.getMusicByCategory('trending', 10);

            // Get new releases
            const newReleaseTracks = await this.youtubeMusicService.getMusicByCategory('new', 10);

            // Get personalized recommendations
            const recommendations = await this.generateRecommendations(
                userId,
                userHistory,
                null,
                excludeTrackIds
            );

            // Get genre-based recommendations
            const genreTracks = await this.getGenreBasedRecommendations(userHistory, 10);

            // Get similar artist recommendations
            const similarArtistTracks = await this.getSimilarArtistRecommendations(userHistory, 10);

            // Convert to MusicTrack format and remove excluded tracks
            const convertAndFilter = (tracks: YouTubeMusicTrack[]): MusicTrack[] => {
                return tracks
                    .map(track => ({
                        id: track.videoId,
                        youtube_id: track.videoId,
                        title: track.title,
                        artist: track.artist,
                        duration: track.duration,
                        thumbnail_url: track.thumbnail,
                        genre: track.genre,
                        release_date: track.releaseDate,
                        is_explicit: track.explicit,
                        popularity: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }))
                    .filter(track => !excludeTrackIds.includes(track.youtube_id))
                    .slice(0, limit / 5); // Distribute across categories
            };

            return {
                trending: convertAndFilter(trendingTracks),
                newReleases: convertAndFilter(newReleaseTracks),
                recommended: recommendations.slice(0, limit / 5).map(r => r.track!).filter(Boolean) as MusicTrack[],
                genres: convertAndFilter(genreTracks),
                similarArtists: convertAndFilter(similarArtistTracks),
            };

        } catch (error) {
            console.error('Failed to get discovery feed:', error);
            throw new Error('Failed to fetch discovery content');
        }
    }

    /**
     * Analyze user's listening patterns for better recommendations
     */
    private async analyzeListeningPatterns(history: ListeningHistory[]): Promise<ListeningPattern> {
        const patterns: ListeningPattern = {
            genrePreferences: {},
            artistPreferences: {},
            timeOfDayPreferences: {},
            dayOfWeekPreferences: {},
            sessionLength: 0,
            completionRate: 0,
        };

        if (history.length === 0) return patterns;

        // Analyze listening times
        history.forEach(listening => {
            if (listening.listened_at) {
                const date = new Date(listening.listened_at);
                const hour = date.getHours();
                const dayOfWeek = date.getDay();

                patterns.timeOfDayPreferences[hour] = (patterns.timeOfDayPreferences[hour] || 0) + 1;
                patterns.dayOfWeekPreferences[dayOfWeek] = (patterns.dayOfWeekPreferences[dayOfWeek] || 0) + 1;
            }
        });

        // Calculate completion rate
        const totalDuration = history.reduce((sum, h) => sum + (h.duration_listened || 0), 0);
        const expectedDuration = history.reduce((sum, h) => sum + ((h.track?.duration || 0) * (h.completion_percentage || 0) / 100), 0);
        patterns.completionRate = expectedDuration > 0 ? (totalDuration / expectedDuration) * 100 : 0;

        // Calculate session length (average time between tracks)
        const sortedHistory = history.sort((a, b) =>
            new Date(a.listened_at || 0).getTime() - new Date(b.listened_at || 0).getTime()
        );

        if (sortedHistory.length > 1) {
            let totalSessionTime = 0;
            let sessionCount = 0;

            for (let i = 1; i < sortedHistory.length; i++) {
                const timeDiff = new Date(sortedHistory[i].listened_at || 0).getTime() -
                    new Date(sortedHistory[i - 1].listened_at || 0).getTime();

                // If less than 30 minutes between tracks, consider it same session
                if (timeDiff < 30 * 60 * 1000) {
                    totalSessionTime += timeDiff;
                    sessionCount++;
                }
            }

            patterns.sessionLength = sessionCount > 0 ? totalSessionTime / sessionCount : 0;
        }

        return patterns;
    }

    /**
     * Extract genre preferences from user history
     */
    private extractGenrePreferences(history: ListeningHistory[]): Record<string, number> {
        const genreCounts: Record<string, number> = {};
        let totalListeningTime = 0;

        history.forEach(listening => {
            if (listening.track?.genre) {
                const listeningTime = listening.duration_listened || 0;
                genreCounts[listening.track.genre] = (genreCounts[listening.track.genre] || 0) + listeningTime;
                totalListeningTime += listeningTime;
            }
        });

        // Convert to percentages
        const preferences: Record<string, number> = {};
        Object.entries(genreCounts).forEach(([genre, count]) => {
            preferences[genre] = (count / totalListeningTime) * 100;
        });

        return preferences;
    }

    /**
     * Extract artist preferences from user history
     */
    private extractArtistPreferences(history: ListeningHistory[]): Record<string, number> {
        const artistCounts: Record<string, number> = {};
        let totalListeningTime = 0;

        history.forEach(listening => {
            if (listening.track?.artist) {
                const listeningTime = listening.duration_listened || 0;
                artistCounts[listening.track.artist] = (artistCounts[listening.track.artist] || 0) + listeningTime;
                totalListeningTime += listeningTime;
            }
        });

        // Convert to percentages
        const preferences: Record<string, number> = {};
        Object.entries(artistCounts).forEach(([artist, count]) => {
            preferences[artist] = (count / totalListeningTime) * 100;
        });

        return preferences;
    }

    /**
     * Get collaborative filtering recommendations
     */
    private async getCollaborativeRecommendations(
        userId: string,
        userHistory: ListeningHistory[],
        excludeTrackIds: string[]
    ): Promise<MusicRecommendation[]> {
        // Mock implementation - in real app, this would analyze similar users
        const recommendations: MusicRecommendation[] = [];

        // For now, return trending tracks as "collaborative" recommendations
        const trendingTracks = await this.youtubeMusicService.getMusicByCategory('trending', 5);

        trendingTracks.forEach((track, index) => {
            recommendations.push({
                id: `collab-${track.videoId}`,
                user_id: userId,
                track_id: track.videoId,
                recommendation_type: 'similar_users',
                confidence_score: 85 - (index * 5), // Decreasing confidence
                created_at: new Date().toISOString(),
                clicked: false,
                liked: false,
            });
        });

        return recommendations;
    }

    /**
     * Get content-based recommendations
     */
    private async getContentBasedRecommendations(
        genrePreferences: Record<string, number>,
        artistPreferences: Record<string, number>,
        excludeTrackIds: string[]
    ): Promise<MusicRecommendation[]> {
        const recommendations: MusicRecommendation[] = [];

        // Search for music based on preferred genres
        const topGenres = Object.entries(genrePreferences)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([genre]) => genre);

        for (const genre of topGenres) {
            try {
                const searchResults = await this.youtubeMusicService.searchTracks(genre, '', 3);

                searchResults.forEach((track, index) => {
                    if (!excludeTrackIds.includes(track.youtube_id)) {
                        recommendations.push({
                            id: `content-${track.youtube_id}`,
                            user_id: '', // Will be set by caller
                            track_id: track.youtube_id,
                            recommendation_type: 'based_on_listening',
                            confidence_score: (genrePreferences[genre] || 0) - (index * 10),
                            created_at: new Date().toISOString(),
                            clicked: false,
                            liked: false,
                        });
                    }
                });
            } catch (error) {
                console.error(`Failed to get recommendations for genre ${genre}:`, error);
            }
        }

        return recommendations;
    }

    /**
     * Get trending recommendations
     */
    private async getTrendingRecommendations(excludeTrackIds: string[]): Promise<MusicRecommendation[]> {
        const recommendations: MusicRecommendation[] = [];

        const trendingTracks = await this.youtubeMusicService.getMusicByCategory('trending', 5);

        trendingTracks.forEach((track, index) => {
            if (!excludeTrackIds.includes(track.videoId)) {
                recommendations.push({
                    id: `trending-${track.videoId}`,
                    user_id: '', // Will be set by caller
                    track_id: track.videoId,
                    recommendation_type: 'trending',
                    confidence_score: 90 - (index * 8),
                    created_at: new Date().toISOString(),
                    clicked: false,
                    liked: false,
                });
            }
        });

        return recommendations;
    }

    /**
     * Get new release recommendations
     */
    private async getNewReleaseRecommendations(excludeTrackIds: string[]): Promise<MusicRecommendation[]> {
        const recommendations: MusicRecommendation[] = [];

        const newReleases = await this.youtubeMusicService.getMusicByCategory('new', 5);

        newReleases.forEach((track, index) => {
            if (!excludeTrackIds.includes(track.videoId)) {
                recommendations.push({
                    id: `new-${track.videoId}`,
                    user_id: '', // Will be set by caller
                    track_id: track.videoId,
                    recommendation_type: 'trending',
                    confidence_score: 80 - (index * 6),
                    created_at: new Date().toISOString(),
                    clicked: false,
                    liked: false,
                });
            }
        });

        return recommendations;
    }

    /**
     * Get mood-based recommendations
     */
    private async getMoodBasedRecommendations(
        patterns: ListeningPattern,
        excludeTrackIds: string[]
    ): Promise<MusicRecommendation[]> {
        const recommendations: MusicRecommendation[] = [];

        // Determine user's current mood based on listening patterns
        const currentHour = new Date().getHours();
        const isEvening = currentHour >= 18 || currentHour <= 23;
        const isWorkTime = currentHour >= 9 && currentHour <= 17;

        let moodQuery = '';
        if (isEvening) {
            moodQuery = 'relaxing evening music';
        } else if (isWorkTime) {
            moodQuery = 'focused work music';
        } else {
            moodQuery = 'energetic music';
        }

        try {
            const moodTracks = await this.youtubeMusicService.searchTracks(moodQuery, '', 3);

            moodTracks.forEach((track, index) => {
                if (!excludeTrackIds.includes(track.youtube_id)) {
                    recommendations.push({
                        id: `mood-${track.youtube_id}`,
                        user_id: '', // Will be set by caller
                        track_id: track.youtube_id,
                        recommendation_type: 'mood_based',
                        confidence_score: 75 - (index * 10),
                        created_at: new Date().toISOString(),
                        clicked: false,
                        liked: false,
                    });
                }
            });
        } catch (error) {
            console.error('Failed to get mood-based recommendations:', error);
        }

        return recommendations;
    }

    /**
     * Get genre-based recommendations
     */
    private async getGenreBasedRecommendations(history: ListeningHistory[], limit: number): Promise<YouTubeMusicTrack[]> {
        const topGenres = this.extractGenrePreferences(history);
        const topGenre = Object.entries(topGenres).sort(([, a], [, b]) => b - a)[0]?.[0];

        if (!topGenre) return [];

        try {
            const genreTracks = await this.youtubeMusicService.searchTracks(topGenre, '', limit);
            return genreTracks.slice(0, limit);
        } catch (error) {
            console.error('Failed to get genre recommendations:', error);
            return [];
        }
    }

    /**
     * Get similar artist recommendations
     */
    private async getSimilarArtistRecommendations(history: ListeningHistory[], limit: number): Promise<YouTubeMusicTrack[]> {
        const topArtists = this.extractArtistPreferences(history);
        const topArtist = Object.entries(topArtists).sort(([, a], [, b]) => b - a)[0]?.[0];

        if (!topArtist) return [];

        try {
            const similarTracks = await this.youtubeMusicService.searchTracks('', topArtist, limit);
            return similarTracks.slice(0, limit);
        } catch (error) {
            console.error('Failed to get similar artist recommendations:', error);
            return [];
        }
    }

    /**
     * Remove duplicate recommendations
     */
    private deduplicateRecommendations(recommendations: MusicRecommendation[]): MusicRecommendation[] {
        const seen = new Set<string>();
        return recommendations.filter(rec => {
            if (seen.has(rec.track_id)) {
                return false;
            }
            seen.add(rec.track_id);
            return true;
        });
    }

    /**
     * Update recommendation feedback
     */
    async updateRecommendationFeedback(
        recommendationId: string,
        clicked: boolean,
        liked: boolean
    ): Promise<void> {
        try {
            // In a real implementation, this would update the database
            console.log('Updating recommendation feedback:', {
                recommendationId,
                clicked,
                liked
            });
        } catch (error) {
            console.error('Failed to update recommendation feedback:', error);
        }
    }
}

// Export singleton instance
export const createMusicRecommendationService = () =>
    new MusicRecommendationService();

export default MusicRecommendationService;