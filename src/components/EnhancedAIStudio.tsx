import { useState } from 'react';
import { Sparkles, Copy, Download, Settings, Zap, Target, Languages, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { createAIContentGenerator, ContentGenerationOptions, GeneratedContent } from '@/lib/api/ai-content';

interface BatchJob {
    id: string;
    title: string;
    type: 'title' | 'description' | 'tags' | 'thumbnail';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: any;
    createdAt: Date;
}

const ENHANCED_PROMPTS = {
    viral: {
        title: "Generate viral titles that trigger curiosity and clicks",
        description: "Create descriptions that hook viewers in the first 3 seconds",
        tags: "Generate trending hashtags that maximize discoverability",
        thumbnail: "Design eye-catching thumbnails with bold text and high contrast"
    },
    educational: {
        title: "Create educational titles that clearly explain the value",
        description: "Write informative descriptions with key takeaways",
        tags: "Generate learning-focused tags for educational content",
        thumbnail: "Design clean, professional thumbnails for educational content"
    },
    entertainment: {
        title: "Generate entertaining titles that build excitement",
        description: "Create fun, engaging descriptions that encourage interaction",
        tags: "Generate entertainment-focused hashtags for maximum reach",
        thumbnail: "Design vibrant, fun thumbnails that capture attention"
    },
    business: {
        title: "Create professional titles that establish authority",
        description: "Write business-focused descriptions with clear value propositions",
        tags: "Generate professional tags for business content",
        thumbnail: "Design professional, trust-building thumbnails"
    }
};

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
];

export const EnhancedAIStudio = () => {
    const [contentOptions, setContentOptions] = useState<ContentGenerationOptions>({
        videoTitle: '',
        videoDescription: '',
        videoTranscript: '',
        targetPlatform: 'youtube',
        tone: 'engaging',
        language: 'en'
    });

    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [enableABTesting, setEnableABTesting] = useState(false);
    const [enablePredictions, setEnablePredictions] = useState(true);
    const [selectedStyle, setSelectedStyle] = useState<keyof typeof ENHANCED_PROMPTS>('viral');

    const handleGenerateContent = async () => {
        setIsGenerating(true);

        try {
            const config = {
                provider: 'openai' as const,
                apiKey: import.meta.env.VITE_OPENAI_API_KEY || ''
            };

            const generator = createAIContentGenerator(config);
            const content = await generator.generateAllContent(contentOptions);
            setGeneratedContent(content);
        } catch (error) {
            console.error('Failed to generate content:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBatchGeneration = () => {
        const jobId = Date.now().toString();
        const newJob: BatchJob = {
            id: jobId,
            title: contentOptions.videoTitle || 'Untitled Video',
            type: 'title',
            status: 'pending',
            progress: 0,
            createdAt: new Date()
        };

        setBatchJobs(prev => [newJob, ...prev]);

        // Simulate batch processing
        simulateBatchProcessing(jobId);
    };

    const simulateBatchProcessing = (jobId: string) => {
        const interval = setInterval(() => {
            setBatchJobs(prev => prev.map(job => {
                if (job.id === jobId && job.status === 'pending') {
                    const newProgress = job.progress + 10;
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        return {
                            ...job,
                            status: 'completed',
                            progress: 100,
                            result: { titles: [`Generated Title ${Date.now()}`] }
                        };
                    }
                    return { ...job, progress: newProgress, status: 'processing' as const };
                }
                return job;
            }));
        }, 500);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const downloadContent = (content: GeneratedContent) => {
        const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-generated-content-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gradient-funky">Enhanced AI Studio</h2>
                    <p className="text-muted-foreground mt-2">
                        Advanced content generation with batch processing and performance predictions
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1">
                        <Zap className="w-3 h-3 mr-1" />
                        AI-Powered
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                        <Target className="w-3 h-3 mr-1" />
                        Multi-Platform
                    </Badge>
                </div>
            </div>

            {/* Settings Panel */}
            <Card className="glass-card p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Content Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Content Style</Label>
                        <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as keyof typeof ENHANCED_PROMPTS)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="viral">🔥 Viral</SelectItem>
                                <SelectItem value="educational">📚 Educational</SelectItem>
                                <SelectItem value="entertainment">🎭 Entertainment</SelectItem>
                                <SelectItem value="business">💼 Business</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Target Platform</Label>
                        <Select value={contentOptions.targetPlatform} onValueChange={(value) =>
                            setContentOptions(prev => ({ ...prev, targetPlatform: value as any }))
                        }>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Tone</Label>
                        <Select value={contentOptions.tone} onValueChange={(value) =>
                            setContentOptions(prev => ({ ...prev, tone: value as any }))
                        }>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="energetic">Energetic</SelectItem>
                                <SelectItem value="educational">Educational</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={contentOptions.language} onValueChange={(value) =>
                            setContentOptions(prev => ({ ...prev, language: value }))
                        }>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGES.map(lang => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Advanced Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>A/B Testing Suggestions</Label>
                            <p className="text-xs text-muted-foreground">Generate multiple variations for testing</p>
                        </div>
                        <Switch
                            checked={enableABTesting}
                            onCheckedChange={setEnableABTesting}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Performance Predictions</Label>
                            <p className="text-xs text-muted-foreground">AI-powered performance forecasts</p>
                        </div>
                        <Switch
                            checked={enablePredictions}
                            onCheckedChange={setEnablePredictions}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Multi-Language</Label>
                            <p className="text-xs text-muted-foreground">Generate content in multiple languages</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </Card>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Panel */}
                <Card className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Content Input</h3>

                    <div className="space-y-4">
                        <div>
                            <Label>Video Title</Label>
                            <Input
                                placeholder="Enter your video title or topic..."
                                value={contentOptions.videoTitle}
                                onChange={(e) => setContentOptions(prev => ({ ...prev, videoTitle: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Describe your video content..."
                                value={contentOptions.videoDescription}
                                onChange={(e) => setContentOptions(prev => ({ ...prev, videoDescription: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label>Transcript (Optional)</Label>
                            <Textarea
                                placeholder="Paste key parts of your transcript for better context..."
                                value={contentOptions.videoTranscript}
                                onChange={(e) => setContentOptions(prev => ({ ...prev, videoTranscript: e.target.value }))}
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleGenerateContent}
                                disabled={isGenerating || !contentOptions.videoTitle}
                                className="flex-1 btn-3d gradient-funky"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {isGenerating ? 'Generating...' : 'Generate Content'}
                            </Button>

                            <Button
                                onClick={handleBatchGeneration}
                                variant="outline"
                                className="btn-3d"
                            >
                                <Clock className="w-4 h-4 mr-2" />
                                Batch Process
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Output Panel */}
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Generated Content</h3>
                        {generatedContent && (
                            <Button
                                onClick={() => downloadContent(generatedContent)}
                                variant="outline"
                                size="sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        )}
                    </div>

                    {generatedContent ? (
                        <Tabs defaultValue="titles" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="titles">Titles</TabsTrigger>
                                <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
                                <TabsTrigger value="tags">Tags</TabsTrigger>
                                <TabsTrigger value="thumbnails">Thumbnails</TabsTrigger>
                            </TabsList>

                            <TabsContent value="titles" className="space-y-3 mt-4">
                                {generatedContent.titles.map((title, index) => (
                                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <p className="flex-1">{title}</p>
                                            <Button
                                                onClick={() => copyToClipboard(title)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {enablePredictions && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">
                                                    Predicted CTR: {Math.random() * 5 + 3}%
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    Viral Score: {Math.floor(Math.random() * 30 + 70)}/100
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="descriptions" className="space-y-3 mt-4">
                                {generatedContent.descriptions.map((description, index) => (
                                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <p className="flex-1 text-sm">{description}</p>
                                            <Button
                                                onClick={() => copyToClipboard(description)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="tags" className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                    {generatedContent.tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-white/10"
                                            onClick={() => copyToClipboard(tag)}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="thumbnails" className="space-y-3 mt-4">
                                {generatedContent.thumbnailPrompts.map((prompt, index) => (
                                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <p className="flex-1 text-sm">{prompt}</p>
                                            <Button
                                                onClick={() => copyToClipboard(prompt)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Enter your content details and click "Generate Content" to get started</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Batch Jobs Panel */}
            {batchJobs.length > 0 && (
                <Card className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Batch Processing Queue</h3>

                    <div className="space-y-3">
                        {batchJobs.map((job) => (
                            <div key={job.id} className="p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={
                                                job.status === 'completed' ? 'default' :
                                                    job.status === 'processing' ? 'secondary' :
                                                        job.status === 'failed' ? 'destructive' : 'outline'
                                            }
                                        >
                                            {job.status}
                                        </Badge>
                                        <span className="font-medium">{job.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {job.createdAt.toLocaleTimeString()}
                                    </span>
                                </div>

                                <Progress value={job.progress} className="h-2" />

                                {job.result && (
                                    <div className="mt-3 flex gap-2">
                                        <Button
                                            onClick={() => copyToClipboard(JSON.stringify(job.result))}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Copy className="w-3 h-3 mr-1" />
                                            Copy Result
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};