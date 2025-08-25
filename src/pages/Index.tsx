import { useState } from 'react';
import { CategorySelector } from '@/components/CategorySelector';
import { StudySession } from '@/components/StudySession';
import { getAllCards, getCategoryCards, Category } from '@/data/flashcards';
import { GraduationCap, Stethoscope } from 'lucide-react';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all' | null>(null);
  const [isStudying, setIsStudying] = useState(false);

  const allCards = getAllCards();
  const obstetricCards = getCategoryCards('obstetrics');
  const gynecologyCards = getCategoryCards('gynecology');

  const getStudyCards = () => {
    if (selectedCategory === 'all') return allCards;
    if (selectedCategory === 'obstetrics') return obstetricCards;
    if (selectedCategory === 'gynecology') return gynecologyCards;
    return [];
  };

  const getCategoryTitle = () => {
    if (selectedCategory === 'all') return 'All Topics';
    if (selectedCategory === 'obstetrics') return 'Obstetrics';
    if (selectedCategory === 'gynecology') return 'Gynecology';
    return '';
  };

  const handleCategorySelect = (category: Category | 'all') => {
    setSelectedCategory(category);
    setIsStudying(true);
  };

  const handleBackToCategories = () => {
    setIsStudying(false);
    setSelectedCategory(null);
  };

  if (isStudying && selectedCategory) {
    return (
      <div className="min-h-screen bg-background p-6">
        <StudySession 
          cards={getStudyCards()}
          onBack={handleBackToCategories}
          categoryTitle={getCategoryTitle()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary to-accent">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OB/GYN Flashcards
            </h1>
            <div className="p-3 rounded-full bg-gradient-to-br from-accent to-primary">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master obstetrics and gynecology with interactive flashcards designed for medical students and healthcare professionals.
          </p>
        </div>

        {/* Category Selection */}
        <CategorySelector
          selectedCategory={selectedCategory || 'all'}
          onCategoryChange={handleCategorySelect}
          obstetricCount={obstetricCards.length}
          gynecologyCount={gynecologyCards.length}
          totalCount={allCards.length}
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-6 bg-gradient-to-br from-card to-medical-light rounded-lg shadow-[var(--shadow-card)]">
            <div className="text-3xl font-bold text-primary mb-2">{allCards.length}</div>
            <div className="text-muted-foreground">Total Flashcards</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-card to-medical-light rounded-lg shadow-[var(--shadow-card)]">
            <div className="text-3xl font-bold text-primary mb-2">2</div>
            <div className="text-muted-foreground">Categories</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-card to-medical-light rounded-lg shadow-[var(--shadow-card)]">
            <div className="text-3xl font-bold text-primary mb-2">∞</div>
            <div className="text-muted-foreground">Study Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
