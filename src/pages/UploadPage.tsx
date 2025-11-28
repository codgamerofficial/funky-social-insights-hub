/**
 * Upload Page
 * Main interface for uploading videos and publishing to platforms
 */

import { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Calendar, Play, Pause, Volume2, VolumeX, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import VideoUploader from '@/components/VideoUploader';
import BatchUploader from '@/components/BatchUploader';
import ScheduleDialog, { ScheduleData } from '@/components/ui/schedule-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useToast } from '@/hooks/use-toast';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';

const UploadPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { saveVideoToDatabase } = useVideoUpload();
    const { schedulePost, isScheduling } = useScheduledPosts();

    const [videoData, setVideoData] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [platforms, setPlatforms] = useState({
        youtube: false,
        facebook: false,
        instagram: false,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [savedVideoId, setSavedVideoId] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handleUploadComplete = (data: any) => {
        setVideoData(data);
        setIsPlaying(false);
        setIsMuted(false);
        setCurrentTime(0);
        setDuration(0);
        toast({
            title: 'Video Uploaded',
            description: 'Now add details and select platforms to publish.',
        });
    };

    const togglePlayPause = () => {
        const video = document.getElementById('video-preview') as HTMLVideoElement;
        if (video) {
            if (isPlaying) {
                video.pause();
            } else {
                video.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        const video = document.getElementById('video-preview') as HTMLVideoElement;
        if (video) {
            video.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        const video = document.getElementById('video-preview') as HTMLVideoElement;
        if (video) {
            setCurrentTime(video.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        const video = document.getElementById('video-preview') as HTMLVideoElement;
        if (video) {
            setDuration(video.duration);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleGenerateContent = async () => {
        if (!title) {
            toast({
                title: 'Title Required',
                description: 'Please enter a video title first.',
                variant: 'destructive',
            });
            return;
        }

        setIsGenerating(true);

        try {
            const { createAIContentGenerator } = await import('@/lib/api/ai-content');

            // Initialize AI generator
            const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

            let aiGenerator;
            if (geminiApiKey) {
                aiGenerator = createAIContentGenerator({
                    provider: 'gemini',
                    apiKey: geminiApiKey,
                });
            } else if (openaiApiKey) {
                aiGenerator = createAIContentGenerator({
                    provider: 'openai',
                    apiKey: openaiApiKey,
                });
            }

            if (!aiGenerator) {
                throw new Error('No AI API keys found');
            }

            // Generate content
            const contentOptions = {
                videoTitle: title,
                videoDescription: description,
                targetPlatform: 'youtube' as const,
                tone: 'engaging' as const,
            };

            const descriptions = await aiGenerator.generateDescriptions(contentOptions);
            const tags = await aiGenerator.generateTags(contentOptions, 10);

            const generatedDesc = descriptions[0] || `This is an AI-generated description for "${title}". 

🎯 In this video, we explore the key concepts and provide valuable insights.

📌 Key Points:
• Comprehensive overview
• Practical examples
• Expert tips and tricks

👍 Don't forget to like, subscribe, and hit the bell icon for more content!`;

            const tagString = tags.map(tag => `#${tag}`).join(' ');
            setDescription(`${generatedDesc}\n\n${tagString}`);

            toast({
                title: 'Content Generated',
                description: 'AI-generated description added!',
            });
        } catch (error: any) {
            console.error('AI generation error:', error);
            toast({
                title: 'Generation Failed',
                description: 'Failed to generate content. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const publishToPlatform = async (
        platform: string,
        userId: string,
        videoTitle: string,
        videoDescription: string,
        videoUrl: string
    ) => {
        // Get user's platform connection
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: connection, error } = await (supabase as any)
            .from('platform_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('platform', platform)
            .single();

        if (error || !connection) {
            throw new Error(`${platform} connection not found`);
        }

        switch (platform) {
            case 'youtube':
                try {
                    // Get YouTube API configuration
                    const { createYouTubeAPI } = await import('@/lib/api/youtube');

                    const youtubeAPI = createYouTubeAPI({
                        clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID || '',
                        clientSecret: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || '',
                        apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
                        redirectUri: `${window.location.origin}/oauth/callback`
                    });

                    // Download video file from storage for upload
                    const videoResponse = await fetch(videoUrl);
                    if (!videoResponse.ok) {
                        throw new Error('Failed to download video for YouTube upload');
                    }

                    const videoBlob = await videoResponse.blob();
                    const videoFile = new File([videoBlob], `${videoTitle}.mp4`, { type: videoBlob.type });

                    // Extract tags from description (hashtags)
                    const tagMatches = description.match(/#\w+/g) || [];
                    const tags = tagMatches.map(tag => tag.substring(1)); // Remove # symbol

                    // Upload to YouTube
                    const uploadResult = await youtubeAPI.uploadVideo(
                        connection.access_token,
                        videoFile,
                        {
                            title: videoTitle,
                            description: videoDescription,
                            tags: tags,
                            privacyStatus: 'public'
                        }
                    );

                    console.log('YouTube upload successful:', uploadResult);
                    return uploadResult;
                } catch (error: any) {
                    console.error('YouTube upload error:', error);
                    throw new Error(`YouTube upload failed: ${error.message}`);
                }

            case 'facebook':
                // For Facebook, we can share the video URL
                const { createFacebookAPI } = await import('@/lib/api/facebook');
                const facebookAPI = createFacebookAPI({
                    appId: import.meta.env.VITE_FACEBOOK_APP_ID,
                    appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
                    redirectUri: `${window.location.origin}/oauth/callback`
                });

                // Get user's pages
                const pages = await facebookAPI.getUserPages(connection.access_token);
                if (pages.length > 0) {
                    const pageId = pages[0].id;
                    // Create video post
                    await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: `${videoTitle}\n\n${videoDescription}\n\nWatch: ${videoUrl}`,
                            access_token: connection.access_token,
                        }),
                    });
                }
                break;

            case 'instagram':
                try {
                    // Get Instagram API configuration
                    const { createInstagramAPI } = await import('@/lib/api/instagram');

                    const instagramAPI = createInstagramAPI({
                        appId: import.meta.env.VITE_INSTAGRAM_APP_ID || import.meta.env.VITE_FACEBOOK_APP_ID || '',
                        appSecret: import.meta.env.VITE_INSTAGRAM_APP_SECRET || import.meta.env.VITE_FACEBOOK_APP_SECRET || '',
                        redirectUri: `${window.location.origin}/oauth/callback`
                    });

                    // First, get the user's pages to find Instagram Business Account
                    const { createFacebookAPI } = await import('@/lib/api/facebook');
                    const facebookAPI = createFacebookAPI({
                        appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
                        appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET || '',
                        redirectUri: `${window.location.origin}/oauth/callback`
                    });

                    const pages = await facebookAPI.getUserPages(connection.access_token);
                    if (pages.length === 0) {
                        throw new Error('No Facebook pages found. Instagram Business Account required.');
                    }

                    // Find the first page with Instagram Business Account
                    let instagramAccountId: string | null = null;
                    let selectedPage = null;

                    for (const page of pages) {
                        try {
                            instagramAccountId = await instagramAPI.getInstagramAccountId(
                                connection.access_token,
                                page.id
                            );
                            selectedPage = page;
                            break;
                        } catch (error) {
                            // This page doesn't have Instagram Business Account, try next
                            continue;
                        }
                    }

                    if (!instagramAccountId) {
                        throw new Error('No Instagram Business Account found. Please connect your Instagram Business Account.');
                    }

                    // Extract hashtags from description for caption
                    const tagMatches = description.match(/#\w+/g) || [];
                    const hashtagText = tagMatches.join(' ');

                    // Truncate caption to Instagram's limit (2200 characters)
                    const maxCaptionLength = 2200;
                    let caption = videoTitle + '\n\n' + videoDescription;
                    if (hashtagText) {
                        caption += '\n\n' + hashtagText;
                    }

                    if (caption.length > maxCaptionLength) {
                        caption = caption.substring(0, maxCaptionLength - 3) + '...';
                    }

                    // Upload Reel to Instagram
                    const uploadResult = await instagramAPI.uploadReel(
                        connection.access_token,
                        instagramAccountId,
                        videoUrl, // Must be publicly accessible
                        {
                            caption: caption,
                            shareToFeed: true, // Share to feed as well as Reels
                        }
                    );

                    console.log('Instagram upload successful:', uploadResult);
                    return uploadResult;
                } catch (error: any) {
                    console.error('Instagram upload error:', error);
                    throw new Error(`Instagram upload failed: ${error.message}`);
                }
        }
    };

    const handleSchedule = async (scheduleData: ScheduleData) => {
        if (!user || !videoData) return;

        if (!title.trim()) {
            toast({
                title: 'Title Required',
                description: 'Please enter a video title.',
                variant: 'destructive',
            });
            return;
        }

        try {
            // Save video to database first
            const video = await saveVideoToDatabase(
                user.id,
                title,
                description,
                videoData.url,
                videoData.path,
                videoData.metadata
            );

            if (!video) {
                throw new Error('Failed to save video to database');
            }

            setSavedVideoId(video.id);

            // Schedule the post
            await schedulePost(video.id, {
                ...scheduleData,
                platforms: scheduleData.platforms.filter(platform => platforms[platform as keyof typeof platforms]),
            });

            setShowScheduleDialog(false);
            navigate('/library');
        } catch (error: any) {
            toast({
                title: 'Scheduling Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const validatePlatformConnections = async (selectedPlatforms: string[]) => {
        const { supabase } = await import('@/integrations/supabase/client');
        const invalidPlatforms: string[] = [];

        for (const platform of selectedPlatforms) {
            const { data, error } = await (supabase as any)
                .from('platform_connections')
                .select('*')
                .eq('user_id', user!.id)
                .eq('platform', platform)
                .eq('status', 'connected')
                .single();

            if (error || !data) {
                invalidPlatforms.push(platform);
            }
        }

        return invalidPlatforms;
    };

    const handlePublish = async () => {
        if (!user || !videoData) return;

        const selectedPlatforms = Object.entries(platforms)
            .filter(([_, selected]) => selected)
            .map(([platform]) => platform);

        if (selectedPlatforms.length === 0) {
            toast({
                title: 'Select Platforms',
                description: 'Please select at least one platform to publish to.',
                variant: 'destructive',
            });
            return;
        }

        if (!title.trim()) {
            toast({
                title: 'Title Required',
                description: 'Please enter a video title.',
                variant: 'destructive',
            });
            return;
        }

        setIsPublishing(true);

        try {
            // Validate platform connections first
            const invalidPlatforms = await validatePlatformConnections(selectedPlatforms);

            if (invalidPlatforms.length > 0) {
                toast({
                    title: 'Connection Required',
                    description: `Please connect your ${invalidPlatforms.join(', ')} account(s) first.`,
                    variant: 'destructive',
                });
                setIsPublishing(false);
                navigate('/platform-connections');
                return;
            }

            // Save video to database
            const video = await saveVideoToDatabase(
                user.id,
                title,
                description,
                videoData.url,
                videoData.path,
                videoData.metadata
            );

            toast({
                title: 'Publishing...',
                description: `Publishing to ${selectedPlatforms.join(', ')}`,
            });

            // Publish to selected platforms with detailed logging
            const publishResults = await Promise.allSettled(
                selectedPlatforms.map(async (platform) => {
                    try {
                        await publishToPlatform(platform, user.id, title, description, videoData.url);
                        return { platform, status: 'success', error: null };
                    } catch (error: any) {
                        return { platform, status: 'failed', error: error.message };
                    }
                })
            );

            const successful = publishResults.filter(result => result.status === 'fulfilled').length;
            const failed = publishResults.filter(result => result.status === 'rejected');
            const detailedFailed = publishResults
                .filter(result => result.status === 'fulfilled')
                .map(result => (result as any).value)
                .filter(result => result.status === 'failed');

            setIsPublishing(false);

            if (failed.length > 0 || detailedFailed.length > 0) {
                const totalFailed = failed.length + detailedFailed.length;
                const failureDetails = detailedFailed.map(f => `${f.platform}: ${f.error}`).join(', ');

                toast({
                    title: 'Partial Success',
                    description: `Published to ${successful} platform(s). ${totalFailed} failed. ${failureDetails}`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Published Successfully!',
                    description: `Video published to ${selectedPlatforms.join(', ')}`,
                });
            }

            navigate('/library');
        } catch (error: any) {
            setIsPublishing(false);
            console.error('Publishing error:', error);
            toast({
                title: 'Publishing Failed',
                description: error.message || 'An unexpected error occurred during publishing.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
                <div className="flex items-center space-x-4">
                    <Link to="/">
                        <Button variant="ghost" className="btn-3d">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold text-gradient-funky">Upload Videos</h1>
                </div>

                <Tabs defaultValue="single" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="single" className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Single Upload
                        </TabsTrigger>
                        <TabsTrigger value="batch" className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Batch Upload
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Video Upload */}
                            <div className="space-y-6">
                                <VideoUploader
                                    onUploadComplete={handleUploadComplete}
                                    userId={user?.id || ''}
                                />

                                {videoData && (
                                    <Card className="glass-card p-6">
                                        <h3 className="text-lg font-bold mb-4">Video Preview</h3>

                                        {/* Video Player */}
                                        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                                            <video
                                                id="video-preview"
                                                className="w-full h-auto"
                                                src={videoData.url}
                                                onTimeUpdate={handleTimeUpdate}
                                                onLoadedMetadata={handleLoadedMetadata}
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                                controls={false}
                                                muted={isMuted}
                                            />

                                            {/* Video Controls Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={togglePlayPause}
                                                            className="text-white hover:bg-white/20"
                                                        >
                                                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={toggleMute}
                                                            className="text-white hover:bg-white/20"
                                                        >
                                                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                                        </Button>

                                                        <span className="text-white text-sm">
                                                            {formatTime(currentTime)} / {formatTime(duration || videoData.metadata.duration)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-2">
                                                    <div className="w-full bg-white/20 rounded-full h-1">
                                                        <div
                                                            className="bg-blue-500 h-1 rounded-full transition-all duration-150"
                                                            style={{ width: `${((currentTime / (duration || videoData.metadata.duration)) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Video Metadata */}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Duration:</span>
                                                <span>{Math.floor(videoData.metadata.duration / 60)}:{(videoData.metadata.duration % 60).toString().padStart(2, '0')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Resolution:</span>
                                                <span>{videoData.metadata.width}x{videoData.metadata.height}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Size:</span>
                                                <span>{(videoData.metadata.size / (1024 * 1024)).toFixed(2)} MB</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Format:</span>
                                                <span>{videoData.metadata.format || 'Unknown'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">FPS:</span>
                                                <span>{videoData.metadata.fps || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>

                            {/* Right Column - Metadata & Publishing */}
                            <div className="space-y-6">
                                <Card className="glass-card p-6">
                                    <h3 className="text-lg font-bold mb-4">Content Details</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Title *</Label>
                                            <Input
                                                id="title"
                                                placeholder="Enter video title..."
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleGenerateContent}
                                                    disabled={isGenerating || !title}
                                                    className="btn-3d"
                                                >
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    {isGenerating ? 'Generating...' : 'AI Generate'}
                                                </Button>
                                            </div>
                                            <Textarea
                                                id="description"
                                                placeholder="Enter video description..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={8}
                                                className="resize-none"
                                            />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="glass-card p-6">
                                    <h3 className="text-lg font-bold mb-4">Select Platforms</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="youtube"
                                                checked={platforms.youtube}
                                                onCheckedChange={(checked) =>
                                                    setPlatforms({ ...platforms, youtube: !!checked })
                                                }
                                            />
                                            <Label htmlFor="youtube" className="flex items-center space-x-2 cursor-pointer">
                                                <span className="text-2xl">📺</span>
                                                <span>YouTube</span>
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="facebook"
                                                checked={platforms.facebook}
                                                onCheckedChange={(checked) =>
                                                    setPlatforms({ ...platforms, facebook: !!checked })
                                                }
                                            />
                                            <Label htmlFor="facebook" className="flex items-center space-x-2 cursor-pointer">
                                                <span className="text-2xl">📘</span>
                                                <span>Facebook</span>
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="instagram"
                                                checked={platforms.instagram}
                                                onCheckedChange={(checked) =>
                                                    setPlatforms({ ...platforms, instagram: !!checked })
                                                }
                                            />
                                            <Label htmlFor="instagram" className="flex items-center space-x-2 cursor-pointer">
                                                <span className="text-2xl">📷</span>
                                                <span>Instagram (Reels)</span>
                                            </Label>
                                        </div>
                                    </div>
                                </Card>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={handlePublish}
                                        disabled={!videoData || isPublishing}
                                        className="flex-1 btn-3d gradient-instagram text-white"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {isPublishing ? 'Publishing...' : 'Publish Now'}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        disabled={!videoData}
                                        onClick={() => setShowScheduleDialog(true)}
                                        className="btn-3d"
                                    >
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Schedule
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="batch" className="mt-6">
                        <BatchUploader />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Schedule Dialog */}
            <ScheduleDialog
                open={showScheduleDialog}
                onOpenChange={setShowScheduleDialog}
                onSchedule={handleSchedule}
                isLoading={isScheduling}
            />
        </div>
    );
};

export default UploadPage;
