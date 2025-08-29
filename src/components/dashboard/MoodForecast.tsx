import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMoodForecast } from '@/hooks/useMoodForecast';
import { TrendingUp, TrendingDown, Minus, Brain, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';

export const MoodForecast = () => {
  const { forecastData, loading, hasEnoughData } = useMoodForecast();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Mood Forecast
          </CardTitle>
          <CardDescription>AI-powered mood predictions for the next 5 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Analyzing your mood patterns...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasEnoughData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Mood Forecast
          </CardTitle>
          <CardDescription>AI-powered mood predictions for the next 5 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Create at least 3 journal entries with sentiment analysis to see your mood forecast.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!forecastData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Mood Forecast
          </CardTitle>
          <CardDescription>AI-powered mood predictions for the next 5 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Unable to generate forecast. Please add more journal entries.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine historical and forecast data for the chart
  const chartData = [
    ...forecastData.historical.slice(-10), // Last 10 days of historical data
    ...forecastData.forecast
  ].map(point => ({
    ...point,
    displayDate: format(parseISO(point.date), 'MMM dd'),
    scorePercentage: (point.score + 1) * 50 // Convert -1 to 1 range to 0-100 for better visualization
  }));

  const getTrendIcon = () => {
    switch (forecastData.trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (forecastData.trend) {
      case 'improving':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declining':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTooltipValue = (value: number) => {
    const actualScore = (value / 50) - 1;
    if (actualScore > 0.3) return 'Very Positive';
    if (actualScore > 0.1) return 'Positive';
    if (actualScore > -0.1) return 'Neutral';
    if (actualScore > -0.3) return 'Negative';
    return 'Very Negative';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Mood Forecast
        </CardTitle>
        <CardDescription>
          AI-powered predictions based on your journaling patterns
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Trend and Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getTrendColor()}>
              {getTrendIcon()}
              {forecastData.trend} trend
            </Badge>
            <Badge variant="outline">
              {Math.round(forecastData.confidence * 100)}% confidence
            </Badge>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const score = (value / 50) - 1;
                  return score > 0 ? '+' : score < 0 ? '-' : '0';
                }}
              />
              <Tooltip 
                formatter={(value: number, name, props) => [
                  formatTooltipValue(value),
                  props.payload.isActual ? 'Historical' : 'Predicted'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <ReferenceLine y={50} stroke="#666" strokeDasharray="2 2" />
              
              {/* Historical data line */}
              <Line
                type="monotone"
                dataKey="scorePercentage"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              
              {/* Forecast data line */}
              <Line
                type="monotone"
                dataKey="scorePercentage"
                stroke="#ff7300"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#8884d8]"></div>
            Historical Data
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#ff7300] border-dashed border-t-2"></div>
            Forecast
          </div>
        </div>

        {/* Recommendation */}
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <strong>AI Insight:</strong> {forecastData.recommendation}
          </AlertDescription>
        </Alert>

        {/* Forecast breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {forecastData.forecast.map((day, index) => (
            <div key={day.date} className="text-center p-2 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground">
                {format(parseISO(day.date), 'EEE')}
              </div>
              <div className="text-sm font-medium">
                {format(parseISO(day.date), 'MM/dd')}
              </div>
              <div className={`text-xs mt-1 ${
                day.sentiment === 'positive' ? 'text-green-600' :
                day.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {day.sentiment}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};