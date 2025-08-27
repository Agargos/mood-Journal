import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface JournalEntry {
  id: number;
  user_id: string;
  text: string;
  sentiment: string | null;
  score: number | null;
  created_at: string;
}

export const useJournalEntries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [user]);

  const createEntry = async (text: string) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
      body: {
        text,
        user_id: user.id
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Refresh entries after creating new one
    await fetchEntries();
    return data;
  };

  return {
    entries,
    loading,
    createEntry,
    refetch: fetchEntries
  };
};