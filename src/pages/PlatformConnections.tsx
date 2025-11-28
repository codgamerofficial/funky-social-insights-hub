/**
 * Platform Connections Page
 * Manage OAuth connections to YouTube, Facebook, Instagram
 */

import { ArrowLeft, Link as LinkIcon, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { usePlatformConnections } from '@/hooks/usePlatformConnections';
import { useAuth } from '@/contexts/AuthContext';
import DebugPanel from '@/components/DebugPanel';

const PlatformConnections = () => {
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const {
        connections,
        loading,
        error,
        connectPlatform,
        disconnectPlatform,
        refreshConnection,
    } = usePlatformConnections();

    // Debug logging
    console.log('PlatformConnections render:', {
        user: user ? { id: user.id, email: user.email } : null,
        authLoading,
        connections,
        loading,
        error
    });

    const handleConnect = async (platform: string) => {
        toast({
            title: 'Connecting...',
            description: `Opening ${platform} OAuth flow`,
        });

        try {
            let authUrl = '';

            switch (platform) {
                case 'youtube':
                    const youtubeConfig = {
                        clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID,
                        clientSecret: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET,
                        apiKey: import.meta.env.VITE_YOUTUBE_API_KEY,
                        redirectUri: `${window.location.origin}/oauth/callback`
                    };
                    const { createYouTubeAPI } = await import('@/lib/api/youtube');
                    const youtubeAPI = createYouTubeAPI(youtubeConfig);
                    authUrl = youtubeAPI.initiateOAuth();
                    break;

                case 'facebook':
                    const facebookConfig = {
                        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
                        appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
                        redirectUri: `${window.location.origin}/oauth/callback`
                    };
                    const { createFacebookAPI } = await import('@/lib/api/facebook');
                    const facebookAPI = createFacebookAPI(facebookConfig);
                    authUrl = facebookAPI.initiateOAuth();
                    break;

                case 'instagram':
                    const instagramConfig = {
                        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
                        appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
                        redirectUri: `${window.location.origin}/oauth/callback`
                    };
                    const { createInstagramAPI } = await import('@/lib/api/instagram');
                    const instagramAPI = createInstagramAPI(instagramConfig);
                    // Instagram uses Facebook's OAuth flow
                    authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${instagramConfig.appId}&redirect_uri=${encodeURIComponent(instagramConfig.redirectUri)}&scope=instagram_basic,instagram_content_publish&response_type=code`;
                    break;

                default:
                    throw new Error(`Unsupported platform: ${platform}`);
            }

            if (authUrl) {
                // Store the platform being connected for callback handling
                localStorage.setItem('connectingPlatform', platform);
                // Redirect to OAuth provider
                window.location.href = authUrl;
            }
        } catch (error) {
            console.error(`Failed to connect to ${platform}:`, error);
            toast({
                title: 'Connection Failed',
                description: `Failed to connect to ${platform}. Please try again.`,
                variant: 'destructive',
            });
        }
    };

    const handleDisconnect = async (platform: string) => {
        try {
            await disconnectPlatform(platform);
            toast({
                title: 'Disconnected',
                description: `Successfully disconnected from ${platform}`,
            });
        } catch (error: any) {
            toast({
                title: 'Disconnection Failed',
                description: error.message || `Failed to disconnect from ${platform}`,
                variant: 'destructive',
            });
        }
    };

    const handleRefresh = async (platform: string) => {
        try {
            toast({
                title: 'Refreshing...',
                description: `Updating ${platform} connection`,
            });

            await refreshConnection(platform);

            toast({
                title: 'Refreshed',
                description: `${platform} connection updated successfully`,
            });
        } catch (error: any) {
            toast({
                title: 'Refresh Failed',
                description: error.message || `Failed to refresh ${platform} connection`,
                variant: 'destructive',
            });
        }
    };

    // Show loading states
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-6 py-8 space-y-8 max-w-4xl">
                    <div className="text-center">
                        <p className="text-muted-foreground">
                            {authLoading ? 'Authenticating...' : 'Loading platform connections...'}
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // Check if user is authenticated
    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-6 py-8 space-y-8 max-w-4xl">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
                        <p className="text-muted-foreground mb-6">
                            Please sign in to manage your platform connections.
                        </p>
                        <Link to="/">
                            <Button className="btn-3d gradient-instagram text-white">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-6 py-8 space-y-8 max-w-4xl">
                    <div className="text-center">
                        <p className="text-red-500">Error loading platform connections: {error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="mt-4"
                            variant="outline"
                        >
                            Retry
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 py-8 space-y-8 max-w-4xl">
                <div className="flex items-center space-x-4">
                    <Link to="/">
                        <Button variant="ghost" className="btn-3d">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold text-gradient-funky">Platform Connections</h1>
                </div>

                <Card className="glass-card p-6">
                    <p className="text-muted-foreground mb-6">
                        Connect your social media accounts to enable automated posting and analytics tracking.
                    </p>

                    <div className="space-y-4">
                        {connections.map((connection) => (
                            <Card key={connection.platform} className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-4xl">{connection.icon}</div>
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center space-x-2">
                                                <span>{connection.name}</span>
                                                {connection.connected ? (
                                                    <Badge className="bg-green-500/20 text-green-500">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Connected
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-gray-500/20 text-gray-500">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Not Connected
                                                    </Badge>
                                                )}
                                            </h3>
                                            {connection.connected && (
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    <p>{connection.accountName}</p>
                                                    {connection.lastSync && (
                                                        <p className="text-xs">
                                                            Last synced: {new Date(connection.lastSync).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {connection.connected ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRefresh(connection.platform)}
                                                    className="btn-3d"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Refresh
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDisconnect(connection.platform)}
                                                >
                                                    Disconnect
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                onClick={() => handleConnect(connection.platform)}
                                                className="btn-3d gradient-instagram text-white"
                                            >
                                                <LinkIcon className="w-4 h-4 mr-2" />
                                                Connect
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>

                <Card className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4">Setup Instructions</h3>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">📺 YouTube</h4>
                            <p>Click "Connect" to start OAuth flow. Ensure your Google Cloud Console has YouTube Data API v3 enabled and redirect URIs configured.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">📘 Facebook</h4>
                            <p>Click "Connect" to start OAuth flow. Your Facebook app needs Facebook Login and Pages permissions approved.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">📷 Instagram</h4>
                            <p>Click "Connect" to start OAuth flow. Requires Facebook Business account with linked Instagram Business account.</p>
                        </div>
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-blue-400 text-xs">
                                💡 <strong>Tip:</strong> After connecting, click "Refresh" to fetch the latest analytics data from your connected accounts.
                            </p>
                        </div>
                    </div>
                </Card>
            </main>

            {/* Debug Panel */}
            <DebugPanel />
        </div>
    );
};

export default PlatformConnections;
