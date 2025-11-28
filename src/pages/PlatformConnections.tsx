/**
 * Platform Connections Page
 * Manage OAuth connections to YouTube, Facebook, Instagram
 */

import { useState } from 'react';
import { ArrowLeft, Link as LinkIcon, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

const PlatformConnections = () => {
    const { toast } = useToast();

    const [connections, setConnections] = useState([
        {
            platform: 'youtube',
            name: 'YouTube',
            icon: '📺',
            connected: false,
            accountName: '',
            lastSync: null,
        },
        {
            platform: 'facebook',
            name: 'Facebook',
            icon: '📘',
            connected: false,
            accountName: '',
            lastSync: null,
        },
        {
            platform: 'instagram',
            name: 'Instagram',
            icon: '📷',
            connected: false,
            accountName: '',
            lastSync: null,
        },
    ]);

    const handleConnect = (platform: string) => {
        toast({
            title: 'Connecting...',
            description: `Opening ${platform} OAuth flow`,
        });

        // TODO: Implement actual OAuth flow
        // This would redirect to the platform's OAuth page
        setTimeout(() => {
            setConnections(connections.map(conn =>
                conn.platform === platform
                    ? { ...conn, connected: true, accountName: `My ${conn.name} Account`, lastSync: new Date().toISOString() }
                    : conn
            ));

            toast({
                title: 'Connected!',
                description: `Successfully connected to ${platform}`,
            });
        }, 1500);
    };

    const handleDisconnect = (platform: string) => {
        setConnections(connections.map(conn =>
            conn.platform === platform
                ? { ...conn, connected: false, accountName: '', lastSync: null }
                : conn
        ));

        toast({
            title: 'Disconnected',
            description: `Disconnected from ${platform}`,
        });
    };

    const handleRefresh = (platform: string) => {
        toast({
            title: 'Refreshing...',
            description: 'Updating connection status',
        });

        setTimeout(() => {
            setConnections(connections.map(conn =>
                conn.platform === platform
                    ? { ...conn, lastSync: new Date().toISOString() }
                    : conn
            ));

            toast({
                title: 'Refreshed',
                description: 'Connection updated successfully',
            });
        }, 1000);
    };

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
                            <p>Requires Google Cloud Console project with YouTube Data API enabled.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">📘 Facebook</h4>
                            <p>Requires Meta Developer app with Facebook Login and Pages permissions.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">📷 Instagram</h4>
                            <p>Requires Facebook Business account with Instagram Business account linked.</p>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default PlatformConnections;
