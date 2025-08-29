import { useState, useEffect, useMemo } from 'react';
import { useJournalEntries } from './useJournalEntries';
import { format, subDays, addDays, parseISO, startOfDay, differenceInDays } from 'date-fns';

export interface MoodDataPoint {
  date: string;
  score: number;
  sentiment: string;
  isActual: boolean;
}

export interface ForecastResult {
  historical: MoodDataPoint[];
  forecast: MoodDataPoint[];
  confidence: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
}

export const useMoodForecast = () => {
  const { entries, loading } = useJournalEntries();
  const [forecastData, setForecastData] = useState<ForecastResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Simple moving average function
  const calculateMovingAverage = (data: number[], window: number): number[] => {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const average = subset.reduce((sum, val) => sum + val, 0) / subset.length;
      result.push(average);
    }
    return result;
  };

  // Linear regression for trend analysis
  const calculateLinearRegression = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // Process historical data and generate forecast
  const processData = useMemo(() => {
    if (loading || entries.length < 3) return null;

    setIsCalculating(true);

    try {
      // Get the last 30 days of entries with sentiment scores
      const thirtyDaysAgo = subDays(new Date(), 30);
      const validEntries = entries.filter(entry => 
        entry.score !== null && 
        parseISO(entry.created_at) >= thirtyDaysAgo
      );

      if (validEntries.length < 3) return null;

      // Group entries by date and calculate daily average
      const dailyScores = new Map<string, number[]>();
      validEntries.forEach(entry => {
        const date = format(parseISO(entry.created_at), 'yyyy-MM-dd');
        if (!dailyScores.has(date)) {
          dailyScores.set(date, []);
        }
        dailyScores.get(date)!.push(entry.score!);
      });

      // Calculate daily averages
      const historical: MoodDataPoint[] = [];
      for (const [date, scores] of dailyScores.entries()) {
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const sentiment = averageScore > 0.1 ? 'positive' : averageScore < -0.1 ? 'negative' : 'neutral';
        historical.push({
          date,
          score: averageScore,
          sentiment,
          isActual: true
        });
      }

      // Sort by date
      historical.sort((a, b) => a.date.localeCompare(b.date));

      if (historical.length < 3) return null;

      // Prepare data for forecasting
      const scores = historical.map(h => h.score);
      const days = historical.map((_, index) => index);

      // Apply moving average smoothing
      const smoothedScores = calculateMovingAverage(scores, Math.min(3, scores.length));
      
      // Calculate linear regression for trend
      const { slope, intercept } = calculateLinearRegression(days, smoothedScores);

      // Generate 5-day forecast
      const forecast: MoodDataPoint[] = [];
      const lastDate = parseISO(historical[historical.length - 1].date);
      
      for (let i = 1; i <= 5; i++) {
        const forecastDate = addDays(lastDate, i);
        const dayIndex = historical.length + i - 1;
        
        // Combine moving average and linear regression
        const trendScore = slope * dayIndex + intercept;
        const lastMA = smoothedScores[smoothedScores.length - 1];
        
        // Weight: 70% trend, 30% last moving average
        let predictedScore = 0.7 * trendScore + 0.3 * lastMA;
        
        // Add some seasonal/weekly patterns (simple weekend effect)
        const dayOfWeek = forecastDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
          predictedScore += 0.05; // Slight mood boost for weekends
        }

        // Bound the prediction within reasonable limits
        predictedScore = Math.max(-1, Math.min(1, predictedScore));
        
        const sentiment = predictedScore > 0.1 ? 'positive' : predictedScore < -0.1 ? 'negative' : 'neutral';
        
        forecast.push({
          date: format(forecastDate, 'yyyy-MM-dd'),
          score: predictedScore,
          sentiment,
          isActual: false
        });
      }

      // Calculate confidence based on data consistency
      const scoreVariance = scores.reduce((sum, score) => {
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        return sum + Math.pow(score - mean, 2);
      }, 0) / scores.length;
      
      const confidence = Math.max(0.3, Math.min(0.9, 1 - scoreVariance));

      // Determine trend
      const recentTrend = slope > 0.02 ? 'improving' : slope < -0.02 ? 'declining' : 'stable';
      
      // Generate recommendation
      let recommendation = '';
      const avgForecastScore = forecast.reduce((sum, f) => sum + f.score, 0) / forecast.length;
      
      if (recentTrend === 'declining' || avgForecastScore < -0.2) {
        recommendation = "Your mood may dip in the coming days. Consider scheduling uplifting activities, connecting with friends, or practicing self-care.";
      } else if (recentTrend === 'improving' || avgForecastScore > 0.2) {
        recommendation = "You're trending toward better moods! Keep up your positive habits and consider planning enjoyable activities.";
      } else {
        recommendation = "Your mood appears stable. This is a good time to maintain your current routines and perhaps try something new.";
      }

      return {
        historical,
        forecast,
        confidence,
        trend: recentTrend as 'improving' | 'declining' | 'stable',
        recommendation
      };
    } catch (error) {
      console.error('Error processing mood forecast:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [entries, loading]);

  useEffect(() => {
    setForecastData(processData);
  }, [processData]);

  return {
    forecastData,
    loading: loading || isCalculating,
    hasEnoughData: entries.filter(e => e.score !== null).length >= 3
  };
};