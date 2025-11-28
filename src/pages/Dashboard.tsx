import { ArrowLeft, BarChart3, Users, TrendingUp, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const { data: stats, isLoading, error } = useDashboardData();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
          <h1 className="text-4xl font-bold text-gradient-funky">Dashboard</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">
              No analytics data available yet. Connect your social media accounts to start tracking!
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Followers"
                value={formatNumber(stats?.totalFollowers || 0)}
                change={stats?.followersChange || 'No data'}
                changeType={stats?.totalFollowers && stats.totalFollowers > 0 ? "positive" : "neutral"}
                icon={Users}
                gradient="instagram"
              />
              <StatsCard
                title="Engagement Rate"
                value={`${stats?.engagementRate.toFixed(1) || 0}%`}
                change={stats?.engagementChange || 'No data'}
                changeType={stats?.engagementRate && stats.engagementRate > 0 ? "positive" : "neutral"}
                icon={TrendingUp}
                gradient="facebook"
              />
              <StatsCard
                title="Post Reach"
                value={formatNumber(stats?.postReach || 0)}
                change={stats?.reachChange || 'No data'}
                changeType={stats?.postReach && stats.postReach > 0 ? "positive" : "neutral"}
                icon={Eye}
                gradient="funky"
              />
              <StatsCard
                title="Growth Rate"
                value={`${stats?.growthRate.toFixed(1) || 0}%`}
                change={stats?.growthChange || 'No data'}
                changeType={stats?.growthRate && stats.growthRate >= 0 ? "positive" : "negative"}
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
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;