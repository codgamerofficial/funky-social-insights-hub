/**
 * Audio Player Context Provider
 * Centralized state management for music playback
 */

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { MusicTrack, RepeatMode, AudioPlayerState, AudioControls } from '@/types/music';

interface AudioPlayerAction {
    type: string;
    payload?: any;
}

interface AudioPlayerContextType {
    state: AudioPlayerState;
    controls: AudioControls;
    playTrack: (track: MusicTrack, playlist?: MusicTrack[], index?: number) => void;
    addToQueue: (track: MusicTrack) => void;
    clearQueue: () => void;
    toggleFavorite: (trackId: string) => void;
}

const initialState: AudioPlayerState = {
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
};

const audioPlayerReducer = (state: AudioPlayerState, action: AudioPlayerAction): AudioPlayerState => {
    switch (action.type) {
        case 'SET_CURRENT_TRACK':
            return {
                ...state,
                currentTrack: action.payload.track,
                isLoading: true,
                currentTime: 0,
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
            };
        case 'PREVIOUS_TRACK':
            return {
                ...state,
                currentTrackIndex: Math.max(0, state.currentTrackIndex - 1),
                currentTime: 0,
            };
        case 'ADD_TO_QUEUE':
            return {
                ...state,
                queue: [...state.queue, action.payload],
            };
        case 'REMOVE_FROM_QUEUE':
            return {
                ...state,
                queue: state.queue.filter((_, index) => index !== action.payload),
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
            };
        default:
            return state;
    }
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(audioPlayerReducer, initialState);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = 'anonymous';
        audioRef.current.preload = 'metadata';

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

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('canplay', handleCanPlay);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
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

    // Handle track changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !state.currentTrack) return;

        const trackUrl = `https://www.youtube.com/watch?v=${state.currentTrack.youtube_id}`;
        audio.src = trackUrl;
        audio.load();
    }, [state.currentTrack]);

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
        } else {
            // Stop playback
            dispatch({ type: 'PAUSE' });
            dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
        }
    };

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
            const newQueue = [...state.queue];
            const [removed] = newQueue.splice(fromIndex, 1);
            newQueue.splice(toIndex, 0, removed);
            dispatch({ type: 'SET_PLAYLIST', payload: { tracks: newQueue, playlist: state.currentPlaylist, index: state.queuePosition } });
        },
    };

    const playTrack = (track: MusicTrack, playlist: MusicTrack[] = [], index: number = 0) => {
        dispatch({ type: 'SET_CURRENT_TRACK', payload: { track } });
        if (playlist.length > 0) {
            dispatch({ type: 'SET_PLAYLIST', payload: { tracks: playlist, playlist: null, index } });
        }
        dispatch({ type: 'PLAY' });
    };

    const addToQueue = (track: MusicTrack) => {
        controls.addToQueue(track);
    };

    const clearQueue = () => {
        controls.clearQueue();
    };

    const toggleFavorite = async (trackId: string) => {
        // TODO: Implement favorite toggle logic
        console.log('Toggle favorite for track:', trackId);
    };

    const value: AudioPlayerContextType = {
        state,
        controls,
        playTrack,
        addToQueue,
        clearQueue,
        toggleFavorite,
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