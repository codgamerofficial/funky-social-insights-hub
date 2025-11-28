/**
 * Video Uploader Component
 * Drag-and-drop interface for video uploads
 */

import { useState, useCallback } from 'react';
import { Upload, Video, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVideoUpload } from '@/hooks/useVideoUpload';

interface VideoUploaderProps {
    onUploadComplete: (videoData: {
        url: string;
        path: string;
        metadata: any;
    }) => void;
    userId: string;
}

const VideoUploader = ({ onUploadComplete, userId }: VideoUploaderProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const { uploading, progress, uploadVideo } = useVideoUpload();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const videoFile = files.find(file => file.type.startsWith('video/'));

        if (videoFile) {
            handleFileSelect(videoFile);
        }
    }, []);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);

        // Create preview
        const url = URL.createObjectURL(file);
        setPreview(url);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const result = await uploadVideo(selectedFile, userId);
            onUploadComplete(result);

            // Reset
            setSelectedFile(null);
            setPreview(null);
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    const handleRemove = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setSelectedFile(null);
        setPreview(null);
    };

    return (
        <Card className="glass-card p-6">
            {!selectedFile ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                            ? 'border-primary bg-primary/10'
                            : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                >
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                Drop your video here
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                or click to browse
                            </p>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileInput}
                                className="hidden"
                                id="video-upload"
                            />
                            <label htmlFor="video-upload">
                                <Button variant="outline" className="btn-3d" asChild>
                                    <span>Choose File</span>
                                </Button>
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Supported formats: MP4, MOV, AVI, WebM (Max 2GB)
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative">
                        {preview && (
                            <video
                                src={preview}
                                controls
                                className="w-full rounded-lg max-h-96 object-contain bg-black"
                            />
                        )}
                        {!uploading && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={handleRemove}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <Video className="w-4 h-4" />
                                <span className="font-medium">{selectedFile.name}</span>
                            </div>
                            <span className="text-muted-foreground">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                        </div>

                        {uploading && (
                            <div className="space-y-2">
                                <Progress value={progress.percentage} />
                                <p className="text-xs text-center text-muted-foreground">
                                    Uploading... {progress.percentage.toFixed(0)}%
                                </p>
                            </div>
                        )}

                        {!uploading && (
                            <Button
                                onClick={handleUpload}
                                className="w-full btn-3d gradient-funky text-white"
                            >
                                Upload Video
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default VideoUploader;
