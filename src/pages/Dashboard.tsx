import { ArrowLeft, BarChart3, Users, TrendingUp, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";

const Dashboard = () => {
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
          <h1 className="text-4xl font-bold text-gradient-funky">Dashboard</h1>
        </div>

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
            icon={TrendingUp}
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
            title="Analytics Score"
            value="92%"
            change="+5% improvement"
            changeType="positive"
            icon={BarChart3}
            gradient="instagram"
          />
        </div>

        <div className="text-center space-y-4 py-8">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gradient-instagram mb-4">
              Welcome to Your Dashboard
            </h2>
            <p className="text-muted-foreground mb-6">
              Here you can view all your analytics and performance metrics in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/analytics">
                <Button variant="instagram" className="btn-3d">
                  View Detailed Analytics
                </Button>
              </Link>
              <Link to="/ai-insights">
                <Button variant="funky" className="btn-3d">
                  Get AI Insights
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;