
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Quiz, QuizQuestion } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, RefreshCw, Circle, CheckCircle2, ArrowLeft } from "lucide-react";
import { JapaneseText } from "./japanese-text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "./ui/alert";

interface QuizViewProps {
  quiz: Quiz;
  userId: string;
  onBack?: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  if (!array) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export function QuizView({ quiz, userId, onBack }: QuizViewProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const getProgressKey = useCallback((quizId: string) => `quiz-progress-${quizId}_${userId}`, [userId]);

  const score = useMemo(() => {
    return selectedAnswers.reduce((acc, answer, index) => {
      if (!shuffledQuestions[index]) return acc;
      return answer === shuffledQuestions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
  }, [selectedAnswers, shuffledQuestions]);

  const finishQuiz = useCallback((saveScore = true) => {
    if (saveScore) {
       if (quiz.id === 'ai-generated') {
          const results = JSON.parse(localStorage.getItem(`quizResults_ai_${userId}`) || '[]');
          results.push({
              score,
              total: shuffledQuestions.length,
              timestamp: new Date().toISOString(),
          });
          localStorage.setItem(`quizResults_ai_${userId}`, JSON.stringify(results));
       } else {
          const storageKey = `quiz-highscore-${quiz.id}_${userId}`;
          const currentHighScore = parseInt(localStorage.getItem(storageKey) || "0", 10);
          if (score > currentHighScore) {
              localStorage.setItem(storageKey, score.toString());
          }
          const results = JSON.parse(localStorage.getItem(`quizResults_provided_${userId}`) || '[]');
          results.push({
              id: quiz.id,
              score,
              total: shuffledQuestions.length,
              timestamp: new Date().toISOString(),
          });
          localStorage.setItem(`quizResults_provided_${userId}`, JSON.stringify(results));
       }
    }
    setIsFinished(true);
  }, [quiz.id, score, shuffledQuestions.length, userId]);


  const startQuiz = useCallback((resume = false) => {
    const questions = shuffleArray(quiz.questions);
    setShuffledQuestions(questions);
    
    const progressKey = getProgressKey(quiz.id);
    let initialAnswers = Array(questions.length).fill(null);
    let initialIndex = 0;

    if (resume) {
        const savedProgressJson = localStorage.getItem(progressKey);
        if (savedProgressJson) {
            try {
                const savedAnswers = JSON.parse(savedProgressJson);
                 if (Array.isArray(savedAnswers) && savedAnswers.length === questions.length) {
                    const allAnswered = savedAnswers.every(a => a !== null);
                    // Only resume if not all questions were answered
                    if (!allAnswered) {
                        initialAnswers = savedAnswers;
                        const lastAnsweredIndex = savedAnswers.findLastIndex((a: any) => a !== null);
                        initialIndex = lastAnsweredIndex >= 0 ? lastAnsweredIndex + 1 : 0;
                    }
                }
            } catch (e) {
                // If parsing fails, start a fresh quiz.
                 localStorage.removeItem(progressKey);
            }
        }
    } else {
        localStorage.removeItem(progressKey);
    }
    
    setSelectedAnswers(initialAnswers);
    setCurrentQuestionIndex(initialIndex);
    setIsFinished(false);
    setIsMounted(true);
  }, [quiz.questions, getProgressKey, quiz.id]);

  useEffect(() => {
      startQuiz(true); // Attempt to resume on initial load
  }, [quiz, startQuiz]);


  useEffect(() => {
    if (isMounted && !isFinished && selectedAnswers.length > 0) {
      localStorage.setItem(getProgressKey(quiz.id), JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, quiz.id, isMounted, isFinished, getProgressKey]);
  
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer) return; 
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const restartQuiz = () => {
    if (quiz.id === 'ai-generated') {
       sessionStorage.removeItem(`ai-generated-quiz_${userId}`);
       localStorage.removeItem(getProgressKey(quiz.id));
    }
    startQuiz(false); // Start fresh, don't resume
  };

  const progress = isFinished ? 100 : ((currentQuestionIndex) / shuffledQuestions.length) * 100;
  
  if (!isMounted || !currentQuestion) {
    return (
        <div className="flex justify-center items-center h-full p-4">
            <p>Loading Quiz...</p>
        </div>
    );
  }

  if (isFinished) {
    const percentage = (score / shuffledQuestions.length) * 100;
    return (
      <div className="pb-4 flex flex-col items-center justify-center text-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Quiz Complete!</CardTitle>
            <CardDescription>You scored</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-4xl font-bold text-primary">{score} / {shuffledQuestions.length}</p>
            <p className="text-2xl font-semibold text-muted-foreground">({percentage.toFixed(0)}%)</p>
            <div className="flex gap-2 mt-4">
                <Button onClick={restartQuiz} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Take Again
                </Button>
                {onBack && (
                     <Button onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Return to Quizzes
                     </Button>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const hasAnswered = selectedAnswer !== null;

  return (
    <div className="pb-1 space-y-1">
      <div className="space-y-2 p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Start Over
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This will restart the quiz and all your current progress will be lost.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={restartQuiz}>
                          Restart Quiz
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <Progress value={progress} />
           {quiz.level === 'AI' && (
             <Alert variant="destructive" className="p-2 bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300 [&>svg]:text-orange-600">
                <AlertDescription className="text-xs">
                    AI can make mistakes, please confirm with external source if unsure.
                </AlertDescription>
            </Alert>
           )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
             <JapaneseText 
                text={currentQuestion.question}
                reading={currentQuestion.questionReading}
                isBlock
                isInteractive={!hasAnswered}
              />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = currentQuestion.correctAnswer === option;
              const optionReading = currentQuestion.optionsReading?.[index]

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "w-full justify-start h-auto py-3 text-left whitespace-normal text-foreground",
                    "hover:text-foreground",
                    hasAnswered && isCorrect && "bg-green-600 border-green-700 text-green-50 hover:bg-green-600 dark:bg-green-800/80 dark:border-green-700 dark:text-green-100",
                    hasAnswered && !isCorrect && isSelected && "bg-red-600 border-red-700 text-red-50 hover:bg-red-600 dark:bg-red-800/80 dark:border-red-700 dark:text-red-100",
                    !hasAnswered && "hover:bg-accent/10"
                  )}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={hasAnswered}
                >
                  {hasAnswered && isSelected ? (
                     <CheckCircle2 className="mr-3 h-5 w-5 text-primary"/>
                  ) : (
                     <Circle className="mr-3 h-5 w-5 text-muted-foreground/50"/>
                  )}
                  <span className="flex-1">
                     <JapaneseText
                        text={option}
                        reading={optionReading}
                        isInteractive={!hasAnswered}
                      />
                  </span>
                  {hasAnswered && isCorrect && <CheckCircle className="ml-4 h-5 w-5 text-green-200 dark:text-green-300"/>}
                  {hasAnswered && !isCorrect && isSelected && <XCircle className="ml-4 h-5 w-5 text-red-200 dark:text-red-300"/>}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {hasAnswered && (
        <div className="p-4 bg-muted/50 rounded-lg animate-in fade-in space-y-4">
            <div className="text-sm text-muted-foreground">
                 <JapaneseText
                    text={currentQuestion.explanation}
                    reading={currentQuestion.explanationReading}
                    isBlock
                    isInteractive={true}
                  />
            </div>
            <Button onClick={goToNextQuestion} className="w-full">
            {currentQuestionIndex < shuffledQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
        </div>
      )}
    </div>
  );
}
