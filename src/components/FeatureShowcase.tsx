/**
 * Feature Showcase Component
 * A visually stunning "ad-like" display of the platform's capabilities
 */

import { useState, useEffect } from 'react';
import {
    Sparkles,
    Calendar,
    BarChart3,
    Upload,
    Youtube,
    Facebook,
    Instagram,
    Zap,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const FeatureShowcase = () => {
    const [activeFeature, setActiveFeature] = useState(0);

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 4);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            id: 'upload',
            title: 'Multi-Platform Publishing',
            description: 'Upload once, publish everywhere. Seamlessly distribute your content to YouTube, Facebook, and Instagram in a single click.',
            icon: Upload,
            color: 'from-blue-500 to-purple-600',
            demo: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 blur-3xl" />
                    <div className="relative z-10 flex items-center gap-4">
                        <Card className="w-16 h-16 flex items-center justify-center bg-black/50 border-white/10 animate-bounce-in" style={{ animationDelay: '0ms' }}>
                            <Upload className="w-8 h-8 text-white" />
                        </Card>
                        <div className="flex flex-col gap-2">
                            <div className="w-8 h-1 bg-gradient-to-r from-white/50 to-transparent rounded-full animate-pulse" />
                            <div className="w-8 h-1 bg-gradient-to-r from-white/50 to-transparent rounded-full animate-pulse delay-75" />
                            <div className="w-8 h-1 bg-gradient-to-r from-white/50 to-transparent rounded-full animate-pulse delay-150" />
                        </div>
                        <div className="flex flex-col gap-4">
                            <Card className="w-12 h-12 flex items-center justify-center bg-red-600/20 border-red-500/50 animate-bounce-in" style={{ animationDelay: '100ms' }}>
                                <Youtube className="w-6 h-6 text-red-500" />
                            </Card>
                            <Card className="w-12 h-12 flex items-center justify-center bg-blue-600/20 border-blue-500/50 animate-bounce-in" style={{ animationDelay: '200ms' }}>
                                <Facebook className="w-6 h-6 text-blue-500" />
                            </Card>
                            <Card className="w-12 h-12 flex items-center justify-center bg-pink-600/20 border-pink-500/50 animate-bounce-in" style={{ animationDelay: '300ms' }}>
                                <Instagram className="w-6 h-6 text-pink-500" />
                            </Card>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'ai',
            title: 'AI Content Studio',
            description: 'Let AI generate viral titles, engaging descriptions, and optimized tags. Stop staring at a blank screen.',
            icon: Sparkles,
            color: 'from-pink-500 to-orange-400',
            demo: (
                <div className="relative w-full h-full p-6 flex flex-col justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-400/10 blur-3xl" />
                    <Card className="glass-card p-4 space-y-3 border-white/10 relative z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-pink-500" />
                            <span className="text-xs font-bold text-gradient-funky">AI Generating...</span>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-3/4 bg-white/10 rounded animate-pulse" />
                            <div className="h-2 w-full bg-white/10 rounded animate-pulse delay-75" />
                            <div className="h-2 w-5/6 bg-white/10 rounded animate-pulse delay-150" />
                        </div>
                        <div className="pt-2 flex gap-2">
                            <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/20">#viral</Badge>
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">#trending</Badge>
                        </div>
                    </Card>
                </div>
            )
        },
        {
            id: 'schedule',
            title: 'Smart Scheduling',
            description: 'Plan your content calendar with drag-and-drop ease. Auto-post at optimal times for maximum engagement.',
            icon: Calendar,
            color: 'from-green-400 to-emerald-600',
            demo: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-600/10 blur-3xl" />
                    <div className="grid grid-cols-3 gap-2 relative z-10 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <div
                                key={i}
                                className={`w-12 h-12 rounded-lg border border-white/10 flex items-center justify-center ${[2, 5, 9].includes(i) ? 'bg-green-500/20 border-green-500/50' : 'bg-black/40'
                                    }`}
                            >
                                {[2, 5, 9].includes(i) && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'analytics',
            title: 'Unified Analytics',
            description: 'Track performance across all platforms in one dashboard. Compare views, engagement, and growth.',
            icon: BarChart3,
            color: 'from-orange-500 to-red-600',
            demo: (
                <div className="relative w-full h-full flex items-end justify-center px-8 pb-8 gap-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10 blur-3xl" />
                    {[40, 70, 50, 90, 60, 80].map((h, i) => (
                        <div
                            key={i}
                            className="w-8 bg-gradient-to-t from-orange-500 to-red-600 rounded-t-lg relative group"
                            style={{ height: `${h}%` }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {h}k
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
    ];

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-64 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 px-4 py-1 text-sm backdrop-blur-md">
                        <Zap className="w-3 h-3 mr-2 text-yellow-400 fill-yellow-400" />
                        New: Automation Suite
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
                        Everything You Need to <br />
                        <span className="text-gradient-funky">Dominate Social Media</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Stop juggling multiple tabs. Manage your entire social media presence from one powerful, AI-enhanced command center.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Feature Navigation */}
                    <div className="space-y-4">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                onClick={() => setActiveFeature(index)}
                                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${activeFeature === index
                                        ? 'bg-white/5 border-white/20 scale-105 shadow-2xl'
                                        : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold mb-2 ${activeFeature === index ? 'text-white' : 'text-white/70'}`}>
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Interactive Demo Area */}
                    <div className="relative h-[600px] w-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
                            {/* Window Controls */}
                            <div className="absolute top-0 left-0 w-full h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>

                            {/* Content Area */}
                            <div className="absolute top-12 left-0 w-full h-[calc(100%-3rem)] p-8 flex items-center justify-center">
                                {features[activeFeature].demo}
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute bottom-8 right-8 animate-bounce-slow">
                                <Link to="/auth">
                                    <Button className="btn-3d gradient-funky text-white shadow-lg shadow-purple-500/20">
                                        Try It Now <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;
