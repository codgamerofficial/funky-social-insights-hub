/**
 * Scheduler Page
 * Manage scheduled posts and content calendar
 */

import { useState } from 'react';
import { ArrowLeft, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import Header from '@/components/Header';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import { useToast } from '@/hooks/use-toast';

const SchedulerPage = () => {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Mock data - replace with database fetch
    const [posts] = useState([
        {
            id: '1',
            title: 'Product Launch Teaser',
            date: new Date(new Date().setHours(10, 0, 0, 0)), // Today 10 AM
            platforms: ['instagram', 'facebook'],
            status: 'scheduled' as const,
        },
        {
            id: '2',
            title: 'Weekly Update',
            date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days later
            platforms: ['youtube'],
            status: 'scheduled' as const,
        },
        {
            id: '3',
            title: 'Behind the Scenes',
            date: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
            platforms: ['instagram'],
            status: 'published' as const,
        },
    ]);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsDialogOpen(true);
    };

    const handlePostClick = (post: any) => {
        toast({
            title: 'Post Details',
            description: `Editing: ${post.title}`,
        });
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
                        <h1 className="text-4xl font-bold text-gradient-funky">Content Scheduler</h1>
                    </div>

                    <Link to="/upload">
                        <Button className="btn-3d gradient-funky text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule New Post
                        </Button>
                    </Link>
                </div>

                <ScheduleCalendar
                    posts={posts}
                    onDateClick={handleDateClick}
                    onPostClick={handlePostClick}
                />

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="glass-card border-white/10">
                        <DialogHeader>
                            <DialogTitle>Schedule Post</DialogTitle>
                            <DialogDescription>
                                Create a new post for {selectedDate?.toLocaleDateString()}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="p-4 border border-dashed border-white/20 rounded-lg text-center">
                                <p className="text-muted-foreground mb-4">
                                    Select content from your library or upload new video
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Link to="/library">
                                        <Button variant="outline" className="btn-3d">
                                            Select from Library
                                        </Button>
                                    </Link>
                                    <Link to="/upload">
                                        <Button className="btn-3d gradient-instagram text-white">
                                            Upload New
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default SchedulerPage;
