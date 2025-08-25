import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Category } from '@/data/flashcards';
import { Baby, Heart, BookOpen } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  obstetricCount: number;
  gynecologyCount: number;
  totalCount: number;
}

export const CategorySelector = ({ 
  selectedCategory, 
  onCategoryChange, 
  obstetricCount, 
  gynecologyCount, 
  totalCount 
}: CategorySelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card 
        className={`p-6 cursor-pointer transition-all duration-300 border-2 hover:shadow-[var(--shadow-card-hover)] ${
          selectedCategory === 'all' 
            ? 'border-primary bg-primary/5 shadow-[var(--shadow-card)]' 
            : 'border-border hover:border-primary/50'
        }`}
        onClick={() => onCategoryChange('all')}
      >
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg">All Topics</h3>
          <p className="text-muted-foreground">
            {totalCount} cards
          </p>
          <Button 
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onCategoryChange('all');
            }}
          >
            Study All
          </Button>
        </div>
      </Card>

      <Card 
        className={`p-6 cursor-pointer transition-all duration-300 border-2 hover:shadow-[var(--shadow-card-hover)] ${
          selectedCategory === 'obstetrics' 
            ? 'border-primary bg-primary/5 shadow-[var(--shadow-card)]' 
            : 'border-border hover:border-primary/50'
        }`}
        onClick={() => onCategoryChange('obstetrics')}
      >
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Baby className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Obstetrics</h3>
          <p className="text-muted-foreground">
            {obstetricCount} cards
          </p>
          <Button 
            variant={selectedCategory === 'obstetrics' ? 'default' : 'outline'}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onCategoryChange('obstetrics');
            }}
          >
            Study Obstetrics
          </Button>
        </div>
      </Card>

      <Card 
        className={`p-6 cursor-pointer transition-all duration-300 border-2 hover:shadow-[var(--shadow-card-hover)] ${
          selectedCategory === 'gynecology' 
            ? 'border-accent bg-accent/5 shadow-[var(--shadow-card)]' 
            : 'border-border hover:border-accent/50'
        }`}
        onClick={() => onCategoryChange('gynecology')}
      >
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <Heart className="h-6 w-6 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Gynecology</h3>
          <p className="text-muted-foreground">
            {gynecologyCount} cards
          </p>
          <Button 
            variant={selectedCategory === 'gynecology' ? 'default' : 'outline'}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onCategoryChange('gynecology');
            }}
          >
            Study Gynecology
          </Button>
        </div>
      </Card>
    </div>
  );
};