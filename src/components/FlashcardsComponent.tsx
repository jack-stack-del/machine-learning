
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import type { Tables } from '@/integrations/supabase/types';

interface FlashcardsComponentProps {
  flashcards: Tables<'flashcards'>[];
  lessonId: string;
}

const FlashcardsComponent = ({ flashcards, lessonId }: FlashcardsComponentProps) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCards(new Set());
  }, [flashcards]);

  const currentCard = flashcards[currentIndex];
  const progressPercentage = flashcards.length > 0 ? (reviewedCards.size / flashcards.length) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && currentCard) {
      setReviewedCards(prev => new Set(prev).add(currentCard.id));
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCards(new Set());
  };

  const updateProgress = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          flashcards_reviewed: reviewedCards.size,
          last_reviewed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Framsteg sparat! 📚",
        description: `Du har gått igenom ${reviewedCards.size} av ${flashcards.length} flashcards.`
      });

    } catch (error: any) {
      console.error('Error updating flashcard progress:', error);
    }
  };

  useEffect(() => {
    if (reviewedCards.size === flashcards.length && flashcards.length > 0) {
      updateProgress();
    }
  }, [reviewedCards, flashcards.length]);

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inga flashcards tillgängliga</h3>
          <p className="text-gray-600">Flashcards för denna lektion kommer att läggas till snart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Framsteg</span>
          <span className="text-sm text-gray-600">
            {reviewedCards.size} av {flashcards.length} granskade
          </span>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>

      {/* Card Counter */}
      <div className="flex justify-between items-center">
        <Badge variant="outline">
          Kort {currentIndex + 1} av {flashcards.length}
        </Badge>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Börja om
        </Button>
      </div>

      {/* Flashcard */}
      <Card className="min-h-[300px] cursor-pointer transition-transform hover:scale-[1.02]" onClick={handleFlip}>
        <CardContent className="flex items-center justify-center p-8 min-h-[300px]">
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-500 uppercase tracking-wide">
              {isFlipped ? 'Svar' : 'Fråga'}
            </div>
            <div className="text-lg font-medium leading-relaxed">
              {isFlipped ? currentCard?.back_sv : currentCard?.front_sv}
            </div>
            {!isFlipped && (
              <div className="text-sm text-gray-400 pt-4">
                Klicka för att se svaret
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Föregående
        </Button>

        <div className="flex space-x-2">
          {flashcards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-blue-600' 
                  : reviewedCards.has(flashcards[index].id)
                  ? 'bg-green-400'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button 
          variant="outline" 
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          Nästa
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Completion Message */}
      {reviewedCards.size === flashcards.length && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Bra jobbat! 🎉
            </h3>
            <p className="text-green-700">
              Du har gått igenom alla flashcards för denna lektion.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlashcardsComponent;
