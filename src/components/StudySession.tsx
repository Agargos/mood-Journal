import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FlashcardComponent } from './FlashcardComponent';
import { Flashcard } from '@/data/flashcards';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle } from 'lucide-react';

interface StudySessionProps {
  cards: Flashcard[];
  onBack: () => void;
  categoryTitle: string;
}

export const StudySession = ({ cards, onBack, categoryTitle }: StudySessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const completedCount = completedCards.size;

  const goToNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const markAsCompleted = () => {
    setCompletedCards(prev => new Set([...prev, currentIndex]));
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setCompletedCards(new Set());
  };

  const isCurrentCompleted = completedCards.has(currentIndex);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">{categoryTitle}</h2>
          <p className="text-muted-foreground">
            Card {currentIndex + 1} of {cards.length}
          </p>
        </div>
        <Button variant="outline" onClick={resetSession}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{completedCount} completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <FlashcardComponent card={currentCard} />

      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={goToPrevious} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-3">
          <Button 
            variant={isCurrentCompleted ? "outline" : "default"}
            onClick={markAsCompleted}
            disabled={isCurrentCompleted}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isCurrentCompleted ? 'Completed' : 'Mark Complete'}
          </Button>
        </div>

        <Button 
          variant="outline" 
          onClick={goToNext} 
          disabled={currentIndex === cards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Completion Status */}
      {completedCount === cards.length && (
        <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            🎉 Congratulations!
          </h3>
          <p className="text-muted-foreground">
            You've completed all {cards.length} cards in this category!
          </p>
        </div>
      )}
    </div>
  );
};