import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CourseCard from '@/components/CourseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, BookOpen, Target, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

interface CourseWithProgress extends Tables<'courses'> {
  lessonsCount: number;
  completedLessons: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    streak: 0,
    badges: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch courses with lesson counts
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          lessons(count)
        `);

      if (coursesError) throw coursesError;

      // Fetch user progress if logged in
      let progressData: any = {};
      if (user) {
        const { data: userProgressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id);

        if (progressError) throw progressError;

        // Group progress by course
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, course_id');

        if (lessonsError) throw lessonsError;

        // Calculate progress per course
        progressData = lessonsData?.reduce((acc: any, lesson) => {
          if (!acc[lesson.course_id]) {
            acc[lesson.course_id] = { total: 0, completed: 0 };
          }
          acc[lesson.course_id].total += 1;
          
          const isCompleted = userProgressData?.some(
            (progress: any) => progress.lesson_id === lesson.id && progress.completed
          );
          
          if (isCompleted) {
            acc[lesson.course_id].completed += 1;
          }
          
          return acc;
        }, {}) || {};

        // Fetch user stats
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('streak_days')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData) {
          setStats(prev => ({
            ...prev,
            streak: profileData.streak_days || 0
          }));
        }

        const { data: badgesData, error: badgesError } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', user.id);

        if (!badgesError && badgesData) {
          setStats(prev => ({
            ...prev,
            badges: badgesData.length
          }));
        }
      }

      // Format courses data
      const formattedCourses: CourseWithProgress[] = coursesData?.map((course: any) => ({
        ...course,
        lessonsCount: course.lessons?.[0]?.count || 0,
        completedLessons: progressData[course.id]?.completed || 0
      })) || [];

      setCourses(formattedCourses);

      // Calculate total stats
      const totalLessons = formattedCourses.reduce((sum, course) => sum + course.lessonsCount, 0);
      const completedLessons = formattedCourses.reduce((sum, course) => sum + course.completedLessons, 0);
      
      setStats(prev => ({
        ...prev,
        totalLessons,
        completedLessons
      }));

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Kunde inte ladda data. Försök igen senare.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Hej {user?.email?.split('@')[0] || 'där'}! 👋
        </h2>
        <p className="text-lg text-gray-600">
          Redo att lära dig maskininlärning idag?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genomförda lektioner</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedLessons}</div>
            <p className="text-xs text-muted-foreground">av {stats.totalLessons} totalt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuvarande streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak}</div>
            <p className="text-xs text-muted-foreground">dagar i rad</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intjänade märken</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.badges}</div>
            <p className="text-xs text-muted-foreground">prestationer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Framsteg totalt</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">genomfört</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Tillgängliga kurser</h3>
        
        {courses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inga kurser tillgängliga än</h3>
              <p className="text-gray-600">Kurser kommer att läggas till snart. Håll utkik!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                lessonsCount={course.lessonsCount}
                completedLessons={course.completedLessons}
                onStartCourse={() => handleStartCourse(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
