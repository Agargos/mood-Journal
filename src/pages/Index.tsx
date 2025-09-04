
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
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Trophy, BarChart3 } from 'lucide-react';
import React, { useEffect } from 'react';

const Index = () => {
  const { user, loading } = useAuth();
  const { isPremium } = usePremium();
  const { quote } = useMotivationalQuotes();
  const navigate = useNavigate();


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
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">
              How are you feeling today? Share your thoughts and track your emotional journey.
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Journal Entry */}
            <div className="lg:col-span-2 space-y-6">
              <EntryForm />
              <EntryList />
            </div>
            
            {/* Right Column - Dashboard & Gamification */}
            <div className="lg:col-span-1 space-y-6">
              <ActiveChallenges />
              
              <Button 
                onClick={() => navigate('/ai-chat')}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                AI Mood Support
              </Button>
              
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
                7-Day Emotion Tracking
              </Button>
              <StreakCounter />
              {!isPremium && <PremiumUpgrade />}
              {isPremium && quote && (
                <MotivationalQuote quote={quote} />
              )}
              <ExportButtons />
            </div>
          </div>

          {/* Enhanced Analytics Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Analytics & Insights</h2>
            
            {/* Mood Forecast - New AI feature */}
            <MoodForecast />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;