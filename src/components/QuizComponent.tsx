
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Target, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import type { Tables } from '@/integrations/supabase/types';

interface QuizComponentProps {
  quizzes: Tables<'quizzes'>[];
  lessonId: string;
  onQuizComplete?: () => void;
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

const QuizComponent = ({ quizzes, lessonId, onQuizComplete }: QuizComponentProps) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = quizzes[currentQuestionIndex];
  const totalQuestions = quizzes.length;
  const progressPercentage = totalQuestions > 0 ? (results.length / totalQuestions) * 100 : 0;

  useEffect(() => {
    resetQuiz();
  }, [quizzes]);

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setResults([]);
    setShowResults(false);
    setQuizCompleted(false);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const newResult: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect
    };

    const newResults = [...results, newResult];
    setResults(newResults);

    // Show result for current question
    setShowResults(true);

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResults(false);
      } else {
        // Quiz completed
        completeQuiz(newResults);
      }
    }, 2000);
  };

  const completeQuiz = async (finalResults: QuizResult[]) => {
    setQuizCompleted(true);
    
    const correctAnswers = finalResults.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    if (user) {
      try {
        const { error } = await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            quiz_score: score,
            last_reviewed_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: score >= 70 ? "Fantastiskt! 🎉" : "Bra försök! 💪",
          description: `Du fick ${correctAnswers} av ${totalQuestions} rätt (${score}%).`
        });

        if (score >= 70 && onQuizComplete) {
          onQuizComplete();
        }

      } catch (error: any) {
        console.error('Error saving quiz score:', error);
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inga quiz-frågor tillgängliga</h3>
          <p className="text-gray-600">Quiz-frågor för denna lektion kommer att läggas till snart.</p>
        </CardContent>
      </Card>
    );
  }

  if (quizCompleted) {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz slutfört!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
              <p className="text-lg">
                {correctAnswers} av {totalQuestions} rätt svar
              </p>
              
              {score >= 70 ? (
                <Badge className="bg-green-600">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Godkänt!
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="mr-1 h-3 w-3" />
                  Försök igen
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {results.map((result, index) => {
                const question = quizzes.find(q => q.id === result.questionId);
                if (!question) return null;

                return (
                  <div key={result.questionId} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">Fråga {index + 1}</span>
                    {result.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={resetQuiz} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Försök igen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const answerOptions = currentQuestion.answer_options as string[];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Quiz framsteg</span>
          <Badge variant="outline">
            Fråga {currentQuestionIndex + 1} av {totalQuestions}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question_sv}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showResults ? (
            <>
              <RadioGroup 
                value={selectedAnswer?.toString() || ""} 
                onValueChange={(value) => setSelectedAnswer(parseInt(value))}
              >
                {answerOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button 
                onClick={handleAnswerSubmit} 
                disabled={selectedAnswer === null}
                className="w-full"
              >
                Svara
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              {selectedAnswer === currentQuestion.correct_answer ? (
                <div className="space-y-2">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                  <h3 className="text-lg font-medium text-green-800">Rätt svar!</h3>
                  <p className="text-green-700">Bra jobbat! 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="mx-auto h-12 w-12 text-red-600" />
                  <h3 className="text-lg font-medium text-red-800">Fel svar</h3>
                  <p className="text-red-700">
                    Rätt svar: {answerOptions[currentQuestion.correct_answer]}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizComponent;
