import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useChallenges } from '@/hooks/useChallenges';
import { Trophy, Target, Zap, FileText } from 'lucide-react';

export const ActiveChallenges = () => {
  const { getActiveChallenges, updateChallengeNotes, loading } = useChallenges();
  const activeChallenges = getActiveChallenges();
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleOpenNotes = (challengeId: string, existingNotes: string | null) => {
    setSelectedChallenge(challengeId);
    setNoteText(existingNotes || '');
  };

  const handleSaveNotes = async () => {
    if (selectedChallenge) {
      await updateChallengeNotes(selectedChallenge, noteText);
      setSelectedChallenge(null);
      setNoteText('');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[120px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeChallenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active challenges</p>
            <p className="text-xs">Join a challenge to start your journey!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Active Challenges ({activeChallenges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeChallenges.slice(0, 3).map((userChallenge) => {
          const challenge = userChallenge.challenge;
          const progressPercentage = Math.min(
            (userChallenge.progress / challenge.target_value) * 100,
            100
          );

          return (
            <div key={userChallenge.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{challenge.badge_icon}</span>
                  <div>
                    <p className="font-medium text-sm">{challenge.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {userChallenge.progress} / {challenge.target_value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={selectedChallenge === userChallenge.challenge_id} onOpenChange={(open) => !open && setSelectedChallenge(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenNotes(userChallenge.challenge_id, userChallenge.notes)}
                        className="h-6 px-2"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span>{challenge.badge_icon}</span>
                          {challenge.title} - My Notes
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Challenge Description:</p>
                          <p className="text-sm bg-muted p-3 rounded">{challenge.description}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">What does this challenge ask you to do?</p>
                          <Textarea
                            placeholder="Write down what this challenge requires you to do, your goals, or any notes to help you succeed..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setSelectedChallenge(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveNotes}>
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: challenge.badge_color, color: challenge.badge_color }}
                  >
                    {Math.round(progressPercentage)}%
                  </Badge>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              {userChallenge.notes && (
                <div className="mt-2 p-2 bg-muted rounded text-xs">
                  <p className="font-medium text-muted-foreground mb-1">My Notes:</p>
                  <p>{userChallenge.notes}</p>
                </div>
              )}
            </div>
          );
        })}
        
        {activeChallenges.length > 3 && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              +{activeChallenges.length - 3} more challenges
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};