
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { apiService } from '@/lib/api';
import type { VocabularyWord } from '@/lib/types';
import * as wanakana from 'wanakana';
import { getContentTypeFromDeckCategory } from '@/lib/content-type-utils';

interface WordMasteryStats {
  correct: number;
  incorrect: number;
  weight: number;
}

type TestStatus = 'idle' | 'correct' | 'incorrect';

type AnswerStatus = "idle" | "correct" | "incorrect";

interface WeightedWord extends VocabularyWord {
  weight: number;
}

interface MemoryTestViewerProps {
  words: VocabularyWord[];
  isKana?: boolean;
  userId: string;
  deckCategory?: string;
}

export function MemoryTestViewer({ words, isKana = false, userId, deckCategory }: MemoryTestViewerProps) {
  const [weightedWords, setWeightedWords] = useState<WeightedWord[]>([]);
  const [currentWord, setCurrentWord] = useState<WeightedWord | null>(null);
  const [status, setStatus] = useState<TestStatus>('idle');
  const [inputValue, setInputValue] = useState('');
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle');
  const [isEnterLocked, setIsEnterLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // This effect runs when the component unmounts (e.g., user clicks back)
  useEffect(() => {
    return () => {
      if (sessionTotal > 0) {
        // Save session stats to database with content type
        let contentType;
        if (isKana) {
          // Kana practice should count under provided decks
          contentType = 'provided_decks';
        } else {
          contentType = getContentTypeFromDeckCategory(deckCategory);
        }
        apiService.updateMemoryStats(contentType, sessionCorrect, sessionTotal).catch(error => {
          console.error('Error saving memory stats:', error);
        });
      }
    };
  }, [sessionCorrect, sessionTotal, deckCategory, isKana]);

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
    // Fallback in case of floating point issues
    return weightedWords[weightedWords.length - 1];
  }, [weightedWords]);

  useEffect(() => {
    if (weightedWords.length > 0 && !currentWord) {
      const firstWord = selectNextWord();
      if (firstWord) {
        setCurrentWord(firstWord);
        setIsEnterLocked(true); // Lock on initial load
      }
    }
  }, [weightedWords, currentWord, selectNextWord]);
  
  useEffect(() => {
    if (currentWord) {
      const timer = setTimeout(() => {
        setIsEnterLocked(false);
      }, 200); // 200ms delay to prevent instant enter
      return () => clearTimeout(timer);
    }
  }, [currentWord]);

  const goToNext = useCallback(() => {
    const nextWord = selectNextWord();
    if (nextWord) {
        setCurrentWord(nextWord);
    } else {
        // Handle case where all words are exhausted or no words are available
        setCurrentWord(null);
    }
    setInputValue('');
    if (inputRef.current) inputRef.current.value = '';
    setAnswerStatus('idle');
    setIsEnterLocked(true);
  }, [selectNextWord]);
  
  useEffect(() => {
    if (inputRef.current) {
      if (answerStatus === 'idle') {
        // Bind wanakana with proper configuration
        wanakana.bind(inputRef.current, { 
          IMEMode: 'toHiragana'
        });
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

  // Ensure wanakana is bound when currentWord changes
  useEffect(() => {
    if (inputRef.current && currentWord && answerStatus === 'idle') {
      // Re-bind wanakana when word changes
      try {
        if (inputRef.current.dataset.wanakana) {
          wanakana.unbind(inputRef.current);
        }
        wanakana.bind(inputRef.current, { 
          IMEMode: 'toHiragana'
        });
        inputRef.current.focus();
      } catch (error) {
        console.warn('Error binding wanakana:', error);
      }
    }
  }, [currentWord, answerStatus]);
  
  const handleGuess = useCallback(async (guessed: boolean, answer: string) => {
    if (!currentWord || answerStatus !== 'idle') return;
    
    // Update session stats
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
      let contentType;
      if (isKana) {
        // Kana practice should count under provided decks
        contentType = 'provided_decks';
      } else {
        contentType = getContentTypeFromDeckCategory(deckCategory);
      }
      await apiService.updateWordMasteryStats(contentType, masteryStats);

      setWeightedWords(prevWords => {
          return prevWords.map(w => {
              if (w.id === currentWord.id) {
                  return { ...w, weight: currentWeight };
              }
              return w;
          });
      });
    } catch (error) {
      console.error('Error updating word mastery stats:', error);
    }

    setAnswerStatus(guessed ? 'correct' : 'incorrect');
  }, [currentWord, answerStatus, deckCategory]);

  const checkAnswer = (answer: string) => {
    if (!currentWord) return false;
    
    const normalizedAnswer = answer.trim().toLowerCase();
    // For both kana and memory tests, we expect hiragana input against the reading
    const correctAnswer = currentWord.reading;
    const normalizedCorrect = correctAnswer.toLowerCase();
    
    return normalizedAnswer === normalizedCorrect;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEnterLocked) return;
    
    const isCorrect = checkAnswer(inputValue);
    handleGuess(isCorrect, inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isEnterLocked) {
      e.preventDefault();
      e.stopPropagation();
      const visibleInput = inputRef.current?.value || '';
      const converted = wanakana.toHiragana(visibleInput.trim());
      const isCorrect = checkAnswer(converted);
      handleGuess(isCorrect, converted);
    }
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    // This fires when IME composition ends (wanakana finishes conversion)
    // setInputValue(e.currentTarget.value); // Removed as per new logic
  };

  const handleDontKnow = () => {
    if (isEnterLocked) return;
    handleGuess(false, '');
  };

  const getBackgroundColor = () => {
    if (answerStatus === 'correct') return 'bg-green-50 border-green-200';
    if (answerStatus === 'incorrect') return 'bg-red-50 border-red-200';
    return 'bg-white border-gray-200';
  };

  const getInputBorderColor = () => {
    if (answerStatus === 'correct') return 'border-green-500';
    if (answerStatus === 'incorrect') return 'border-red-500';
    return 'border-gray-300';
  };

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No words available for testing.</p>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">All words completed!</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className={getBackgroundColor()}>
        <CardHeader>
          <CardTitle className="text-center">
            {isKana ? 'Reading Test' : 'Memory Test'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="text-center text-sm text-gray-600">
            Session: {sessionCorrect}/{sessionTotal} correct
          </div>

          {/* Word Display */}
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-gray-800">
              {isKana ? currentWord.reading : currentWord.japanese}
            </div>
            {/* Remove the hiragana reading below the kanji */}
            {/*
            {!isKana && currentWord.reading && (
              <div className="text-sm text-gray-500">
                {currentWord.reading}
              </div>
            )}
            */}
          </div>

          {/* Answer Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium text-gray-700">
                {isKana ? 'Enter the reading:' : 'Enter the Japanese:'}
              </label>
              <Input
                ref={inputRef}
                id="answer"
                type="text"
                onKeyDown={handleKeyDown}
                className={`w-full ${getInputBorderColor()}`}
                placeholder={isKana ? "ひらがな" : "漢字"}
                disabled={answerStatus !== 'idle'}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  if (!isEnterLocked && answerStatus === 'idle') {
                    const visibleInput = inputRef.current?.value || '';
                    const converted = wanakana.toHiragana(visibleInput.trim());
                    const isCorrect = checkAnswer(converted);
                    handleGuess(isCorrect, converted);
                  }
                }}
                disabled={isEnterLocked || answerStatus !== 'idle'}
                className="flex-1"
              >
                {answerStatus === 'idle' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check
                  </>
                ) : answerStatus === 'correct' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Correct!
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Incorrect
                  </>
                )}
              </Button>
              
              {answerStatus === 'idle' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDontKnow}
                  disabled={isEnterLocked}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Don't Know
                </Button>
              )}
            </div>

            {/* Next Button */}
            {answerStatus !== 'idle' && (
              <Button
                ref={nextButtonRef}
                type="button"
                onClick={goToNext}
                className="w-full"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Next Word
              </Button>
            )}
          </div>

          {/* Correct Answer & Meaning Display */}
          {answerStatus !== 'idle' && currentWord && (
            <div
              className={`text-center p-3 rounded-lg space-y-2 ${
                answerStatus === 'correct' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  answerStatus === 'correct' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                Correct answer: <span className="font-bold">{currentWord.reading}</span>
              </p>
              {currentWord.meaning && (
                <p className="text-sm text-gray-700">
                  Meaning: <span className="font-medium">{currentWord.meaning}</span>
                </p>
              )}
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
