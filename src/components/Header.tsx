import { Instagram, Facebook, Menu, User, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="glass-card sticky top-0 z-50 w-full px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 gradient-instagram rounded-xl flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-instagram">
              IG&FB Analyzer
            </h1>
            <p className="text-xs text-muted-foreground">Social Media Analytics</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
            Dashboard
          </Button>
          <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
            Analytics
          </Button>
          <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
            AI Insights
          </Button>
          <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
            Reports
          </Button>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="btn-3d border-primary/30 hover:border-primary"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            className="btn-3d gradient-instagram text-white hover:opacity-90"
            size="sm"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden btn-3d">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;