import { Brain, TrendingUp, Users, Target, Lightbulb, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const AIInsights = () => {
  const { toast } = useToast();

  const handleGenerateInsights = () => {
    toast({
      title: "Generating AI Insights",
      description: "Analyzing your data to provide personalized recommendations...",
    });
  };

  const insights = [
    {
      icon: TrendingUp,
      title: "Peak Engagement Time",
      insight: "Your audience is most active between 7-9 PM. Consider posting during these hours for maximum engagement.",
      confidence: 95,
      type: "timing"
    },
    {
      icon: Users,
      title: "Audience Growth Opportunity",
      insight: "Your content performs 40% better with hashtags #socialmedia and #analytics. Use them more frequently.",
      confidence: 87,
      type: "growth"
    },
    {
      icon: Target,
      title: "Content Strategy",
      insight: "Video content receives 3x more engagement than static posts. Focus on creating more video content.",
      confidence: 92,
      type: "content"
    }
  ];

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 gradient-funky rounded-xl flex items-center justify-center animate-pulse-glow">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gradient-funky">AI Insights</h3>
          <p className="text-sm text-muted-foreground">Powered by advanced analytics</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div 
              key={index} 
              className="glass-card p-4 btn-3d group hover:border-primary/30 transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 gradient-instagram rounded-lg flex items-center justify-center flex-shrink-0 animate-float">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">{insight.title}</h4>
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      {insight.confidence}% confident
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.insight}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button 
          className="btn-3d gradient-funky text-white hover:opacity-90"
          onClick={handleGenerateInsights}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Get More AI Insights
        </Button>
      </div>
    </Card>
  );
};

export default AIInsights;