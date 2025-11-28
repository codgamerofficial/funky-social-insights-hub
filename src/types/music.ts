/**
 * Music Streaming Platform Type Definitions
 * Complete type system for music streaming features
 */

// Core Music Types
export interface MusicTrack {
    id: string;
    youtube_id: string;
    title: string;
    artist: string;
    album?: string;
    duration?: number; // in seconds
    thumbnail_url?: string;
    preview_url?: string; // YouTube video preview URL
    release_date?: string;
    genre?: string;
    language?: string;
    popularity?: number;
    is_explicit?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Playlist {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    thumbnail_url?: string;
    is_public: boolean;
    is_collaborative: boolean;
    track_count: number;
    total_duration: number; // in seconds
    created_at?: string;
    updated_at?: string;
    tracks?: PlaylistTrack[];
    user?: UserProfile;
}

export interface PlaylistTrack {
    id: string;
    playlist_id: string;
    track_id: string;
    position: number;
    added_at?: string;
    track?: MusicTrack;
}

export interface UserProfile {
    id: string;
    user_id: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    country?: string;
    preferred_language?: string;
    date_of_birth?: string;
    is_artist: boolean;
    artist_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserFavorite {
    id: string;
    user_id: string;
    track_id: string;
    created_at?: string;
    track?: MusicTrack;
}

export interface UserFollow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at?: string;
    following_user?: UserProfile;
}

export interface ListeningHistory {
    id: string;
    user_id: string;
    track_id: string;
    playlist_id?: string;
    position_in_playlist?: number;
    listened_at?: string;
    duration_listened?: number; // in seconds
    completion_percentage?: number; // 0.00 to 100.00
    track?: MusicTrack;
    playlist?: Playlist;
}

export interface MusicAnalytics {
    id: string;
    track_id: string;
    total_plays: number;
    total_likes: number;
    total_shares: number;
    unique_listeners: number;
    average_completion_rate: number; // 0.00 to 100.00
    last_played_at?: string;
    created_at?: string;
    updated_at?: string;
    track?: MusicTrack;
}

export interface MusicRecommendation {
    id: string;
    user_id: string;
    track_id: string;
    recommendation_type: 'based_on_listening' | 'trending' | 'similar_users' | 'artist_radio' | 'mood_based';
    confidence_score?: number; // 0.00 to 100.00
    created_at?: string;
    shown_at?: string;
    clicked: boolean;
    liked: boolean;
    track?: MusicTrack;
}

export interface SearchHistory {
    id: string;
    user_id: string;
    query: string;
    search_type: 'tracks' | 'artists' | 'playlists' | 'all';
    results_count: number;
    created_at?: string;
}

export interface SmartPlaylist {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    rules: SmartPlaylistRules;
    last_generated_at?: string;
    auto_update: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface SmartPlaylistRules {
    genres?: string[];
    artists?: string[];
    min_popularity?: number;
    max_popularity?: number;
    release_date_after?: string;
    release_date_before?: string;
    min_duration?: number;
    max_duration?: number;
    exclude_explicit?: boolean;
    include_only_explicit?: boolean;
    energy_level?: 'low' | 'medium' | 'high';
    language?: string[];
}

// Audio Player Types
export interface AudioPlayerState {
    isPlaying: boolean;
    currentTrack: MusicTrack | null;
    currentPlaylist: Playlist | null;
    currentTrackIndex: number;
    volume: number; // 0.0 to 1.0
    currentTime: number; // in seconds
    duration: number; // in seconds
    isLoading: boolean;
    isMuted: boolean;
    isShuffled: boolean;
    repeatMode: RepeatMode;
    queue: MusicTrack[];
    queuePosition: number;
}

export type RepeatMode = 'none' | 'one' | 'all';

export interface AudioControls {
    play: () => void;
    pause: () => void;
    togglePlayPause: () => void;
    next: () => void;
    previous: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    toggleShuffle: () => void;
    setRepeatMode: (mode: RepeatMode) => void;
    addToQueue: (track: MusicTrack) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
    reorderQueue: (fromIndex: number, toIndex: number) => void;
}

// YouTube Music API Types
export interface YouTubeMusicSearchResult {
    videos: YouTubeMusicVideo[];
    artists: YouTubeMusicArtist[];
    albums: YouTubeMusicAlbum[];
}

export interface YouTubeMusicVideo {
    videoId: string;
    title: string;
    artist: string;
    duration: number; // in seconds
    thumbnail: string;
    viewCount?: number;
    publishedAt?: string;
}

export interface YouTubeMusicArtist {
    artistId: string;
    artist: string;
    thumbnail: string;
    subscribers?: number;
    verified?: boolean;
}

export interface YouTubeMusicAlbum {
    albumId: string;
    title: string;
    artist: string;
    thumbnail: string;
    year?: number;
    trackCount?: number;
}

export interface YouTubeMusicTrack {
    videoId: string;
    title: string;
    artist: string;
    album?: string;
    duration: number;
    thumbnail: string;
    genre?: string;
    releaseDate?: string;
    explicit?: boolean;
}

// Music Library Types
export interface MusicLibrary {
    playlists: Playlist[];
    favorites: UserFavorite[];
    recentlyPlayed: ListeningHistory[];
    mostPlayed: MusicTrack[];
    downloaded: MusicTrack[];
}

export interface MusicLibraryStats {
    totalPlaylists: number;
    totalTracks: number;
    totalListeningTime: number; // in seconds
    favoriteGenres: string[];
    favoriteArtists: string[];
    listeningStreak: number; // days
}

// Music Discovery Types
export interface MusicDiscovery {
    trending: MusicTrack[];
    newReleases: MusicTrack[];
    recommendations: MusicRecommendation[];
    discoverWeekly: Playlist;
    releaseRadar: Playlist;
    madeForYou: Playlist[];
}

export interface MoodPlaylist {
    id: string;
    name: string;
    description: string;
    mood: 'happy' | 'sad' | 'energetic' | 'relaxed' | 'romantic' | 'workout' | 'study' | 'party';
    tracks: MusicTrack[];
    thumbnail: string;
}

export interface GenreStation {
    id: string;
    name: string;
    description: string;
    genre: string;
    tracks: MusicTrack[];
    thumbnail: string;
}

// Social Features Types
export interface MusicShare {
    id: string;
    user_id: string;
    track_id?: string;
    playlist_id?: string;
    shared_at?: string;
    platform: 'internal' | 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'copy_link';
    message?: string;
    track?: MusicTrack;
    playlist?: Playlist;
    user?: UserProfile;
}

export interface MusicCollaboration {
    id: string;
    playlist_id: string;
    invited_user_id: string;
    invited_by_user_id: string;
    status: 'pending' | 'accepted' | 'declined';
    permissions: 'view' | 'edit' | 'admin';
    invited_at?: string;
    responded_at?: string;
    invited_user?: UserProfile;
    invited_by_user?: UserProfile;
    playlist?: Playlist;
}

export interface MusicActivity {
    id: string;
    user_id: string;
    activity_type: 'created_playlist' | 'added_to_playlist' | 'liked_track' | 'followed_artist' | 'shared_track' | 'started_listening';
    track_id?: string;
    playlist_id?: string;
    artist_name?: string;
    activity_data?: any;
    created_at?: string;
    user?: UserProfile;
    track?: MusicTrack;
    playlist?: Playlist;
}

// Lyrics Types
export interface TrackLyrics {
    track_id: string;
    lyrics: string;
    synced_lyrics?: SyncedLyricsLine[];
    language: string;
    has_timestamps: boolean;
    source: 'musixmatch' | 'azlyrics' | 'genius' | 'manual';
}

export interface SyncedLyricsLine {
    time: number; // in seconds
    text: string;
}

// Music Quality Types
export interface AudioQuality {
    label: 'auto' | 'low' | 'medium' | 'high' | 'lossless';
    bitrate: number; // in kbps
    sampleRate: number; // in Hz
    bitDepth?: number; // for lossless
}

export interface StreamingSettings {
    audioQuality: AudioQuality;
    offlineQuality: AudioQuality;
    crossfadeEnabled: boolean;
    crossfadeDuration: number; // in seconds
    gaplessPlayback: boolean;
    normalizeVolume: boolean;
    autoplay: boolean;
}

// Music Cache Types
export interface CachedTrack {
    track_id: string;
    audio_url: string;
    thumbnail_url: string;
    cached_at: string;
    expires_at: string;
    quality: AudioQuality;
    file_size: number; // in bytes
}

export interface CacheSettings {
    maxStorageSize: number; // in MB
    maxTracksPerQuality: number;
    autoCleanup: boolean;
    cacheOfflineOnly: boolean;
    preferredQualities: AudioQuality[];
}

// Music Analytics Types
export interface UserMusicStats {
    user_id: string;
    period: 'week' | 'month' | 'year' | 'all_time';
    totalListeningTime: number; // in seconds
    totalTracksPlayed: number;
    uniqueArtistsListened: number;
    uniqueGenresExplored: number;
    favoriteGenres: GenreStats[];
    favoriteArtists: ArtistStats[];
    listeningPatterns: ListeningPattern[];
    mostActiveHours: number[];
    completionRate: number; // percentage
    discoveryRate: number; // percentage of new tracks
    created_at?: string;
}

export interface GenreStats {
    genre: string;
    playCount: number;
    totalDuration: number; // in seconds
    percentage: number; // percentage of total listening
}

export interface ArtistStats {
    artist: string;
    playCount: number;
    totalDuration: number; // in seconds
    percentage: number;
    firstListenedAt?: string;
    lastListenedAt?: string;
}

export interface ListeningPattern {
    hour: number;
    day_of_week: number;
    playCount: number;
    averageDuration: number; // in seconds
}

// Music Search Types
export interface MusicSearchFilters {
    genre?: string[];
    artist?: string[];
    duration_min?: number; // in seconds
    duration_max?: number; // in seconds
    release_year_min?: number;
    release_year_max?: number;
    explicit?: boolean;
    popularity_min?: number;
    language?: string[];
}

export interface MusicSearchResults {
    tracks: MusicTrack[];
    artists: YouTubeMusicArtist[];
    albums: YouTubeMusicAlbum[];
    playlists: Playlist[];
    totalResults: number;
    searchQuery: string;
    filters?: MusicSearchFilters;
    sortBy: 'relevance' | 'date' | 'popularity' | 'duration' | 'alphabetical';
    sortOrder: 'asc' | 'desc';
}

// Music Queue Types
export interface MusicQueue {
    id: string;
    tracks: MusicTrack[];
    currentIndex: number;
    isShuffled: boolean;
    repeatMode: RepeatMode;
    source: 'playlist' | 'search' | 'library' | 'radio' | 'album';
    sourceId?: string;
    created_at?: string;
    updated_at?: string;
}

export interface QueueHistory {
    id: string;
    track_id: string;
    played_at: string;
    queue_position: number;
    completion_percentage: number;
}

// Error Types
export interface MusicStreamingError {
    code: string;
    message: string;
    track_id?: string;
    playlist_id?: string;
    retryable: boolean;
    timestamp: string;
}

// Event Types
export interface MusicPlayerEvent {
    type: 'play' | 'pause' | 'track_change' | 'queue_change' | 'volume_change' | 'progress_update';
    track?: MusicTrack;
    position?: number;
    duration?: number;
    timestamp: string;
}

export interface MusicLibraryEvent {
    type: 'playlist_created' | 'track_added' | 'track_removed' | 'favorite_added' | 'favorite_removed';
    playlist_id?: string;
    track_id?: string;
    timestamp: string;
}