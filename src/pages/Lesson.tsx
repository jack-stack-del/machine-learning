
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/VideoPlayer';
import FlashcardsComponent from '@/components/FlashcardsComponent';
import QuizComponent from '@/components/QuizComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, PlayCircle, Clock, BookOpen } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface LessonData extends Tables<'lessons'> {
  course: {
    title_sv: string;
  };
  flashcards: Tables<'flashcards'>[];
  quizzes: Tables<'quizzes'>[];
  isCompleted: boolean;
}

const Lesson = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('video');

  useEffect(() => {
    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lesson with course info
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select(`
          *,
          course:courses(title_sv)
        `)
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      // Fetch flashcards
      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('lesson_id', lessonId);

      if (flashcardsError) throw flashcardsError;

      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId);

      if (quizzesError) throw quizzesError;

      setLesson({
        ...lessonData,
        flashcards: flashcardsData || [],
        quizzes: quizzesData || [],
        isCompleted: false // No user progress in public mode
      });

    } catch (error: any) {
      console.error('Error fetching lesson data:', error);
      setError('Kunde inte ladda lektionsdata. Försök igen senare.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tillbaka
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Lektionen kunde inte hittas.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tillbaka
        </Button>
        
        <Badge variant="outline" className="bg-blue-50">
          Gratis innehåll
        </Badge>
      </div>

      {/* Lesson Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="outline">
              Lektion {lesson.order_number}
            </Badge>
            <span className="text-sm text-gray-500">
              {lesson.course?.title_sv}
            </span>
          </div>
          <CardTitle className="text-2xl">{lesson.title_sv}</CardTitle>
          {lesson.summary_sv && (
            <p className="text-gray-600">{lesson.summary_sv}</p>
          )}
        </CardHeader>
      </Card>

      {/* Lesson Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="video" className="flex items-center space-x-2">
            <PlayCircle className="h-4 w-4" />
            <span>Video</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Flashcards ({lesson.flashcards.length})</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Quiz ({lesson.quizzes.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video">
          <VideoPlayer videoUrl={lesson.video_url} />
        </TabsContent>

        <TabsContent value="flashcards">
          <FlashcardsComponent 
            flashcards={lesson.flashcards} 
            lessonId={lesson.id}
          />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizComponent 
            quizzes={lesson.quizzes} 
            lessonId={lesson.id}
            onQuizComplete={() => {}} // No completion tracking in public mode
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Lesson;
