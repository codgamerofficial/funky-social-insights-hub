/**
 * AI Studio Page
 * Generate content using AI (Titles, Descriptions, Thumbnails)
 */

import { useState } from 'react';
import { ArrowLeft, Sparkles, Copy, RefreshCw, Image as ImageIcon, Type, FileText, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { createAIContentGenerator } from '@/lib/api/ai-content';

const AIStudioPage = () => {
    const { toast } = useToast();
    const [videoTitle, setVideoTitle] = useState('');
    const [videoDescription, setVideoDescription] = useState('');
    const [platform, setPlatform] = useState('youtube');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<any>(null);

    // Initialize AI generator (mock config for now)
    const aiGenerator = createAIContentGenerator({
        provider: 'openai',
        apiKey: 'mock-key', // In production, this would come from env/db
    });

    const handleGenerate = async (type: 'titles' | 'description' | 'tags' | 'thumbnails') => {
        if (!videoTitle) {
            toast({
                title: 'Title Required',
                description: 'Please enter a video topic or title first.',
                variant: 'destructive',
            });
            return;
        }

        setIsGenerating(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            let result;
            switch (type) {
                case 'titles':
                    result = [
                        `10 Secrets About ${videoTitle} You Didn't Know`,
                        `The Ultimate Guide to ${videoTitle} in 2024`,
                        `Why Everyone is Wrong About ${videoTitle}`,
                        `How to Master ${videoTitle} Fast`,
                        `${videoTitle}: A Complete Breakdown`,
                    ];
                    setGeneratedContent({ ...generatedContent, titles: result });
                    break;
                case 'description':
                    result = `🔥 In this video, we dive deep into ${videoTitle}.

You'll learn:
✅ Key Concept 1
✅ Key Concept 2
✅ Key Concept 3

Don't forget to subscribe for more content about ${videoTitle}!

#${videoTitle.replace(/\s+/g, '')} #learning #guide`;
                    setGeneratedContent({ ...generatedContent, description: result });
                    break;
                case 'tags':
                    result = ['viral', 'trending', 'guide', 'tutorial', 'howto', '2024', 'tips', 'tricks', 'education', 'learning'];
                    setGeneratedContent({ ...generatedContent, tags: result });
                    break;
                case 'thumbnails':
                    result = [
                        'Close up of person looking shocked with bold text overlay',
                        'Split screen comparison with red arrow pointing to detail',
                        'Minimalist background with high contrast subject',
                    ];
                    setGeneratedContent({ ...generatedContent, thumbnails: result });
                    break;
            }

            toast({
                title: 'Content Generated',
                description: `Successfully generated ${type}!`,
            });
        } catch (error) {
            toast({
                title: 'Generation Failed',
                description: 'Failed to generate content. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied!',
            description: 'Content copied to clipboard.',
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
                <div className="flex items-center space-x-4">
                    <Link to="/">
                        <Button variant="ghost" className="btn-3d">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold text-gradient-funky">AI Studio</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Section */}
                    <Card className="glass-card p-6 space-y-6 lg:col-span-1">
                        <h3 className="text-lg font-bold flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-primary" />
                            Input Context
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="platform">Target Platform</Label>
                                <Select value={platform} onValueChange={setPlatform}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="videoTitle">Video Title / Topic</Label>
                                <Input
                                    id="videoTitle"
                                    placeholder="e.g., How to bake a cake"
                                    value={videoTitle}
                                    onChange={(e) => setVideoTitle(e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="videoDescription">Additional Context (Optional)</Label>
                                <Textarea
                                    id="videoDescription"
                                    placeholder="Key points to cover..."
                                    value={videoDescription}
                                    onChange={(e) => setVideoDescription(e.target.value)}
                                    className="mt-2"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Generation Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs defaultValue="titles" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 glass-card p-1">
                                <TabsTrigger value="titles">
                                    <Type className="w-4 h-4 mr-2" />
                                    Titles
                                </TabsTrigger>
                                <TabsTrigger value="description">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Description
                                </TabsTrigger>
                                <TabsTrigger value="tags">
                                    <Hash className="w-4 h-4 mr-2" />
                                    Tags
                                </TabsTrigger>
                                <TabsTrigger value="thumbnails">
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Thumbnails
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-6">
                                <TabsContent value="titles">
                                    <Card className="glass-card p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold">Generated Titles</h3>
                                            <Button
                                                onClick={() => handleGenerate('titles')}
                                                disabled={isGenerating}
                                                className="btn-3d gradient-funky text-white"
                                            >
                                                {isGenerating ? (
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                )}
                                                Generate Titles
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {generatedContent?.titles?.map((title: string, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-white/10 group hover:border-primary/50 transition-colors">
                                                    <span className="font-medium">{title}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(title)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {!generatedContent?.titles && (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    Click generate to create catchy titles for your video
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="description">
                                    <Card className="glass-card p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold">Generated Description</h3>
                                            <Button
                                                onClick={() => handleGenerate('description')}
                                                disabled={isGenerating}
                                                className="btn-3d gradient-funky text-white"
                                            >
                                                {isGenerating ? (
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                )}
                                                Generate Description
                                            </Button>
                                        </div>

                                        {generatedContent?.description ? (
                                            <div className="relative group">
                                                <div className="p-4 bg-background/50 rounded-lg border border-white/10 whitespace-pre-wrap font-mono text-sm">
                                                    {generatedContent.description}
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(generatedContent.description)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">
                                                Generate an SEO-optimized description for your video
                                            </div>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="tags">
                                    <Card className="glass-card p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold">Generated Tags</h3>
                                            <Button
                                                onClick={() => handleGenerate('tags')}
                                                disabled={isGenerating}
                                                className="btn-3d gradient-funky text-white"
                                            >
                                                {isGenerating ? (
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                )}
                                                Generate Tags
                                            </Button>
                                        </div>

                                        {generatedContent?.tags ? (
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {generatedContent.tags.map((tag: string, index: number) => (
                                                        <div key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                                                            #{tag}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="w-full btn-3d"
                                                    onClick={() => copyToClipboard(generatedContent.tags.join(', '))}
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy All Tags
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">
                                                Generate relevant tags to boost discoverability
                                            </div>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="thumbnails">
                                    <Card className="glass-card p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold">Thumbnail Ideas</h3>
                                            <Button
                                                onClick={() => handleGenerate('thumbnails')}
                                                disabled={isGenerating}
                                                className="btn-3d gradient-funky text-white"
                                            >
                                                {isGenerating ? (
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                )}
                                                Generate Ideas
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            {generatedContent?.thumbnails?.map((prompt: string, index: number) => (
                                                <div key={index} className="p-4 bg-background/50 rounded-lg border border-white/10">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <p className="text-sm">{prompt}</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(prompt)}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="mt-2 w-full btn-3d">
                                                        <ImageIcon className="w-4 h-4 mr-2" />
                                                        Generate Image (DALL-E)
                                                    </Button>
                                                </div>
                                            ))}
                                            {!generatedContent?.thumbnails && (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    Get creative thumbnail concepts for your video
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIStudioPage;
