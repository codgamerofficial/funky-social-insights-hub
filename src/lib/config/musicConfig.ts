/**
 * Orbit Music Streaming Platform - Configuration
 * Centralized configuration for all music services and API integrations
 */

import { MusicServiceConfig } from '@/lib/services/musicService';

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

export interface MusicPlatformConfig {
    // YouTube Music API Configuration
    youtube: {
        apiKey: string;
        clientId?: string;
        clientSecret?: string;
        baseUrl: string;
        maxRequestsPerDay: number;
    };

    // Supabase Configuration
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey?: string;
    };

    // AI Services Configuration
    ai: {
        geminiApiKey?: string;
        openaiApiKey?: string;
    };

    // Music Platform Configuration
    platform: {
        name: string;
        version: string;
        maxCacheSize: number;
        enableOfflineMode: boolean;
        enableSocialFeatures: boolean;
        enableRecommendations: boolean;
        enableAnalytics: boolean;
    };

    // Feature Flags
    features: {
        socialFeatures: boolean;
        musicRecommendations: boolean;
        offlineMode: boolean;
        lyricsDisplay: boolean;
        musicSharing: boolean;
        userFollowing: boolean;
        playlistCollaboration: boolean;
        musicAnalytics: boolean;
        aiRecommendations: boolean;
        voiceSearch: boolean;
        crossfadePlayback: boolean;
        equalizerControls: boolean;
    };

    // Performance Configuration
    performance: {
        maxConcurrentRequests: number;
        requestTimeout: number;
        cacheTTL: number; // in milliseconds
        prefetchEnabled: boolean;
        lazyLoadingEnabled: boolean;
    };

    // Security Configuration
    security: {
        enableRateLimiting: boolean;
        rateLimitRequests: number;
        rateLimitWindow: number; // in milliseconds
        enableCORS: boolean;
        allowedOrigins: string[];
    };
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const defaultConfig: MusicPlatformConfig = {
    youtube: {
        apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
        clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID,
        clientSecret: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET,
        baseUrl: 'https://www.googleapis.com/youtube/v3',
        maxRequestsPerDay: 10000,
    },

    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    },

    ai: {
        geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
        openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    },

    platform: {
        name: 'Orbit Music Streaming Platform',
        version: '1.0.0',
        maxCacheSize: 1000,
        enableOfflineMode: true,
        enableSocialFeatures: true,
        enableRecommendations: true,
        enableAnalytics: true,
    },

    features: {
        socialFeatures: true,
        musicRecommendations: true,
        offlineMode: true,
        lyricsDisplay: true,
        musicSharing: true,
        userFollowing: true,
        playlistCollaboration: true,
        musicAnalytics: true,
        aiRecommendations: true,
        voiceSearch: false,
        crossfadePlayback: true,
        equalizerControls: true,
    },

    performance: {
        maxConcurrentRequests: 5,
        requestTimeout: 30000, // 30 seconds
        cacheTTL: 5 * 60 * 1000, // 5 minutes
        prefetchEnabled: true,
        lazyLoadingEnabled: true,
    },

    security: {
        enableRateLimiting: true,
        rateLimitRequests: 100,
        rateLimitWindow: 60 * 1000, // 1 minute
        enableCORS: true,
        allowedOrigins: [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://orbit-music.vercel.app',
            'https://orbit-music.netlify.app',
        ],
    },
};

// =============================================================================
// CONFIGURATION VALIDATION
// =============================================================================

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateConfig(config: MusicPlatformConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required YouTube API configuration
    if (!config.youtube.apiKey) {
        errors.push('YouTube API key is required');
    }

    // Validate Supabase configuration
    if (!config.supabase.url) {
        errors.push('Supabase URL is required');
    }

    if (!config.supabase.anonKey) {
        errors.push('Supabase anonymous key is required');
    }

    // Validate performance settings
    if (config.performance.maxConcurrentRequests <= 0) {
        errors.push('Max concurrent requests must be greater than 0');
    }

    if (config.performance.requestTimeout <= 0) {
        errors.push('Request timeout must be greater than 0');
    }

    // Validate cache settings
    if (config.platform.maxCacheSize <= 0) {
        errors.push('Max cache size must be greater than 0');
    }

    // Check for optional features
    if (!config.ai.geminiApiKey && config.features.aiRecommendations) {
        warnings.push('AI recommendations enabled but no Gemini API key provided');
    }

    if (!config.youtube.clientId && config.features.socialFeatures) {
        warnings.push('Social features enabled but no YouTube OAuth client ID provided');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

// =============================================================================
// MUSIC SERVICE CONFIGURATION CREATION
// =============================================================================

export function createMusicServiceConfig(config: MusicPlatformConfig): MusicServiceConfig {
    return {
        youtubeApiKey: config.youtube.apiKey,
        youtubeClientId: config.youtube.clientId,
        youtubeClientSecret: config.youtube.clientSecret,
        geminiApiKey: config.ai.geminiApiKey,
        maxCacheSize: config.platform.maxCacheSize,
        enableOfflineMode: config.platform.enableOfflineMode,
    };
}

// =============================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// =============================================================================

export const configurations = {
    development: {
        ...defaultConfig,
        platform: {
            ...defaultConfig.platform,
            enableOfflineMode: false, // Disable offline in development
        },
        performance: {
            ...defaultConfig.performance,
            cacheTTL: 30 * 1000, // Shorter cache in development
            prefetchEnabled: false,
        },
        security: {
            ...defaultConfig.security,
            rateLimitRequests: 1000, // More lenient in development
        },
    },

    staging: {
        ...defaultConfig,
        platform: {
            ...defaultConfig.platform,
            enableOfflineMode: true,
        },
        performance: {
            ...defaultConfig.performance,
            cacheTTL: 2 * 60 * 1000, // 2 minutes for staging
        },
    },

    production: {
        ...defaultConfig,
        platform: {
            ...defaultConfig.platform,
            enableOfflineMode: true,
            enableSocialFeatures: true,
            enableRecommendations: true,
            enableAnalytics: true,
        },
        performance: {
            ...defaultConfig.performance,
            cacheTTL: 10 * 60 * 1000, // 10 minutes for production
            prefetchEnabled: true,
        },
        security: {
            ...defaultConfig.security,
            rateLimitRequests: 100, // Stricter limits in production
            allowedOrigins: [
                'https://orbit-music.vercel.app',
                'https://orbit-music.netlify.app',
            ],
        },
    },
};

// =============================================================================
// CONFIGURATION MANAGER
// =============================================================================

class MusicConfigManager {
    private config: MusicPlatformConfig;
    private isInitialized = false;

    constructor() {
        this.config = this.getEnvironmentConfig();
        this.initialize();
    }

    private getEnvironmentConfig(): MusicPlatformConfig {
        const environment = import.meta.env.MODE || 'development';

        switch (environment) {
            case 'production':
                return configurations.production;
            case 'staging':
                return configurations.staging;
            default:
                return configurations.development;
        }
    }

    private initialize(): void {
        const validation = validateConfig(this.config);

        if (!validation.isValid) {
            console.error('Configuration validation failed:', validation.errors);
            throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
        }

        if (validation.warnings.length > 0) {
            console.warn('Configuration warnings:', validation.warnings);
        }

        this.isInitialized = true;
        console.log('Music configuration initialized for environment:', import.meta.env.MODE);
    }

    getConfig(): MusicPlatformConfig {
        if (!this.isInitialized) {
            throw new Error('Configuration not initialized');
        }
        return this.config;
    }

    getMusicServiceConfig(): MusicServiceConfig {
        return createMusicServiceConfig(this.getConfig());
    }

    updateConfig(updates: Partial<MusicPlatformConfig>): void {
        this.config = {
            ...this.config,
            ...updates,
        };
        this.initialize(); // Re-validate after update
    }

    isFeatureEnabled(feature: keyof MusicPlatformConfig['features']): boolean {
        return this.config.features[feature];
    }

    getApiEndpoints() {
        return {
            youtube: {
                search: `${this.config.youtube.baseUrl}/search`,
                videos: `${this.config.youtube.baseUrl}/videos`,
                playlists: `${this.config.youtube.baseUrl}/playlists`,
                channels: `${this.config.youtube.baseUrl}/channels`,
            },
            supabase: {
                rest: `${this.config.supabase.url}/rest/v1`,
                auth: `${this.config.supabase.url}/auth/v1`,
                realtime: `${this.config.supabase.url}/realtime/v1`,
            },
        };
    }

    getRateLimitConfig() {
        return {
            enabled: this.config.security.enableRateLimiting,
            requests: this.config.security.rateLimitRequests,
            window: this.config.security.rateLimitWindow,
        };
    }

    getCacheConfig() {
        return {
            ttl: this.config.performance.cacheTTL,
            maxSize: this.config.platform.maxCacheSize,
            enabled: true,
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const musicConfigManager = new MusicConfigManager();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getCurrentConfig(): MusicPlatformConfig {
    return musicConfigManager.getConfig();
}

export function getMusicServiceConfig(): MusicServiceConfig {
    return musicConfigManager.getMusicServiceConfig();
}

export function isFeatureEnabled(feature: keyof MusicPlatformConfig['features']): boolean {
    return musicConfigManager.isFeatureEnabled(feature);
}

export function getApiEndpoints() {
    return musicConfigManager.getApiEndpoints();
}

export function getEnvironmentInfo() {
    return {
        mode: import.meta.env.MODE,
        development: import.meta.env.DEV,
        production: import.meta.env.PROD,
        ssr: import.meta.env.SSR,
    };
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
    MusicPlatformConfig,
    MusicServiceConfig,
    ValidationResult,
};

export default musicConfigManager;