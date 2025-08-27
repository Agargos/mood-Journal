import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Award, Trophy, Medal } from "lucide-react";
import { useStreaks } from "@/hooks/useStreaks";

export const StreakCounter = () => {
  const { streakData, loading } = useStreaks();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Daily Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const getBadgeIcon = () => {
    switch (streakData.badgeLevel) {
      case 'gold':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'silver':
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 'bronze':
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getMotivationalMessage = () => {
    const streak = streakData.currentStreak;
    if (streak === 0) return "Start your journey today! 🌱";
    if (streak < 3) return "Great start! Keep it up! 💪";
    if (streak < 7) return "You're building momentum! 🚀";
    if (streak < 14) return "🔥 You're on fire! Amazing streak!";
    if (streak < 30) return "🌟 Incredible dedication! You're unstoppable!";
    return "🏆 Legendary streak! You're a journaling master!";
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Daily Streak
          {streakData.badgeLevel && (
            <Badge variant="secondary" className="ml-auto flex items-center gap-1">
              {getBadgeIcon()}
              {streakData.badgeLevel}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {streakData.currentStreak}
          </div>
          <div className="text-sm text-muted-foreground">
            {streakData.currentStreak === 1 ? 'day' : 'days'} in a row
          </div>
        </div>
        
        <div className="text-center text-sm font-medium text-foreground">
          {getMotivationalMessage()}
        </div>

        {streakData.lastEntryDate && (
          <div className="text-xs text-muted-foreground text-center">
            Last entry: {new Date(streakData.lastEntryDate).toLocaleDateString()}
          </div>
        )}

        {/* Progress indicators for next badge */}
        {streakData.currentStreak > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Next milestone:</div>
            <div className="flex gap-2 text-xs">
              {streakData.currentStreak < 7 && (
                <Badge variant="outline" className="text-xs">
                  Bronze: {7 - streakData.currentStreak} days to go
                </Badge>
              )}
              {streakData.currentStreak >= 7 && streakData.currentStreak < 14 && (
                <Badge variant="outline" className="text-xs">
                  Silver: {14 - streakData.currentStreak} days to go
                </Badge>
              )}
              {streakData.currentStreak >= 14 && streakData.currentStreak < 30 && (
                <Badge variant="outline" className="text-xs">
                  Gold: {30 - streakData.currentStreak} days to go
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};