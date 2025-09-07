import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useStreaks } from '@/hooks/useStreaks';
import { useMotivationalQuotes } from '@/hooks/useMotivationalQuotes';
import { useToast } from '@/hooks/use-toast';
import { TagInput } from '@/components/ui/tag-input';
import { MotivationalQuote } from '@/components/quotes/MotivationalQuote';
import { CopingStrategy } from '@/components/coping/CopingStrategy';
import { useChallenges } from '@/hooks/useChallenges';
import { useSecureInput } from '@/hooks/useSecurity';
import { Brain, Loader2 } from 'lucide-react';

export const EntryForm = () => {
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastEntryResult, setLastEntryResult] = useState<any>(null);
  const { createEntry } = useJournalEntries();
  const { updateStreak } = useStreaks();
  const { generateQuote, quote } = useMotivationalQuotes();
  const { toast } = useToast();
  const { updateChallengeProgress, getActiveChallenges } = useChallenges();
  const { sanitizeText, checkRateLimit } = useSecureInput();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Security: Check rate limiting for journal entries
    const canProceed = await checkRateLimit('create_journal_entry', 20); // Max 20 entries per hour
    if (!canProceed) {
      toast({
        title: "Rate limit exceeded",
        description: "Please wait before creating another journal entry.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Security: Sanitize input before processing
      const sanitizedText = sanitizeText(text);
      const sanitizedTags = tags.map(tag => sanitizeText(tag)).filter(tag => tag.length > 0);
      
      if (!sanitizedText.trim()) {
        toast({
          title: "Invalid input",
          description: "Please enter valid journal content.",
          variant: "destructive",
        });
        return;
      }
      const result = await createEntry(sanitizedText, sanitizedTags);
      setLastEntryResult(result);
      
      // Update challenge progress for all active challenges
      const activeChallenges = getActiveChallenges();
      for (const userChallenge of activeChallenges) {
        await updateChallengeProgress(userChallenge.challenge_id);
      }
      
      await updateStreak();
      await generateQuote();
      
      setText('');
      setTags([]);
      
      toast({
        title: 'Entry Saved!',
        description: result.message || 'Your journal entry has been analyzed and saved.',
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
    <div className="space-y-4">
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
              className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
              disabled={loading}
            />
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (optional)</label>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags like 'work', 'family', 'health'..."
              />
            </div>
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
      
      {quote && <MotivationalQuote quote={quote} />}
      
      {lastEntryResult?.copingStrategy && lastEntryResult?.emotions && (
        <CopingStrategy 
          strategy={lastEntryResult.copingStrategy}
          emotions={lastEntryResult.emotions}
          onMarkCompleted={() => {
            toast({
              title: "Well done!",
              description: "You're taking great care of your mental health.",
            });
          }}
        />
      )}
    </div>
  );
};