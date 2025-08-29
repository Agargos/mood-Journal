import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'count' | 'daily' | 'weekly';
  target_value: number;
  duration_days: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  badge_icon: string;
  badge_color: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  progress: number;
  started_at: string;
  completed_at: string | null;
  streak_count: number;
  last_activity_date: string | null;
  challenge: Challenge;
}

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      setChallenges((data || []) as Challenge[]);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchUserChallenges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserChallenges((data || []) as UserChallenge[]);
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchChallenges(), fetchUserChallenges()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          status: 'active',
          progress: 0,
          streak_count: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      await fetchUserChallenges();
      toast({
        title: "Challenge Joined!",
        description: "You've successfully joined the challenge. Good luck!",
      });
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      if (error.code === '23505') {
        toast({
          title: "Already Joined",
          description: "You're already participating in this challenge.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to join challenge. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const updateChallengeProgress = async (challengeId: string) => {
    if (!user) return;

    try {
      const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId && uc.status === 'active');
      if (!userChallenge) return;

      const challenge = userChallenge.challenge;
      const today = new Date().toISOString().split('T')[0];
      let newProgress = userChallenge.progress;
      let newStreakCount = userChallenge.streak_count;
      let newStatus = userChallenge.status;

      // Update progress based on challenge type
      switch (challenge.type) {
        case 'streak':
          if (userChallenge.last_activity_date !== today) {
            newStreakCount += 1;
            newProgress = newStreakCount;
          }
          break;
        case 'count':
          newProgress += 1;
          break;
        case 'daily':
          // For daily challenges, we increment progress each day
          if (userChallenge.last_activity_date !== today) {
            newProgress += 1;
          }
          break;
      }

      // Check if challenge is completed
      if (newProgress >= challenge.target_value) {
        newStatus = 'completed';
      }

      const { error } = await supabase
        .from('user_challenges')
        .update({
          progress: newProgress,
          streak_count: newStreakCount,
          status: newStatus,
          last_activity_date: today,
          ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
        })
        .eq('id', userChallenge.id);

      if (error) throw error;

      await fetchUserChallenges();

      if (newStatus === 'completed') {
        toast({
          title: "🎉 Challenge Completed!",
          description: `Congratulations! You've completed the "${challenge.title}" challenge!`,
        });
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  const pauseChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({ status: 'paused' })
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId);

      if (error) throw error;

      await fetchUserChallenges();
      toast({
        title: "Challenge Paused",
        description: "You can resume this challenge anytime.",
      });
    } catch (error) {
      console.error('Error pausing challenge:', error);
    }
  };

  const resumeChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({ status: 'active' })
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId);

      if (error) throw error;

      await fetchUserChallenges();
      toast({
        title: "Challenge Resumed",
        description: "Welcome back! Keep up the great work.",
      });
    } catch (error) {
      console.error('Error resuming challenge:', error);
    }
  };

  const getAvailableChallenges = () => {
    const joinedChallengeIds = userChallenges.map(uc => uc.challenge_id);
    return challenges.filter(challenge => !joinedChallengeIds.includes(challenge.id));
  };

  const getActiveChallenges = () => {
    return userChallenges.filter(uc => uc.status === 'active');
  };

  const getCompletedChallenges = () => {
    return userChallenges.filter(uc => uc.status === 'completed');
  };

  return {
    challenges,
    userChallenges,
    loading,
    joinChallenge,
    updateChallengeProgress,
    pauseChallenge,
    resumeChallenge,
    getAvailableChallenges,
    getActiveChallenges,
    getCompletedChallenges,
    refetch: () => Promise.all([fetchChallenges(), fetchUserChallenges()])
  };
};