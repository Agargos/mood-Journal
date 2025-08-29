import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useChallenges } from '@/hooks/useChallenges';
import { Trophy, Target, Zap } from 'lucide-react';

export const ActiveChallenges = () => {
  const { getActiveChallenges, loading } = useChallenges();
  const activeChallenges = getActiveChallenges();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[120px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeChallenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active challenges</p>
            <p className="text-xs">Join a challenge to start your journey!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Active Challenges ({activeChallenges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeChallenges.slice(0, 3).map((userChallenge) => {
          const challenge = userChallenge.challenge;
          const progressPercentage = Math.min(
            (userChallenge.progress / challenge.target_value) * 100,
            100
          );

          return (
            <div key={userChallenge.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{challenge.badge_icon}</span>
                  <div>
                    <p className="font-medium text-sm">{challenge.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {userChallenge.progress} / {challenge.target_value}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: challenge.badge_color, color: challenge.badge_color }}
                >
                  {Math.round(progressPercentage)}%
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          );
        })}
        
        {activeChallenges.length > 3 && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              +{activeChallenges.length - 3} more challenges
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};