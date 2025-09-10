
import { AuthPage } from '@/components/auth/AuthPage';
import { Navigation } from '@/components/layout/Navigation';
import { EntryForm } from '@/components/journal/EntryForm';
import { EntryList } from '@/components/journal/EntryList';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { ActiveChallenges } from '@/components/challenges/ActiveChallenges';
import { MoodForecast } from '@/components/dashboard/MoodForecast';
import { ExportButtons } from '@/components/export/ExportButtons';
import { PremiumUpgrade } from '@/components/premium/PremiumUpgrade';
import { MotivationalQuote } from '@/components/quotes/MotivationalQuote';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { useMotivationalQuotes } from '@/hooks/useMotivationalQuotes';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Trophy, BarChart3, User, BookOpen, Crown, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React, { useEffect } from 'react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { isPremium } = usePremium();
  const { quote } = useMotivationalQuotes();
  
  // Debug logging
  console.log('User premium status:', isPremium);
  console.log('User:', user?.email);
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
  };
  const location = useLocation();


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Mobile Layout (≤480px) */}
      <div className="block sm:hidden">
        <div className="px-4 pt-6 pb-20 space-y-6">
          {/* Welcome Section - Mobile */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
            <p className="text-sm text-muted-foreground">
              How are you feeling today?
            </p>
          </div>

          {/* Mood Input - Mobile Priority */}
          <EntryForm />
          
          {/* AI Chat Button - Mobile Priority */}
          <Button 
            onClick={() => navigate('/ai-chat')}
            className="w-full"
            size="lg"
            variant="secondary"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Talk to AI
          </Button>

          {/* Stats Cards - Mobile Scrollable */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2 min-w-max">
              <StatsCards />
            </div>
          </div>

          {/* Streak Counter */}
          <StreakCounter />

          {/* Premium Upgrade Section - Mobile */}
          {!isPremium && (
            <div data-premium-upgrade className="mb-6">
              <PremiumUpgrade />
            </div>
          )}

          {/* Motivational Quote */}
          {isPremium && quote && (
            <MotivationalQuote quote={quote} />
          )}

          {/* Journal Entries */}
          <EntryList />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/')}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant={location.pathname === '/challenges' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/challenges')}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <Trophy className="h-4 w-4" />
              <span className="text-xs">Challenges</span>
            </Button>
            <Button
              variant={location.pathname === '/emotion-tracking' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/emotion-tracking')}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Analytics</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col gap-1 h-auto py-2 relative"
                >
                  <User className="h-4 w-4" />
                  <span className="text-xs">Profile</span>
                  {isPremium && (
                    <Crown className="absolute -top-1 -right-1 h-3 w-3 text-primary" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="z-[9999] w-48"
                sideOffset={5}
              >
                {isPremium ? (
                  <>
                    <DropdownMenuItem className="text-primary font-medium pointer-events-none">
                      <Crown className="mr-2 h-4 w-4" />
                      Premium Member
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem 
                      onClick={() => {
                        // Scroll to premium upgrade section on mobile
                        const premiumSection = document.querySelector('[data-premium-upgrade]');
                        if (premiumSection) {
                          premiumSection.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          // If no premium section visible, navigate to main page where it should be
                          navigate('/');
                        }
                      }} 
                      className="text-amber-600 font-medium cursor-pointer"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate('/emotion-tracking')} className="cursor-pointer">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/challenges')} className="cursor-pointer">
                  <Trophy className="mr-2 h-4 w-4" />
                  Challenges
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tablet Layout (481px–1024px) */}
      <div className="hidden sm:block lg:hidden">
        <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
          {/* Welcome Section - Tablet */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">
              How are you feeling today? Share your thoughts and track your emotional journey.
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Two Column Layout for Tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side - Input & AI */}
            <div className="space-y-6">
              <EntryForm />
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => navigate('/ai-chat')}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  AI Chat
                </Button>
                
                <Button 
                  onClick={() => navigate('/challenges')} 
                  className="w-full"
                  size="lg"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Challenges
                </Button>
              </div>
            </div>
            
            {/* Right Side - Analytics & Streak */}
            <div className="space-y-6">
              <MoodForecast />
              <StreakCounter />
              <ActiveChallenges />
              {!isPremium && <PremiumUpgrade />}
              {isPremium && quote && (
                <MotivationalQuote quote={quote} />
              )}
            </div>
          </div>

          {/* Journal Entries - Full Width */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Recent Entries</h3>
            <EntryList />
          </div>
        </div>
      </div>

      {/* Desktop Layout (≥1025px) */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 pt-6 space-y-6">
          {/* Welcome Section - Desktop */}
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-3">Welcome back!</h2>
            <p className="text-lg text-muted-foreground">
              How are you feeling today? Share your thoughts and track your emotional journey.
            </p>
          </div>

          {/* Stats Cards - Full Width */}
          <StatsCards />

          {/* Three Column Desktop Layout */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar (25% - 3 columns) */}
            <div className="col-span-3 space-y-6">
              <StreakCounter />
              
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/challenges')} 
                  className="w-full"
                  size="lg"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Challenge Center
                </Button>
                
                <Button 
                  onClick={() => navigate('/emotion-tracking')} 
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </div>

              <ActiveChallenges />
              
              {isPremium && quote && (
                <MotivationalQuote quote={quote} />
              )}
              
              {!isPremium && <PremiumUpgrade />}
            </div>
            
            {/* Main Content (50% - 6 columns) */}
            <div className="col-span-6 space-y-6">
              <EntryForm />
              
              <Button 
                onClick={() => navigate('/ai-chat')}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                AI Mood Support
              </Button>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recent Journal Entries</h3>
                <EntryList />
              </div>
            </div>
            
            {/* Right Sidebar (25% - 3 columns) */}
            <div className="col-span-3 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Analytics & Insights</h3>
                <MoodForecast />
              </div>
              
              <ExportButtons />
              
              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/emotion-tracking')}
                  >
                    View Detailed Analytics
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/challenges')}
                  >
                    Browse Challenges
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;