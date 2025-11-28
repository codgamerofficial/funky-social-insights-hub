/**
 * Upload Page
 * Main interface for uploading videos and publishing to platforms
 */

import { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import VideoUploader from '@/components/VideoUploader';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useToast } from '@/hooks/use-toast';

const UploadPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { saveVideoToDatabase } = useVideoUpload();

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

    const handleUploadComplete = (data: any) => {
        setVideoData(data);
        toast({
            title: 'Video Uploaded',
            description: 'Now add details and select platforms to publish.',
        });
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

        // Simulate AI generation (replace with actual AI API call)
        setTimeout(() => {
            const generatedDesc = `This is an AI-generated description for "${title}". 

🎯 In this video, we explore the key concepts and provide valuable insights.

📌 Key Points:
• Comprehensive overview
• Practical examples
• Expert tips and tricks

👍 Don't forget to like, subscribe, and hit the bell icon for more content!

#video #content #socialmedia`;

            setDescription(generatedDesc);
            setIsGenerating(false);

            toast({
                title: 'Content Generated',
                description: 'AI-generated description added!',
            });
        }, 2000);
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

            // TODO: Implement actual platform publishing
            // This would call the YouTube, Facebook, Instagram APIs

            setTimeout(() => {
                setIsPublishing(false);
                toast({
                    title: 'Published Successfully!',
                    description: `Video published to ${selectedPlatforms.join(', ')}`,
                });
                navigate('/library');
            }, 2000);
        } catch (error: any) {
            setIsPublishing(false);
            toast({
                title: 'Publishing Failed',
                description: error.message,
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
                    <h1 className="text-4xl font-bold text-gradient-funky">Upload Video</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Video Upload */}
                    <div className="space-y-6">
                        <VideoUploader
                            onUploadComplete={handleUploadComplete}
                            userId={user?.id || ''}
                        />

                        {videoData && (
                            <Card className="glass-card p-6">
                                <h3 className="text-lg font-bold mb-4">Video Details</h3>
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
                                className="btn-3d"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UploadPage;
