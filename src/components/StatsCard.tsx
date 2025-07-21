import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: "instagram" | "facebook" | "funky";
}

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  gradient = "funky" 
}: StatsCardProps) => {
  const gradientClass = {
    instagram: "gradient-instagram",
    facebook: "gradient-facebook", 
    funky: "gradient-funky"
  }[gradient];

  const changeColor = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-yellow-400"
  }[changeType];

  return (
    <Card className="glass-card btn-3d p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground group-hover:scale-105 transition-transform">
            {value}
          </p>
          <p className={`text-sm font-medium ${changeColor} flex items-center`}>
            {change}
          </p>
        </div>
        <div className={`w-12 h-12 ${gradientClass} rounded-xl flex items-center justify-center animate-float`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;