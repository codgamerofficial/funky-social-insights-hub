/**
 * Lyrics Display Component
 * Shows song lyrics with real-time synchronization
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { createLyricsService } from '@/lib/services/lyricsService';
import { TrackLyrics, SyncedLyricsLine } from '@/types/music';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    FileText,
    Edit3,
    Save,
    X,
    ChevronUp,
    ChevronDown,
    Music,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LyricsDisplayProps {
    className?: string;
    showFullScreen?: boolean;
    onClose?: () => void;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
    className,
    showFullScreen = false,
    onClose
}) => {
    const { state } = useAudioPlayer();
    const [lyrics, setLyrics] = useState<TrackLyrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedLyrics, setEditedLyrics] = useState('');
    const [currentLineIndex, setCurrentLineIndex] = useState(-1);
    const [showScrollButtons, setShowScrollButtons] = useState(false);

    const lyricsService = createLyricsService();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const currentLineRef = useRef<HTMLDivElement>(null);

    // Load lyrics when current track changes
    useEffect(() => {
        if (state.currentTrack) {
            loadLyrics();
        } else {
            setLyrics(null);
            setError(null);
        }
    }, [state.currentTrack?.youtube_id]);

    // Sync lyrics with audio playback
    useEffect(() => {
        if (!lyrics?.synced_lyrics || !state.isPlaying) {
            setCurrentLineIndex(-1);
            return;
        }

        const currentTime = state.currentTime;
        const syncedLines = lyrics.synced_lyrics;

        // Find current line
        let currentIndex = -1;
        for (let i = 0; i < syncedLines.length; i++) {
            if (currentTime >= syncedLines[i].time) {
                currentIndex = i;
            } else {
                break;
            }
        }

        if (currentIndex !== currentLineIndex) {
            setCurrentLineIndex(currentIndex);

            // Auto-scroll to current line
            if (currentIndex >= 0 && currentLineRef.current) {
                setTimeout(() => {
                    currentLineRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        }
    }, [state.currentTime, state.isPlaying, lyrics?.synced_lyrics, currentLineIndex]);

    const loadLyrics = async () => {
        if (!state.currentTrack) return;

        setIsLoading(true);
        setError(null);

        try {
            const trackLyrics = await lyricsService.searchLyrics(
                state.currentTrack.artist,
                state.currentTrack.title
            );

            if (trackLyrics) {
                setLyrics(trackLyrics);
            } else {
                setError('Lyrics not found for this track');
            }
        } catch (err) {
            setError('Failed to load lyrics');
            console.error('Lyrics loading error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditLyrics = () => {
        setEditedLyrics(lyrics?.lyrics || '');
        setIsEditing(true);
    };

    const handleSaveLyrics = async () => {
        if (!state.currentTrack || !editedLyrics.trim()) return;

        try {
            await lyricsService.submitLyricsCorrection(
                state.currentTrack.youtube_id,
                state.currentTrack.artist,
                state.currentTrack.title,
                editedLyrics
            );

            setLyrics(prev => prev ? {
                ...prev,
                lyrics: editedLyrics,
                source: 'manual'
            } : null);

            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save lyrics:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedLyrics('');
    };

    const scrollToLine = (direction: 'up' | 'down') => {
        if (!scrollAreaRef.current) return;

        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollContainer) return;

        const scrollAmount = 80;
        const currentScroll = scrollContainer.scrollTop;

        const newScroll = direction === 'up'
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount;

        scrollContainer.scrollTo({
            top: newScroll,
            behavior: 'smooth'
        });
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!state.currentTrack) {
        return (
            <Card className={cn("p-8 text-center", className)}>
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No track selected</p>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card className={cn("p-8 text-center", className)}>
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading lyrics...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={cn("p-8", className)}>
                <div className="text-center space-y-4">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={loadLyrics} variant="outline" size="sm">
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

    if (!lyrics) {
        return (
            <Card className={cn("p-8", className)}>
                <div className="text-center space-y-4">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">No lyrics available for this track</p>
                    <Button onClick={loadLyrics} variant="outline" size="sm">
                        Search Lyrics
                    </Button>
                </div>
            </Card>
        );
    }

    const displayLyrics = lyrics.synced_lyrics || lyrics.lyrics.split('\n');
    const hasSyncedLyrics = !!lyrics.synced_lyrics;

    return (
        <div className={cn(
            "space-y-4",
            showFullScreen && "fixed inset-0 z-50 bg-background p-6",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Lyrics</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{state.currentTrack.title}</span>
                        <span>•</span>
                        <span>{state.currentTrack.artist}</span>
                        <Badge variant="secondary" className="ml-2">
                            {lyrics.source}
                        </Badge>
                        {hasSyncedLyrics && (
                            <Badge variant="outline">Synced</Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditLyrics}
                        disabled={isEditing}
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                    </Button>

                    {onClose && (
                        <Button variant="outline" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Lyrics Content */}
            <Card className="relative">
                {/* Scroll Buttons */}
                {showScrollButtons && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-4 right-4 z-10"
                            onClick={() => scrollToLine('up')}
                        >
                            <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="absolute bottom-16 right-4 z-10"
                            onClick={() => scrollToLine('down')}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </>
                )}

                {isEditing ? (
                    // Edit Mode
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Edit Lyrics
                            </label>
                            <textarea
                                value={editedLyrics}
                                onChange={(e) => setEditedLyrics(e.target.value)}
                                className="w-full h-64 p-3 border rounded-md resize-none"
                                placeholder="Enter lyrics here..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button onClick={handleSaveLyrics} size="sm">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" size="sm">
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Display Mode
                    <ScrollArea
                        className="h-96 p-6"
                        ref={scrollAreaRef}
                    >
                        <div className="space-y-2">
                            {displayLyrics.map((line, index) => {
                                const isActive = hasSyncedLyrics && index === currentLineIndex;
                                const isPast = hasSyncedLyrics && index < currentLineIndex;
                                const timeStamp = hasSyncedLyrics
                                    ? (line as SyncedLyricsLine).time
                                    : null;

                                return (
                                    <div
                                        key={index}
                                        ref={isActive ? currentLineRef : undefined}
                                        className={cn(
                                            "group flex items-center gap-3 py-1 px-2 rounded transition-all duration-300",
                                            isActive && "bg-primary/10 text-primary font-medium scale-105",
                                            isPast && "text-muted-foreground opacity-70",
                                            !hasSyncedLyrics && "hover:bg-muted/50 cursor-pointer",
                                            hasSyncedLyrics && "cursor-pointer"
                                        )}
                                        onClick={() => {
                                            if (hasSyncedLyrics && timeStamp !== null) {
                                                // Seek to timestamp when clicking synced lyrics
                                                const audio = document.querySelector('audio');
                                                if (audio) {
                                                    audio.currentTime = timeStamp;
                                                }
                                            }
                                        }}
                                    >
                                        {hasSyncedLyrics && timeStamp !== null && (
                                            <span className="text-xs text-muted-foreground font-mono min-w-[40px]">
                                                {formatTime(timeStamp)}
                                            </span>
                                        )}

                                        <span className="flex-1 leading-relaxed">
                                            {hasSyncedLyrics
                                                ? (line as SyncedLyricsLine).text
                                                : line
                                            }
                                        </span>

                                        {isActive && (
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </Card>

            {/* Lyrics Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span>Source: {lyrics.source}</span>
                    <span>Language: {lyrics.language}</span>
                    {hasSyncedLyrics && (
                        <Badge variant="outline">Synced Lyrics</Badge>
                    )}
                </div>

                {lyrics.source === 'manual' && (
                    <div className="flex items-center gap-2">
                        <span>User contributed</span>
                        <ExternalLink className="w-3 h-3" />
                    </div>
                )}
            </div>

            {/* Instructions */}
            {hasSyncedLyrics && (
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        Click on any line to jump to that position in the song
                    </p>
                </div>
            )}
        </div>
    );
};

export default LyricsDisplay;