import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2 } from 'lucide-react';

export const EntryForm = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { createEntry } = useJournalEntries();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await createEntry(text);
      setText('');
      toast({
        title: 'Entry Saved!',
        description: 'Your journal entry has been analyzed and saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save entry. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          New Journal Entry
        </CardTitle>
        <CardDescription>
          Write about your day, thoughts, or feelings. Our AI will analyze the sentiment of your entry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling today? What's on your mind?"
            className="min-h-[120px]"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading || !text.trim()}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Analyzing & Saving...' : 'Analyze & Save Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};