/**
 * Batch Uploader Component
 * Handles multiple video uploads and batch processing
 */

import { useState, useRef } from 'react';
import { Upload, X, Play, Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBatchUpload, BatchUploadItem } from '@/hooks/useBatchUpload';

const BatchUploader = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showSettings, setShowSettings] = useState(false);

    const {
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
    } = useBatchUpload();

    const stats = getOverallStats();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const videoFiles = files.filter(file => file.type.startsWith('video/'));

        if (videoFiles.length > 0) {
            addFiles(videoFiles);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const videoFiles = files.filter(file => file.type.startsWith('video/'));

        if (videoFiles.length > 0) {
            addFiles(videoFiles);
        }
    };

    const getStatusIcon = (status: BatchUploadItem['status']) => {
        switch (status) {
            case 'pending':
                return <div className="w-4 h-4 border-2 border-blue-500 rounded-full" />;
            case 'uploading':
            case 'processing':
                return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: BatchUploadItem['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-blue-100 text-blue-800';
            case 'uploading':
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Batch Upload</h2>
                    <p className="text-muted-foreground">Upload and process multiple videos at once</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Files
                    </Button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <Card className="glass-card p-4">
                    <h3 className="font-semibold mb-3">Batch Processing Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="auto-publish">Auto Publish</Label>
                            <Checkbox
                                id="auto-publish"
                                checked={config.autoPublish}
                                onCheckedChange={(checked) =>
                                    setConfig(prev => ({ ...prev, autoPublish: !!checked }))
                                }
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="concurrent">Concurrent Uploads</Label>
                            <Select
                                value={config.concurrentUploads.toString()}
                                onValueChange={(value) =>
                                    setConfig(prev => ({ ...prev, concurrentUploads: parseInt(value) }))
                                }
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 (Slow but stable)</SelectItem>
                                    <SelectItem value="2">2 (Recommended)</SelectItem>
                                    <SelectItem value="3">3 (Faster)</SelectItem>
                                    <SelectItem value="4">4 (Maximum)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="retry">Retry Failed Items</Label>
                            <Checkbox
                                id="retry"
                                checked={config.retryFailed}
                                onCheckedChange={(checked) =>
                                    setConfig(prev => ({ ...prev, retryFailed: !!checked }))
                                }
                                className="mt-2"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Drop Zone */}
            {items.length === 0 && (
                <Card
                    className="glass-card p-12 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                Drop videos here or click to browse
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Support multiple video formats. Max 2GB per file.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* File List */}
            {items.length > 0 && (
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">
                            Upload Queue ({stats.total} files)
                        </h3>
                        <div className="flex items-center space-x-2">
                            {stats.completed > 0 && (
                                <Button variant="outline" size="sm" onClick={clearCompleted}>
                                    Clear Completed
                                </Button>
                            )}
                            <Button
                                onClick={startBatchProcess}
                                disabled={isProcessing || stats.pending === 0}
                                className="btn-3d gradient-funky text-white"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Start Batch Process'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Overall Progress */}
                    {isProcessing && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Overall Progress</span>
                                <span className="text-sm text-muted-foreground">
                                    {overallProgress.toFixed(0)}%
                                </span>
                            </div>
                            <Progress value={overallProgress} />
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                <span>Completed: {stats.completed}</span>
                                <span>Processing: {stats.uploading + stats.processing}</span>
                                <span>Failed: {stats.failed}</span>
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                    {getStatusIcon(item.status)}
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium truncate">{item.file.name}</h4>
                                        <Badge className={getStatusColor(item.status)}>
                                            {item.status}
                                        </Badge>
                                    </div>

                                    <Input
                                        placeholder="Video title..."
                                        value={item.title}
                                        onChange={(e) =>
                                            updateItem(item.id, { title: e.target.value })
                                        }
                                        className="mb-2"
                                    />

                                    <Textarea
                                        placeholder="Video description..."
                                        value={item.description}
                                        onChange={(e) =>
                                            updateItem(item.id, { description: e.target.value })
                                        }
                                        rows={2}
                                        className="mb-3 resize-none"
                                    />

                                    {/* Platform Selection */}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`youtube-${item.id}`}
                                                checked={item.platforms.includes('youtube')}
                                                onCheckedChange={(checked) => {
                                                    const platforms = checked
                                                        ? [...item.platforms, 'youtube']
                                                        : item.platforms.filter(p => p !== 'youtube');
                                                    updateItem(item.id, { platforms });
                                                }}
                                            />
                                            <Label htmlFor={`youtube-${item.id}`} className="flex items-center space-x-1">
                                                <span>📺</span>
                                                <span>YouTube</span>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`facebook-${item.id}`}
                                                checked={item.platforms.includes('facebook')}
                                                onCheckedChange={(checked) => {
                                                    const platforms = checked
                                                        ? [...item.platforms, 'facebook']
                                                        : item.platforms.filter(p => p !== 'facebook');
                                                    updateItem(item.id, { platforms });
                                                }}
                                            />
                                            <Label htmlFor={`facebook-${item.id}`} className="flex items-center space-x-1">
                                                <span>📘</span>
                                                <span>Facebook</span>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`instagram-${item.id}`}
                                                checked={item.platforms.includes('instagram')}
                                                onCheckedChange={(checked) => {
                                                    const platforms = checked
                                                        ? [...item.platforms, 'instagram']
                                                        : item.platforms.filter(p => p !== 'instagram');
                                                    updateItem(item.id, { platforms });
                                                }}
                                            />
                                            <Label htmlFor={`instagram-${item.id}`} className="flex items-center space-x-1">
                                                <span>📷</span>
                                                <span>Instagram</span>
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {item.status === 'uploading' || item.status === 'processing' ? (
                                        <div className="mt-2">
                                            <Progress value={item.progress} />
                                        </div>
                                    ) : null}

                                    {/* Error Message */}
                                    {item.error && (
                                        <p className="text-sm text-red-600 mt-1">{item.error}</p>
                                    )}

                                    {/* Success URLs */}
                                    {item.result && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            {Object.entries(item.result.urls).map(([platform, url]) => (
                                                <div key={platform}>
                                                    {platform}: {url}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Remove Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    disabled={isProcessing}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
};

export default BatchUploader;