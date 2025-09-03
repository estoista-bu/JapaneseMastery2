
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import type { VocabularyWord, WordMasteryStats } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/flashcard";
import { cn } from "@/lib/utils";

type AnimationDirection = "left" | "right" | "none";

interface FlashcardViewerProps {
    words: VocabularyWord[];
    isKana?: boolean;
    onEdit: (word: VocabularyWord) => void;
    onRemove: (id: string) => void;
    onShuffle: () => void;
    startIndex?: number;
    masteryStats: Record<string, WordMasteryStats>;
    masteryThreshold: number;
    isEditable?: boolean;
}

export function FlashcardViewer({ words, isKana, onEdit, onRemove, onShuffle, startIndex = 0, masteryStats, masteryThreshold, isEditable = true }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>("none");
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  useEffect(() => {
    if (words.length > 0) {
      setCurrentIndex(startIndex % words.length);
    }
  }, [startIndex, words]);


  const minSwipeDistance = 50;

  const handleNavigation = (direction: 'next' | 'prev') => {
    if (words.length < 2) return;
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setAnimationDirection(direction === 'next' ? 'right' : 'left');
    
    animationTimeoutRef.current = setTimeout(() => {
       if (direction === 'next') {
         setCurrentIndex((prev) => (prev + 1) % words.length);
       } else {
         setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
       }
       setIsFlipped(false);
       setAnimationDirection('none');
    }, 100);
  };

  const goToNext = () => handleNavigation('next');
  const goToPrevious = () => handleNavigation('prev');

  const handleShuffleClick = () => {
    onShuffle();
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setIsFlipped(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setIsFlipped(true);
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [words, currentIndex]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const currentWord = words.length > 0 ? words[currentIndex] : null;

  return (
    <div className="flex flex-col w-full h-full">
        <div 
            className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {currentWord ? (
            <div
                key={currentWord.id}
                className={cn(
                "w-full h-72",
                animationDirection === 'right' && 'animate-slide-out-to-left',
                animationDirection === 'left' && 'animate-slide-out-to-right',
                animationDirection === 'none' && 'animate-slide-in'
                )}
            >
                <Flashcard
                    word={currentWord}
                    onRemove={() => onRemove(currentWord.id)}
                    onEdit={() => onEdit(currentWord)}
                    isKana={isKana}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(!isFlipped)}
                    mode="view"
                    isMastered={(masteryStats[currentWord.id]?.correct || 0) >= masteryThreshold}
                    isEditable={isEditable}
                />
            </div>
            ) : null}
        </div>
        
        {words.length > 0 && (
            <footer className="flex items-center justify-between p-4 border-t">
            <Button variant="outline" size="icon" onClick={goToPrevious} disabled={words.length < 2}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous word</span>
            </Button>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleShuffleClick} disabled={words.length < 2}>
                <Shuffle className="h-4 w-4" />
                <span className="sr-only">Shuffle words</span>
                </Button>
                <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {words.length}
                </p>
            </div>
            <Button variant="outline" size="icon" onClick={goToNext} disabled={words.length < 2}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next word</span>
            </Button>
            </footer>
        )}
    </div>
  );
}
