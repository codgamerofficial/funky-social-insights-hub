/**
 * Analytics Page
 * Comprehensive analytics dashboard for all platforms
 */

import { ArrowLeft, TrendingUp, Users, Eye, Heart, Calendar, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import VideoAnalytics from '@/components/VideoAnalytics';
import { usePlatformConnections } from '@/hooks/usePlatformConnections';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Loader2 } from 'lucide-react';

const Analytics = () => {
  const { connections, loading: platformsLoading } = usePlatformConnections();
  const { data: stats, isLoading: statsLoading } = useDashboardData();

  const connectedPlatforms = connections.filter(c => c.connected);
  const hasConnectedPlatforms = connectedPlatforms.length > 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" className="btn-3d">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gradient-funky">Analytics Dashboard</h1>
          </div>
          <Button variant="outline" className="btn-3d">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {!hasConnectedPlatforms && !platformsLoading ? (
          <Card className="glass-card p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-4">No Connected Platforms</h2>
              <p className="text-muted-foreground mb-6">
                Connect your social media accounts to start viewing comprehensive analytics and insights.
              </p>
              <Link to="/platforms">
                <Button className="btn-3d gradient-instagram text-white">
                  Connect Platforms
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-card p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="videos">Video Analytics</TabsTrigger>
              <TabsTrigger value="platforms">Platform Breakdown</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Cards */}
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Followers</p>
                        <h3 className="text-2xl font-bold">{formatNumber(stats?.totalFollowers || 0)}</h3>
                        <p className="text-xs text-green-500">{stats?.followersChange || 'No data'}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </Card>

                  <Card className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
                        <h3 className="text-2xl font-bold">{(stats?.engagementRate || 0).toFixed(1)}%</h3>
                        <p className="text-xs text-green-500">{stats?.engagementChange || 'No data'}</p>
                      </div>
                      <Heart className="w-8 h-8 text-pink-500" />
                    </div>
                  </Card>

                  <Card className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Reach</p>
                        <h3 className="text-2xl font-bold">{formatNumber(stats?.postReach || 0)}</h3>
                        <p className="text-xs text-green-500">{stats?.reachChange || 'No data'}</p>
                      </div>
                      <Eye className="w-8 h-8 text-green-500" />
                    </div>
                  </Card>

                  <Card className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
                        <h3 className="text-2xl font-bold">{(stats?.growthRate || 0).toFixed(1)}%</h3>
                        <p className="text-xs text-green-500">{stats?.growthChange || 'No data'}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                  </Card>
                </div>
              )}

              {/* Connected Platforms Status */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Connected Platforms</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {connections.map((platform) => (
                    <div key={platform.platform} className="flex items-center space-x-3 p-4 bg-background/50 rounded-lg">
                      <div className="text-2xl">{platform.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{platform.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {platform.connected ? 'Connected' : 'Not Connected'}
                        </p>
                        {platform.connected && platform.lastSync && (
                          <p className="text-xs text-muted-foreground">
                            Last sync: {new Date(platform.lastSync).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <VideoAnalytics />
            </TabsContent>

            <TabsContent value="platforms" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {connectedPlatforms.map((platform) => (
                  <Card key={platform.platform} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold flex items-center">
                        <span className="mr-2">{platform.icon}</span>
                        {platform.name}
                      </h3>
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs">
                        Connected
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account</span>
                        <span className="font-medium">{platform.accountName || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Username</span>
                        <span className="font-medium">{platform.accountUsername || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Sync</span>
                        <span className="font-medium">
                          {platform.lastSync ? new Date(platform.lastSync).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Detailed Analytics
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">AI-Powered Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-2">Engagement Opportunity</h4>
                    <p className="text-sm text-muted-foreground">
                      Your Instagram posts perform 23% better than average. Consider increasing Instagram content frequency.
                    </p>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-medium text-green-400 mb-2">Growth Trend</h4>
                    <p className="text-sm text-muted-foreground">
                      Steady follower growth across all platforms. Current growth rate: 3.4% monthly.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <h4 className="font-medium text-yellow-400 mb-2">Content Recommendation</h4>
                    <p className="text-sm text-muted-foreground">
                      Video content on YouTube shows 45% higher engagement than other content types.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Analytics;