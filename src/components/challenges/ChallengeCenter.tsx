import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChallenges, Challenge, UserChallenge } from '@/hooks/useChallenges';
import { Trophy, Target, Clock, Play, Pause, CheckCircle, Star } from 'lucide-react';

export const ChallengeCenter = () => {
  const {
    loading,
    joinChallenge,
    pauseChallenge,
    resumeChallenge,
    getAvailableChallenges,
    getActiveChallenges,
    getCompletedChallenges
  } = useChallenges();

  const availableChallenges = getAvailableChallenges();
  const activeChallenges = getActiveChallenges();
  const completedChallenges = getCompletedChallenges();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'positivity': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mindfulness': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'reflection': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (days: number) => {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days === 7) return '1 week';
    if (days < 30) return `${Math.round(days / 7)} weeks`;
    return `${Math.round(days / 30)} month${days > 30 ? 's' : ''}`;
  };

  const getParticipationInstructions = (challenge: Challenge) => {
    switch (challenge.type) {
      case 'daily':
        if (challenge.title.toLowerCase().includes('gratitude')) {
          return "Write a journal entry each day about something you're grateful for. Your progress updates automatically when you create entries!";
        }
        return `Create a journal entry each day for ${challenge.duration_days} days. Progress updates automatically when you journal!`;
      case 'streak':
        return `Journal consistently for ${challenge.target_value} days in a row. Missing a day will reset your streak.`;
      case 'count':
        return `Create ${challenge.target_value} journal entries within ${challenge.duration_days} days.`;
      case 'weekly':
        return `Journal ${challenge.target_value} times each week for ${Math.round(challenge.duration_days / 7)} weeks.`;
      default:
        return "Participate by creating journal entries regularly!";
    }
  };

  const getProgressMessage = (challenge: Challenge, userChallenge: UserChallenge) => {
    const remaining = challenge.target_value - userChallenge.progress;
    if (challenge.type === 'daily' && challenge.title.toLowerCase().includes('gratitude')) {
      return `${remaining} more days of gratitude journaling to complete this challenge!`;
    }
    if (challenge.type === 'streak') {
      return `Current streak: ${userChallenge.streak_count} days. Keep journaling daily to maintain your streak!`;
    }
    return `${remaining} more entries needed to complete this challenge!`;
  };

  const ChallengeCard = ({ challenge, userChallenge }: { challenge: Challenge; userChallenge?: UserChallenge }) => {
    const isUserChallenge = !!userChallenge;
    const progressPercentage = isUserChallenge 
      ? Math.min((userChallenge.progress / challenge.target_value) * 100, 100)
      : 0;

    return (
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{challenge.badge_icon}</span>
              <div>
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                <CardDescription className="text-sm">{challenge.description}</CardDescription>
              </div>
            </div>
            {isUserChallenge && userChallenge.status === 'completed' && (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* How to participate section */}
          {!isUserChallenge && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium text-muted-foreground mb-1">How to participate:</p>
              <p className="text-muted-foreground">
                {getParticipationInstructions(challenge)}
              </p>
            </div>
          )}
          
          {/* Progress tracking for active challenges */}
          {isUserChallenge && userChallenge.status === 'active' && (
            <div className="bg-primary/5 rounded-lg p-3 text-sm">
              <p className="font-medium text-primary mb-1">Keep going!</p>
              <p className="text-muted-foreground">
                {getProgressMessage(challenge, userChallenge)}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
            <Badge variant="outline" className={getCategoryColor(challenge.category)}>
              {challenge.category}
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(challenge.duration_days)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Target: {challenge.target_value}
              </span>
              {isUserChallenge && (
                <span className="font-medium">
                  {userChallenge.progress} / {challenge.target_value}
                </span>
              )}
            </div>
            
            {isUserChallenge && (
              <Progress value={progressPercentage} className="h-2" />
            )}
          </div>

          <div className="flex gap-2">
            {!isUserChallenge ? (
              <Button 
                onClick={() => joinChallenge(challenge.id)}
                className="w-full"
                disabled={loading}
              >
                <Play className="h-4 w-4 mr-2" />
                Join Challenge
              </Button>
            ) : userChallenge.status === 'active' ? (
              <Button 
                variant="outline"
                onClick={() => pauseChallenge(challenge.id)}
                className="w-full"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : userChallenge.status === 'paused' ? (
              <Button 
                onClick={() => resumeChallenge(challenge.id)}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            ) : userChallenge.status === 'completed' ? (
              <Button 
                variant="outline"
                className="w-full"
                disabled
              >
                <Trophy className="h-4 w-4 mr-2" />
                Completed!
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Challenge Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading challenges...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Challenge Center
        </CardTitle>
        <CardDescription>
          Join challenges to stay motivated and build healthy journaling habits
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="available" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Available ({availableChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Active ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Completed ({completedChallenges.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-4">
            {availableChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>You've joined all available challenges!</p>
                <p className="text-sm">Check back later for new challenges.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {activeChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeChallenges.map((userChallenge) => (
                  <ChallengeCard 
                    key={userChallenge.id} 
                    challenge={userChallenge.challenge}
                    userChallenge={userChallenge}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active challenges</p>
                <p className="text-sm">Join a challenge to get started!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedChallenges.map((userChallenge) => (
                  <ChallengeCard 
                    key={userChallenge.id} 
                    challenge={userChallenge.challenge}
                    userChallenge={userChallenge}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No completed challenges yet</p>
                <p className="text-sm">Complete your first challenge to see it here!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};