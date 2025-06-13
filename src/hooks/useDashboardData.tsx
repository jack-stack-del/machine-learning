
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface CourseWithProgress extends Tables<'courses'> {
  lessonsCount: number;
  completedLessons: number;
}

interface DashboardStats {
  totalLessons: number;
  completedLessons: number;
  streak: number;
  badges: number;
}

export const useDashboardData = () => {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLessons: 0,
    completedLessons: 0,
    streak: 0,
    badges: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Format courses data without user progress
      const formattedCourses: CourseWithProgress[] = coursesData?.map((course: any) => ({
        ...course,
        lessonsCount: course.lessons?.[0]?.count || 0,
        completedLessons: 0 // No user progress in public mode
      })) || [];

      setCourses(formattedCourses);

      // Calculate total stats without user data
      const totalLessons = formattedCourses.reduce((sum, course) => sum + course.lessonsCount, 0);
      
      setStats({
        totalLessons,
        completedLessons: 0,
        streak: 0,
        badges: 0
      });

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Kunde inte ladda data. Försök igen senare.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    courses,
    stats,
    loading,
    error,
    refetch: fetchDashboardData
  };
};
