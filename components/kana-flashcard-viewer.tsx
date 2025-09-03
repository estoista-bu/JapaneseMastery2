"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Shuffle, Volume2, RotateCcw, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface KanaCharacter {
  id: number;
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  category: string;
  order: number;
}

interface KanaFlashcardViewerProps {
  userId: string;
}

type PracticeMode = 'hiragana' | 'katakana' | 'mixed';
type PracticeCategory = 'basic' | 'dakuten' | 'handakuten' | 'small' | 'all';

export function KanaFlashcardViewer({ userId }: KanaFlashcardViewerProps) {
  const [kana, setKana] = useState<KanaCharacter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('hiragana');
  const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('basic');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shuffledKana, setShuffledKana] = useState<KanaCharacter[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadKana();
  }, [practiceMode, practiceCategory]);

  useEffect(() => {
    if (kana.length > 0) {
      const shuffled = [...kana].sort(() => Math.random() - 0.5);
      setShuffledKana(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [kana]);

  const loadKana = async () => {
    try {
      setLoading(true);
      let response;
      
      if (practiceMode === 'mixed') {
        response = await apiService.getAllKana(undefined, practiceCategory === 'all' ? undefined : practiceCategory);
        setKana(response.kana);
      } else {
        if (practiceMode === 'hiragana') {
          response = await apiService.getHiragana(practiceCategory === 'all' ? undefined : practiceCategory);
          setKana(response.hiragana);
        } else {
          response = await apiService.getKatakana(practiceCategory === 'all' ? undefined : practiceCategory);
          setKana(response.katakana);
        }
      }
    } catch (error) {
      console.error('Failed to load kana:', error);
      toast({
        title: "Error",
        description: "Failed to load kana characters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (direction: 'next' | 'prev') => {
    if (shuffledKana.length < 2) return;
    
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % shuffledKana.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + shuffledKana.length) % shuffledKana.length);
    }
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    const shuffled = [...kana].sort(() => Math.random() - 0.5);
    setShuffledKana(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const speakKana = () => {
    if (!currentKana) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentKana.romaji);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  const resetProgress = () => {
    setScore(0);
    setTotal(0);
  };

  const getAccuracy = () => {
    return total > 0 ? (score / total) * 100 : 0;
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'basic': return 'Basic';
      case 'dakuten': return 'Dakuten';
      case 'handakuten': return 'Handakuten';
      case 'small': return 'Small';
      default: return 'All';
    }
  };

  const getModeDisplayName = (mode: PracticeMode) => {
    switch (mode) {
      case 'hiragana': return 'Hiragana';
      case 'katakana': return 'Katakana';
      case 'mixed': return 'Mixed';
      default: return 'Hiragana';
    }
  };

  const currentKana = shuffledKana[currentIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RotateCcw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading kana...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kana Flash Cards</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {score}/{total} ({getAccuracy().toFixed(1)}%)
          </Badge>
          <Button onClick={resetProgress} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Practice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Practice Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Practice Mode</label>
              <Tabs value={practiceMode} onValueChange={(value) => setPracticeMode(value as PracticeMode)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="hiragana">Hiragana</TabsTrigger>
                  <TabsTrigger value="katakana">Katakana</TabsTrigger>
                  <TabsTrigger value="mixed">Mixed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Tabs value={practiceCategory} onValueChange={(value) => setPracticeCategory(value as PracticeCategory)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="dakuten">Dakuten</TabsTrigger>
                  <TabsTrigger value="handakuten">Handakuten</TabsTrigger>
                  <TabsTrigger value="small">Small</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Accuracy</span>
              <span>{getAccuracy().toFixed(1)}%</span>
            </div>
            <Progress value={getAccuracy()} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{total - score}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flash Card */}
      {currentKana && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Practice: {getModeDisplayName(practiceMode)} - {getCategoryDisplayName(practiceCategory)}</span>
              <Button onClick={speakKana} variant="outline" size="sm">
                <Volume2 className="h-4 w-4 mr-2" />
                Speak
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Flash Card */}
              <div
                className="group w-full h-72 [perspective:1000px] cursor-pointer"
                onClick={handleFlip}
                role="button"
                aria-label={`Kana flashcard for ${currentKana.character}. Click to flip.`}
              >
                <div
                  className={cn(
                    "relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d]",
                    isFlipped && "[transform:rotateY(180deg)]"
                  )}
                >
                  {/* Front of the card */}
                  <Card className={cn(
                    "absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center overflow-hidden",
                    isFlipped && "pointer-events-none"
                  )}>
                    <CardContent className="p-4 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-8xl font-bold text-primary mb-4">
                          {currentKana.character}
                        </p>
                        <Badge variant="secondary">
                          {currentKana.type} - {currentKana.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Back of the card */}
                  <Card className={cn(
                    "absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center overflow-hidden [transform:rotateY(180deg)]",
                    !isFlipped && "pointer-events-none"
                  )}>
                    <CardContent className="p-4 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-6xl font-bold text-primary mb-4">
                          {currentKana.romaji}
                        </p>
                        <p className="text-lg text-muted-foreground mb-2">
                          Pronunciation
                        </p>
                        <Badge variant="secondary">
                          {currentKana.type} - {currentKana.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleNavigation('prev')} 
                  disabled={shuffledKana.length < 2}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous kana</span>
                </Button>
                
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleShuffle} 
                    disabled={shuffledKana.length < 2}
                  >
                    <Shuffle className="h-4 w-4" />
                    <span className="sr-only">Shuffle kana</span>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {shuffledKana.length}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleNavigation('next')} 
                  disabled={shuffledKana.length < 2}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next kana</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Kana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Available Kana ({kana.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
            {kana.slice(0, 32).map((char) => (
              <div
                key={char.id}
                className={cn(
                  "text-center p-2 border rounded hover:bg-muted cursor-pointer transition-colors",
                  char.id === currentKana?.id && "bg-primary text-primary-foreground"
                )}
                title={`${char.character} = ${char.romaji}`}
                onClick={() => {
                  const index = shuffledKana.findIndex(k => k.id === char.id);
                  if (index !== -1) {
                    setCurrentIndex(index);
                    setIsFlipped(false);
                  }
                }}
              >
                <div className="text-lg font-medium">{char.character}</div>
                <div className="text-xs text-muted-foreground">{char.romaji}</div>
              </div>
            ))}
            {kana.length > 32 && (
              <div className="col-span-full text-center text-sm text-muted-foreground">
                +{kana.length - 32} more characters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
