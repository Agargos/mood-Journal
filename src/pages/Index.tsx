import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/auth/AuthPage';
import { Navigation } from '@/components/layout/Navigation';
import { EntryForm } from '@/components/journal/EntryForm';
import { MoodChart } from '@/components/dashboard/MoodChart';
import { EntryList } from '@/components/journal/EntryList';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { ExportButtons } from '@/components/export/ExportButtons';
import { PremiumUpgrade } from '@/components/premium/PremiumUpgrade';
import { MotivationalQuote } from '@/components/quotes/MotivationalQuote';
import { useMotivationalQuotes } from '@/hooks/useMotivationalQuotes';
import { usePremium } from '@/hooks/usePremium';
import { FlutterwaveScript } from '@/components/premium/FlutterwaveScript';
import { useEffect } from 'react';

const Index = () => {
  const { user, loading } = useAuth();
  const { isPremium } = usePremium();
  const { quote } = useMotivationalQuotes();

  // Ensure Flutterwave script loads early
  useEffect(() => {
    if (!window.FlutterwaveCheckout) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      script.onload = () => console.log('Flutterwave script loaded');
      script.onerror = (error) => console.error('Failed to load Flutterwave script:', error);
      document.head.appendChild(script);
    }
  }, []);

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
      <FlutterwaveScript />
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
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <EntryForm />
              <EntryList />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <StreakCounter />
              {!isPremium && <PremiumUpgrade />}
              {isPremium && quote && (
                <MotivationalQuote quote={quote} />
              )}
              <ExportButtons />
              <MoodChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
