
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import CourseCard from '@/components/CourseCard';
import type { Tables } from '@/integrations/supabase/types';

interface CourseWithProgress extends Tables<'courses'> {
  lessonsCount: number;
  completedLessons: number;
}

interface CoursesSectionProps {
  courses: CourseWithProgress[];
  onStartCourse: (courseId: string) => void;
}

const CoursesSection = ({ courses, onStartCourse }: CoursesSectionProps) => {
  return (
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
              onStartCourse={() => onStartCourse(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesSection;
