
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, Clock, PlayCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface CourseCardProps {
  course: Tables<'courses'>;
  lessonsCount: number;
  completedLessons: number;
  onStartCourse: () => void;
}

const CourseCard = ({ course, lessonsCount, completedLessons, onStartCourse }: CourseCardProps) => {
  const progressPercentage = lessonsCount > 0 ? (completedLessons / lessonsCount) * 100 : 0;
  const isCompleted = completedLessons === lessonsCount && lessonsCount > 0;

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Machine Learning
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-600 text-xs">
                  Slutförd
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold mb-2">
              {course.title_sv}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {course.description_sv && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {course.description_sv}
          </p>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Framsteg</span>
            <span className="font-medium">
              {completedLessons}/{lessonsCount} lektioner
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-3 w-3" />
            <span>{lessonsCount} lektioner</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>~{lessonsCount * 15} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>Andrew Ng</span>
          </div>
        </div>

        <Button onClick={onStartCourse} className="w-full" variant={isCompleted ? "outline" : "default"}>
          <PlayCircle className="mr-2 h-4 w-4" />
          {isCompleted ? "Repetera kurs" : completedLessons > 0 ? "Fortsätt kurs" : "Starta kurs"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
