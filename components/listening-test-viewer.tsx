
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { VocabularyWord, WordMasteryStats } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as wanakana from 'wanakana';
import { ArrowRight, Volume2, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { apiService } from "@/lib/api";
import { getContentTypeFromDeckCategory } from '@/lib/content-type-utils';

type AnswerStatus = "idle" | "correct" | "incorrect";

interface WeightedWord extends VocabularyWord {
  weight: number;
}

interface ListeningTestViewerProps {
  words: VocabularyWord[];
  userId: string;
  deckCategory?: string;
}

export function ListeningTestViewer({ words, userId, deckCategory }: ListeningTestViewerProps) {
  const [weightedWords, setWeightedWords] = useState<WeightedWord[]>([]);
  const [currentWord, setCurrentWord] = useState<WeightedWord | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle');
  const [showStats, setShowStats] = useState(false);
  const [isEnterLocked, setIsEnterLocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // This effect runs when the component unmounts (e.g., user clicks back)
  useEffect(() => {
    return () => {
      if (sessionTotal > 0) {
        // Save session stats to database with content type
        const contentType = getContentTypeFromDeckCategory(deckCategory);
        apiService.updateListeningStats(contentType, sessionCorrect, sessionTotal).catch(error => {
          console.error('Error saving listening stats:', error);
        });
      }
    };
  }, [sessionCorrect, sessionTotal, deckCategory]);

  useEffect(() => {
    const loadWordMasteryStats = async () => {
      try {
        const response = await apiService.getUserStats();
        const stats = response.stats;
        const masteryStats: Record<string, WordMasteryStats> = stats.word_mastery_stats || {};
        
        const initialWords = words.map(word => {
            const stats = masteryStats[word.id] || { correct: 0, incorrect: 0, weight: 1 };
            return { 
                ...word, 
                weight: stats.weight ?? 1 // Default weight to 1 if not present
            };
        });
        setWeightedWords(initialWords);
        setCurrentWord(null);
      } catch (error) {
        console.error('Error loading word mastery stats:', error);
        // Fallback to default weights
        const initialWords = words.map(word => ({ ...word, weight: 1 }));
        setWeightedWords(initialWords);
        setCurrentWord(null);
      }
    };

    loadWordMasteryStats();
  }, [words]);
  
  const selectNextWord = useCallback(() => {
    if (weightedWords.length === 0) return null;

    const totalWeight = weightedWords.reduce((sum, word) => sum + word.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const word of weightedWords) {
        random -= word.weight;
        if (random <= 0) {
            return word;
        }
    }
    return weightedWords[weightedWords.length - 1];
  }, [weightedWords]);

  useEffect(() => {
    if (weightedWords.length > 0 && !currentWord) {
      const firstWord = selectNextWord();
      if (firstWord) {
        setCurrentWord(firstWord);
        setIsEnterLocked(true);
      }
    }
  }, [weightedWords, currentWord, selectNextWord]);
  
  useEffect(() => {
    if (currentWord) {
      const timer = setTimeout(() => setIsEnterLocked(false), 200);
      return () => clearTimeout(timer);
    }
  }, [currentWord]);

  const goToNext = useCallback(() => {
    const nextWord = selectNextWord();
    if (nextWord) {
        setCurrentWord(nextWord);
    } else {
        setCurrentWord(null);
    }
    setInputValue('');
    setAnswerStatus('idle');
    setIsEnterLocked(true);
    setPlayCount(0); // Reset play count for new word
  }, [selectNextWord]);
  
  useEffect(() => {
    if (inputRef.current) {
      if (answerStatus === 'idle') {
        wanakana.bind(inputRef.current, { IMEMode: 'toHiragana' });
        inputRef.current.focus();
      } else {
        // Check if the element is still bound before unbinding
        try {
          if (inputRef.current && inputRef.current.dataset.wanakana) {
            wanakana.unbind(inputRef.current);
          }
        } catch (error) {
          console.warn('Error unbinding wanakana:', error);
        }
      }
    }
     if (answerStatus !== 'idle' && nextButtonRef.current) {
         nextButtonRef.current.focus();
     }
  }, [answerStatus]);

  // Cleanup effect to unbind wanakana when component unmounts
  useEffect(() => {
    return () => {
      if (inputRef.current) {
        try {
          if (inputRef.current.dataset.wanakana) {
            wanakana.unbind(inputRef.current);
          }
        } catch (error) {
          console.warn('Error unbinding wanakana on cleanup:', error);
        }
      }
    };
  }, []);
  
  const handleGuess = useCallback(async (guessed: boolean, answer: string) => {
    if (!currentWord || answerStatus !== 'idle') return;
    
    setInputValue(answer);
    
    setSessionTotal(prev => prev + 1);
    if (guessed) {
      setSessionCorrect(prev => prev + 1);
    }

    // Update word mastery stats in database
    try {
      const response = await apiService.getUserStats();
      const stats = response.stats;
      const masteryStats: Record<string, WordMasteryStats> = stats.word_mastery_stats || {};
      
      if (!masteryStats[currentWord.id]) {
        masteryStats[currentWord.id] = { correct: 0, incorrect: 0, weight: 1 };
      }
      
      let currentWeight = masteryStats[currentWord.id].weight ?? 1;

      if (guessed) {
         masteryStats[currentWord.id].correct = (masteryStats[currentWord.id].correct || 0) + 1;
         if (currentWeight < 8) {
           currentWeight = 1;
         } else {
           currentWeight /= 8;
         }
      } else {
         masteryStats[currentWord.id].incorrect = (masteryStats[currentWord.id].incorrect || 0) + 1;
         currentWeight *= 10;
      }
      masteryStats[currentWord.id].weight = currentWeight;
      
      // Save updated mastery stats to database
      const contentType = getContentTypeFromDeckCategory(deckCategory);
      await apiService.updateWordMasteryStats(contentType, masteryStats);

      setWeightedWords(prevWords => 
          prevWords.map(w => (w.id === currentWord.id ? { ...w, weight: currentWeight } : w))
      );
    } catch (error) {
      console.error('Error updating word mastery stats:', error);
    }

    setAnswerStatus(guessed ? 'correct' : 'incorrect');
  }, [currentWord, answerStatus, deckCategory]);
  
  const checkAnswer = (answer: string) => {
    if (answerStatus !== 'idle' || !currentWord) return;
    
    let submittedAnswer = answer.trim();

    if (wanakana.isKatakana(currentWord.japanese)) {
        const isCorrect = wanakana.toHiragana(submittedAnswer) === currentWord.reading;
        handleGuess(isCorrect, submittedAnswer);
        return;
    }

    const normalizedAnswer = wanakana.toRomaji(wanakana.toHiragana(submittedAnswer));
    const normalizedReading = wanakana.toRomaji(currentWord.reading);
    
    const isCorrect = normalizedAnswer === normalizedReading;
    handleGuess(isCorrect, submittedAnswer);
  };
  
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (answerStatus === 'idle' && !isEnterLocked) {
        e.preventDefault();
        checkAnswer(e.currentTarget.value);
      } else if (answerStatus !== 'idle') {
        e.preventDefault();
        goToNext();
      }
    }
  };

  const handleDontKnow = () => {
    if (answerStatus !== 'idle') return;
    handleGuess(false, "---");
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis || isPlaying || !currentWord || playCount >= 2) {
      return;
    }
    
    setPlayCount(prev => prev + 1);
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(currentWord.reading);
    utterance.lang = 'ja-JP';
    utterance.onend = () => {
        setIsPlaying(false);
        inputRef.current?.focus();
    };
    utterance.onerror = () => {
        setIsPlaying(false);
        inputRef.current?.focus();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const getBackgroundColor = () => {
    if (answerStatus === 'correct') return 'bg-green-200 dark:bg-green-900';
    if (answerStatus === 'incorrect') return 'bg-red-200 dark:bg-red-900';
    return 'bg-background';
  }
  
  const getInputBorderColor = () => {
    if (answerStatus === 'correct') return 'border-green-600 focus-visible:ring-green-600';
    if (answerStatus === 'incorrect') return 'border-red-600 focus-visible:ring-red-600';
    return 'border-input';
  }
  
  const maxWeight = Math.max(...weightedWords.map(w => w.weight), 1);
  const playsLeft = 2 - playCount;

  return (
    <div className={cn("flex flex-col w-full h-full transition-colors duration-300", getBackgroundColor())}>
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden space-y-8">
            {currentWord ? (
            <div
                key={`${currentWord.id}`}
                className="w-full text-center animate-in fade-in"
            >
              <div className="flex flex-col items-center gap-2">
                <Button onClick={handlePlayAudio} disabled={isPlaying || playsLeft <= 0} size="lg" variant="outline" className="h-24 w-24 rounded-full">
                  {isPlaying ? <Loader2 className="h-10 w-10 animate-spin" /> : <Volume2 className="h-10 w-10" />}
                  <span className="sr-only">Play Word</span>
                </Button>
                <span className="text-xs text-muted-foreground">
                    {playsLeft > 0 ? `${playsLeft} play${playsLeft > 1 ? 's' : ''} left` : 'No plays left'}
                </span>
              </div>
            </div>
            ) : (
                 <p className="text-muted-foreground">Loading test...</p>
            )}
            
            <div className="w-full max-w-sm">
                 <Input
                    ref={inputRef}
                    type="text"
                    lang="ja"
                    placeholder="Enter reading in hiragana..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyUp={handleKeyUp}
                    disabled={answerStatus !== 'idle'}
                    className={cn(
                        "h-16 text-center text-3xl font-japanese tracking-widest",
                        "transition-colors duration-300",
                        getInputBorderColor()
                    )}
                 />
                 {(answerStatus === 'correct' || answerStatus === 'incorrect') && currentWord && (
                    <div className={cn(
                        "mt-2 text-center text-lg font-semibold animate-in fade-in",
                        answerStatus === 'correct' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                    )}>
                        <p>{currentWord.japanese} ({currentWord.reading})</p>
                        <p className="text-base text-muted-foreground mt-1">{currentWord.meaning}</p>
                    </div>
                 )}
                 {answerStatus !== 'idle' && (
                    <Button ref={nextButtonRef} type="button" onClick={goToNext} className="w-full mt-4">
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                 )}
            </div>
            
            {showStats && (
                <Card className="w-full max-w-md animate-in fade-in">
                    <CardHeader>
                        <CardTitle>Word Weights</CardTitle>
                        <CardDescription>
                            Higher weights mean a word is more likely to appear next.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-48">
                            <div className="p-4 space-y-4 pr-3">
                                {weightedWords.sort((a, b) => b.weight - a.weight).map(word => (
                                    <div key={word.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="truncate pr-2">{word.japanese}</span>
                                            <span className="font-mono text-muted-foreground">{word.weight.toFixed(2)}</span>
                                        </div>
                                        <Progress value={(word.weight / maxWeight) * 100} />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

        </div>
        
        <footer className="flex items-center justify-between p-4 border-t">
             <div className="w-1/3 flex items-center space-x-2">
                <Checkbox id="show-stats" checked={showStats} onCheckedChange={(checked) => setShowStats(!!checked)} />
                <Label htmlFor="show-stats" className="text-sm font-medium">Stats</Label>
            </div>
            <p className="text-sm text-muted-foreground w-1/3 text-center">
                Session: {sessionCorrect} / {sessionTotal}
            </p>
            <div className="w-1/3 flex justify-end">
                {answerStatus === 'idle' && (
                    <Button onClick={handleDontKnow} variant="outline" disabled={answerStatus !== 'idle'}>
                       I don't know
                    </Button>
                )}
            </div>
        </footer>
    </div>
  );
}
