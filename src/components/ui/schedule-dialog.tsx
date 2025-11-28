/**
 * Schedule Dialog Component
 * Modal for scheduling video posts
 */

import { useState, useEffect } from 'react';
import { Calendar, Clock, Send } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSchedule: (data: ScheduleData) => void;
    isLoading?: boolean;
}

export interface ScheduleData {
    platforms: string[];
    scheduledDate: Date;
    scheduledTime: string;
    notes?: string;
}

interface PlatformSchedule {
    [key: string]: boolean;
}

const ScheduleDialog = ({
    open,
    onOpenChange,
    onSchedule,
    isLoading = false,
}: ScheduleDialogProps) => {
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [platforms, setPlatforms] = useState<PlatformSchedule>({
        youtube: false,
        facebook: false,
        instagram: false,
    });
    const [notes, setNotes] = useState('');

    // Auto-select next hour if scheduling for today
    useEffect(() => {
        if (!selectedDate && !open) {
            const now = new Date();
            const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
            setSelectedDate(nextHour);
            setSelectedTime(
                `${nextHour.getHours().toString().padStart(2, '0')}:${nextHour
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}`
            );
        }
    }, [open]);

    const handleSchedule = () => {
        if (!selectedDate) {
            return;
        }

        const scheduledDateTime = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':').map(Number);
        scheduledDateTime.setHours(hours, minutes, 0, 0);

        const selectedPlatforms = Object.entries(platforms)
            .filter(([_, selected]) => selected)
            .map(([platform]) => platform);

        if (selectedPlatforms.length === 0) {
            return;
        }

        onSchedule({
            platforms: selectedPlatforms,
            scheduledDate: scheduledDateTime,
            scheduledTime: selectedTime,
            notes: notes.trim() || undefined,
        });
    };

    const isDateInPast = (date: Date) => {
        const now = new Date();
        const selectedDateTime = new Date(date);
        selectedDateTime.setHours(
            ...selectedTime.split(':').map(Number),
            0,
            0
        );
        return selectedDateTime <= now;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Schedule Post
                    </DialogTitle>
                    <DialogDescription>
                        Schedule your video to be published across selected platforms at a
                        specific time.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Platform Selection */}
                    <div className="space-y-3">
                        <Label>Select Platforms</Label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="schedule-youtube"
                                    checked={platforms.youtube}
                                    onCheckedChange={(checked) =>
                                        setPlatforms({
                                            ...platforms,
                                            youtube: !!checked,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor="schedule-youtube"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <span className="text-xl">📺</span>
                                    <span>YouTube</span>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="schedule-facebook"
                                    checked={platforms.facebook}
                                    onCheckedChange={(checked) =>
                                        setPlatforms({
                                            ...platforms,
                                            facebook: !!checked,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor="schedule-facebook"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <span className="text-xl">📘</span>
                                    <span>Facebook</span>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="schedule-instagram"
                                    checked={platforms.instagram}
                                    onCheckedChange={(checked) =>
                                        setPlatforms({
                                            ...platforms,
                                            instagram: !!checked,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor="schedule-instagram"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <span className="text-xl">📷</span>
                                    <span>Instagram</span>
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !selectedDate && 'text-muted-foreground'
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {selectedDate ? (
                                        format(selectedDate, 'PPP')
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <Input
                                id="time"
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add notes about this scheduled post..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Validation */}
                    {selectedDate && isDateInPast(selectedDate) && (
                        <div className="text-sm text-destructive">
                            Selected date and time is in the past. Please choose a future
                            time.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSchedule}
                        disabled={
                            isLoading ||
                            !selectedDate ||
                            isDateInPast(selectedDate) ||
                            Object.values(platforms).every((selected) => !selected)
                        }
                    >
                        {isLoading ? (
                            'Scheduling...'
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Schedule Post
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ScheduleDialog;