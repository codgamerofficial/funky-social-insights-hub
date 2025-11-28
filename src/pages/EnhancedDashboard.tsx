import { useState } from 'react';
import { Calendar, TrendingUp, Target, Users, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AdvancedLineChart,
    AdvancedAreaChart,
    PlatformComparisonChart,
    EngagementPieChart,
    HeatmapChart,
    ChartDataPoint
} from '@/components/AdvancedCharts';
import Header from '@/components/Header';

// Mock data - replace with real API data
const generateMockData = (days: number = 30): ChartDataPoint[] => {
    return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 1000) + 500,
        youtube: Math.floor(Math.random() * 400) + 200,
        facebook: Math.floor(Math.random() * 300) + 150,
        instagram: Math.floor(Math.random() * 300) + 150
    }));
};

const mockHeatmapData = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
        day,
        hour,
        value: Math.random() * 100
    }))
).flat();

const mockEngagementData = [
    { name: 'YouTube', value: 35, color: '#ff0000' },
    { name: 'Facebook', value: 28, color: '#1877f2' },
    { name: 'Instagram', value: 37, color: '#e4405f' }
];

const EnhancedDashboard = () => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const currentData = generateMockData(daysMap[timeRange]);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gradient-funky">Advanced Analytics</h1>
                        <p className="text-muted-foreground mt-2">
                            Deep insights into your social media performance
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
                            <TabsList className="glass-card">
                                <TabsTrigger value="7d">7 Days</TabsTrigger>
                                <TabsTrigger value="30d">30 Days</TabsTrigger>
                                <TabsTrigger value="90d">90 Days</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Button variant="outline" className="btn-3d">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                                <p className="text-3xl font-bold">1.2M</p>
                                <div className="flex items-center mt-1">
                                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-500">+23.5%</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                                <p className="text-3xl font-bold">8.4%</p>
                                <div className="flex items-center mt-1">
                                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-500">+12.1%</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Peak Hours</p>
                                <p className="text-3xl font-bold">2PM</p>
                                <div className="flex items-center mt-1">
                                    <Clock className="w-4 h-4 text-blue-500 mr-1" />
                                    <span className="text-sm text-blue-500">Best time</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Content Score</p>
                                <p className="text-3xl font-bold">94/100</p>
                                <div className="flex items-center mt-1">
                                    <Badge variant="outline" className="border-green-500 text-green-500">
                                        Excellent
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Analytics Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="glass-card w-full justify-start">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="platforms">Platforms</TabsTrigger>
                        <TabsTrigger value="engagement">Engagement</TabsTrigger>
                        <TabsTrigger value="audience">Audience</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AdvancedLineChart
                                data={currentData}
                                title="Followers Growth"
                                color="#8b5cf6"
                                showTrend={true}
                                height={350}
                            />

                            <AdvancedAreaChart
                                data={currentData}
                                title="Engagement Trend"
                                color="#06b6d4"
                                height={350}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <PlatformComparisonChart
                                data={currentData}
                                title="Multi-Platform Performance"
                                height={350}
                            />

                            <EngagementPieChart
                                data={mockEngagementData}
                                title="Platform Distribution"
                                height={350}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="platforms" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <AdvancedLineChart
                                data={currentData}
                                title="YouTube Analytics"
                                color="#ff0000"
                                height={400}
                            />

                            <AdvancedLineChart
                                data={currentData}
                                title="Facebook Analytics"
                                color="#1877f2"
                                height={400}
                            />

                            <AdvancedLineChart
                                data={currentData}
                                title="Instagram Analytics"
                                color="#e4405f"
                                height={400}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="engagement" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AdvancedLineChart
                                data={currentData}
                                title="Engagement Over Time"
                                color="#10b981"
                                height={400}
                            />

                            <HeatmapChart
                                data={mockHeatmapData}
                                title="Peak Engagement Hours"
                                height={400}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="glass-card p-6">
                                <h3 className="text-lg font-semibold mb-4">Engagement Rate</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Likes</span>
                                        <span className="font-bold">12.5%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Comments</span>
                                        <span className="font-bold">8.3%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shares</span>
                                        <span className="font-bold">5.7%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saves</span>
                                        <span className="font-bold">3.2%</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="glass-card p-6">
                                <h3 className="text-lg font-semibold mb-4">Top Performing Content</h3>
                                <div className="space-y-3">
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <p className="font-medium">Tutorial Video #23</p>
                                        <p className="text-sm text-muted-foreground">45.2K views • 2.1K likes</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <p className="font-medium">Behind the Scenes</p>
                                        <p className="text-sm text-muted-foreground">38.7K views • 1.8K likes</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <p className="font-medium">Product Showcase</p>
                                        <p className="text-sm text-muted-foreground">32.1K views • 1.5K likes</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="glass-card p-6">
                                <h3 className="text-lg font-semibold mb-4">Growth Predictions</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm">Next 7 days</span>
                                            <span className="text-sm font-bold">+5.2%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm">Next 30 days</span>
                                            <span className="text-sm font-bold">+18.7%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm">Next 90 days</span>
                                            <span className="text-sm font-bold">+42.1%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="audience" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="glass-card p-6">
                                <h3 className="text-lg font-semibold mb-4">Audience Demographics</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span>Age 18-24</span>
                                            <span>35%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-pink-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span>Age 25-34</span>
                                            <span>42%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span>Age 35-44</span>
                                            <span>18%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span>Age 45+</span>
                                            <span>5%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="glass-card p-6">
                                <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>🇺🇸 United States</span>
                                        <span className="font-bold">45%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>🇬🇧 United Kingdom</span>
                                        <span className="font-bold">23%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>🇨🇦 Canada</span>
                                        <span className="font-bold">15%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>🇦🇺 Australia</span>
                                        <span className="font-bold">12%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>🇩🇪 Germany</span>
                                        <span className="font-bold">5%</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default EnhancedDashboard;