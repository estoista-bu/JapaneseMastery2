"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { VocabularyWord, WordMasteryStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, ArrowRight, RefreshCw, XCircle, CheckCircle, ServerCrash, Volume2, Loader2, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { apiService } from '@/lib/api';
import { getContentTypeFromDeckCategory } from '@/lib/content-type-utils';

interface WeightedWord extends VocabularyWord {
  weight: number;
}

interface SpeechTestViewerProps {
  words: VocabularyWord[];
  userId: string;
  deckCategory?: string;
  isKana?: boolean;
}

type TestStatus = 'idle' | 'listening' | 'processing' | 'correct' | 'incorrect' | 'error';

// Helper to get the SpeechRecognition object, handling browser prefixes
const getSpeechRecognition = () => {
  if (typeof window !== 'undefined') {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }
  return null;
};

export function SpeechTestViewer({ words, userId, deckCategory, isKana = false }: SpeechTestViewerProps) {
  const [weightedWords, setWeightedWords] = useState<WeightedWord[]>([]);
  const [currentWord, setCurrentWord] = useState<WeightedWord | null>(null);
  const [status, setStatus] = useState<TestStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
        apiService.updatePronunciationStats(contentType, sessionCorrect, sessionTotal).catch(error => {
          console.error('Error saving pronunciation stats:', error);
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
      }
    }
  }, [weightedWords, currentWord, selectNextWord]);
  
  const goToNext = useCallback(() => {
    const nextWord = selectNextWord();
    if (nextWord) {
        setCurrentWord(nextWord);
    } else {
        setCurrentWord(null);
    }
    setTranscript('');
    setStatus('idle');
  }, [selectNextWord]);
  
   useEffect(() => {
     if (status !== 'idle' && nextButtonRef.current) {
         nextButtonRef.current.focus();
     }
  }, [status]);
  
  const handleGuess = useCallback(async (guessed: boolean) => {
    if (!currentWord) return;
    
    setSessionTotal(prev => prev + 1);
    if (guessed) {
      setSessionCorrect(prev => prev + 1);
      setStatus('correct');
      // For debug button, we won't have a transcript, so set a placeholder
      if (!transcript) setTranscript('Correct (Debug)');
    } else {
      setStatus('incorrect');
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
  }, [currentWord, transcript, deckCategory]);

  const checkAnswer = useCallback((spokenText: string) => {
    if (!currentWord) return;
    const normalizedSpoken = spokenText.replace(/\s/g, '');
    const normalizedReading = currentWord.reading.replace(/\s/g, '');
    const normalizedJapanese = currentWord.japanese.replace(/\s/g, '');

    const isCorrect = normalizedSpoken === normalizedReading || normalizedSpoken === normalizedJapanese;
    handleGuess(isCorrect);

  }, [currentWord, handleGuess]);
  
  useEffect(() => {
    if (transcript && status === 'processing') {
      checkAnswer(transcript);
    }
  }, [transcript, status, checkAnswer]);


  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    
    if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ja-JP';
        recognitionRef.current = recognition;
    }
    
    const recognition = recognitionRef.current;

    const handleResult = (event: SpeechRecognitionEvent) => {
      const speechResult = event.results[0][0].transcript;
      setStatus('processing');
      setTranscript(speechResult);
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      if (status === 'listening') {
        setStatus('error');
      }
    };
    
    const handleEnd = () => {
        if (status === 'listening') {
           setStatus('idle');
        }
    };

    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError);
    recognition.addEventListener('end', handleEnd);
    
    return () => {
      if (recognition) {
        recognition.removeEventListener('result', handleResult);
        recognition.removeEventListener('error', handleError);
        recognition.removeEventListener('end', handleEnd);
        recognition.stop();
      }
    };
  }, [status]);


  const handleStartListening = () => {
    if (recognitionRef.current && (status === 'idle' || status === 'error')) {
      try {
        setStatus('listening');
        setTranscript('');
        recognitionRef.current.start();
      } catch(e) {
        console.error("Could not start recognition", e);
        setStatus('error');
      }
    }
  };


  const handleRestart = () => {
    setSessionCorrect(0);
    setSessionTotal(0);
    setStatus('idle');
    setTranscript('');
    goToNext();
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis || isPlayingAudio || !currentWord) {
      return;
    }

    setIsPlayingAudio(true);
    const utterance = new SpeechSynthesisUtterance(currentWord.reading);
    utterance.lang = 'ja-JP';
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    
    window.speechSynthesis.speak(utterance);
  };


  if (!isSupported) {
    return (
      <div className="p-4 flex-1 flex items-center justify-center">
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Browser Not Supported</AlertTitle>
          <AlertDescription>
            Your browser does not support the Web Speech API. Please try Chrome or Safari.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentWord) {
     return (
        <div className="p-4 flex-1 flex items-center justify-center">
            <p>Loading...</p>
        </div>
     );
  }
  
  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (status === 'correct' || status === 'incorrect') {
        goToNext();
      } else if (status === 'idle' || status === 'error') {
        handleStartListening();
      }
    }
  };
  
  const maxWeight = Math.max(...weightedWords.map(w => w.weight), 1);

  return (
    <div className="flex flex-col w-full h-full" onKeyUp={handleKeyUp} tabIndex={0}>
       <div className="p-4 space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
           <Button onClick={handleRestart} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Score
            </Button>
          <p>Session Score: {sessionCorrect} / {sessionTotal}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="font-headline text-primary drop-shadow-sm text-7xl md:text-8xl break-all">
              {currentWord.japanese}
            </p>
            <p className="text-muted-foreground mt-2 text-xl">{currentWord.meaning}</p>
          </CardContent>
        </Card>
        
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

        <div className="w-full max-w-xs space-y-2">
           {status === 'idle' && (
            <div className="text-center mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGuess(true)}
                className="text-xs text-muted-foreground"
              >
                <Bug className="mr-2 h-3 w-3" />
                Debug: Mark as Correct
              </Button>
            </div>
          )}
          <Button 
            onClick={handleStartListening} 
            disabled={status !== 'idle' && status !== 'error'}
            size="lg"
            className={cn(
              "w-full",
              status === 'listening' && 'bg-blue-600 hover:bg-blue-700 animate-pulse'
            )}
          >
            {status === 'listening' ? <Mic className="mr-2 h-5 w-5"/> : <MicOff className="mr-2 h-5 w-5" />}
            {status === 'listening' ? 'Listening...' : 'Start Listening'}
          </Button>
        </div>
      </div>
      
      <div className="p-4 min-h-[120px]">
        {(status === 'correct' || status === 'incorrect') && (
          <div className="space-y-4 animate-in fade-in">
            <div className={cn(
              "p-4 rounded-lg text-center",
              status === 'correct' && 'bg-green-100 dark:bg-green-900/50',
              status === 'incorrect' && 'bg-red-100 dark:bg-red-900/50',
            )}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {status === 'correct' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {status === 'incorrect' && <XCircle className="h-5 w-5 text-red-600" />}
                <p className="text-lg font-semibold">{transcript || "No speech detected"}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                 <span>Correct:</span>
                 <span className="font-semibold text-accent">{currentWord.reading}</span>
                  <Button variant="ghost" size="icon" onClick={handlePlayAudio} disabled={isPlayingAudio} className="h-6 w-6">
                    {isPlayingAudio ? <Loader2 className="h-4 w-4 animate-spin"/> : <Volume2 className="h-4 w-4"/>}
                    <span className="sr-only">Play pronunciation</span>
                  </Button>
              </div>
            </div>
            
            {(status === 'correct' || status === 'incorrect') && (
              <Button ref={nextButtonRef} onClick={goToNext} className="w-full">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        {status === 'error' && (
           <Alert variant="destructive">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>An Error Occurred</AlertTitle>
            <AlertDescription>
                Speech recognition failed. Please check your microphone permissions and try again.
            </AlertDescription>
          </Alert>
        )}
      </div>
       <footer className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center space-x-2">
                <Checkbox id="show-stats" checked={showStats} onCheckedChange={(checked) => setShowStats(!!checked)} />
                <Label htmlFor="show-stats" className="text-sm font-medium">Stats</Label>
            </div>
            <div className="w-1/3 flex justify-end">
                 {/* Placeholder for potential right-side controls */}
            </div>
        </footer>
    </div>
  );
}
