/**
 * Platform Connections Hook
 * Manages social media platform connections and their status
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { socialMediaService } from '@/lib/services/socialMediaService';

export interface PlatformConnectionData {
    platform: string;
    name: string;
    icon: string;
    connected: boolean;
    accountName: string;
    accountUsername?: string;
    lastSync: string | null;
    followerCount?: number;
}

export const usePlatformConnections = () => {
    const { user } = useAuth();
    const [connections, setConnections] = useState<PlatformConnectionData[]>([
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchConnections();
        }
    }, [user]);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching platform connections for user:', user?.id);

            if (!user) {
                console.warn('User not authenticated in fetchConnections');
                setError('User not authenticated');
                return;
            }

            console.log('Querying platform_connections table...');
            const { data, error } = await supabase
                .from('platform_connections')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Platform connections data:', data);

            // Update connections with actual data
            setConnections(prevConnections =>
                prevConnections.map(connection => {
                    const platformData = data?.find(d => d.platform === connection.platform);
                    if (platformData) {
                        return {
                            ...connection,
                            connected: true,
                            accountName: platformData.account_name || 'Connected Account',
                            accountUsername: platformData.account_username,
                            lastSync: platformData.updated_at,
                        };
                    } else {
                        return {
                            ...connection,
                            connected: false,
                            accountName: '',
                            accountUsername: undefined,
                            lastSync: null,
                        };
                    }
                })
            );
        } catch (err: any) {
            console.error('Error fetching platform connections:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const connectPlatform = async (platform: string) => {
        // This is handled by the OAuth flow in PlatformConnections.tsx
        // This function just refreshes the connections list
        await fetchConnections();
    };

    const disconnectPlatform = async (platform: string) => {
        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            const success = await socialMediaService.disconnectPlatform(user.id, platform);

            if (success) {
                // Update local state
                setConnections(prevConnections =>
                    prevConnections.map(connection =>
                        connection.platform === platform
                            ? {
                                ...connection,
                                connected: false,
                                accountName: '',
                                accountUsername: undefined,
                                lastSync: null,
                            }
                            : connection
                    )
                );
            } else {
                throw new Error('Failed to disconnect platform');
            }
        } catch (err: any) {
            console.error(`Error disconnecting ${platform}:`, err);
            setError(err.message);
            throw err;
        }
    };

    const refreshConnection = async (platform: string) => {
        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Fetch fresh analytics data for the platform
            const analytics = await socialMediaService.getAllPlatformAnalytics(user.id);

            // Store the fresh data
            const platformAnalytics = analytics[platform as keyof typeof analytics];
            if (platformAnalytics) {
                await socialMediaService.storeAnalytics(user.id, platformAnalytics);
            }

            // Update the last sync time
            setConnections(prevConnections =>
                prevConnections.map(connection =>
                    connection.platform === platform
                        ? { ...connection, lastSync: new Date().toISOString() }
                        : connection
                )
            );
        } catch (err: any) {
            console.error(`Error refreshing ${platform}:`, err);
            setError(err.message);
            throw err;
        }
    };

    const getConnectedPlatforms = (): string[] => {
        return connections
            .filter(connection => connection.connected)
            .map(connection => connection.platform);
    };

    const isPlatformConnected = (platform: string): boolean => {
        return connections.find(c => c.platform === platform)?.connected || false;
    };

    return {
        connections,
        loading,
        error,
        connectPlatform,
        disconnectPlatform,
        refreshConnection,
        getConnectedPlatforms,
        isPlatformConnected,
        refetch: fetchConnections,
    };
};