
"use client";

import { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle2 } from "lucide-react";
import type { GrammarLesson } from "@/lib/types";
import { grammarLessons as allLessons } from "@/data/lessons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface GrammarLessonsListProps {
  onSelectLesson: (lesson: GrammarLesson) => void;
  userId: string;
}

export function GrammarLessonsList({ onSelectLesson, userId }: GrammarLessonsListProps) {
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);

  useEffect(() => {
    const lessonsWithStatus = allLessons.map((lesson) => ({
      ...lesson,
      isRead: !!localStorage.getItem(`lesson-read-${lesson.title}_${userId}`),
    }));
    setLessons(lessonsWithStatus);
  }, [userId]);

  const n5Lessons = lessons.filter(l => l.level === "N5");
  const n4Lessons = lessons.filter(l => l.level === "N4");

  return (
    <div className="p-4">
      <Accordion type="multiple" className="w-full space-y-4">
        <AccordionItem value="n5-lessons" className="border-none">
          <AccordionTrigger className="font-headline font-semibold text-lg text-primary hover:no-underline rounded-lg bg-card p-4">
            N5 Lessons
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-2">
            {n5Lessons.map((lesson, index) => (
              <button
                key={`n5-${index}`}
                onClick={() => onSelectLesson(lesson)}
                className="flex items-center justify-between w-full p-4 rounded-lg bg-card hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {lesson.isRead ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-muted rounded-full flex-shrink-0" />
                  )}
                  <span className="flex-1 pr-4">{lesson.title}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="n4-lessons" className="border-none">
          <AccordionTrigger className="font-headline font-semibold text-lg text-primary hover:no-underline rounded-lg bg-card p-4">
            N4 Lessons
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-2">
            {n4Lessons.map((lesson, index) => (
              <button
                key={`n4-${index}`}
                onClick={() => onSelectLesson(lesson)}
                className="flex items-center justify-between w-full p-4 rounded-lg bg-card hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {lesson.isRead ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-muted rounded-full flex-shrink-0" />
                  )}
                  <span className="flex-1 pr-4">{lesson.title}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    