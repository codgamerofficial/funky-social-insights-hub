/**
 * Music Dashboard
 * Main hub for music streaming platform
 */

import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { MusicTrack, Playlist, MusicLibrary } from '@/types/music';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Home,
    Search,
    Library,
    Heart,
    Clock,
    TrendingUp,
    Plus,
    Play,
    Pause,
    Volume2,
    Music2,
    Radio,
    Star,
    Users,
    Mic
} from 'lucide-react';
import AudioPlayer from '@/components/music/AudioPlayer';
import MusicSearch from '@/components/music/MusicSearch';
import { cn } from '@/lib/utils';

interface MusicDashboardProps {
    className?: string;
}

export const MusicDashboard: React.FC<MusicDashboardProps> = ({ className }) => {
    const { state, controls, playTrack } = useAudioPlayer();
    const [activeTab, setActiveTab] = useState('home');
    const [library, setLibrary] = useState<MusicLibrary>({
        playlists: [],
        favorites: [],
        recentlyPlayed: [],
        mostPlayed: [],
        downloaded: []
    });
    const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

    // Mock data for demonstration
    useEffect(() => {
        // In a real app, this would fetch from your API/database
        setLibrary({
            playlists: [
                {
                    id: '1',
                    user_id: 'user1',
                    name: 'My Favorites',
                    description: 'All my favorite songs',
                    is_public: false,
                    is_collaborative: false,
                    track_count: 25,
                    total_duration: 3600,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    thumbnail_url: '/placeholder-playlist.jpg'
                },
                {
                    id: '2',
                    user_id: 'user1',
                    name: 'Workout Mix',
                    description: 'High energy songs for workouts',
                    is_public: true,
                    is_collaborative: false,
                    track_count: 18,
                    total_duration: 2800,
                    created_at: '2024-01-15T00:00:00Z',
                    updated_at: '2024-01-15T00:00:00Z',
                    thumbnail_url: '/placeholder-playlist.jpg'
                }
            ],
            favorites: [],
            recentlyPlayed: [],
            mostPlayed: [],
            downloaded: []
        });
    }, []);

    // Quick play function
    const handleQuickPlay = (track: MusicTrack, playlist: MusicTrack[] = [track]) => {
        playTrack(track, playlist, 0);
    };

    // Trending tracks (mock data)
    const trendingTracks: MusicTrack[] = [
        {
            id: '1',
            youtube_id: 'dQw4w9WgXcQ',
            title: 'Never Gonna Give You Up',
            artist: 'Rick Astley',
            album: 'Whenever You Need Somebody',
            duration: 213,
            thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
            popularity: 95,
            genre: 'Pop',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
        },
        {
            id: '2',
            youtube_id: 'kJQP7kiw5Fk',
            title: 'Despacito',
            artist: 'Luis Fonsi',
            album: 'Vida',
            duration: 269,
            thumbnail_url: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
            popularity: 98,
            genre: 'Latin Pop',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
        }
    ];

    // Recommended tracks (mock data)
    const recommendedTracks: MusicTrack[] = [
        {
            id: '3',
            youtube_id: 'fJ9rUzIMcZQ',
            title: 'Bohemian Rhapsody',
            artist: 'Queen',
            album: 'A Night at the Opera',
            duration: 355,
            thumbnail_url: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
            popularity: 92,
            genre: 'Rock',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
        }
    ];

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    return (
        <div className={cn("min-h-screen bg-background", className)}>
            {/* Main Content */}
            <div className={cn(
                "pb-32 transition-all duration-300",
                isPlayerExpanded && "pb-96"
            )}>
                <div className="container mx-auto px-4 py-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        {/* Navigation Tabs */}
                        <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
                            <TabsTrigger value="home" className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                <span className="hidden sm:inline">Home</span>
                            </TabsTrigger>
                            <TabsTrigger value="search" className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                <span className="hidden sm:inline">Search</span>
                            </TabsTrigger>
                            <TabsTrigger value="library" className="flex items-center gap-2">
                                <Library className="w-4 h-4" />
                                <span className="hidden sm:inline">Library</span>
                            </TabsTrigger>
                            <TabsTrigger value="playlists" className="flex items-center gap-2">
                                <Music2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Playlists</span>
                            </TabsTrigger>
                            <TabsTrigger value="radio" className="flex items-center gap-2">
                                <Radio className="w-4 h-4" />
                                <span className="hidden sm:inline">Radio</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Home Tab */}
                        <TabsContent value="home" className="space-y-6">
                            {/* Welcome Section */}
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold">Good evening</h1>
                                <p className="text-muted-foreground">
                                    Discover new music and enjoy your favorite tracks
                                </p>
                            </div>

                            {/* Quick Access Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Card
                                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleQuickPlay(trendingTracks[0], trendingTracks)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Trending Now</h3>
                                            <p className="text-sm text-muted-foreground">Popular tracks</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card
                                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setActiveTab('library')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center">
                                            <Heart className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Liked Songs</h3>
                                            <p className="text-sm text-muted-foreground">Your favorites</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Recently Played</h3>
                                            <p className="text-sm text-muted-foreground">Pick up where you left off</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Trending Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <TrendingUp className="w-6 h-6" />
                                        Trending Now
                                    </h2>
                                    <Button variant="outline" size="sm">View All</Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {trendingTracks.map((track) => (
                                        <Card key={track.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="space-y-3">
                                                <div className="relative group">
                                                    <img
                                                        src={track.thumbnail_url}
                                                        alt={track.title}
                                                        className="w-full aspect-square object-cover rounded"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-album.jpg';
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleQuickPlay(track, trendingTracks)}
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium truncate">{track.title}</h4>
                                                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary">{track.genre}</Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {Math.floor((track.duration || 0) / 60)}m
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Made for You Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Star className="w-6 h-6" />
                                        Made for You
                                    </h2>
                                    <Button variant="outline" size="sm">View All</Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recommendedTracks.map((track) => (
                                        <Card key={track.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="space-y-3">
                                                <div className="relative group">
                                                    <img
                                                        src={track.thumbnail_url}
                                                        alt={track.title}
                                                        className="w-full aspect-square object-cover rounded"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-album.jpg';
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleQuickPlay(track, recommendedTracks)}
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium truncate">{track.title}</h4>
                                                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary">Recommended</Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {Math.floor((track.duration || 0) / 60)}m
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Your Playlists */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">Your Playlists</h2>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Playlist
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {library.playlists.map((playlist) => (
                                        <Card key={playlist.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="space-y-3">
                                                <div className="w-full aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                                                    <Music2 className="w-12 h-12 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium truncate">{playlist.name}</h4>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {playlist.track_count} songs • {formatDuration(playlist.total_duration)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Search Tab */}
                        <TabsContent value="search">
                            <MusicSearch onTrackSelect={(track) => handleQuickPlay(track)} />
                        </TabsContent>

                        {/* Library Tab */}
                        <TabsContent value="library" className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold">Your Library</h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card className="p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                        <Heart className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                        <h3 className="font-medium">Liked Songs</h3>
                                        <p className="text-sm text-muted-foreground">0 songs</p>
                                    </Card>

                                    <Card className="p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                        <Clock className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                                        <h3 className="font-medium">Recently Played</h3>
                                        <p className="text-sm text-muted-foreground">0 songs</p>
                                    </Card>

                                    <Card className="p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                        <h3 className="font-medium">Following</h3>
                                        <p className="text-sm text-muted-foreground">0 artists</p>
                                    </Card>

                                    <Card className="p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                        <Mic className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                                        <h3 className="font-medium">Artists</h3>
                                        <p className="text-sm text-muted-foreground">0 artists</p>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Playlists Tab */}
                        <TabsContent value="playlists" className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-3xl font-bold">Playlists</h1>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Playlist
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {library.playlists.map((playlist) => (
                                        <Card key={playlist.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="space-y-3">
                                                <div className="w-full aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                                                    <Music2 className="w-12 h-12 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium truncate">{playlist.name}</h4>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {playlist.track_count} songs • {formatDuration(playlist.total_duration)}
                                                    </p>
                                                    {playlist.description && (
                                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                                            {playlist.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Radio Tab */}
                        <TabsContent value="radio" className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold">Radio Stations</h1>
                                <p className="text-muted-foreground">
                                    Discover music through curated radio stations
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {['Pop Hits', 'Rock Anthems', 'Hip Hop Central', 'Electronic Vibes', 'Jazz Classics', 'Country Roads'].map((station, index) => (
                                        <Card key={index} className="p-6 hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="space-y-3">
                                                <div className="w-full aspect-square bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center">
                                                    <Volume2 className="w-12 h-12 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{station}</h4>
                                                    <p className="text-sm text-muted-foreground">Live station</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Audio Player */}
            <div className="fixed bottom-0 left-0 right-0 z-40">
                <AudioPlayer
                    expanded={isPlayerExpanded}
                    onExpandToggle={() => setIsPlayerExpanded(!isPlayerExpanded)}
                />
            </div>
        </div>
    );
};

export default MusicDashboard;