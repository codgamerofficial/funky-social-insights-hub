/**
 * OAuth Callback Handler
 * Processes OAuth responses from different platforms
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        try {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const connectingPlatform = localStorage.getItem('connectingPlatform');

            if (error) {
                throw new Error(`OAuth error: ${error}`);
            }

            if (!code || !connectingPlatform) {
                throw new Error('Missing authorization code or platform information');
            }

            // Store the tokens in Supabase or local storage based on the platform
            await handlePlatformAuth(connectingPlatform, code);

            // Clean up
            localStorage.removeItem('connectingPlatform');

            setStatus('success');
            toast({
                title: 'Success!',
                description: `Successfully connected to ${connectingPlatform}`,
            });

            // Redirect to platform connections after a delay
            setTimeout(() => {
                navigate('/platform-connections');
            }, 2000);

        } catch (error: any) {
            console.error('OAuth callback error:', error);
            setStatus('error');
            toast({
                title: 'Connection Failed',
                description: error.message || 'Failed to complete OAuth flow',
                variant: 'destructive',
            });

            // Redirect back to platform connections after a delay
            setTimeout(() => {
                navigate('/platform-connections');
            }, 3000);
        }
    };

    const handlePlatformAuth = async (platform: string, code: string) => {
        switch (platform) {
            case 'youtube':
                await handleYouTubeAuth(code);
                break;
            case 'facebook':
                await handleFacebookAuth(code);
                break;
            case 'instagram':
                await handleInstagramAuth(code);
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    };

    const handleYouTubeAuth = async (code: string) => {
        const config = {
            clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID,
            clientSecret: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET,
            apiKey: import.meta.env.VITE_YOUTUBE_API_KEY,
            redirectUri: `${window.location.origin}/dashboard`
        };

        const { createYouTubeAPI } = await import('@/lib/api/youtube');
        const youtubeAPI = createYouTubeAPI(config);

        const tokens = await youtubeAPI.exchangeCodeForTokens(code);

        // Store tokens securely (in a real app, encrypt these)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('platform_connections').upsert({
                user_id: user.id,
                platform: 'youtube',
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
                updated_at: new Date().toISOString()
            });
        }
    };

    const handleFacebookAuth = async (code: string) => {
        const config = {
            appId: import.meta.env.VITE_FACEBOOK_APP_ID,
            appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
            redirectUri: `${window.location.origin}/dashboard`
        };

        const { createFacebookAPI } = await import('@/lib/api/facebook');
        const facebookAPI = createFacebookAPI(config);

        const tokens = await facebookAPI.exchangeCodeForToken(code);

        // Get long-lived token
        const longLivedTokens = await facebookAPI.getLongLivedToken(tokens.access_token);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('platform_connections').upsert({
                user_id: user.id,
                platform: 'facebook',
                access_token: longLivedTokens.access_token,
                expires_at: new Date(Date.now() + longLivedTokens.expires_in * 1000).toISOString(),
                updated_at: new Date().toISOString()
            });
        }
    };

    const handleInstagramAuth = async (code: string) => {
        // Instagram uses Facebook's OAuth, so we can reuse the Facebook API
        const config = {
            appId: import.meta.env.VITE_FACEBOOK_APP_ID,
            appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
            redirectUri: `${window.location.origin}/dashboard`
        };

        const { createFacebookAPI } = await import('@/lib/api/facebook');
        const facebookAPI = createFacebookAPI(config);

        const tokens = await facebookAPI.exchangeCodeForToken(code);

        // Get long-lived token
        const longLivedTokens = await facebookAPI.getLongLivedToken(tokens.access_token);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('platform_connections').upsert({
                user_id: user.id,
                platform: 'instagram',
                access_token: longLivedTokens.access_token,
                expires_at: new Date(Date.now() + longLivedTokens.expires_in * 1000).toISOString(),
                updated_at: new Date().toISOString()
            });
        }
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'processing':
                return {
                    title: 'Processing...',
                    description: 'Completing your OAuth authentication',
                };
            case 'success':
                return {
                    title: 'Connected Successfully!',
                    description: 'Your account has been connected. Redirecting...',
                };
            case 'error':
                return {
                    title: 'Connection Failed',
                    description: 'There was an error connecting your account. Redirecting...',
                };
        }
    };

    const statusMessage = getStatusMessage();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Card className="glass-card p-8 max-w-md w-full mx-4">
                <div className="text-center space-y-4">
                    {status === 'processing' && (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    )}
                    {status === 'success' && (
                        <div className="w-8 h-8 mx-auto text-green-500">✓</div>
                    )}
                    {status === 'error' && (
                        <div className="w-8 h-8 mx-auto text-red-500">✗</div>
                    )}
                    <h2 className="text-xl font-bold">{statusMessage.title}</h2>
                    <p className="text-muted-foreground">{statusMessage.description}</p>
                </div>
            </Card>
        </div>
    );
};

export default OAuthCallback;