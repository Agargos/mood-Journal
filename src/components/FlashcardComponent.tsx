import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/data/flashcards';
import { RotateCcw } from 'lucide-react';

interface FlashcardComponentProps {
  card: Flashcard;
}

export const FlashcardComponent = ({ card }: FlashcardComponentProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Card 
        className="h-80 cursor-pointer transition-all duration-300 bg-gradient-to-br from-card to-medical-light border-0 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] overflow-hidden"
        onClick={handleFlip}
      >
        <div className="relative h-full p-8 flex flex-col">
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              card.category === 'obstetrics' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-accent text-accent-foreground'
            }`}>
              {card.category === 'obstetrics' ? 'Obstetrics' : 'Gynecology'}
            </span>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              {!isFlipped ? (
                <>
                  <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-wide">
                    Question
                  </h3>
                  <p className="text-xl font-semibold text-foreground leading-relaxed">
                    {card.question}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-wide">
                    Answer
                  </h3>
                  <div className="text-lg text-foreground leading-relaxed whitespace-pre-line">
                    {card.answer}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Flip Indicator */}
          <div className="flex justify-center items-center gap-2 text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
            <span className="text-sm">
              Click to {isFlipped ? 'see question' : 'reveal answer'}
            </span>
          </div>
        </div>
      </Card>

      {/* Reset Button */}
      {isFlipped && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
            className="transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Card
          </Button>
        </div>
      )}
    </div>
  );
};