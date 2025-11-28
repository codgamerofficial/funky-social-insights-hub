/**
 * Music Streaming Platform Type Definitions
 * Complete type system for music streaming features
 */

// =============================================================================
// CORE MUSIC DATABASE TYPES (matching Supabase schema)
// =============================================================================

// Artists table (extracted from YouTube data)
export interface Artist {
    id: string;
    youtube_artist_id?: string;
    name: string;
    description?: string;
    thumbnail_url?: string;
    banner_url?: string;
    follower_count?: number;
    monthly_listeners?: number;
    verified?: boolean;
    genres?: string[];
    country?: string;
    formed_year?: number;
    popularity_score?: number; // 0.0 to 1.0
    created_at?: string;
    updated_at?: string;
}

// Albums table (grouping of tracks)
export interface Album {
    id: string;
    youtube_playlist_id?: string;
    youtube_album_id?: string;
    title: string;
    description?: string;
    artist_id?: string;
    thumbnail_url?: string;
    banner_url?: string;
    release_date?: string;
    album_type?: 'album' | 'single' | 'EP' | 'compilation';
    total_tracks?: number;
    total_duration?: number; // in seconds
    popularity_score?: number; // 0.0 to 1.0
    explicit?: boolean;
    created_at?: string;
    updated_at?: string;
    artist?: Artist;
}

// Enhanced Music tracks table (YouTube-based music content)
export interface Track {
    id: string;
    youtube_video_id: string;
    youtube_playlist_id?: string;
    title: string;
    description?: string;
    artist_id?: string;
    album_id?: string;
    duration: number; // in seconds
    thumbnail_url?: string;
    banner_url?: string;
    genre?: string;
    subgenre?: string;
    language?: string;
    release_date?: string;
    view_count?: number;
    like_count?: number;
    comment_count?: number;
    popularity_score?: number; // 0.0 to 1.0
    energy_level?: number; // 0.0 to 1.0
    danceability?: number; // 0.0 to 1.0
    valence?: number; // musical positivity 0.0 to 1.0
    tempo?: number; // BPM
    key_signature?: string; // e.g., "C major", "A minor"
    time_signature?: string; // e.g., "4/4"
    explicit?: boolean;
    instrumental?: boolean;
    live_performance?: boolean;
    cover_version?: boolean;
    remix_version?: boolean;
    created_at?: string;
    updated_at?: string;
    artist?: Artist;
    album?: Album;
}

// Legacy MusicTrack interface for backward compatibility
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

// Legacy Playlist interface for backward compatibility
export interface LegacyPlaylist {
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
    tracks?: LegacyPlaylistTrack[];
    user?: UserProfile;
}

export interface LegacyPlaylistTrack {
    id: string;
    playlist_id: string;
    track_id: string;
    position: number;
    added_at?: string;
    track?: MusicTrack;
}

// =============================================================================
// USER MANAGEMENT DATABASE TYPES
// =============================================================================

// User music library (personal collection)
export interface UserLibrary {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    is_default?: boolean;
    is_public?: boolean;
    cover_image_url?: string;
    total_tracks?: number;
    total_duration?: number; // in seconds
    created_at?: string;
    updated_at?: string;
}

// Enhanced User Profile (integrating with auth.users)
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

// User playlists
export interface Playlist {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    cover_image_url?: string;
    is_public?: boolean;
    is_collaborative?: boolean;
    is_smart?: boolean; // AI-generated or algorithm-based
    playlist_type?: 'manual' | 'smart' | 'discover' | 'top_songs' | 'recent' | 'favorite';
    total_tracks?: number;
    total_duration?: number; // in seconds
    follower_count?: number;
    play_count?: number;
    created_at?: string;
    updated_at?: string;
    tracks?: PlaylistTrack[];
    user?: UserProfile;
}

// Playlist tracks (many-to-many relationship)
export interface PlaylistTrack {
    id: string;
    playlist_id: string;
    track_id: string;
    position: number;
    added_by?: string;
    added_at?: string;
    track?: Track;
}

// User favorites (liked songs)
export interface UserFavorite {
    id: string;
    user_id: string;
    track_id: string;
    created_at?: string;
    track?: Track;
}

// Legacy UserFavorite interface for backward compatibility
export interface LegacyUserFavorite {
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

// =============================================================================
// COMPREHENSIVE DATABASE TYPES - ANALYTICS & LISTENING HISTORY
// =============================================================================

// User listening history
export interface ListeningHistoryEntry {
    id: string;
    user_id: string;
    track_id: string;
    playlist_id?: string;
    session_id?: string;
    listened_at?: string;
    duration_listened: number; // in seconds
    completion_percentage?: number; // 0.00 to 100.00
    skipped?: boolean;
    replay_count?: number;
    device_type?: 'web' | 'mobile' | 'tablet';
    context_type?: 'playlist' | 'search' | 'recommendation' | 'direct';
    play_source?: 'youtube' | 'local' | 'uploaded';
    quality_setting?: 'auto' | 'low' | 'medium' | 'high';
    created_at?: string;
    track?: Track;
    playlist?: Playlist;
}

// User listening statistics
export interface UserListeningStats {
    id: string;
    user_id: string;
    total_listens?: number;
    total_listening_time?: number; // in seconds
    unique_tracks_played?: number;
    favorite_genre?: string;
    favorite_artist_id?: string;
    favorite_track_id?: string;
    listening_streak_days?: number;
    most_active_hour?: number; // 0-23
    most_active_day?: number; // 0-6 (Sunday-Saturday)
    average_session_length?: number; // in minutes
    last_activity_at?: string;
    created_at?: string;
    updated_at?: string;
    favorite_artist?: Artist;
    favorite_track?: Track;
}

// =============================================================================
// COMPREHENSIVE DATABASE TYPES - AI & RECOMMENDATIONS
// =============================================================================

// Database Music Recommendations
export interface DatabaseMusicRecommendation {
    id: string;
    user_id: string;
    track_id: string;
    recommendation_type: 'collaborative' | 'content_based' | 'trending' | 'new_release' | 'similar_artist' | 'mood_based' | 'ai_generated';
    confidence_score?: number; // 0.00 to 1.00
    algorithm_version?: string;
    created_at?: string;
    expires_at?: string;
    clicked?: boolean;
    liked?: boolean;
    played?: boolean;
    track?: Track;
}

// User music preferences
export interface UserMusicPreferences {
    id: string;
    user_id: string;
    preferred_genres?: string[];
    disliked_genres?: string[];
    preferred_artists?: string[]; // Artist names or YouTube channel IDs
    preferred_languages?: string[];
    explicit_content_allowed?: boolean;
    preferred_audio_quality?: 'low' | 'medium' | 'high' | 'auto';
    crossfade_enabled?: boolean;
    crossfade_duration?: number; // in seconds
    autoplay_enabled?: boolean;
    repeat_mode?: 'off' | 'one' | 'all';
    shuffle_enabled?: boolean;
    volume_level?: number; // 0.0 to 1.0
    created_at?: string;
    updated_at?: string;
}

// =============================================================================
// COMPREHENSIVE DATABASE TYPES - SOCIAL FEATURES
// =============================================================================

// User follows (for social discovery)
export interface UserFollow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at?: string;
    follower?: UserProfile;
    following?: UserProfile;
}

// Playlist follows
export interface PlaylistFollow {
    id: string;
    user_id: string;
    playlist_id: string;
    created_at?: string;
    user?: UserProfile;
    playlist?: Playlist;
}

// Music activity feed
// Database Music Activity Feed
export interface DatabaseMusicActivity {
    id: string;
    user_id: string;
    activity_type: 'play' | 'like' | 'playlist_create' | 'playlist_follow' | 'playlist_share' | 'track_add' | 'artist_follow';
    target_type: 'track' | 'playlist' | 'artist' | 'album';
    target_id: string; // References the appropriate table based on target_type
    metadata?: any; // Additional activity data
    is_public?: boolean;
    created_at?: string;
    user?: UserProfile;
}

// =============================================================================
// UTILITY TYPES FOR DATABASE OPERATIONS
// =============================================================================

// Database query result types
export interface DatabaseTrack extends Track {
    artist?: Artist;
    album?: Album;
}

export interface DatabasePlaylist extends Playlist {
    user?: UserProfile;
    tracks?: (PlaylistTrack & { track?: Track })[];
}

export interface DatabaseUserFavorite extends UserFavorite {
    track?: Track;
}

export interface DatabaseListeningHistory extends ListeningHistoryEntry {
    track?: Track;
    playlist?: Playlist;
}

// Supabase response types
export interface SupabaseMusicResponse<T> {
    data: T | null;
    error: string | null;
    count?: number;
}

// Batch operation types
export interface BatchOperation {
    table: string;
    operation: 'insert' | 'update' | 'delete';
    records: any[];
    filter?: string;
}