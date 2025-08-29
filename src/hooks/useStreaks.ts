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
      console.log('Calculating streak for user:', user.id);
      
      // Get user's profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('current_streak, last_entry_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile data:', profile);

      if (profile) {
        const today = new Date().toISOString().split('T')[0];
        const lastEntry = profile.last_entry_date;
        let currentStreak = profile.current_streak || 0;

        console.log('Today:', today, 'Last entry:', lastEntry, 'Current streak:', currentStreak);

        if (lastEntry) {
          const lastEntryDate = new Date(lastEntry);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastEntryDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          console.log('Days difference:', diffDays);

          // If more than 1 day has passed, reset streak
          if (diffDays > 1) {
            currentStreak = 0;
            await supabase
              .from('profiles')
              .update({ current_streak: 0 })
              .eq('user_id', user.id);
            console.log('Streak reset due to gap');
          }
        }

        const streakData = {
          currentStreak,
          lastEntryDate: lastEntry,
          badgeLevel: getBadgeLevel(currentStreak)
        };

        console.log('Setting streak data:', streakData);
        setStreakData(streakData);
      } else {
        console.log('No profile found, creating one');
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
      
      console.log('Updating streak for today:', today);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('current_streak, last_entry_date')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile for streak update:', error);
        return;
      }

      console.log('Current profile before update:', profile);

      // Skip if we already updated today
      if (profile?.last_entry_date === today) {
        console.log('Streak already updated today');
        return;
      }

      let newStreak = 1;
      if (profile?.last_entry_date) {
        const lastEntryDate = new Date(profile.last_entry_date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastEntryString = lastEntryDate.toISOString().split('T')[0];
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        console.log('Last entry was:', lastEntryString, 'Yesterday was:', yesterdayString);
        
        // If last entry was yesterday, increment streak
        if (lastEntryString === yesterdayString) {
          newStreak = (profile.current_streak || 0) + 1;
          console.log('Incrementing streak to:', newStreak);
        } else {
          console.log('Starting new streak');
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          last_entry_date: today
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating streak:', updateError);
        return;
      }

      console.log('Streak updated successfully to:', newStreak);

      const newStreakData = {
        currentStreak: newStreak,
        lastEntryDate: today,
        badgeLevel: getBadgeLevel(newStreak)
      };

      setStreakData(newStreakData);
      console.log('Streak data updated in state:', newStreakData);
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