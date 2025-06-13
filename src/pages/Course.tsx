
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LessonCard from '@/components/LessonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

interface LessonWithProgress extends Tables<'lessons'> {
  isCompleted: boolean;
}

interface CourseWithProgress extends Tables<'courses'> {
  lessons: LessonWithProgress[];
  totalLessons: number;
  completedLessons: number;
}

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Fetch lessons for the course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_number');

      if (lessonsError) throw lessonsError;

      // Set lessons without user progress (public mode)
      const lessonsWithProgress = lessonsData?.map((lesson) => ({
        ...lesson,
        isCompleted: false // No user progress in public mode
      })) || [];

      setCourse({
        ...courseData,
        lessons: lessonsWithProgress,
        totalLessons: lessonsWithProgress.length,
        completedLessons: 0 // No user progress in public mode
      });

    } catch (error: any) {
      console.error('Error fetching course data:', error);
      setError('Kunde inte ladda kursdata. Försök igen senare.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const progressPercentage = 0; // No progress tracking in public mode

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tillbaka till dashboard
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Kursen kunde inte hittas.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tillbaka till dashboard
      </Button>

      {/* Course Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.title_sv}</h1>
          {course.description_sv && (
            <p className="text-lg text-gray-600 mt-2">{course.description_sv}</p>
          )}
        </div>

        {/* Course Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Kursinformation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{course.totalLessons} lektioner tillgängliga</span>
              <span>Gratis och öppet innehåll</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lessons Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Lektioner</h2>
        
        {course.lessons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <PlayCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inga lektioner tillgängliga</h3>
              <p className="text-gray-600">Lektioner kommer att läggas till snart.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={lesson.isCompleted}
                onStartLesson={() => handleStartLesson(lesson.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Course;
