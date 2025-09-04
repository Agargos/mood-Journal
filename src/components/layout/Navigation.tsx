import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { Heart, LogOut, User, Crown, MessageCircle, BookOpen, BarChart3, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-primary to-accent">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mood Journal
            </h1>
            {isPremium && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <Button
                  variant={isActive('/') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Journal
                </Button>
                
                <Button
                  variant={isActive('/ai-chat') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/ai-chat')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  AI Chat
                </Button>
                
                <Button
                  variant={isActive('/emotion-tracking') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/emotion-tracking')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
                
                <Button
                  variant={isActive('/challenges') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/challenges')}
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
                    {user.email}
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
        </div>
      </div>
    </nav>
  );
};