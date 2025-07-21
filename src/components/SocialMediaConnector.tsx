import { Instagram, Facebook, Link, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SocialMediaConnector = () => {
  const platforms = [
    {
      name: "Instagram",
      icon: Instagram,
      gradient: "gradient-instagram",
      connected: false,
      description: "Connect your Instagram Business account to analyze posts, stories, and engagement metrics."
    },
    {
      name: "Facebook",
      icon: Facebook,
      gradient: "gradient-facebook", 
      connected: true,
      description: "Analyze your Facebook page performance, audience insights, and post engagement."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gradient-funky">Connect Your Social Accounts</h2>
        <p className="text-muted-foreground">Link your social media accounts to start analyzing your performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <Card key={platform.name} className="glass-card btn-3d p-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${platform.gradient} rounded-xl flex items-center justify-center animate-float`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{platform.name}</h3>
                      {platform.connected ? (
                        <Badge variant="outline" className="border-green-400 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted-foreground">
                          Not Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {platform.description}
                </p>

                <Button 
                  className={`w-full btn-3d ${platform.gradient} text-white hover:opacity-90 transition-all`}
                  disabled={platform.connected}
                >
                  <Link className="w-4 h-4 mr-2" />
                  {platform.connected ? "Connected" : `Connect ${platform.name}`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMediaConnector;