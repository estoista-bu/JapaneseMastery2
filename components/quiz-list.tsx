
"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import type { Quiz } from "@/lib/types";
import { quizzes as allQuizzes } from "@/data/quizzes";
import { Badge } from "@/components/ui/badge";

interface QuizListProps {
  onSelectQuiz: (quiz: Quiz) => void;
  userId: string;
}

export function QuizList({ onSelectQuiz, userId }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const quizzesWithScores = allQuizzes.map((quiz) => {
      const storedScore = localStorage.getItem(`quiz-highscore-${quiz.id}_${userId}`);
      const progressJson = localStorage.getItem(`quiz-progress-${quiz.id}_${userId}`);
      
      let inProgress = false;
      if (progressJson) {
        try {
          const progress = JSON.parse(progressJson);
          // A quiz is in progress if there's a record and at least one question is unanswered (null)
          if (Array.isArray(progress) && progress.some(a => a === null)) {
            inProgress = true;
          }
        } catch (e) {
          // Ignore if JSON is invalid
        }
      }

      return {
        ...quiz,
        score: storedScore ? parseInt(storedScore, 10) : null,
        inProgress: inProgress,
      };
    });
    setQuizzes(quizzesWithScores);
  }, [userId]);

  const n5Quizzes = quizzes.filter(q => q.level === "N5");
  const n4Quizzes = quizzes.filter(q => q.level === "N4");


  return (
    <div className="space-y-4 p-4">
      {/* N5 Quizzes */}
      {n5Quizzes.length > 0 && (
         <div>
            <h3 className="font-headline font-semibold text-lg mb-2 text-primary">N5 Quizzes</h3>
            <div className="space-y-2">
            {n5Quizzes.map((quiz) => (
                <button
                key={quiz.id}
                onClick={() => onSelectQuiz(quiz)}
                className="flex items-center justify-between w-full p-4 rounded-lg bg-card hover:bg-muted transition-colors text-left"
                >
                <div className="flex flex-col flex-1 pr-4">
                    <span className="flex items-center gap-2 flex-wrap">
                        {quiz.title}
                        {quiz.inProgress && (
                           <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                In Progress
                           </Badge>
                        )}
                        {quiz.score !== null && (
                            <Badge variant="secondary" className="text-xs">
                                High Score: {quiz.score}/{quiz.questions.length}
                            </Badge>
                        )}
                    </span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </button>
            ))}
            </div>
        </div>
      )}
     
      {/* N4 Quizzes */}
      {n4Quizzes.length > 0 && (
         <div>
            <h3 className="font-headline font-semibold text-lg mb-2 text-primary">N4 Quizzes</h3>
            <div className="space-y-2">
            {n4Quizzes.map((quiz) => (
                <button
                key={quiz.id}
                onClick={() => onSelectQuiz(quiz)}
                className="flex items-center justify-between w-full p-4 rounded-lg bg-card hover:bg-muted transition-colors text-left"
                >
                <div className="flex flex-col flex-1 pr-4">
                    <span className="flex items-center gap-2 flex-wrap">
                        {quiz.title}
                         {quiz.inProgress && (
                           <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                In Progress
                           </Badge>
                        )}
                        {quiz.score !== null && (
                            <Badge variant="secondary" className="text-xs">
                                High Score: {quiz.score}/{quiz.questions.length}
                            </Badge>
                        )}
                    </span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </button>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}

    
