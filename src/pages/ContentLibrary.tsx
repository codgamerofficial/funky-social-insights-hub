/**
 * Content Library Page
 * Manage all uploaded videos
 */

import { useState } from 'react';
import { ArrowLeft, Video, Trash2, Calendar, BarChart3, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';

const ContentLibrary = () => {
    // Mock data - replace with actual database query
    const [videos] = useState([
        {
            id: '1',
            title: 'Getting Started with Social Media Marketing',
            thumbnail: 'https://via.placeholder.com/320x180',
            duration: '10:25',
            uploadedAt: '2024-01-15',
            status: 'published',
            platforms: ['youtube', 'facebook'],
            views: 1250,
        },
        {
            id: '2',
            title: 'Advanced Instagram Strategies',
            thumbnail: 'https://via.placeholder.com/320x180',
            duration: '15:30',
            uploadedAt: '2024-01-14',
            status: 'published',
            platforms: ['instagram', 'facebook'],
            views: 890,
        },
        {
            id: '3',
            title: 'YouTube SEO Tips and Tricks',
            thumbnail: 'https://via.placeholder.com/320x180',
            duration: '8:45',
            uploadedAt: '2024-01-13',
            status: 'draft',
            platforms: [],
            views: 0,
        },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-500/20 text-green-500';
            case 'draft': return 'bg-gray-500/20 text-gray-500';
            case 'processing': return 'bg-yellow-500/20 text-yellow-500';
            case 'failed': return 'bg-red-500/20 text-red-500';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    const getPlatformEmoji = (platform: string) => {
        switch (platform) {
            case 'youtube': return '📺';
            case 'facebook': return '📘';
            case 'instagram': return '📷';
            default: return '📱';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/">
                            <Button variant="ghost" className="btn-3d">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-4xl font-bold text-gradient-funky">Content Library</h1>
                    </div>

                    <Link to="/upload">
                        <Button className="btn-3d gradient-instagram text-white">
                            <Video className="w-4 h-4 mr-2" />
                            Upload New
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <Card key={video.id} className="glass-card overflow-hidden group">
                            <div className="relative">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                    {video.duration}
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Badge className={getStatusColor(video.status)}>
                                        {video.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <h3 className="font-bold text-lg line-clamp-2">{video.title}</h3>

                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                                    <span>{video.views.toLocaleString()} views</span>
                                </div>

                                {video.platforms.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-muted-foreground">Published on:</span>
                                        <div className="flex space-x-1">
                                            {video.platforms.map((platform) => (
                                                <span key={platform} className="text-lg">
                                                    {getPlatformEmoji(platform)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1 btn-3d">
                                        <Edit className="w-3 h-3 mr-1" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 btn-3d">
                                        <BarChart3 className="w-3 h-3 mr-1" />
                                        Analytics
                                    </Button>
                                    <Button variant="outline" size="sm" className="btn-3d">
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {videos.length === 0 && (
                    <Card className="glass-card p-12 text-center">
                        <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Upload your first video to get started!
                        </p>
                        <Link to="/upload">
                            <Button className="btn-3d gradient-funky text-white">
                                Upload Video
                            </Button>
                        </Link>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default ContentLibrary;
