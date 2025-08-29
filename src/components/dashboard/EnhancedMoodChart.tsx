import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJournalEntries, JournalEntry } from '@/hooks/useJournalEntries';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';

export const EnhancedMoodChart = () => {
  const { entries, loading, getAllTags } = useJournalEntries();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30days');
  
  const availableTags = getAllTags();

  const filteredEntries = useMemo(() => {
    let filtered = entries;
    
    // Filter by tag
    if (selectedTag !== 'all') {
      filtered = filtered.filter(entry => 
        entry.tags && entry.tags.includes(selectedTag)
      );
    }
    
    // Filter by time range
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return filtered.filter(entry => 
      new Date(entry.created_at) >= cutoffDate
    );
  }, [entries, selectedTag, timeRange]);

  const moodTrendData = useMemo(() => {
    return filteredEntries
      .filter(entry => entry.score !== null)
      .reverse()
      .map((entry: JournalEntry) => ({
        date: new Date(entry.created_at).toLocaleDateString(),
        score: entry.score,
        sentiment: entry.sentiment,
        emotions: entry.emotions || [],
        text: entry.text.substring(0, 50) + '...'
      }));
  }, [filteredEntries]);

  const emotionDistributionData = useMemo(() => {
    const emotionCounts: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      if (entry.emotions) {
        entry.emotions.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      }
    });

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count,
      percentage: Math.round((count / filteredEntries.length) * 100)
    }));
  }, [filteredEntries]);

  const weeklyEmotionData = useMemo(() => {
    const weeks: Record<string, Record<string, number>> = {};
    
    filteredEntries.forEach(entry => {
      const weekStart = new Date(entry.created_at);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toLocaleDateString();
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {};
      }
      
      if (entry.emotions) {
        entry.emotions.forEach(emotion => {
          weeks[weekKey][emotion] = (weeks[weekKey][emotion] || 0) + 1;
        });
      }
    });

    return Object.entries(weeks).map(([week, emotions]) => ({
      week,
      ...emotions
    })).slice(-8); // Last 8 weeks
  }, [filteredEntries]);

  const getEmotionColor = (emotion: string) => {
    const colors = {
      stress: '#f97316',    // orange
      anxiety: '#eab308',   // yellow
      sadness: '#3b82f6',   // blue
      anger: '#ef4444',     // red
      joy: '#22c55e',       // green
      fear: '#8b5cf6',      // purple
      neutral: '#6b7280'    // gray
    };
    return colors[emotion.toLowerCase() as keyof typeof colors] || '#6b7280';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Score: {data.score?.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Sentiment: {data.sentiment}
          </p>
          {data.emotions && data.emotions.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Emotions: {data.emotions.join(', ')}
            </p>
          )}
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
            Mood Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading analytics...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredEntries.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mood Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive mood and emotion tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No data for selected filters</p>
              <p className="text-sm">Try adjusting your filters or add more journal entries!</p>
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
          Mood Analytics
        </CardTitle>
        <CardDescription>
          Advanced sentiment and emotion tracking with {filteredEntries.length} entries
        </CardDescription>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 3 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {availableTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trend" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mood Trend
            </TabsTrigger>
            <TabsTrigger value="emotions" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Emotions
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Weekly View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trend" className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodTrendData}>
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
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ r: 5, strokeWidth: 2 }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="emotions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <h4 className="text-sm font-medium mb-3">Emotion Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ emotion, percentage }) => `${emotion} (${percentage}%)`}
                      labelLine={false}
                    >
                      {emotionDistributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getEmotionColor(entry.emotion)}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} entries`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Emotion Breakdown</h4>
                <div className="space-y-2">
                  {emotionDistributionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getEmotionColor(item.emotion) }}
                        />
                        <span className="text-sm font-medium">{item.emotion}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.count} entries ({item.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-4">
            <div className="h-[350px]">
              <h4 className="text-sm font-medium mb-3">Weekly Emotion Trends</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyEmotionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  {['joy', 'stress', 'anxiety', 'sadness', 'anger', 'fear'].map(emotion => (
                    <Bar 
                      key={emotion}
                      dataKey={emotion} 
                      stackId="emotions"
                      fill={getEmotionColor(emotion)}
                      name={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};