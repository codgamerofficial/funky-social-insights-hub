import { ArrowLeft, Brain, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import AIInsights from "@/components/AIInsights";

const AIInsightsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" className="btn-3d">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gradient-funky">AI Insights</h1>
        </div>

        <div className="text-center space-y-6 py-8">
          <div className="animate-bounce-in">
            <div className="w-20 h-20 gradient-funky rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gradient-instagram mb-4">
              AI-Powered Social Media Intelligence
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get personalized recommendations and insights powered by advanced AI 
              to optimize your social media strategy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AIInsights />
          
          <div className="space-y-6">
            <div className="glass-card p-6 btn-3d">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 gradient-instagram rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gradient-instagram">Premium AI Features</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Predictive analytics for content performance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Automated hashtag suggestions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Competitor analysis and benchmarking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Content calendar optimization</span>
                </li>
              </ul>
              <Button className="w-full mt-6 btn-3d gradient-funky text-white hover:opacity-90">
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIInsightsPage;