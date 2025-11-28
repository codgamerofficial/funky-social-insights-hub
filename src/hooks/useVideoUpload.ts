/**
 * Custom hook for video upload to Supabase Storage
 * Handles file validation, upload progress, and metadata extraction
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VideoMetadata {
    duration: number;
    width: number;
    height: number;
    size: number;
    type: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export const useVideoUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
    const { toast } = useToast();

    /**
     * Extract video metadata
     */
    const extractMetadata = (file: File): Promise<VideoMetadata> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve({
                    duration: Math.floor(video.duration),
                    width: video.videoWidth,
                    height: video.videoHeight,
                    size: file.size,
                    type: file.type,
                });
            };

            video.onerror = () => {
                reject(new Error('Failed to load video metadata'));
            };

            video.src = URL.createObjectURL(file);
        });
    };

    /**
     * Validate video file
     */
    const validateVideo = (file: File): { valid: boolean; error?: string } => {
        // Check file type
        const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
        if (!validTypes.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Please upload MP4, MOV, AVI, or WebM.' };
        }

        // Check file size (max 2GB)
        const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
        if (file.size > maxSize) {
            return { valid: false, error: 'File too large. Maximum size is 2GB.' };
        }

        return { valid: true };
    };

    /**
     * Upload video to Supabase Storage
     */
    const uploadVideo = async (
        file: File,
        userId: string
    ): Promise<{ url: string; path: string; metadata: VideoMetadata }> => {
        setUploading(true);
        setProgress({ loaded: 0, total: file.size, percentage: 0 });

        try {
            // Validate file
            const validation = validateVideo(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Extract metadata
            const metadata = await extractMetadata(file);

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${userId}/${timestamp}-${file.name}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('videos')
                .upload(filename, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('videos')
                .getPublicUrl(data.path);

            setProgress({ loaded: file.size, total: file.size, percentage: 100 });

            toast({
                title: 'Upload Complete',
                description: 'Your video has been uploaded successfully.',
            });

            return {
                url: urlData.publicUrl,
                path: data.path,
                metadata,
            };
        } catch (error: any) {
            toast({
                title: 'Upload Failed',
                description: error.message,
                variant: 'destructive',
            });
            throw error;
        } finally {
            setUploading(false);
        }
    };

    /**
     * Save video to database
     */
    const saveVideoToDatabase = async (
        userId: string,
        title: string,
        description: string,
        fileUrl: string,
        filePath: string,
        metadata: VideoMetadata
    ) => {
        const { data, error } = await supabase
            .from('videos')
            .insert({
                user_id: userId,
                title,
                description,
                file_url: fileUrl,
                duration: metadata.duration,
                file_size: metadata.size,
                mime_type: metadata.type,
                status: 'ready',
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                },
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    };

    return {
        uploading,
        progress,
        uploadVideo,
        saveVideoToDatabase,
        extractMetadata,
        validateVideo,
    };
};
