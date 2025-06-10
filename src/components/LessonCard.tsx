
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, CheckCircle, Clock, BookOpen } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface LessonCardProps {
  lesson: Tables<'lessons'>;
  isCompleted?: boolean;
  onStartLesson: () => void;
}

const LessonCard = ({ lesson, isCompleted = false, onStartLesson }: LessonCardProps) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Lektion {lesson.order_number}
              </Badge>
              {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
            <CardTitle className="text-base font-semibold">
              {lesson.title_sv}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {lesson.summary_sv && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {lesson.summary_sv}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>~15 min</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="h-3 w-3" />
                <span>Video + Quiz</span>
              </div>
            </div>

            <Button onClick={onStartLesson} size="sm" variant={isCompleted ? "outline" : "default"}>
              <PlayCircle className="mr-1 h-3 w-3" />
              {isCompleted ? "Repetera" : "Starta"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonCard;
