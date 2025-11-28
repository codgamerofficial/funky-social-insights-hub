import { ArrowLeft, Brain, Sparkles, Zap, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useAIInsights } from "@/hooks/useAIInsights";

const AIInsightsPage = () => {
  const { data: insights, isLoading, error } = useAIInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500';
      case 'low': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return '💬';
      case 'growth': return '📈';
      case 'content': return '📝';
      case 'audience': return '👥';
      default: return '💡';
    }
  };

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : error || !insights || insights.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No AI insights available yet. Connect your social media accounts and start analyzing your data to receive personalized insights!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="glass-card p-6 btn-3d">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(insight.category)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{insight.category}</p>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{insight.content}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                  {insight.is_read && (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Read</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="glass-card p-6 btn-3d max-w-2xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 gradient-instagram rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gradient-instagram">Premium AI Features</h3>
          </div>
          <ul className="space-y-3 text-muted-foreground mb-6">
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
          <Button className="w-full btn-3d gradient-funky text-white hover:opacity-90">
            Upgrade to Premium
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AIInsightsPage;