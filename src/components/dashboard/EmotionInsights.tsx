import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { Brain, TrendingUp, Calendar } from 'lucide-react';

export const EmotionInsights = () => {
  const { entries } = useJournalEntries();

  const emotionTrends = useMemo(() => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentEntries = entries.filter(entry => 
      new Date(entry.created_at) >= last7Days && entry.emotions
    );

    const dailyEmotions: Record<string, Record<string, number>> = {};
    
    // Initialize with last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      dailyEmotions[dateKey] = {
        joy: 0, stress: 0, anxiety: 0, sadness: 0, anger: 0, fear: 0, neutral: 0
      };
    }

    recentEntries.forEach(entry => {
      const dayName = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyEmotions[dayName] && entry.emotions) {
        entry.emotions.forEach(emotion => {
          if (dailyEmotions[dayName][emotion] !== undefined) {
            dailyEmotions[dayName][emotion]++;
          }
        });
      }
    });

    return Object.entries(dailyEmotions).map(([day, emotions]) => ({
      day,
      ...emotions
    }));
  }, [entries]);

  const emotionInsights = useMemo(() => {
    const allEmotions = entries.flatMap(entry => entry.emotions || []);
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalEntries = entries.length;
    const mostCommon = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const recentEntries = entries.slice(0, 10);
    const recentEmotions = recentEntries.flatMap(entry => entry.emotions || []);
    const recentTrend = recentEmotions.length > 0 
      ? recentEmotions.reduce((acc, emotion) => {
          acc[emotion] = (acc[emotion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {};

    return {
      mostCommon,
      totalEntries,
      recentTrend: Object.entries(recentTrend)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
    };
  }, [entries]);

  const getEmotionColor = (emotion: string) => {
    const colors = {
      stress: '#f97316',
      anxiety: '#eab308',
      sadness: '#3b82f6',
      anger: '#ef4444',
      joy: '#22c55e',
      fear: '#8b5cf6',
      neutral: '#6b7280'
    };
    return colors[emotion as keyof typeof colors] || '#6b7280';
  };

  if (!entries.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Emotion Insights
          </CardTitle>
          <CardDescription>Weekly emotion patterns and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No emotion data yet</p>
              <p className="text-sm">Start journaling to see insights!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Most Common Emotion</CardTitle>
          </CardHeader>
          <CardContent>
            {emotionInsights.mostCommon[0] ? (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getEmotionColor(emotionInsights.mostCommon[0][0]) }}
                />
                <span className="font-medium capitalize">{emotionInsights.mostCommon[0][0]}</span>
                <span className="text-sm text-muted-foreground">
                  ({Math.round((emotionInsights.mostCommon[0][1] / emotionInsights.totalEntries) * 100)}%)
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">No data</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {emotionInsights.recentTrend[0] ? (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium capitalize">{emotionInsights.recentTrend[0][0]}</span>
                <span className="text-sm text-muted-foreground">
                  in last 10 entries
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">No recent data</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">{emotionInsights.totalEntries}</span>
              <span className="text-sm text-muted-foreground">journal entries</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Emotion Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            7-Day Emotion Tracking
          </CardTitle>
          <CardDescription>
            Daily emotion patterns over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelFormatter={(label) => `${label}`}
                  formatter={(value, name) => [value, name?.toString().charAt(0).toUpperCase() + name?.toString().slice(1)]}
                />
                <Bar dataKey="joy" fill="#22c55e" name="Joy" />
                <Bar dataKey="stress" fill="#f97316" name="Stress" />
                <Bar dataKey="anxiety" fill="#eab308" name="Anxiety" />
                <Bar dataKey="sadness" fill="#3b82f6" name="Sadness" />
                <Bar dataKey="anger" fill="#ef4444" name="Anger" />
                <Bar dataKey="fear" fill="#8b5cf6" name="Fear" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};