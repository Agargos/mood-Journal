import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MotivationalQuote {
  text: string;
  category: 'positive' | 'encouraging' | 'neutral';
}

export const useMotivationalQuotes = () => {
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const staticQuotes = {
    positive: [
      "Keep shining! Your positive energy is inspiring! ✨",
      "You're doing amazing! Keep up the great work! 🌟",
      "Your positivity is contagious! Spread those good vibes! 😊",
      "What a wonderful day it sounds like! Keep celebrating life! 🎉"
    ],
    encouraging: [
      "Tomorrow is a new day with new possibilities. 🌅",
      "Every challenge you face makes you stronger. 💪",
      "It's okay to have tough days. You're resilient and brave. 🦋",
      "This feeling is temporary. You've overcome difficulties before. 🌈",
      "Be gentle with yourself. Growth takes time. 🌱"
    ],
    neutral: [
      "Consistency in journaling shows great self-awareness. 📝",
      "Reflection is the first step to understanding yourself better. 🤔",
      "Every entry is a step on your journey of self-discovery. 🚶‍♀️",
      "Your thoughts and feelings matter. Keep documenting them. 💭"
    ]
  };

  const getQuoteCategory = (avgSentiment: number): 'positive' | 'encouraging' | 'neutral' => {
    if (avgSentiment > 0.6) return 'positive';
    if (avgSentiment < 0.4) return 'encouraging';
    return 'neutral';
  };

  const generateQuote = async () => {
    if (!user) return null;

    setLoading(true);
    try {
      // Get user's recent sentiment trend (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentEntries } = await supabase
        .from('journal_entries')
        .select('sentiment, score')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .not('score', 'is', null);

      let category: 'positive' | 'encouraging' | 'neutral' = 'neutral';

      if (recentEntries && recentEntries.length > 0) {
        const avgScore = recentEntries.reduce((sum, entry) => sum + (entry.score || 0), 0) / recentEntries.length;
        category = getQuoteCategory(avgScore);
      }

      // Try to generate AI quote first, fallback to static quotes
      try {
        const { data: aiQuote, error } = await supabase.functions.invoke('generate-quote', {
          body: { 
            category,
            recentSentiment: recentEntries?.map(e => ({ sentiment: e.sentiment, score: e.score })) || []
          }
        });

        if (!error && aiQuote?.quote) {
          const generatedQuote: MotivationalQuote = {
            text: aiQuote.quote,
            category
          };
          setQuote(generatedQuote);
          return generatedQuote;
        }
      } catch (error) {
        console.log('AI quote generation failed, using static quotes');
      }

      // Fallback to static quotes
      const quotes = staticQuotes[category];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      
      const staticQuote: MotivationalQuote = {
        text: randomQuote,
        category
      };
      
      setQuote(staticQuote);
      return staticQuote;

    } catch (error) {
      console.error('Error generating quote:', error);
      // Final fallback
      const fallbackQuote: MotivationalQuote = {
        text: "Keep writing, keep growing! 🌱",
        category: 'neutral'
      };
      setQuote(fallbackQuote);
      return fallbackQuote;
    } finally {
      setLoading(false);
    }
  };

  return {
    quote,
    loading,
    generateQuote
  };
};