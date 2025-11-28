/**
 * useScheduledPosts Hook
 * Manages scheduled video posts
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledPost {
    id: string;
    user_id: string;
    video_id: string;
    platforms: string[];
    scheduled_date: Date;
    status: 'scheduled' | 'published' | 'failed' | 'cancelled';
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

export interface ScheduleData {
    platforms: string[];
    scheduledDate: Date;
    scheduledTime: string;
    notes?: string;
}

export const useScheduledPosts = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

    const schedulePost = useCallback(
        async (videoId: string, scheduleData: ScheduleData) => {
            if (!user) {
                throw new Error('User not authenticated');
            }

            setIsScheduling(true);

            try {
                const { supabase } = await import('@/integrations/supabase/client');

                // Create scheduled post record
                const { data, error } = await (supabase as any)
                    .from('scheduled_posts')
                    .insert({
                        user_id: user.id,
                        video_id: videoId,
                        platforms: scheduleData.platforms,
                        scheduled_date: scheduleData.scheduledDate.toISOString(),
                        status: 'scheduled',
                        notes: scheduleData.notes,
                    })
                    .select()
                    .single();

                if (error) {
                    throw error;
                }

                const newScheduledPost: ScheduledPost = {
                    ...data,
                    scheduled_date: new Date(data.scheduled_date),
                    created_at: new Date(data.created_at),
                    updated_at: new Date(data.updated_at),
                };

                setScheduledPosts((prev) => [...prev, newScheduledPost]);

                toast({
                    title: 'Post Scheduled',
                    description: `Scheduled for ${scheduleData.scheduledDate.toLocaleString()}`,
                });

                return newScheduledPost;
            } catch (error: any) {
                console.error('Failed to schedule post:', error);
                toast({
                    title: 'Scheduling Failed',
                    description: error.message,
                    variant: 'destructive',
                });
                throw error;
            } finally {
                setIsScheduling(false);
            }
        },
        [user, toast]
    );

    const cancelScheduledPost = useCallback(
        async (scheduledPostId: string) => {
            if (!user) {
                throw new Error('User not authenticated');
            }

            try {
                const { supabase } = await import('@/integrations/supabase/client');

                const { error } = await (supabase as any)
                    .from('scheduled_posts')
                    .update({ status: 'cancelled' })
                    .eq('id', scheduledPostId)
                    .eq('user_id', user.id);

                if (error) {
                    throw error;
                }

                setScheduledPosts((prev) =>
                    prev.map((post) =>
                        post.id === scheduledPostId
                            ? { ...post, status: 'cancelled' as const }
                            : post
                    )
                );

                toast({
                    title: 'Post Cancelled',
                    description: 'Scheduled post has been cancelled.',
                });
            } catch (error: any) {
                console.error('Failed to cancel scheduled post:', error);
                toast({
                    title: 'Cancellation Failed',
                    description: error.message,
                    variant: 'destructive',
                });
                throw error;
            }
        },
        [user, toast]
    );

    const loadScheduledPosts = useCallback(async () => {
        if (!user) {
            return;
        }

        try {
            const { supabase } = await import('@/integrations/supabase/client');

            const { data, error } = await (supabase as any)
                .from('scheduled_posts')
                .select('*')
                .eq('user_id', user.id)
                .order('scheduled_date', { ascending: true });

            if (error) {
                throw error;
            }

            const loadedPosts: ScheduledPost[] = data.map((post: any) => ({
                ...post,
                scheduled_date: new Date(post.scheduled_date),
                created_at: new Date(post.created_at),
                updated_at: new Date(post.updated_at),
            }));

            setScheduledPosts(loadedPosts);
        } catch (error: any) {
            console.error('Failed to load scheduled posts:', error);
            toast({
                title: 'Failed to Load Posts',
                description: error.message,
                variant: 'destructive',
            });
        }
    }, [user, toast]);

    return {
        schedulePost,
        cancelScheduledPost,
        loadScheduledPosts,
        isScheduling,
        scheduledPosts,
    };
};