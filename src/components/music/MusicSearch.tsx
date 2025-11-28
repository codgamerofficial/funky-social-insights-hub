/**
 * Music Search Interface
 * Search and discover music with YouTube integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { createYouTubeMusicService } from '@/lib/services/youtubeMusicService';
import { MusicTrack, MusicSearchFilters, MusicSearchResults } from '@/types/music';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Filter,
    Play,
    Pause,
    Plus,
    Heart,
    Clock,
    Music,
    TrendingUp,
    Disc,
    Volume2
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface MusicSearchProps {
    className?: string;
    onTrackSelect?: (track: MusicTrack) => void;
}

export const MusicSearch: React.FC<MusicSearchProps> = ({
    className,
    onTrackSelect
}) => {
    const { state, controls, playTrack } = useAudioPlayer();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MusicSearchResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<MusicSearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Initialize YouTube Music Service
    const youtubeMusicService = createYouTubeMusicService({
        apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
        maxResults: 25,
    });

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to load recent searches:', error);
            }
        }
    }, []);

    // Save recent searches to localStorage
    const saveRecentSearch = useCallback((query: string) => {
        if (!query.trim()) return;

        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    }, [recentSearches]);

    // Perform search
    const performSearch = useCallback(async (query: string, searchFilters?: MusicSearchFilters) => {
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            saveRecentSearch(query);

            const results = await youtubeMusicService.searchWithFilters(
                query,
                searchFilters || filters,
                25
            );

            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults(null);
        } finally {
            setIsLoading(false);
        }
    }, [youtubeMusicService, filters, saveRecentSearch]);

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            performSearch(searchQuery.trim());
        }
    };

    // Handle search suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        setSearchQuery(suggestion);
        performSearch(suggestion);
    };

    // Play track
    const handlePlayTrack = (track: MusicTrack, index: number = 0) => {
        if (onTrackSelect) {
            onTrackSelect(track);
        } else {
            const playlist = searchResults?.tracks || [track];
            playTrack(track, playlist, index);
        }
    };

    // Toggle favorite
    const toggleFavorite = (trackId: string) => {
        setFavorites(prev => {
            const updated = new Set(prev);
            if (updated.has(trackId)) {
                updated.delete(trackId);
            } else {
                updated.add(trackId);
            }
            return updated;
        });
    };

    // Add to queue
    const handleAddToQueue = (track: MusicTrack) => {
        controls.addToQueue(track);
    };

    const formatDuration = (seconds: number): string => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Quick search categories
    const quickSearches = [
        { label: 'Trending', icon: TrendingUp, query: 'trending music' },
        { label: 'New Releases', icon: Disc, query: 'new music 2024' },
        { label: 'Pop', icon: Music, query: 'pop music' },
        { label: 'Rock', icon: Volume2, query: 'rock music' },
        { label: 'Hip Hop', icon: Music, query: 'hip hop rap' },
        { label: 'Electronic', icon: Volume2, query: 'electronic dance' },
    ];

    return (
        <div className={cn("space-y-6", className)}>
            {/* Search Header */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Search Music</h1>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search for songs, artists, albums..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
                        {isLoading ? 'Searching...' : 'Search'}
                    </Button>

                    {/* Filters Sheet */}
                    <Sheet open={showFilters} onOpenChange={setShowFilters}>
                        <SheetTrigger asChild>
                            <Button variant="outline">
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Search Filters</SheetTitle>
                                <SheetDescription>
                                    Refine your music search results
                                </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-6 mt-6">
                                {/* Genre Filter */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Genre</label>
                                    <Select
                                        value={filters.genre?.[0] || ''}
                                        onValueChange={(value) =>
                                            setFilters(prev => ({
                                                ...prev,
                                                genre: value ? [value] : undefined
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select genre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Genres</SelectItem>
                                            <SelectItem value="pop">Pop</SelectItem>
                                            <SelectItem value="rock">Rock</SelectItem>
                                            <SelectItem value="hip hop">Hip Hop</SelectItem>
                                            <SelectItem value="electronic">Electronic</SelectItem>
                                            <SelectItem value="jazz">Jazz</SelectItem>
                                            <SelectItem value="classical">Classical</SelectItem>
                                            <SelectItem value="country">Country</SelectItem>
                                            <SelectItem value="r&b">R&B</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Duration Filter */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Min Duration</label>
                                        <Select
                                            value={filters.duration_min?.toString() || ''}
                                            onValueChange={(value) =>
                                                setFilters(prev => ({
                                                    ...prev,
                                                    duration_min: value ? parseInt(value) : undefined
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Min" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Any</SelectItem>
                                                <SelectItem value="60">1 min</SelectItem>
                                                <SelectItem value="180">3 min</SelectItem>
                                                <SelectItem value="300">5 min</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Max Duration</label>
                                        <Select
                                            value={filters.duration_max?.toString() || ''}
                                            onValueChange={(value) =>
                                                setFilters(prev => ({
                                                    ...prev,
                                                    duration_max: value ? parseInt(value) : undefined
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Max" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Any</SelectItem>
                                                <SelectItem value="180">3 min</SelectItem>
                                                <SelectItem value="300">5 min</SelectItem>
                                                <SelectItem value="420">7 min</SelectItem>
                                                <SelectItem value="600">10 min</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Content Filter */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Content</label>
                                    <Select
                                        value={filters.explicit?.toString() || ''}
                                        onValueChange={(value) =>
                                            setFilters(prev => ({
                                                ...prev,
                                                explicit: value === '' ? undefined : value === 'true'
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All content" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Content</SelectItem>
                                            <SelectItem value="false">Clean Only</SelectItem>
                                            <SelectItem value="true">Explicit Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Apply Filters Button */}
                                <Button
                                    onClick={() => {
                                        performSearch(searchQuery);
                                        setShowFilters(false);
                                    }}
                                    className="w-full"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </form>

                {/* Recent Searches */}
                {recentSearches.length > 0 && !searchQuery && (
                    <div>
                        <h3 className="text-sm font-medium mb-2">Recent Searches</h3>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.slice(0, 5).map((search, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-secondary/80"
                                    onClick={() => handleSuggestionClick(search)}
                                >
                                    <Clock className="w-3 h-3 mr-1" />
                                    {search}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Search Categories */}
                {!searchQuery && (
                    <div>
                        <h3 className="text-sm font-medium mb-2">Browse by Category</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {quickSearches.map((category, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="justify-start h-auto p-3"
                                    onClick={() => handleSuggestionClick(category.query)}
                                >
                                    <category.icon className="w-4 h-4 mr-2" />
                                    <span className="text-sm">{category.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Results */}
            {searchResults && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Search Results ({searchResults.totalResults})
                        </h2>
                        {searchResults.filters && Object.keys(searchResults.filters).length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setFilters({});
                                    performSearch(searchQuery);
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {searchResults.tracks.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-muted-foreground">No tracks found matching your search.</p>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {searchResults.tracks.map((track, index) => {
                                const isCurrentTrack = state.currentTrack?.youtube_id === track.youtube_id;
                                const isPlaying = isCurrentTrack && state.isPlaying;

                                return (
                                    <Card key={track.id} className="p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {/* Track Index/Play Button */}
                                            <div className="w-8 flex justify-center">
                                                {isCurrentTrack ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={controls.togglePlayPause}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {isPlaying ? (
                                                            <Pause className="w-4 h-4" />
                                                        ) : (
                                                            <Play className="w-4 h-4 ml-0.5" />
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handlePlayTrack(track, index)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        <Play className="w-4 h-4 ml-0.5" />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Track Thumbnail */}
                                            <img
                                                src={track.thumbnail_url || '/placeholder-album.jpg'}
                                                alt={track.title}
                                                className="w-12 h-12 rounded object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-album.jpg';
                                                }}
                                            />

                                            {/* Track Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{track.title}</h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span className="truncate">{track.artist}</span>
                                                    {track.album && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate">{track.album}</span>
                                                        </>
                                                    )}
                                                    {track.is_explicit && (
                                                        <Badge variant="secondary" className="text-xs">E</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Duration */}
                                            <div className="text-sm text-muted-foreground min-w-[50px]">
                                                {formatDuration(track.duration || 0)}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleFavorite(track.id)}
                                                    className={cn(
                                                        "w-8 h-8 p-0",
                                                        favorites.has(track.id) && "text-red-500"
                                                    )}
                                                >
                                                    <Heart className={cn(
                                                        "w-4 h-4",
                                                        favorites.has(track.id) && "fill-current"
                                                    )} />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAddToQueue(track)}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <Card className="p-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground">Searching music...</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default MusicSearch;