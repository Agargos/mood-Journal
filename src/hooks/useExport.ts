import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { JournalEntry } from './useJournalEntries';

export const useExport = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const exportToCSV = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!entries || entries.length === 0) {
        throw new Error('No entries to export');
      }

      // Create CSV content
      const headers = ['Date', 'Text', 'Sentiment', 'Score', 'Tags'];
      const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
          new Date(entry.created_at).toLocaleDateString(),
          `"${entry.text.replace(/"/g, '""')}"`, // Escape quotes
          entry.sentiment || '',
          entry.score || '',
          entry.tags ? `"${entry.tags.join(', ')}"` : ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `mood-journal-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!entries || entries.length === 0) {
        throw new Error('No entries to export');
      }

      // Call edge function to generate PDF
      const { data: pdfData, error } = await supabase.functions.invoke('generate-pdf', {
        body: { entries }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Download PDF
      const blob = new Blob([new Uint8Array(pdfData.pdf)], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `mood-journal-${new Date().toISOString().split('T')[0]}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    exportToCSV,
    exportToPDF
  };
};