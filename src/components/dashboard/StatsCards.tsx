import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { Calendar, TrendingUp, BarChart3, Heart } from 'lucide-react';

export const StatsCards = () => {
  const { entries } = useJournalEntries();

  const stats = {
    totalEntries: entries.length,
    thisWeek: entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate > weekAgo;
    }).length,
    avgSentiment: entries.length > 0 
      ? entries.reduce((sum, entry) => sum + (entry.score || 0), 0) / entries.length
      : 0,
    positiveEntries: entries.filter(entry => entry.sentiment === 'POSITIVE').length
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.6) return 'Positive';
    if (score < 0.4) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="min-w-[140px] sm:min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Entries</CardTitle>
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{stats.totalEntries}</div>
          <p className="text-xs text-muted-foreground">
            Journal entries
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-[140px] sm:min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">This Week</CardTitle>
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{stats.thisWeek}</div>
          <p className="text-xs text-muted-foreground">
            Last 7 days
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-[140px] sm:min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Avg Mood</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">
            {getSentimentLabel(stats.avgSentiment)}
          </div>
          <p className="text-xs text-muted-foreground">
            {(stats.avgSentiment * 100).toFixed(0)}%
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-[140px] sm:min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Positive Days</CardTitle>
          <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{stats.positiveEntries}</div>
          <p className="text-xs text-muted-foreground">
            Positive entries
          </p>
        </CardContent>
      </Card>
    </div>
  );
};