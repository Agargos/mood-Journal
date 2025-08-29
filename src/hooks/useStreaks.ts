import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StreakData {
  currentStreak: number;
  lastEntryDate: string | null;
  badgeLevel: 'bronze' | 'silver' | 'gold' | null;
}

export const useStreaks = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastEntryDate: null,
    badgeLevel: null
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getBadgeLevel = (streak: number): 'bronze' | 'silver' | 'gold' | null => {
    if (streak >= 30) return 'gold';
    if (streak >= 14) return 'silver';
    if (streak >= 7) return 'bronze';
    return null;
  };

  const calculateStreak = async () => {
    if (!user) return;

    try {
      // Get user's profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, last_entry_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        const today = new Date().toISOString().split('T')[0];
        const lastEntry = profile.last_entry_date;
        let currentStreak = profile.current_streak || 0;

        if (lastEntry) {
          const lastEntryDate = new Date(lastEntry);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastEntryDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // If more than 1 day has passed, reset streak
          if (diffDays > 1) {
            currentStreak = 0;
            await supabase
              .from('profiles')
              .update({ current_streak: 0 })
              .eq('user_id', user.id);
          }
        }

        console.log('Current streak data:', { currentStreak, lastEntry });
        setStreakData({
          currentStreak,
          lastEntryDate: lastEntry,
          badgeLevel: getBadgeLevel(currentStreak)
        });
      } else {
        // Create profile if it doesn't exist
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            current_streak: 0,
            last_entry_date: null
          });
        
        if (!error) {
          setStreakData({
            currentStreak: 0,
            lastEntryDate: null,
            badgeLevel: null
          });
        }
      }
    } catch (error) {
      console.error('Error calculating streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, last_entry_date')
        .eq('user_id', user.id)
        .single();

      // Skip if we already updated today
      if (profile?.last_entry_date === today) {
        return;
      }

      let newStreak = 1;
      if (profile?.last_entry_date) {
        const lastEntryDate = new Date(profile.last_entry_date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastEntryString = lastEntryDate.toISOString().split('T')[0];
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        // If last entry was yesterday, increment streak
        if (lastEntryString === yesterdayString) {
          newStreak = (profile.current_streak || 0) + 1;
        }
      }

      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          last_entry_date: today
        })
        .eq('user_id', user.id);

      setStreakData({
        currentStreak: newStreak,
        lastEntryDate: today,
        badgeLevel: getBadgeLevel(newStreak)
      });
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  useEffect(() => {
    if (user) {
      calculateStreak();
    }
  }, [user]);

  return {
    streakData,
    loading,
    updateStreak,
    refetch: calculateStreak
  };
};