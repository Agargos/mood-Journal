import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { Heart, LogOut, User, Crown, MessageCircle, BookOpen, BarChart3, Trophy, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-primary to-accent">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mood Journal
            </h1>
            {isPremium && (
              <Badge variant="secondary" className="hidden sm:flex bg-primary/20 text-primary border-primary/30">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {user && (
              <>
                <Button
                  variant={isActive('/') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigation('/')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Journal
                </Button>
                
                <Button
                  variant={isActive('/ai-chat') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigation('/ai-chat')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  AI Chat
                </Button>
                
                <Button
                  variant={isActive('/emotion-tracking') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigation('/emotion-tracking')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
                
                <Button
                  variant={isActive('/challenges') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigation('/challenges')}
                  className="flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Challenges
                </Button>
              </>
            )}
            
            <ThemeToggle />
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden xl:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Navigation Controls */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/')}
                className="w-full justify-start gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Journal
              </Button>
              
              <Button
                variant={isActive('/ai-chat') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/ai-chat')}
                className="w-full justify-start gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                AI Chat
              </Button>
              
              <Button
                variant={isActive('/emotion-tracking') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/emotion-tracking')}
                className="w-full justify-start gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
              
              <Button
                variant={isActive('/challenges') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/challenges')}
                className="w-full justify-start gap-2"
              >
                <Trophy className="h-4 w-4" />
                Challenges
              </Button>
              
              <div className="border-t pt-2 mt-2">
                {isPremium && (
                  <div className="px-3 py-2">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};