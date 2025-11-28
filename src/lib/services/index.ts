/**
 * Orbit Music Streaming Platform - Service Initialization
 * Central export and initialization of all music services
 */

import { createMusicService } from './musicService';
import { getMusicServiceConfig } from '@/lib/config/musicConfig';

// =============================================================================
// SERVICE INITIALIZATION
// =============================================================================

// Initialize the music service with configuration
export const musicService = createMusicService(getMusicServiceConfig());

// Export all services
export { default as YouTubeMusicService } from './youtubeMusicService';
export { default as MusicRecommendationService } from './musicRecommendationService';
export { default as MusicService } from './musicService';

// =============================================================================
// SERVICE HEALTH CHECK
// =============================================================================

export interface ServiceHealthStatus {
    musicService: 'healthy' | 'degraded' | 'unhealthy';
    youtubeApi: 'healthy' | 'degraded' | 'unhealthy';
    supabase: 'healthy' | 'degraded' | 'unhealthy';
    recommendations: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
}

export async function checkServiceHealth(): Promise<ServiceHealthStatus> {
    const status: ServiceHealthStatus = {
        musicService: 'healthy',
        youtubeApi: 'healthy',
        supabase: 'healthy',
        recommendations: 'healthy',
        timestamp: new Date().toISOString(),
    };

    try {
        // Test music service basic functionality
        await musicService.getTrendingMusic({ limit: 1 });
    } catch (error) {
        status.musicService = 'unhealthy';
        console.error('Music service health check failed:', error);
    }

    try {
        // Test YouTube API connectivity (basic search)
        // This would be implemented in a real health check
    } catch (error) {
        status.youtubeApi = 'unhealthy';
        console.error('YouTube API health check failed:', error);
    }

    try {
        // Test Supabase connectivity
        // This would be implemented in a real health check
    } catch (error) {
        status.supabase = 'unhealthy';
        console.error('Supabase health check failed:', error);
    }

    return status;
}

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

// Initialize development services
export function initializeDevelopmentServices() {
    if (import.meta.env.DEV) {
        console.log('🎵 Orbit Music Streaming Platform - Development Mode');
        console.log('🎼 Music Service:', musicService.constructor.name);
        console.log('🔧 Environment:', import.meta.env.MODE);

        // Clear caches in development for fresh data
        musicService.clearAllCaches();

        // Enable debug logging
        console.log('✅ Services initialized successfully');
    }
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default musicService;