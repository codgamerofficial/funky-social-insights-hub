/**
 * Audio Player Component
 * Complete music player interface with full controls
 */

import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Shuffle,
    Repeat,
    Repeat1,
    Heart,
    Share,
    MoreHorizontal,
    Minimize2,
    Maximize2
} from 'lucide-react';
import { MusicTrack } from '@/types/music';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
    className?: string;
    expanded?: boolean;
    onExpandToggle?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    className,
    expanded = false,
    onExpandToggle
}) => {
    const { state, controls } = useAudioPlayer();
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const formatTime = (seconds: number): string => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (value: number[]) => {
        controls.seek(value[0]);
    };

    const handleVolumeChange = (value: number[]) => {
        controls.setVolume(value[0] / 100);
    };

    const toggleLike = () => {
        if (state.currentTrack) {
            setIsLiked(!isLiked);
            // TODO: Implement actual favorite toggle
        }
    };

    const getRepeatIcon = () => {
        switch (state.repeatMode) {
            case 'one':
                return <Repeat1 className="w-4 h-4" />;
            case 'all':
                return <Repeat className="w-4 h-4 text-primary" />;
            default:
                return <Repeat className="w-4 h-4" />;
        }
    };

    if (!state.currentTrack) {
        return null;
    }

    return (
        <Card className={cn(
            "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            expanded ? "fixed inset-0 z-50 rounded-none" : "relative",
            className
        )}>
            <div className="flex items-center gap-4 p-4">
                {/* Track Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative">
                        <img
                            src={state.currentTrack.thumbnail_url || '/placeholder-album.jpg'}
                            alt={state.currentTrack.title}
                            className="w-14 h-14 rounded-md object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '/placeholder-album.jpg';
                            }}
                        />
                        {state.isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">
                            {state.currentTrack.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                            {state.currentTrack.artist}
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleLike}
                            className={cn(
                                "p-2",
                                isLiked && "text-red-500 hover:text-red-600"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                        </Button>

                        <Button variant="ghost" size="sm" className="p-2">
                            <Share className="w-4 h-4" />
                        </Button>

                        <Button variant="ghost" size="sm" className="p-2">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Player Controls */}
                <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
                    <div className="flex items-center gap-4">
                        {/* Shuffle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={controls.toggleShuffle}
                            className={cn(
                                "p-2",
                                state.isShuffled && "text-primary"
                            )}
                        >
                            <Shuffle className="w-4 h-4" />
                        </Button>

                        {/* Previous */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={controls.previous}
                            disabled={state.currentTrackIndex === 0}
                            className="p-2"
                        >
                            <SkipBack className="w-5 h-5" />
                        </Button>

                        {/* Play/Pause */}
                        <Button
                            onClick={controls.togglePlayPause}
                            disabled={state.isLoading}
                            className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90"
                        >
                            {state.isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : state.isPlaying ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5 ml-0.5" />
                            )}
                        </Button>

                        {/* Next */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={controls.next}
                            disabled={state.currentTrackIndex >= state.queue.length - 1}
                            className="p-2"
                        >
                            <SkipForward className="w-5 h-5" />
                        </Button>

                        {/* Repeat */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
                                const currentIndex = modes.indexOf(state.repeatMode);
                                const nextMode = modes[(currentIndex + 1) % modes.length];
                                controls.setRepeatMode(nextMode);
                            }}
                            className="p-2"
                        >
                            {getRepeatIcon()}
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-xs text-muted-foreground min-w-[40px]">
                            {formatTime(state.currentTime)}
                        </span>

                        <div className="flex-1">
                            <Slider
                                value={[state.currentTime]}
                                max={state.duration || 100}
                                step={1}
                                onValueChange={handleProgressChange}
                                className="w-full"
                            />
                        </div>

                        <span className="text-xs text-muted-foreground min-w-[40px]">
                            {formatTime(state.duration)}
                        </span>
                    </div>
                </div>

                {/* Volume and Additional Controls */}
                <div className="flex items-center gap-2 min-w-0">
                    {/* Expand/Minimize */}
                    {onExpandToggle && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onExpandToggle}
                            className="hidden md:flex p-2"
                        >
                            {expanded ? (
                                <Minimize2 className="w-4 h-4" />
                            ) : (
                                <Maximize2 className="w-4 h-4" />
                            )}
                        </Button>
                    )}

                    {/* Volume Control */}
                    <div
                        className="flex items-center gap-2"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={controls.toggleMute}
                            className="p-2"
                        >
                            {state.isMuted || state.volume === 0 ? (
                                <VolumeX className="w-4 h-4" />
                            ) : (
                                <Volume2 className="w-4 h-4" />
                            )}
                        </Button>

                        {showVolumeSlider && (
                            <div className="w-24">
                                <Slider
                                    value={[state.isMuted ? 0 : state.volume * 100]}
                                    max={100}
                                    step={1}
                                    onValueChange={handleVolumeChange}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded View Additional Content */}
            {expanded && (
                <div className="border-t p-6 space-y-6">
                    {/* Lyrics Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Lyrics</h3>
                        <div className="max-h-64 overflow-y-auto text-sm text-muted-foreground">
                            <p className="text-center py-8">
                                Lyrics not available for this track
                            </p>
                        </div>
                    </div>

                    {/* Queue Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Up Next</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {state.queue.slice(state.currentTrackIndex + 1).map((track, index) => (
                                <div
                                    key={track.id}
                                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                                    onClick={() => {
                                        // TODO: Implement queue navigation
                                    }}
                                >
                                    <img
                                        src={track.thumbnail_url || '/placeholder-album.jpg'}
                                        alt={track.title}
                                        className="w-10 h-10 rounded object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '/placeholder-album.jpg';
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{track.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatTime(track.duration || 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default AudioPlayer;