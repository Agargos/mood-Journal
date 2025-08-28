import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface JournalEntry {
  id: number;
  user_id: string;
  text: string;
  sentiment: string | null;
  score: number | null;
  tags: string[] | null;
  emotions?: string[];
  coping_strategy?: string;
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

  const createEntry = async (text: string, tags: string[] = []) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('analyze-sentiment-enhanced', {
      body: {
        text,
        tags,
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

  const getFilteredEntries = (tagFilter?: string) => {
    if (!tagFilter) return entries;
    return entries.filter(entry => 
      entry.tags && entry.tags.includes(tagFilter)
    );
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  return {
    entries,
    loading,
    createEntry,
    getFilteredEntries,
    getAllTags,
    refetch: fetchEntries
  };
};