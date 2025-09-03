"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Play, 
  Pause,
  Volume2,
  Target,
  Award
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface KanaCharacter {
  id: number;
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  category: string;
  order: number;
}

interface KanaPracticeProps {
  userId: string;
}

type PracticeMode = 'hiragana' | 'katakana' | 'mixed';
type PracticeCategory = 'basic' | 'dakuten' | 'handakuten' | 'combination' | 'all';

export function KanaPractice({ userId }: KanaPracticeProps) {
  const [kana, setKana] = useState<KanaCharacter[]>([]);
  const [currentKana, setCurrentKana] = useState<KanaCharacter | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('hiragana');
  const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('basic');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadKana();
  }, [practiceMode, practiceCategory]);

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
      
      if (kana.length > 0) {
        selectRandomKana();
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

  const selectRandomKana = () => {
    if (kana.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * kana.length);
    setCurrentKana(kana[randomIndex]);
    setInputValue('');
    setIsCorrect(null);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value.toLowerCase());
  };

  const handleSubmit = async () => {
    if (!currentKana) return;
    
    const isAnswerCorrect = inputValue.toLowerCase() === currentKana.romaji.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
      toast({
        title: "Correct!",
        description: `${currentKana.character} = ${currentKana.romaji}`,
      });
    } else {
      toast({
        title: "Incorrect",
        description: `${currentKana.character} = ${currentKana.romaji}`,
        variant: "destructive",
      });
    }
    
    setTotal(prev => prev + 1);
    
    // Update kana practice stats
    try {
      await apiService.updateKanaStats('kana_practice', isAnswerCorrect ? 1 : 0, 1);
    } catch (error) {
      console.error('Failed to update kana stats:', error);
    }
    
    // Move to next kana after a short delay
    setTimeout(() => {
      selectRandomKana();
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const resetPractice = () => {
    setScore(0);
    setTotal(0);
    setIsCorrect(null);
    setInputValue('');
    selectRandomKana();
  };

  const speakKana = () => {
    if (!currentKana) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentKana.romaji);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  const getAccuracy = () => {
    return total > 0 ? (score / total) * 100 : 0;
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'basic': return 'Basic';
      case 'dakuten': return 'Dakuten';
      case 'handakuten': return 'Handakuten';
      case 'combination': return 'Combinations';
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kana Practice</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {score}/{total} ({getAccuracy().toFixed(1)}%)
          </Badge>
          <Button onClick={resetPractice} variant="outline" size="sm">
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
                  <TabsTrigger value="combination">Combinations</TabsTrigger>
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

      {/* Practice Area */}
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
              {/* Kana Character */}
              <div className="text-center">
                <div className="text-8xl font-bold mb-4">{currentKana.character}</div>
                <Badge variant="secondary">
                  {currentKana.type} - {currentKana.category}
                </Badge>
              </div>

              {/* Input */}
              <div className="space-y-4">
                <div className="text-center">
                  <label className="text-sm font-medium mb-2 block">
                    Enter the romaji pronunciation:
                  </label>
                  <Input
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type romaji here..."
                    className="text-center text-lg max-w-xs mx-auto"
                    autoFocus
                  />
                </div>

                {/* Feedback */}
                {isCorrect !== null && (
                  <div className="text-center">
                    {isCorrect ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Correct!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">Incorrect</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="text-center">
                  <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
                    <Play className="h-4 w-4 mr-2" />
                    Check Answer
                  </Button>
                </div>
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
                className="text-center p-2 border rounded hover:bg-muted cursor-pointer"
                title={`${char.character} = ${char.romaji}`}
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

