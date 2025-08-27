import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/auth/AuthPage';
import { Navigation } from '@/components/layout/Navigation';
import { EntryForm } from '@/components/journal/EntryForm';
import { MoodChart } from '@/components/dashboard/MoodChart';
import { EntryList } from '@/components/journal/EntryList';
import { StatsCards } from '@/components/dashboard/StatsCards';

const Index = () => {
  const { user, loading } = useAuth();

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <EntryForm />
              <EntryList />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <MoodChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
