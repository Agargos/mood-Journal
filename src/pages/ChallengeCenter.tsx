import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { ChallengeCenter } from '@/components/challenges/ChallengeCenter';
import { ActiveChallenges } from '@/components/challenges/ActiveChallenges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AuthPage } from '@/components/auth/AuthPage';

const ChallengeCenterPage = () => {
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
              <Trophy className="h-10 w-10 text-primary" />
              Challenge Center
              <Target className="h-10 w-10 text-accent" />
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take on challenges to improve your mental wellness journey. Complete tasks, earn achievements, and unlock new levels of personal growth.
            </p>
          </div>

          {/* Active Challenges Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Active Challenges
              </CardTitle>
              <CardDescription>
                Keep track of your ongoing challenges and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveChallenges />
            </CardContent>
          </Card>

          {/* All Challenges */}
          <ChallengeCenter />
        </div>
      </div>
    </div>
  );
};

export default ChallengeCenterPage;