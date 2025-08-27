import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJournalEntries, JournalEntry } from '@/hooks/useJournalEntries';
import { TrendingUp } from 'lucide-react';

export const MoodChart = () => {
  const { entries, loading } = useJournalEntries();

  const chartData = useMemo(() => {
    if (!entries.length) return [];

    return entries
      .filter(entry => entry.score !== null)
      .slice(-30) // Last 30 entries
      .reverse() // Show chronologically
      .map((entry: JournalEntry) => ({
        date: new Date(entry.created_at).toLocaleDateString(),
        score: entry.score,
        sentiment: entry.sentiment,
        text: entry.text.substring(0, 50) + '...'
      }));
  }, [entries]);

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'POSITIVE': return '#22c55e';
      case 'NEGATIVE': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Score: {data.score?.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Sentiment: {data.sentiment}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            "{data.text}"
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mood Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mood Trends
          </CardTitle>
          <CardDescription>
            Track your emotional journey over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No mood data yet</p>
              <p className="text-sm">Start journaling to see your mood trends!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Mood Trends
        </CardTitle>
        <CardDescription>
          Your emotional journey over the last {chartData.length} entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 1]}
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Negative</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};