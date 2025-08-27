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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEntries}</div>
          <p className="text-xs text-muted-foreground">
            Journal entries created
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisWeek}</div>
          <p className="text-xs text-muted-foreground">
            Entries in the last 7 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Mood</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getSentimentLabel(stats.avgSentiment)}
          </div>
          <p className="text-xs text-muted-foreground">
            Score: {(stats.avgSentiment * 100).toFixed(0)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Positive Days</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.positiveEntries}</div>
          <p className="text-xs text-muted-foreground">
            Positive sentiment entries
          </p>
        </CardContent>
      </Card>
    </div>
  );
};