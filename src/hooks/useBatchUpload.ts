/**
 * useBatchUpload Hook
 * Manages batch video uploads and publishing
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useVideoUpload } from '@/hooks/useVideoUpload';

export interface BatchUploadItem {
    id: string;
    file: File;
    title: string;
    description: string;
    platforms: string[];
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
    progress: number;
    error?: string;
    result?: {
        videoId: string;
        urls: { [platform: string]: string };
    };
}

export interface BatchUploadConfig {
    autoPublish: boolean;
    concurrentUploads: number;
    retryFailed: boolean;
}

export const useBatchUpload = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { uploadVideo, saveVideoToDatabase } = useVideoUpload();

    const [items, setItems] = useState<BatchUploadItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);
    const [config, setConfig] = useState<BatchUploadConfig>({
        autoPublish: true,
        concurrentUploads: 2,
        retryFailed: false,
    });

    const addFiles = useCallback((files: File[]) => {
        const newItems: BatchUploadItem[] = files.map((file, index) => ({
            id: `batch-${Date.now()}-${index}`,
            file,
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            description: '',
            platforms: [],
            status: 'pending',
            progress: 0,
        }));

        setItems(prev => [...prev, ...newItems]);
    }, []);

    const updateItem = useCallback((id: string, updates: Partial<BatchUploadItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const clearCompleted = useCallback(() => {
        setItems(prev => prev.filter(item => item.status !== 'completed'));
    }, []);

    const processUpload = useCallback(async (item: BatchUploadItem) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            // Update status to uploading
            updateItem(item.id, { status: 'uploading', progress: 0 });

            // Upload video file
            const uploadResult = await uploadVideo(item.file, user.id);

            // Update progress for upload completion
            updateItem(item.id, { progress: 50 });

            // Save to database
            const video = await saveVideoToDatabase(
                user.id,
                item.title,
                item.description,
                uploadResult.url,
                uploadResult.path,
                uploadResult.metadata
            );

            updateItem(item.id, { progress: 70 });

            const result: { videoId: string; urls: { [platform: string]: string } } = {
                videoId: video.id,
                urls: {}
            };

            // Auto-publish if configured
            if (config.autoPublish && item.platforms.length > 0) {
                updateItem(item.id, { status: 'processing' });

                // This would publish to platforms - similar to the UploadPage logic
                // For now, we'll just simulate the process
                for (const platform of item.platforms) {
                    // Simulate platform-specific publishing
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    result.urls[platform] = `https://${platform}.com/video/${video.id}`;
                }
            }

            updateItem(item.id, {
                status: 'completed',
                progress: 100,
                result
            });

            return result;
        } catch (error: any) {
            updateItem(item.id, {
                status: 'failed',
                error: error.message
            });
            throw error;
        }
    }, [user, uploadVideo, saveVideoToDatabase, config, updateItem]);

    const startBatchProcess = useCallback(async () => {
        if (items.length === 0) {
            toast({
                title: 'No Files',
                description: 'Please add video files to process.',
                variant: 'destructive',
            });
            return;
        }

        const pendingItems = items.filter(item => item.status === 'pending' ||
            (item.status === 'failed' && config.retryFailed));

        if (pendingItems.length === 0) {
            toast({
                title: 'No Pending Items',
                description: 'No items to process.',
                variant: 'destructive',
            });
            return;
        }

        setIsProcessing(true);
        setOverallProgress(0);

        try {
            // Process items in batches to limit concurrent uploads
            const batchSize = config.concurrentUploads;
            let completed = 0;
            const total = pendingItems.length;

            for (let i = 0; i < pendingItems.length; i += batchSize) {
                const batch = pendingItems.slice(i, i + batchSize);

                await Promise.allSettled(
                    batch.map(async (item) => {
                        try {
                            await processUpload(item);
                        } catch (error) {
                            console.error(`Failed to process item ${item.id}:`, error);
                        }
                    })
                );

                completed += batch.length;
                setOverallProgress((completed / total) * 100);
            }

            const successful = items.filter(item => item.status === 'completed').length;
            const failed = items.filter(item => item.status === 'failed').length;

            toast({
                title: 'Batch Process Complete',
                description: `Processed ${total} items: ${successful} successful, ${failed} failed.`,
                variant: failed > 0 ? 'destructive' : 'default',
            });

        } catch (error: any) {
            toast({
                title: 'Batch Process Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    }, [items, config, processUpload, toast]);

    const getOverallStats = useCallback(() => {
        const total = items.length;
        const pending = items.filter(item => item.status === 'pending').length;
        const uploading = items.filter(item => item.status === 'uploading').length;
        const processing = items.filter(item => item.status === 'processing').length;
        const completed = items.filter(item => item.status === 'completed').length;
        const failed = items.filter(item => item.status === 'failed').length;

        return {
            total,
            pending,
            uploading,
            processing,
            completed,
            failed,
            successRate: total > 0 ? (completed / total) * 100 : 0,
        };
    }, [items]);

    return {
        items,
        isProcessing,
        overallProgress,
        config,
        setConfig,
        addFiles,
        updateItem,
        removeItem,
        clearCompleted,
        startBatchProcess,
        getOverallStats,
    };
};