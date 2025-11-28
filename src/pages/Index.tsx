import {
  Instagram,
  Facebook,
  TrendingUp,
  Users,
  Eye,
  Heart,
  BarChart3,
  Target
} from "lucide-react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import SocialMediaConnector from "@/components/SocialMediaConnector";
import AIInsights from "@/components/AIInsights";
import ContactInfo from "@/components/ContactInfo";
import FeatureShowcase from "@/components/FeatureShowcase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();

  const handleInstagramAnalyze = () => {
    toast({
      title: "Starting Instagram Analysis",
      description: "Connecting to Instagram API to fetch your data...",
    });
  };

  const handleFacebookAnalyze = () => {
    toast({
      title: "Starting Facebook Analysis",
      description: "Connecting to Facebook API to fetch your page data...",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="animate-bounce-in relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-white/80">Orbit v2.0 is now live</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Orbit
              </span>
            </h1>
            <p className="text-2xl md:text-3xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Your complete <span className="text-white font-medium">Social Command Center</span>. <br />
              Upload, Analyze, and Dominate.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
            <Link to="/auth">
              <Button
                className="btn-3d gradient-instagram text-white h-12 px-8 text-lg shadow-lg shadow-pink-500/20"
              >
                Start for Free
              </Button>
            </Link>
            <Link to="/library">
              <Button
                variant="outline"
                className="btn-3d h-12 px-8 text-lg"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Showcase Ad Design */}
        <FeatureShowcase />

        {/* Stats Overview */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-gradient-funky">
            Live Performance Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Followers"
              value="24.5K"
              change="+12.5% from last month"
              changeType="positive"
              icon={Users}
              gradient="instagram"
            />
            <StatsCard
              title="Engagement Rate"
              value="8.2%"
              change="+2.1% from last week"
              changeType="positive"
              icon={Heart}
              gradient="facebook"
            />
            <StatsCard
              title="Post Reach"
              value="156K"
              change="+45% from last month"
              changeType="positive"
              icon={Eye}
              gradient="funky"
            />
            <StatsCard
              title="Growth Rate"
              value="3.4%"
              change="+0.8% from last week"
              changeType="positive"
              icon={TrendingUp}
              gradient="instagram"
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Social Media Connector */}
          <div className="lg:col-span-2">
            <SocialMediaConnector />
          </div>

          {/* Right Column - AI Insights & Contact */}
          <div className="space-y-6">
            <AIInsights />
            <ContactInfo />
          </div>
        </div>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-gradient-funky mb-4">
              Ready to Automate?
            </h2>
            <p className="text-muted-foreground mb-6">
              Connect your social media accounts and start getting AI-powered insights
              to grow your online presence.
            </p>
            <Link to="/auth">
              <Button
                variant="funky"
                size="lg"
                className="animate-pulse-glow"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
