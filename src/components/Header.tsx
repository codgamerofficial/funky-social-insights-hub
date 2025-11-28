import { Upload, Video, Link as LinkIcon, Menu, Sparkles, LogIn, Calendar as CalendarIcon, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="glass-card sticky top-0 z-50 w-full px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300">
              <Orbit className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              Orbit
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">Social Command Center</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-4">
          <Link to="/upload">
            <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </Link>
          <Link to="/library">
            <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
              <Video className="w-4 h-4 mr-2" />
              Library
            </Button>
          </Link>
          <Link to="/scheduler">
            <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Scheduler
            </Button>
          </Link>
          <Link to="/ai-studio">
            <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Studio
            </Button>
          </Link>
          <Link to="/platforms">
            <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
              <LinkIcon className="w-4 h-4 mr-2" />
              Platforms
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="ghost" className="btn-3d text-foreground hover:text-primary">
              Analytics
            </Button>
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {user ? (
            <Button
              className="btn-3d gradient-instagram text-white hover:opacity-90"
              size="sm"
              onClick={handleProfileClick}
            >
              <Avatar className="w-5 h-5 mr-2">
                <AvatarFallback className="text-xs bg-white/20">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              Profile
            </Button>
          ) : (
            <Button
              className="btn-3d gradient-instagram text-white hover:opacity-90"
              size="sm"
              onClick={handleProfileClick}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
          <Button variant="ghost" size="sm" className="lg:hidden btn-3d">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;