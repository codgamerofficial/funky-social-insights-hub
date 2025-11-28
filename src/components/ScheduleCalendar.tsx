/**
 * Schedule Calendar Component
 * Displays scheduled posts in a monthly calendar view
 */

import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ScheduledPost {
    id: string;
    title: string;
    date: Date;
    platforms: string[];
    status: 'scheduled' | 'published' | 'failed';
}

interface ScheduleCalendarProps {
    posts: ScheduledPost[];
    onDateClick: (date: Date) => void;
    onPostClick: (post: ScheduledPost) => void;
}

const ScheduleCalendar = ({ posts, onDateClick, onPostClick }: ScheduleCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const today = new Date();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'youtube': return '📺';
            case 'facebook': return '📘';
            case 'instagram': return '📷';
            default: return '📱';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-500/20 text-green-500';
            case 'failed': return 'bg-red-500/20 text-red-500';
            default: return 'bg-blue-500/20 text-blue-500';
        }
    };

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gradient-funky">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="btn-3d">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(today)} className="btn-3d">
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="btn-3d">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card className="glass-card p-4">
                <div className="grid grid-cols-7 gap-px mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center font-semibold text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-px bg-muted/20 rounded-lg overflow-hidden border border-white/10">
                    {calendarDays.map((day, dayIdx) => {
                        const dayPosts = posts.filter(post => isSameDay(post.date, day));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, today);

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[120px] p-2 bg-background/50 hover:bg-background/80 transition-colors border-b border-r border-white/5 ${!isCurrentMonth ? 'opacity-50 bg-muted/10' : ''
                                    } ${isToday ? 'bg-primary/5' : ''}`}
                                onClick={() => onDateClick(day)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span
                                        className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''
                                            }`}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-primary/20"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDateClick(day);
                                        }}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>

                                <div className="space-y-1">
                                    {dayPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPostClick(post);
                                            }}
                                            className="text-xs p-1.5 rounded cursor-pointer hover:scale-105 transition-transform bg-card border border-white/10 shadow-sm group relative"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1 overflow-hidden">
                                                    <span className="flex-shrink-0">
                                                        {post.platforms.map(p => getPlatformIcon(p)).join('')}
                                                    </span>
                                                    <span className="truncate font-medium">{post.title}</span>
                                                </div>
                                                <Badge className={`text-[10px] px-1 h-4 ${getStatusColor(post.status)}`}>
                                                    {format(post.date, 'HH:mm')}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default ScheduleCalendar;
