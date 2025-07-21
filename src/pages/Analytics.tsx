import { ArrowLeft, BarChart3, LineChart, PieChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";

const Analytics = () => {
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
          <h1 className="text-4xl font-bold text-gradient-instagram">Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: "Engagement Analytics",
              description: "Track likes, comments, shares and overall engagement rates",
              gradient: "instagram"
            },
            {
              icon: LineChart,
              title: "Growth Trends",
              description: "Monitor follower growth and reach trends over time",
              gradient: "facebook"
            },
            {
              icon: PieChart,
              title: "Audience Insights",
              description: "Understand your audience demographics and behavior",
              gradient: "funky"
            }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="glass-card p-6 btn-3d group text-center">
                <div className="space-y-4">
                  <div className={`w-16 h-16 ${item.gradient} rounded-2xl flex items-center justify-center mx-auto animate-float`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  <Button className={`${item.gradient} text-white hover:opacity-90 btn-3d`}>
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center py-8">
          <div className="glass-card p-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gradient-funky mb-4">
              Advanced Analytics Coming Soon
            </h2>
            <p className="text-muted-foreground mb-6">
              We're working on bringing you comprehensive analytics with real-time data, 
              custom reports, and advanced filtering options.
            </p>
            <Button variant="funky" size="lg" className="btn-3d animate-pulse-glow">
              Get Notified When Ready
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;