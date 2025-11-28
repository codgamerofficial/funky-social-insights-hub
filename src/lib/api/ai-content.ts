/**
 * AI Content Generation Service
 * Supports both OpenAI and Google Gemini for content generation
 */

export interface AIConfig {
    provider: 'openai' | 'gemini';
    apiKey: string;
}

export interface ContentGenerationOptions {
    videoTitle?: string;
    videoDescription?: string;
    videoTranscript?: string;
    targetPlatform?: 'youtube' | 'facebook' | 'instagram';
    tone?: 'professional' | 'casual' | 'energetic' | 'educational';
    language?: string;
}

export interface GeneratedContent {
    titles: string[];
    descriptions: string[];
    tags: string[];
    thumbnailPrompts: string[];
}

class AIContentGenerator {
    private config: AIConfig;

    constructor(config: AIConfig) {
        this.config = config;
    }

    /**
     * Generate optimized titles for video
     */
    async generateTitles(
        options: ContentGenerationOptions,
        count: number = 5
    ): Promise<string[]> {
        const prompt = this.buildTitlePrompt(options);

        if (this.config.provider === 'openai') {
            return this.generateWithOpenAI(prompt, count);
        } else {
            return this.generateWithGemini(prompt, count);
        }
    }

    /**
     * Generate optimized descriptions
     */
    async generateDescriptions(
        options: ContentGenerationOptions,
        count: number = 3
    ): Promise<string[]> {
        const prompt = this.buildDescriptionPrompt(options);

        if (this.config.provider === 'openai') {
            return this.generateWithOpenAI(prompt, count);
        } else {
            return this.generateWithGemini(prompt, count);
        }
    }

    /**
     * Generate relevant tags/hashtags
     */
    async generateTags(
        options: ContentGenerationOptions,
        count: number = 20
    ): Promise<string[]> {
        const prompt = this.buildTagsPrompt(options);

        const response = this.config.provider === 'openai'
            ? await this.callOpenAI(prompt)
            : await this.callGemini(prompt);

        // Parse comma-separated tags
        return response
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .slice(0, count);
    }

    /**
     * Generate thumbnail image prompts for AI image generation
     */
    async generateThumbnailPrompts(
        options: ContentGenerationOptions,
        count: number = 3
    ): Promise<string[]> {
        const prompt = this.buildThumbnailPrompt(options);

        if (this.config.provider === 'openai') {
            return this.generateWithOpenAI(prompt, count);
        } else {
            return this.generateWithGemini(prompt, count);
        }
    }

    /**
     * Generate all content at once
     */
    async generateAllContent(
        options: ContentGenerationOptions
    ): Promise<GeneratedContent> {
        const [titles, descriptions, tags, thumbnailPrompts] = await Promise.all([
            this.generateTitles(options, 5),
            this.generateDescriptions(options, 3),
            this.generateTags(options, 20),
            this.generateThumbnailPrompts(options, 3),
        ]);

        return {
            titles,
            descriptions,
            tags,
            thumbnailPrompts,
        };
    }

    /**
     * Build prompt for title generation
     */
    private buildTitlePrompt(options: ContentGenerationOptions): string {
        const platform = options.targetPlatform || 'youtube';
        const tone = options.tone || 'engaging';

        return `Generate ${platform === 'youtube' ? '5' : '3'} catchy, SEO-optimized video titles for a video about "${options.videoTitle || 'this topic'}".

Requirements:
- Platform: ${platform.toUpperCase()}
- Tone: ${tone}
- Length: ${platform === 'youtube' ? '60-70' : '40-50'} characters
- Include relevant keywords
- Make them click-worthy but not clickbait
- Each title should be unique and compelling

${options.videoDescription ? `Video context: ${options.videoDescription}` : ''}

Return only the titles, one per line, numbered 1-5.`;
    }

    /**
     * Build prompt for description generation
     */
    private buildDescriptionPrompt(options: ContentGenerationOptions): string {
        const platform = options.targetPlatform || 'youtube';

        return `Generate a compelling video description for ${platform.toUpperCase()}.

Video Title: ${options.videoTitle || 'Untitled'}
${options.videoDescription ? `Context: ${options.videoDescription}` : ''}
${options.videoTranscript ? `Transcript excerpt: ${options.videoTranscript.substring(0, 500)}...` : ''}

Requirements:
- Start with a hook (first 2-3 lines are crucial)
- Include relevant keywords naturally
- Add timestamps if applicable
- Include call-to-action
- ${platform === 'youtube' ? 'Add social media links section' : 'Keep it concise'}
- Length: ${platform === 'youtube' ? '300-500' : '150-250'} words

Generate 3 variations with different approaches.`;
    }

    /**
     * Build prompt for tags generation
     */
    private buildTagsPrompt(options: ContentGenerationOptions): string {
        return `Generate 20 relevant tags/hashtags for this video:

Title: ${options.videoTitle || 'Untitled'}
${options.videoDescription ? `Description: ${options.videoDescription}` : ''}
Platform: ${options.targetPlatform?.toUpperCase() || 'YOUTUBE'}

Requirements:
- Mix of broad and specific tags
- Include trending relevant hashtags
- SEO-optimized
- No spaces in hashtags
- Return as comma-separated list

Return only the tags, comma-separated.`;
    }

    /**
     * Build prompt for thumbnail generation
     */
    private buildThumbnailPrompt(options: ContentGenerationOptions): string {
        return `Generate 3 creative thumbnail image prompts for this video:

Title: ${options.videoTitle || 'Untitled'}
${options.videoDescription ? `Description: ${options.videoDescription}` : ''}

Requirements:
- Eye-catching and professional
- Relevant to video content
- Include text overlay suggestions
- Specify colors, composition, style
- Platform: ${options.targetPlatform?.toUpperCase() || 'YOUTUBE'}

Return 3 detailed image generation prompts, one per line.`;
    }

    /**
     * Generate multiple variations with OpenAI
     */
    private async generateWithOpenAI(
        prompt: string,
        count: number
    ): Promise<string[]> {
        const response = await this.callOpenAI(prompt);
        return this.parseNumberedList(response, count);
    }

    /**
     * Generate multiple variations with Gemini
     */
    private async generateWithGemini(
        prompt: string,
        count: number
    ): Promise<string[]> {
        const response = await this.callGemini(prompt);
        return this.parseNumberedList(response, count);
    }

    /**
     * Call OpenAI API
     */
    private async callOpenAI(prompt: string): Promise<string> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert social media content creator and SEO specialist.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.8,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate content with OpenAI');
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    /**
     * Call Google Gemini API
     */
    private async callGemini(prompt: string): Promise<string> {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 1000,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to generate content with Gemini');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    }

    /**
     * Parse numbered list from AI response
     */
    private parseNumberedList(text: string, expectedCount: number): string[] {
        const lines = text.split('\n').filter(line => line.trim());
        const items: string[] = [];

        for (const line of lines) {
            // Remove numbering (1., 1), etc.)
            const cleaned = line.replace(/^\d+[\.)]\s*/, '').trim();
            if (cleaned) {
                items.push(cleaned);
            }
        }

        return items.slice(0, expectedCount);
    }
}

/**
 * Generate thumbnail image using DALL-E or similar
 */
export async function generateThumbnailImage(
    apiKey: string,
    prompt: string
): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `Create a YouTube thumbnail: ${prompt}. Style: Professional, eye-catching, high contrast, bold text.`,
            n: 1,
            size: '1792x1024', // YouTube thumbnail aspect ratio
            quality: 'hd',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate thumbnail image');
    }

    const data = await response.json();
    return data.data[0].url; // Returns temporary URL
}

export const createAIContentGenerator = (config: AIConfig) => new AIContentGenerator(config);
