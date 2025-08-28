import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePremium = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('premium')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching premium status:', error);
          setIsPremium(false);
        } else {
          setIsPremium(data?.premium || false);
        }
      } catch (error) {
        console.error('Error fetching premium status:', error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumStatus();
  }, [user]);

  const refreshPremiumStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('premium')
        .eq('user_id', user.id)
        .single();

      if (!error) {
        setIsPremium(data?.premium || false);
      }
    } catch (error) {
      console.error('Error refreshing premium status:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isPremium,
    loading,
    refreshPremiumStatus
  };
};