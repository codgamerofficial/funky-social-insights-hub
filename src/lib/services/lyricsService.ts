/**
 * Lyrics Service
 * Integration with multiple lyrics providers for song lyrics
 */

import { TrackLyrics, SyncedLyricsLine } from '@/types/music';

interface LyricsSearchResult {
    lyrics: string;
    source: 'musixmatch' | 'azlyrics' | 'genius' | 'ovh' | 'manual';
    hasTimestamps: boolean;
    language: string;
}

interface LyricsProvider {
    name: string;
    searchLyrics: (artist: string, title: string) => Promise<LyricsSearchResult | null>;
    rateLimit: number; // requests per minute
}

class LyricsService {
    private providers: LyricsProvider[] = [];
    private cache: Map<string, TrackLyrics> = new Map();
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    constructor() {
        // Initialize lyrics providers
        this.initializeProviders();
    }

    private initializeProviders() {
        // OVH Lyrics API (Free, no API key required)
        this.providers.push({
            name: 'ovh',
            rateLimit: 100,
            searchLyrics: this.searchOVHLyrics.bind(this),
        });

        // Add other providers when API keys are available
        // this.providers.push({
        //     name: 'musixmatch',
        //     rateLimit: 30,
        //     searchLyrics: this.searchMusixmatchLyrics.bind(this),
        // });

        // this.providers.push({
        //     name: 'genius',
        //     rateLimit: 60,
        //     searchLyrics: this.searchGeniusLyrics.bind(this),
        // });
    }

    /**
     * Search for lyrics by artist and title
     */
    async searchLyrics(artist: string, title: string): Promise<TrackLyrics | null> {
        try {
            // Check cache first
            const cacheKey = `${artist.toLowerCase()}-${title.toLowerCase()}`;
            const cached = this.cache.get(cacheKey);

            if (cached && this.isCacheValid(cached)) {
                return cached;
            }

            // Try each provider until we find lyrics
            for (const provider of this.providers) {
                try {
                    const result = await provider.searchLyrics(artist, title);

                    if (result) {
                        const lyrics: TrackLyrics = {
                            track_id: cacheKey,
                            lyrics: result.lyrics,
                            synced_lyrics: this.parseSyncedLyrics(result.lyrics, result.hasTimestamps),
                            language: result.language,
                            has_timestamps: result.hasTimestamps,
                            source: result.source,
                        };

                        // Cache the result
                        this.cache.set(cacheKey, lyrics);

                        return lyrics;
                    }
                } catch (error) {
                    console.warn(`Lyrics provider ${provider.name} failed:`, error);
                    continue;
                }
            }

            return null;
        } catch (error) {
            console.error('Failed to search lyrics:', error);
            return null;
        }
    }

    /**
     * Search lyrics using OVH API (Free service)
     */
    private async searchOVHLyrics(artist: string, title: string): Promise<LyricsSearchResult | null> {
        try {
            // Clean up artist and title for API
            const cleanArtist = this.cleanSearchTerm(artist);
            const cleanTitle = this.cleanSearchTerm(title);

            const response = await fetch(
                `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (!data.lyrics) {
                return null;
            }

            return {
                lyrics: data.lyrics.trim(),
                source: 'ovh',
                hasTimestamps: false, // OVH doesn't provide timestamps
                language: this.detectLanguage(data.lyrics),
            };
        } catch (error) {
            console.error('OVH lyrics search failed:', error);
            return null;
        }
    }

    /**
     * Search lyrics using Musixmatch API (requires API key)
     */
    private async searchMusixmatchLyrics(artist: string, title: string): Promise<LyricsSearchResult | null> {
        const apiKey = import.meta.env.VITE_MUSIXMATCH_API_KEY;
        if (!apiKey) {
            throw new Error('Musixmatch API key not configured');
        }

        try {
            // First, search for the track
            const searchResponse = await fetch(
                `https://api.musixmatch.com/ws/1.1/track.search?apikey=${apiKey}&q_artist=${encodeURIComponent(artist)}&q_track=${encodeURIComponent(title)}&format=json&page_size=1`
            );

            if (!searchResponse.ok) {
                return null;
            }

            const searchData = await searchResponse.json();
            const track = searchData.message?.body?.track_list?.[0]?.track;

            if (!track) {
                return null;
            }

            // Get the lyrics
            const lyricsResponse = await fetch(
                `https://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=${apiKey}&track_id=${track.track_id}&format=json`
            );

            if (!lyricsResponse.ok) {
                return null;
            }

            const lyricsData = await lyricsResponse.json();
            const lyrics = lyricsData.message?.body?.lyrics?.lyrics_body;

            if (!lyrics) {
                return null;
            }

            return {
                lyrics: lyrics.replace('******* This Lyrics is NOT for Commercial use *******', '').trim(),
                source: 'musixmatch',
                hasTimestamps: false, // Musixmatch has restrictions on timestamp access
                language: track.language || 'en',
            };
        } catch (error) {
            console.error('Musixmatch lyrics search failed:', error);
            return null;
        }
    }

    /**
     * Search lyrics using Genius API (requires API key)
     */
    private async searchGeniusLyrics(artist: string, title: string): Promise<LyricsSearchResult | null> {
        const apiKey = import.meta.env.VITE_GENIUS_API_KEY;
        if (!apiKey) {
            throw new Error('Genius API key not configured');
        }

        try {
            // Search for the song
            const searchResponse = await fetch(
                `https://api.genius.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                    },
                }
            );

            if (!searchResponse.ok) {
                return null;
            }

            const searchData = await searchResponse.json();
            const song = searchData.response?.hits?.[0]?.result;

            if (!song) {
                return null;
            }

            // Get the song details and lyrics URL
            const songResponse = await fetch(
                `https://api.genius.com/songs/${song.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                    },
                }
            );

            if (!songResponse.ok) {
                return null;
            }

            const songData = await songResponse.json();
            const lyricsUrl = songData.response?.song?.lyrics_url;

            if (!lyricsUrl) {
                return null;
            }

            // In a real implementation, you'd need to scrape the lyrics page
            // or use a different approach since Genius API doesn't provide lyrics directly
            // This is a simplified version

            return {
                lyrics: 'Lyrics not available through API. Please visit the Genius page.',
                source: 'genius',
                hasTimestamps: false,
                language: 'en',
            };
        } catch (error) {
            console.error('Genius lyrics search failed:', error);
            return null;
        }
    }

    /**
     * Parse synced lyrics (LRC format)
     */
    private parseSyncedLyrics(lyrics: string, hasTimestamps: boolean): SyncedLyricsLine[] | undefined {
        if (!hasTimestamps) {
            return undefined;
        }

        const lines: SyncedLyricsLine[] = [];
        const lrcPattern = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?\]\s*(.+)/g;

        let match;
        while ((match = lrcPattern.exec(lyrics)) !== null) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const centiseconds = match[3] ? parseInt(match[3], 10) : 0;
            const text = match[4].trim();

            const timeInSeconds = minutes * 60 + seconds + (centiseconds / 100);

            lines.push({
                time: timeInSeconds,
                text,
            });
        }

        return lines.length > 0 ? lines.sort((a, b) => a.time - b.time) : undefined;
    }

    /**
     * Clean search terms for better API results
     */
    private cleanSearchTerm(term: string): string {
        return term
            .toLowerCase()
            .replace(/\(.*?\)/g, '') // Remove parenthetical content
            .replace(/\[.*?\]/g, '') // Remove bracketed content
            .replace(/feat\..*/g, '') // Remove featuring artists
            .replace(/ft\..*/g, '') // Remove featuring artists (short form)
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    /**
     * Detect language of lyrics text
     */
    private detectLanguage(text: string): string {
        // Simple language detection - in a real app, you'd use a proper language detection library
        const englishIndicators = ['the', 'and', 'of', 'to', 'a', 'in', 'is', 'you', 'that', 'it'];
        const textWords = text.toLowerCase().split(/\s+/);

        const englishMatches = textWords.filter(word => englishIndicators.includes(word)).length;
        const englishRatio = englishMatches / textWords.length;

        return englishRatio > 0.05 ? 'en' : 'unknown';
    }

    /**
     * Check if cached lyrics is still valid
     */
    private isCacheValid(lyrics: TrackLyrics): boolean {
        // For now, always return true - in a real app, you'd track when it was cached
        return true;
    }

    /**
     * Get lyrics by track ID
     */
    async getLyricsByTrackId(trackId: string, artist: string, title: string): Promise<TrackLyrics | null> {
        return this.searchLyrics(artist, title);
    }

    /**
     * Search for lyrics with multiple query variations
     */
    async searchLyricsWithVariations(artist: string, title: string): Promise<TrackLyrics | null> {
        const variations = [
            { artist, title },
            { artist: artist.replace(/\s+\(.*?\)/g, ''), title }, // Remove (feat...) from artist
            { artist, title: title.replace(/\s+\(.*?\)/g, '') }, // Remove (feat...) from title
            { artist: artist.replace(/feat\..*/gi, ''), title }, // Remove featuring artists
        ];

        for (const variation of variations) {
            const lyrics = await this.searchLyrics(variation.artist, variation.title);
            if (lyrics) {
                return lyrics;
            }
        }

        return null;
    }

    /**
     * Submit manual lyrics correction
     */
    async submitLyricsCorrection(
        trackId: string,
        artist: string,
        title: string,
        correctedLyrics: string
    ): Promise<void> {
        try {
            // In a real implementation, this would submit to a database
            // or send to a lyrics moderation system

            const correctedTrackLyrics: TrackLyrics = {
                track_id: trackId,
                lyrics: correctedLyrics,
                language: this.detectLanguage(correctedLyrics),
                has_timestamps: false,
                source: 'manual',
            };

            // Cache the corrected lyrics
            const cacheKey = `${artist.toLowerCase()}-${title.toLowerCase()}`;
            this.cache.set(cacheKey, correctedTrackLyrics);

            console.log('Lyrics correction submitted:', {
                trackId,
                artist,
                title,
                correctedLyrics: correctedLyrics.substring(0, 100) + '...'
            });
        } catch (error) {
            console.error('Failed to submit lyrics correction:', error);
            throw error;
        }
    }

    /**
     * Get popular lyrics for trending songs
     */
    async getPopularLyrics(): Promise<Array<{
        artist: string;
        title: string;
        lyrics: string;
        popularity: number;
    }>> {
        // Mock data - in a real app, this would query popular songs
        return [
            {
                artist: 'Taylor Swift',
                title: 'Anti-Hero',
                lyrics: 'I have this thing where I get older, but just never wiser...',
                popularity: 95,
            },
            {
                artist: 'Bad Bunny',
                title: 'Tití Me Preguntó',
                lyrics: 'Tití me preguntó si tengo novia, le dije que no...',
                popularity: 92,
            },
            {
                artist: 'The Weeknd',
                title: 'Creepin\' (Remix)',
                lyrics: 'She say that I\'m the one, but I ain\'t her only one...',
                popularity: 89,
            },
        ];
    }

    /**
     * Clear lyrics cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; providers: string[] } {
        return {
            size: this.cache.size,
            providers: this.providers.map(p => p.name),
        };
    }
}

// Export singleton instance
export const createLyricsService = () => new LyricsService();

export default LyricsService;