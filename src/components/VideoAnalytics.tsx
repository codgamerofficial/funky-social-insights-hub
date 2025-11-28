/**
 * Video Analytics Component
 * Displays detailed performance metrics for a video
 */

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Eye, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics';

interface VideoAnalyticsProps {
    videoId?: string;
}

const VideoAnalytics = ({ videoId }: VideoAnalyticsProps) => {
    const { metrics, history, loading } = useVideoAnalytics(videoId);

    if (loading || !metrics) {
        return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
    }

    const StatCard = ({ title, value, icon: Icon, trend }: any) => (
        <Card className="glass-card p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-2xl font-bold">{value.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            {trend && (
                <div className={`flex items-center mt-2 text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {Math.abs(trend)}% vs last period
                </div>
            )}
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Views"
                    value={metrics.total.views}
                    icon={Eye}
                    trend={12.5}
                />
                <StatCard
                    title="Total Likes"
                    value={metrics.total.likes}
                    icon={ThumbsUp}
                    trend={8.2}
                />
                <StatCard
                    title="Comments"
                    value={metrics.total.comments}
                    icon={MessageCircle}
                    trend={-2.4}
                />
                <StatCard
                    title="Shares"
                    value={metrics.total.shares}
                    icon={Share2}
                    trend={15.3}
                />
            </div>

            {/* Charts */}
            <Card className="glass-card p-6">
                <Tabs defaultValue="views" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Performance Over Time</h3>
                        <TabsList>
                            <TabsTrigger value="views">Views</TabsTrigger>
                            <TabsTrigger value="engagement">Engagement</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="views" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => new Date(value).getDate().toString()}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="youtube"
                                    stroke="#FF0000"
                                    strokeWidth={2}
                                    dot={false}
                                    name="YouTube"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="facebook"
                                    stroke="#1877F2"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Facebook"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="instagram"
                                    stroke="#E1306C"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Instagram"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="engagement" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => new Date(value).getDate().toString()}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                                />
                                <Bar dataKey="youtube" fill="#FF0000" stackId="a" name="YouTube" />
                                <Bar dataKey="facebook" fill="#1877F2" stackId="a" name="Facebook" />
                                <Bar dataKey="instagram" fill="#E1306C" stackId="a" name="Instagram" />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>
            </Card>

            {/* Platform Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['youtube', 'facebook', 'instagram'].map((platform) => {
                    const pMetrics = metrics[platform as keyof PlatformMetrics] as VideoMetrics;
                    const colors = {
                        youtube: 'text-red-500 bg-red-500/10',
                        facebook: 'text-blue-500 bg-blue-500/10',
                        instagram: 'text-pink-500 bg-pink-500/10',
                    };
                    const colorClass = colors[platform as keyof typeof colors];

                    return (
                        <Card key={platform} className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="capitalize font-bold">{platform}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                                    {pMetrics.engagementRate}% Eng.
                                </span>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Views</span>
                                    <span className="font-medium">{pMetrics.views.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Likes</span>
                                    <span className="font-medium">{pMetrics.likes.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Comments</span>
                                    <span className="font-medium">{pMetrics.comments.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shares</span>
                                    <span className="font-medium">{pMetrics.shares.toLocaleString()}</span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default VideoAnalytics;
