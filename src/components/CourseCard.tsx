
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, BookOpen, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface CourseCardProps {
  course: Tables<'courses'>;
  lessonsCount?: number;
  completedLessons?: number;
  onStartCourse: () => void;
}

const CourseCard = ({ course, lessonsCount = 0, completedLessons = 0, onStartCourse }: CourseCardProps) => {
  const progressPercentage = lessonsCount > 0 ? (completedLessons / lessonsCount) * 100 : 0;
  const isStarted = completedLessons > 0;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900">
              {course.title_sv}
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600">
              {course.description_sv}
            </CardDescription>
          </div>
          <Badge variant={isStarted ? "default" : "secondary"}>
            {isStarted ? "Påbörjad" : "Ny"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{lessonsCount} lektioner</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>~{lessonsCount * 15} min</span>
            </div>
          </div>

          {isStarted && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Framsteg</span>
                <span className="font-medium">{completedLessons}/{lessonsCount}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onStartCourse} className="w-full">
          <PlayCircle className="mr-2 h-4 w-4" />
          {isStarted ? "Fortsätt kurs" : "Starta kurs"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
