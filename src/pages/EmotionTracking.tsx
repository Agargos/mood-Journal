import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedMoodChart } from '@/components/dashboard/EnhancedMoodChart';
import { EmotionInsights } from '@/components/dashboard/EmotionInsights';
import { Calendar, TrendingUp, ArrowLeft, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AuthPage } from '@/components/auth/AuthPage';

const EmotionTrackingPage = () => {
  const { user, loading } = useAuth();
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
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Calendar className="h-10 w-10 text-primary" />
              7-Day Emotion Tracking
              <TrendingUp className="h-10 w-10 text-accent" />
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track and analyze your emotional patterns over the past week. Discover insights about your mood trends and emotional well-being.
            </p>
          </div>

          {/* Weekly Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Emotion Summary
              </CardTitle>
              <CardDescription>
                Your emotional journey over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Weekly Tracking View</h3>
                <p>This feature will show your daily emotion entries for the past 7 days with detailed analytics and patterns.</p>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mood Trends</CardTitle>
                <CardDescription>
                  Visualize your mood changes over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedMoodChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emotion Insights</CardTitle>
                <CardDescription>
                  Detailed analysis of your emotional patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmotionInsights />
              </CardContent>
            </Card>
          </div>

          {/* Daily Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Emotion Breakdown</CardTitle>
              <CardDescription>
                See how your emotions have varied each day this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{day}</h4>
                    <div className="h-20 bg-muted rounded flex items-center justify-center">
                      <span className="text-2xl">😊</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Happy</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Insights</CardTitle>
              <CardDescription>
                Key observations from your 7-day emotion tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary">Positive Trend</h4>
                    <p className="text-sm text-muted-foreground">Your overall mood has been trending upward this week!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Most Active Day</h4>
                    <p className="text-sm text-muted-foreground">Wednesday showed the highest emotional activity with multiple journal entries.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmotionTrackingPage;