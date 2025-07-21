import { 
  Instagram, 
  Facebook, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Target
} from "lucide-react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import SocialMediaConnector from "@/components/SocialMediaConnector";
import AIInsights from "@/components/AIInsights";
import ContactInfo from "@/components/ContactInfo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="animate-bounce-in">
            <h1 className="text-6xl font-bold text-gradient-instagram mb-4">
              IG&FB Analyzer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your social media strategy with AI-powered analytics, 
              insights, and performance tracking for Instagram and Facebook.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="instagram" size="lg" className="animate-pulse-glow">
              <Instagram className="w-5 h-5 mr-2" />
              Start Analyzing Instagram
            </Button>
            <Button variant="facebook" size="lg">
              <Facebook className="w-5 h-5 mr-2" />
              Analyze Facebook Page
            </Button>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-gradient-funky">
            Analytics Overview
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

        {/* Features Grid */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-gradient-instagram">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Deep dive into your performance metrics with detailed charts and insights."
              },
              {
                icon: Target,
                title: "Audience Targeting",
                description: "Understand your audience demographics and optimize your content strategy."
              },
              {
                icon: TrendingUp,
                title: "Growth Tracking",
                description: "Monitor your follower growth and engagement trends over time."
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="glass-card p-6 btn-3d group text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 gradient-funky rounded-2xl flex items-center justify-center mx-auto animate-float">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-gradient-funky mb-4">
              Ready to Analyze?
            </h2>
            <p className="text-muted-foreground mb-6">
              Connect your social media accounts and start getting AI-powered insights 
              to grow your online presence.
            </p>
            <Button variant="funky" size="lg" className="animate-pulse-glow">
              Get Started Now
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
