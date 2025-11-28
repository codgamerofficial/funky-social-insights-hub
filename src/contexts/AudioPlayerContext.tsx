/**
 * Enhanced Audio Player Context Provider
 * Advanced music playback with crossfade, queue management, service integration, and user features
 */

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { MusicTrack, RepeatMode, AudioPlayerState, AudioControls } from '@/types/music';
import { musicService } from '@/lib/services';

interface AudioPlayerAction {
    type: string;
    payload?: any;
}

interface EnhancedAudioPlayerState extends AudioPlayerState {
    crossfadeEnabled: boolean;
    crossfadeDuration: number; // in seconds
    audioQuality: 'auto' | 'low' | 'medium' | 'high';
    playbackSpeed: number; // 0.5x to 2x
    equalizer: {
        enabled: boolean;
        bands: number[]; // -12 to +12 dB for 10 bands
    };
    visualizer: {
        enabled: boolean;
        type: 'bars' | 'wave' | 'circle';
    };
    userId: string | null;
    favoriteTracks: Set<string>;
    currentSessionId: string | null;
    listeningStartTime: number | null;
    autoPlay: boolean;
    gaplessPlayback: boolean;
    normalizeVolume: boolean;
}

interface AudioPlayerContextType {
    state: EnhancedAudioPlayerState;
    controls: AudioControls;
    // Enhanced playback methods
    playTrack: (track: MusicTrack, playlist?: MusicTrack[], index?: number, userId?: string) => Promise<void>;
    playPlaylist: (playlistId: string, startIndex?: number, userId?: string) => Promise<void>;
    playFromSearch: (query: string, track?: MusicTrack, userId?: string) => Promise<void>;
    addToQueue: (track: MusicTrack) => void;
    addNextToQueue: (track: MusicTrack) => void;
    removeFromQueue: (index: number) => void;
    moveQueueItem: (fromIndex: number, toIndex: number) => void;
    clearQueue: () => void;
    toggleFavorite: (trackId: string) => Promise<void>;
    setCrossfade: (duration: number) => void;
    setAudioQuality: (quality: 'auto' | 'low' | 'medium' | 'high') => void;
    setPlaybackSpeed: (speed: number) => void;
    toggleEqualizer: () => void;
    setEqualizerBand: (bandIndex: number, value: number) => void;
    toggleVisualizer: () => void;
    setVisualizerType: (type: 'bars' | 'wave' | 'circle') => void;
    // Advanced controls
    seekToPercentage: (percentage: number) => void;
    skipForward: (seconds: number) => void;
    skipBackward: (seconds: number) => void;
    setAutoPlay: (enabled: boolean) => void;
    setGaplessPlayback: (enabled: boolean) => void;
    setNormalizeVolume: (enabled: boolean) => void;
    // Getters
    getQueue: () => MusicTrack[];
    getCurrentIndex: () => number;
    getProgress: () => number;
    getRemainingTime: () => number;
    isTrackFavorite: (trackId: string) => boolean;
    getListeningStats: () => {
        currentTrackDuration: number;
        elapsedTime: number;
        remainingTime: number;
        progressPercentage: number;
    };
    // User integration
    setUserId: (userId: string | null) => void;
    // Session management
    startListeningSession: () => void;
    endListeningSession: () => void;
}

const initialState: EnhancedAudioPlayerState = {
    isPlaying: false,
    currentTrack: null,
    currentPlaylist: null,
    currentTrackIndex: 0,
    volume: 1,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'none',
    queue: [],
    queuePosition: 0,
    // Enhanced features
    crossfadeEnabled: false,
    crossfadeDuration: 5,
    audioQuality: 'auto',
    playbackSpeed: 1,
    equalizer: {
        enabled: false,
        bands: new Array(10).fill(0), // 10-band equalizer
    },
    visualizer: {
        enabled: false,
        type: 'bars',
    },
    userId: null,
    favoriteTracks: new Set(),
    currentSessionId: null,
    listeningStartTime: null,
    autoPlay: true,
    gaplessPlayback: false,
    normalizeVolume: false,
};

const audioPlayerReducer = (state: EnhancedAudioPlayerState, action: AudioPlayerAction): EnhancedAudioPlayerState => {
    switch (action.type) {
        case 'SET_CURRENT_TRACK':
            return {
                ...state,
                currentTrack: action.payload.track,
                isLoading: true,
                currentTime: 0,
                listeningStartTime: Date.now(),
            };
        case 'SET_PLAYLIST':
            return {
                ...state,
                queue: action.payload.tracks,
                currentPlaylist: action.payload.playlist,
                queuePosition: action.payload.index || 0,
                currentTrackIndex: action.payload.index || 0,
            };
        case 'PLAY':
            return { ...state, isPlaying: true };
        case 'PAUSE':
            return { ...state, isPlaying: false };
        case 'TOGGLE_PLAY_PAUSE':
            return { ...state, isPlaying: !state.isPlaying };
        case 'SET_VOLUME':
            return { ...state, volume: action.payload };
        case 'SET_CURRENT_TIME':
            return { ...state, currentTime: action.payload };
        case 'SET_DURATION':
            return { ...state, duration: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'TOGGLE_MUTE':
            return { ...state, isMuted: !state.isMuted };
        case 'TOGGLE_SHUFFLE':
            return { ...state, isShuffled: !state.isShuffled };
        case 'SET_REPEAT_MODE':
            return { ...state, repeatMode: action.payload };
        case 'NEXT_TRACK':
            return {
                ...state,
                currentTrackIndex: state.currentTrackIndex + 1,
                currentTime: 0,
                listeningStartTime: Date.now(),
            };
        case 'PREVIOUS_TRACK':
            return {
                ...state,
                currentTrackIndex: Math.max(0, state.currentTrackIndex - 1),
                currentTime: 0,
                listeningStartTime: Date.now(),
            };
        case 'ADD_TO_QUEUE':
            return {
                ...state,
                queue: [...state.queue, action.payload],
            };
        case 'ADD_NEXT_TO_QUEUE':
            const insertIndex = state.currentTrackIndex + 1;
            const newQueue = [...state.queue];
            newQueue.splice(insertIndex, 0, action.payload);
            return {
                ...state,
                queue: newQueue,
            };
        case 'REMOVE_FROM_QUEUE':
            return {
                ...state,
                queue: state.queue.filter((_, index) => index !== action.payload),
                currentTrackIndex: action.payload <= state.currentTrackIndex ?
                    Math.max(0, state.currentTrackIndex - 1) : state.currentTrackIndex,
            };
        case 'MOVE_QUEUE_ITEM':
            const { fromIndex, toIndex } = action.payload;
            const queue = [...state.queue];
            const [movedItem] = queue.splice(fromIndex, 1);
            queue.splice(toIndex, 0, movedItem);
            return {
                ...state,
                queue,
                currentTrackIndex: fromIndex === state.currentTrackIndex ? toIndex :
                    fromIndex < state.currentTrackIndex && toIndex >= state.currentTrackIndex ? state.currentTrackIndex - 1 :
                        fromIndex > state.currentTrackIndex && toIndex <= state.currentTrackIndex ? state.currentTrackIndex + 1 :
                            state.currentTrackIndex,
            };
        case 'CLEAR_QUEUE':
            return {
                ...state,
                queue: [],
                currentPlaylist: null,
                currentTrackIndex: 0,
                currentTrack: null,
            };
        case 'SET_QUEUE_POSITION':
            return {
                ...state,
                queuePosition: action.payload,
                currentTrackIndex: action.payload,
                currentTime: 0,
                listeningStartTime: Date.now(),
            };
        case 'SET_CROSSFADE':
            return {
                ...state,
                crossfadeEnabled: action.payload.duration > 0,
                crossfadeDuration: action.payload.duration,
            };
        case 'SET_AUDIO_QUALITY':
            return { ...state, audioQuality: action.payload };
        case 'SET_PLAYBACK_SPEED':
            return { ...state, playbackSpeed: action.payload };
        case 'TOGGLE_EQUALIZER':
            return {
                ...state,
                equalizer: { ...state.equalizer, enabled: !state.equalizer.enabled },
            };
        case 'SET_EQUALIZER_BAND':
            const bands = [...state.equalizer.bands];
            bands[action.payload.bandIndex] = action.payload.value;
            return {
                ...state,
                equalizer: { ...state.equalizer, bands },
            };
        case 'TOGGLE_VISUALIZER':
            return {
                ...state,
                visualizer: { ...state.visualizer, enabled: !state.visualizer.enabled },
            };
        case 'SET_VISUALIZER_TYPE':
            return {
                ...state,
                visualizer: { ...state.visualizer, type: action.payload },
            };
        case 'SET_USER_ID':
            return { ...state, userId: action.payload };
        case 'TOGGLE_FAVORITE':
            const newFavorites = new Set(state.favoriteTracks);
            if (newFavorites.has(action.payload.trackId)) {
                newFavorites.delete(action.payload.trackId);
            } else {
                newFavorites.add(action.payload.trackId);
            }
            return { ...state, favoriteTracks: newFavorites };
        case 'SET_AUTO_PLAY':
            return { ...state, autoPlay: action.payload };
        case 'SET_GAPLESS_PLAYBACK':
            return { ...state, gaplessPlayback: action.payload };
        case 'SET_NORMALIZE_VOLUME':
            return { ...state, normalizeVolume: action.payload };
        default:
            return state;
    }
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(audioPlayerReducer, initialState);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const crossfadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize audio element with enhanced features
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = 'anonymous';
        audioRef.current.preload = 'metadata';
        audioRef.current.playbackRate = state.playbackSpeed;

        const audio = audioRef.current;

        const handleLoadedMetadata = () => {
            dispatch({ type: 'SET_DURATION', payload: audio.duration });
            dispatch({ type: 'SET_LOADING', payload: false });
        };

        const handleTimeUpdate = () => {
            dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
        };

        const handleEnded = () => {
            handleTrackEnd();
        };

        const handleError = (e: Event) => {
            console.error('Audio playback error:', e);
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({ type: 'PAUSE' });
        };

        const handleCanPlay = () => {
            dispatch({ type: 'SET_LOADING', payload: false });
        };

        const handleLoadStart = () => {
            dispatch({ type: 'SET_LOADING', payload: true });
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadstart', handleLoadStart);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadstart', handleLoadStart);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (crossfadeTimeoutRef.current) {
                clearTimeout(crossfadeTimeoutRef.current);
            }
        };
    }, []);

    // Handle playback state changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (state.isPlaying) {
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }
    }, [state.isPlaying]);

    // Handle volume changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = state.isMuted ? 0 : state.volume;
    }, [state.volume, state.isMuted]);

    // Handle playback speed changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.playbackRate = state.playbackSpeed;
    }, [state.playbackSpeed]);

    // Handle track changes with YouTube integration
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !state.currentTrack) return;

        // Use our music service to get the stream URL
        loadTrackStream(state.currentTrack);
    }, [state.currentTrack]);

    const loadTrackStream = async (track: MusicTrack) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            // For now, use YouTube embed URL - in production, you'd use a proper streaming service
            const streamUrl = `https://www.youtube.com/watch?v=${track.youtube_id}`;
            audioRef.current!.src = streamUrl;
            audioRef.current!.load();

            // Record listening activity if user is logged in
            if (state.userId) {
                await musicService.recordListeningActivity(state.userId, {
                    track_id: track.id,
                    duration_listened: 0,
                    completion_percentage: 0,
                    device_type: 'web',
                    context_type: state.currentPlaylist ? 'playlist' : 'search',
                    quality_setting: state.audioQuality,
                });
            }
        } catch (error) {
            console.error('Failed to load track stream:', error);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleTrackEnd = () => {
        if (state.repeatMode === 'one') {
            // Repeat the same track
            const audio = audioRef.current;
            if (audio) {
                audio.currentTime = 0;
                audio.play();
            }
            return;
        }

        if (state.currentTrackIndex < state.queue.length - 1) {
            // Play next track in queue
            dispatch({ type: 'SET_QUEUE_POSITION', payload: state.currentTrackIndex + 1 });
        } else if (state.repeatMode === 'all' && state.queue.length > 0) {
            // Loop back to the beginning if repeat all is enabled
            dispatch({ type: 'SET_QUEUE_POSITION', payload: 0 });
        } else if (state.autoPlay) {
            // Auto-play recommendations
            playRecommendations();
        } else {
            // Stop playback
            dispatch({ type: 'PAUSE' });
            dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
        }
    };

    const playRecommendations = async () => {
        if (!state.userId) return;

        try {
            const recommendations = await musicService.getPersonalizedRecommendations(state.userId, {
                limit: 1,
                excludeTrackIds: state.queue.map(track => track.youtube_id),
            });

            if (recommendations.length > 0) {
                dispatch({ type: 'SET_CURRENT_TRACK', payload: { track: recommendations[0] } });
                dispatch({ type: 'ADD_TO_QUEUE', payload: recommendations[0] });
                dispatch({ type: 'PLAY' });
            }
        } catch (error) {
            console.error('Failed to get recommendations:', error);
        }
    };

    // Enhanced controls implementation
    const controls: AudioControls = {
        play: () => dispatch({ type: 'PLAY' }),
        pause: () => dispatch({ type: 'PAUSE' }),
        togglePlayPause: () => dispatch({ type: 'TOGGLE_PLAY_PAUSE' }),
        next: () => {
            if (state.currentTrackIndex < state.queue.length - 1) {
                dispatch({ type: 'SET_QUEUE_POSITION', payload: state.currentTrackIndex + 1 });
            }
        },
        previous: () => {
            if (state.currentTime > 5) {
                // If more than 5 seconds into the track, restart current track
                const audio = audioRef.current;
                if (audio) {
                    audio.currentTime = 0;
                }
            } else if (state.currentTrackIndex > 0) {
                // Go to previous track
                dispatch({ type: 'SET_QUEUE_POSITION', payload: state.currentTrackIndex - 1 });
            }
        },
        seek: (time: number) => {
            const audio = audioRef.current;
            if (audio) {
                audio.currentTime = time;
                dispatch({ type: 'SET_CURRENT_TIME', payload: time });
            }
        },
        setVolume: (volume: number) => {
            dispatch({ type: 'SET_VOLUME', payload: Math.max(0, Math.min(1, volume)) });
        },
        toggleMute: () => dispatch({ type: 'TOGGLE_MUTE' }),
        toggleShuffle: () => dispatch({ type: 'TOGGLE_SHUFFLE' }),
        setRepeatMode: (mode: RepeatMode) => dispatch({ type: 'SET_REPEAT_MODE', payload: mode }),
        addToQueue: (track: MusicTrack) => dispatch({ type: 'ADD_TO_QUEUE', payload: track }),
        removeFromQueue: (index: number) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index }),
        clearQueue: () => dispatch({ type: 'CLEAR_QUEUE' }),
        reorderQueue: (fromIndex: number, toIndex: number) => {
            dispatch({ type: 'MOVE_QUEUE_ITEM', payload: { fromIndex, toIndex } });
        },
    };

    // Enhanced methods
    const playTrack = async (
        track: MusicTrack,
        playlist: MusicTrack[] = [],
        index: number = 0,
        userId?: string
    ): Promise<void> => {
        try {
            dispatch({ type: 'SET_CURRENT_TRACK', payload: { track } });

            if (playlist.length > 0) {
                dispatch({ type: 'SET_PLAYLIST', payload: { tracks: playlist, playlist: null, index } });
            }

            dispatch({ type: 'PLAY' });

            // Record listening activity
            if (userId || state.userId) {
                const uid = userId || state.userId;
                if (uid) {
                    await musicService.recordListeningActivity(uid, {
                        track_id: track.id,
                        duration_listened: 0,
                        completion_percentage: 0,
                        device_type: 'web',
                        context_type: playlist.length > 0 ? 'playlist' : 'direct',
                        quality_setting: state.audioQuality,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to play track:', error);
        }
    };

    const playPlaylist = async (playlistId: string, startIndex: number = 0, userId?: string): Promise<void> => {
        try {
            const uid = userId || state.userId;
            if (!uid) {
                throw new Error('User ID required to play playlist');
            }

            const playlist = await musicService.getUserPlaylists(uid, {
                include_public: true,
                limit: 1
            });

            const foundPlaylist = playlist.find(p => p.id === playlistId);
            if (foundPlaylist && foundPlaylist.tracks) {
                const tracks = foundPlaylist.tracks.map(pt => pt.track!).filter(Boolean);
                if (tracks.length > 0) {
                    await playTrack(tracks[startIndex], tracks, startIndex, uid);
                }
            }
        } catch (error) {
            console.error('Failed to play playlist:', error);
        }
    };

    const playFromSearch = async (query: string, track?: MusicTrack, userId?: string): Promise<void> => {
        try {
            const uid = userId || state.userId;
            const searchResults = await musicService.searchMusic(query, { limit: 10, userId: uid });

            if (track) {
                await playTrack(track, searchResults.tracks || [], 0, uid);
            } else if (searchResults.tracks && searchResults.tracks.length > 0) {
                await playTrack(searchResults.tracks[0], searchResults.tracks, 0, uid);
            }
        } catch (error) {
            console.error('Failed to play from search:', error);
        }
    };

    const addNextToQueue = (track: MusicTrack) => {
        dispatch({ type: 'ADD_NEXT_TO_QUEUE', payload: track });
    };

    const moveQueueItem = (fromIndex: number, toIndex: number) => {
        dispatch({ type: 'MOVE_QUEUE_ITEM', payload: { fromIndex, toIndex } });
    };

    const toggleFavorite = async (trackId: string): Promise<void> => {
        try {
            if (!state.userId) {
                dispatch({ type: 'TOGGLE_FAVORITE', payload: { trackId } });
                return;
            }

            const isFavorite = state.favoriteTracks.has(trackId);

            if (isFavorite) {
                await musicService.removeFromFavorites(state.userId, trackId);
            } else {
                await musicService.addToFavorites(state.userId, trackId);
            }

            dispatch({ type: 'TOGGLE_FAVORITE', payload: { trackId } });
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const setCrossfade = (duration: number) => {
        dispatch({ type: 'SET_CROSSFADE', payload: { duration } });
    };

    const setAudioQuality = (quality: 'auto' | 'low' | 'medium' | 'high') => {
        dispatch({ type: 'SET_AUDIO_QUALITY', payload: quality });
    };

    const setPlaybackSpeed = (speed: number) => {
        dispatch({ type: 'SET_PLAYBACK_SPEED', payload: Math.max(0.5, Math.min(2, speed)) });
    };

    const toggleEqualizer = () => {
        dispatch({ type: 'TOGGLE_EQUALIZER' });
    };

    const setEqualizerBand = (bandIndex: number, value: number) => {
        dispatch({ type: 'SET_EQUALIZER_BAND', payload: { bandIndex, value: Math.max(-12, Math.min(12, value)) } });
    };

    const toggleVisualizer = () => {
        dispatch({ type: 'TOGGLE_VISUALIZER' });
    };

    const setVisualizerType = (type: 'bars' | 'wave' | 'circle') => {
        dispatch({ type: 'SET_VISUALIZER_TYPE', payload: type });
    };

    const seekToPercentage = (percentage: number) => {
        const time = (percentage / 100) * state.duration;
        controls.seek(time);
    };

    const skipForward = (seconds: number) => {
        const newTime = Math.min(state.currentTime + seconds, state.duration);
        controls.seek(newTime);
    };

    const skipBackward = (seconds: number) => {
        const newTime = Math.max(state.currentTime - seconds, 0);
        controls.seek(newTime);
    };

    const setAutoPlay = (enabled: boolean) => {
        dispatch({ type: 'SET_AUTO_PLAY', payload: enabled });
    };

    const setGaplessPlayback = (enabled: boolean) => {
        dispatch({ type: 'SET_GAPLESS_PLAYBACK', payload: enabled });
    };

    const setNormalizeVolume = (enabled: boolean) => {
        dispatch({ type: 'SET_NORMALIZE_VOLUME', payload: enabled });
    };

    const getQueue = () => state.queue;

    const getCurrentIndex = () => state.currentTrackIndex;

    const getProgress = () => state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

    const getRemainingTime = () => Math.max(0, state.duration - state.currentTime);

    const isTrackFavorite = (trackId: string) => state.favoriteTracks.has(trackId);

    const getListeningStats = () => ({
        currentTrackDuration: state.duration,
        elapsedTime: state.currentTime,
        remainingTime: getRemainingTime(),
        progressPercentage: getProgress(),
    });

    const setUserId = (userId: string | null) => {
        dispatch({ type: 'SET_USER_ID', payload: userId });
    };

    const startListeningSession = () => {
        dispatch({ type: 'SET_USER_ID', payload: state.currentSessionId = crypto.randomUUID() });
    };

    const endListeningSession = async () => {
        if (state.userId && state.currentTrack && state.listeningStartTime) {
            const listenTime = Date.now() - state.listeningStartTime;
            try {
                await musicService.recordListeningActivity(state.userId, {
                    track_id: state.currentTrack.id,
                    duration_listened: Math.floor(listenTime / 1000),
                    completion_percentage: (state.currentTime / state.duration) * 100,
                    device_type: 'web',
                    context_type: state.currentPlaylist ? 'playlist' : 'direct',
                    quality_setting: state.audioQuality,
                });
            } catch (error) {
                console.error('Failed to record listening session:', error);
            }
        }
        dispatch({ type: 'SET_USER_ID', payload: null });
    };

    const value: AudioPlayerContextType = {
        state,
        controls,
        playTrack,
        playPlaylist,
        playFromSearch,
        addToQueue,
        addNextToQueue,
        removeFromQueue,
        moveQueueItem,
        clearQueue,
        toggleFavorite,
        setCrossfade,
        setAudioQuality,
        setPlaybackSpeed,
        toggleEqualizer,
        setEqualizerBand,
        toggleVisualizer,
        setVisualizerType,
        seekToPercentage,
        skipForward,
        skipBackward,
        setAutoPlay,
        setGaplessPlayback,
        setNormalizeVolume,
        getQueue,
        getCurrentIndex,
        getProgress,
        getRemainingTime,
        isTrackFavorite,
        getListeningStats,
        setUserId,
        startListeningSession,
        endListeningSession,
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
        </AudioPlayerContext.Provider>
    );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};