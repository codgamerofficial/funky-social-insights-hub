import { useState, useCallback } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Edit,
    Trash2,
    Copy,
    PlayCircle,
    Youtube,
    Facebook,
    Instagram,
    MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ScheduledPost {
    id: string;
    title: string;
    content: string;
    platforms: string[];
    scheduledTime: Date;
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    mediaUrls?: string[];
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const PLATFORM_ICONS = {
    youtube: Youtube,
    facebook: Facebook,
    instagram: Instagram
};

const PLATFORM_COLORS = {
    youtube: 'bg-red-500',
    facebook: 'bg-blue-500',
    instagram: 'bg-pink-500'
};

const SUGGESTED_TIMES = [
    { time: '09:00', label: 'Morning (9 AM)', engagement: 'High' },
    { time: '12:00', label: 'Lunch (12 PM)', engagement: 'Medium' },
    { time: '15:00', label: 'Afternoon (3 PM)', engagement: 'High' },
    { time: '18:00', label: 'Evening (6 PM)', engagement: 'Very High' },
    { time: '21:00', label: 'Prime Time (9 PM)', engagement: 'Very High' }
];

export const ContentCalendar = () => {
    const [posts, setPosts] = useState<ScheduledPost[]>([
        {
            id: '1',
            title: 'New Tutorial Video',
            content: 'Learn advanced React hooks with practical examples',
            platforms: ['youtube', 'facebook'],
            scheduledTime: new Date(2024, 11, 29, 18, 0), // Dec 29, 2024, 6:00 PM
            status: 'scheduled',
            tags: ['#react', '#tutorial', '#programming'],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: '2',
            title: 'Behind the Scenes',
            content: 'Take a look at our creative process',
            platforms: ['instagram'],
            scheduledTime: new Date(2024, 11, 30, 15, 0), // Dec 30, 2024, 3:00 PM
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [draggedPost, setDraggedPost] = useState<ScheduledPost | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

    // Get calendar days for the current month
    const getCalendarDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startDate);

        for (let i = 0; i < 42; i++) { // 6 weeks view
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const getPostsForDate = (date: Date) => {
        return posts.filter(post =>
            post.scheduledTime.toDateString() === date.toDateString()
        );
    };

    const handleDragStart = (post: ScheduledPost) => {
        setDraggedPost(post);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetDate: Date) => {
        e.preventDefault();
        if (draggedPost) {
            const updatedPosts = posts.map(post =>
                post.id === draggedPost.id
                    ? { ...post, scheduledTime: new Date(targetDate) }
                    : post
            );
            setPosts(updatedPosts);
            setDraggedPost(null);
        }
    }, [draggedPost, posts]);

    const createNewPost = (postData: Partial<ScheduledPost>) => {
        const newPost: ScheduledPost = {
            id: Date.now().toString(),
            title: postData.title || 'Untitled Post',
            content: postData.content || '',
            platforms: postData.platforms || [],
            scheduledTime: postData.scheduledTime || new Date(),
            status: 'draft',
            tags: postData.tags || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setPosts(prev => [...prev, newPost]);
        setIsCreateModalOpen(false);
    };

    const duplicatePost = (post: ScheduledPost) => {
        const duplicatedPost: ScheduledPost = {
            ...post,
            id: Date.now().toString(),
            title: `${post.title} (Copy)`,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setPosts(prev => [...prev, duplicatedPost]);
    };

    const deletePost = (postId: string) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    const getStatusColor = (status: ScheduledPost['status']) => {
        switch (status) {
            case 'published': return 'bg-green-500';
            case 'scheduled': return 'bg-blue-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getEngagementColor = (engagement: string) => {
        switch (engagement) {
            case 'Very High': return 'text-green-500';
            case 'High': return 'text-blue-500';
            case 'Medium': return 'text-yellow-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gradient-funky">Content Calendar</h2>
                    <p className="text-muted-foreground mt-2">
                        Plan, schedule, and manage your content across all platforms
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <Button
                            variant={viewMode === 'month' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('month')}
                        >
                            Month
                        </Button>
                        <Button
                            variant={viewMode === 'week' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('week')}
                        >
                            Week
                        </Button>
                        <Button
                            variant={viewMode === 'day' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('day')}
                        >
                            Day
                        </Button>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="btn-3d gradient-funky">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Post
                            </Button>
                        </DialogTrigger>
                        <CreatePostDialog onSave={createNewPost} />
                    </Dialog>
                </div>
            </div>

            {/* Calendar Navigation */}
            <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setMonth(newDate.getMonth() - 1);
                                setSelectedDate(newDate);
                            }}
                        >
                            Previous
                        </Button>
                        <h3 className="text-xl font-semibold">
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setMonth(newDate.getMonth() + 1);
                                setSelectedDate(newDate);
                            }}
                        >
                            Next
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setSelectedDate(new Date())}
                    >
                        Today
                    </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    {getCalendarDays().map((date, index) => {
                        const dayPosts = getPostsForDate(date);
                        const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                            <div
                                key={index}
                                className={`
                  min-h-[120px] p-2 border border-white/10 rounded-lg cursor-pointer transition-colors
                  ${isCurrentMonth ? 'bg-white/5' : 'bg-white/2 opacity-50'}
                  ${isToday ? 'ring-2 ring-primary' : ''}
                  hover:bg-white/10
                `}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, date)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                                        {date.getDate()}
                                    </span>
                                    {dayPosts.length > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                            {dayPosts.length}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {dayPosts.slice(0, 3).map(post => (
                                        <div
                                            key={post.id}
                                            draggable
                                            onDragStart={() => handleDragStart(post)}
                                            className={`
                        p-2 rounded text-xs cursor-move hover:opacity-80 transition-opacity
                        ${getStatusColor(post.status)}
                      `}
                                        >
                                            <div className="flex items-center gap-1 mb-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{post.scheduledTime.toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                })}</span>
                                            </div>

                                            <div className="font-medium truncate">{post.title}</div>

                                            <div className="flex gap-1 mt-1">
                                                {post.platforms.map(platform => {
                                                    const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
                                                    return Icon ? <Icon key={platform} className="w-3 h-3" /> : null;
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    {dayPosts.length > 3 && (
                                        <div className="text-xs text-muted-foreground text-center">
                                            +{dayPosts.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Suggested Posting Times */}
            <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Optimal Posting Times</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {SUGGESTED_TIMES.map((suggestion, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 cursor-pointer transition-colors"
                            onClick={() => {
                                const [hours, minutes] = suggestion.time.split(':');
                                const newDate = new Date(selectedDate);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                setSelectedDate(newDate);
                            }}
                        >
                            <div className="text-sm font-medium">{suggestion.label}</div>
                            <div className={`text-xs ${getEngagementColor(suggestion.engagement)}`}>
                                {suggestion.engagement} engagement
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Upcoming Posts List */}
            <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Upcoming Posts</h3>
                <div className="space-y-3">
                    {posts
                        .filter(post => post.scheduledTime > new Date() && post.status !== 'published')
                        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
                        .slice(0, 5)
                        .map(post => (
                            <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(post.status)}`} />

                                    <div>
                                        <h4 className="font-medium">{post.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {post.scheduledTime.toLocaleDateString()} at {post.scheduledTime.toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {post.platforms.map(platform => {
                                                const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
                                                return Icon ? (
                                                    <Icon key={platform} className="w-4 h-4" />
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => duplicatePost(post)}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-500"
                                            onClick={() => deletePost(post.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                </div>
            </Card>
        </div>
    );
};

// Create Post Dialog Component
interface CreatePostDialogProps {
    onSave: (post: Partial<ScheduledPost>) => void;
}

const CreatePostDialog = ({ onSave }: CreatePostDialogProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
    const [tags, setTags] = useState('');

    const handleSave = () => {
        onSave({
            title,
            content,
            platforms,
            scheduledTime,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
        });
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
                <div>
                    <Label>Title</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title..."
                    />
                </div>

                <div>
                    <Label>Content</Label>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter post content..."
                        rows={4}
                    />
                </div>

                <div>
                    <Label>Platforms</Label>
                    <div className="flex gap-2 mt-2">
                        {Object.entries(PLATFORM_ICONS).map(([platform, Icon]) => (
                            <Button
                                key={platform}
                                variant={platforms.includes(platform) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setPlatforms(prev =>
                                        prev.includes(platform)
                                            ? prev.filter(p => p !== platform)
                                            : [...prev, platform]
                                    );
                                }}
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Date & Time</Label>
                        <Input
                            type="datetime-local"
                            value={scheduledTime.toISOString().slice(0, 16)}
                            onChange={(e) => setScheduledTime(new Date(e.target.value))}
                        />
                    </div>

                    <div>
                        <Label>Tags (comma-separated)</Label>
                        <Input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="#react, #tutorial"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline">Save as Draft</Button>
                    <Button onClick={handleSave} className="gradient-funky">
                        Schedule Post
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
};