
"use client";

import { useState, useEffect } from "react";
import { X, Pencil, Volume2, Loader2,ThumbsUp, ThumbsDown, Star } from "lucide-react";
import * as wanakana from 'wanakana';
import { cn } from "@/lib/utils";
import type { VocabularyWord, SentenceGenerationOutput, Difficulty } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { generateSentence } from "@/ai/flows/generate-sentence-flow";
import { useToast } from "@/hooks/use-toast";
import { GeneratedSentence } from "./generated-sentence";
import { Badge } from "./ui/badge";

interface FlashcardProps {
  word: VocabularyWord;
  onRemove?: () => void;
  onEdit?: () => void;
  isKana?: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  mode?: "view" | "test";
  onGuess?: (guessed: boolean) => void;
  isMastered?: boolean;
  isEditable?: boolean;
}

export function Flashcard({ 
    word, 
    onRemove, 
    onEdit, 
    isKana = false, 
    isFlipped, 
    onFlip,
    mode = "view",
    onGuess,
    isMastered = false,
    isEditable = true,
}: FlashcardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedSentence, setGeneratedSentence] = useState<SentenceGenerationOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleGuess = (e: React.MouseEvent, guessed: boolean) => {
    e.stopPropagation();
    onGuess?.(guessed);
  }

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis || isPlaying) {
      return;
    }

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(word.reading || word.japanese);
    utterance.lang = 'ja-JP';
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };
  
  const getRomaji = (reading: string) => {
    if (reading === "こんにちは") return "konnichiwa";
    if (reading === "こんばんは") return "konbanwa";
    // The particle 'は' is pronounced 'wa'
    if (reading.endsWith("は") && reading.length > 1) {
        return wanakana.toRomaji(reading.slice(0, -1)) + "wa";
    }
    // The particle 'へ' is pronounced 'e'
    if (reading.endsWith("へ") && reading.length > 1) {
        return wanakana.toRomaji(reading.slice(0, -1)) + "e";
    }
    return wanakana.toRomaji(reading);
  }

  const handleGenerateSentence = async (e: React.MouseEvent, difficulty: Difficulty) => {
    e.stopPropagation();
    setIsGenerating(true);
    setGeneratedSentence(null);
    try {
      const result = await generateSentence({ word, difficulty });
      setGeneratedSentence(result);
    } catch (error) {
      console.error("Sentence generation failed", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a sentence. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetSentenceGeneration = () => {
    setGeneratedSentence(null);
  }


  const japaneseWordLength = word.japanese.length;
  let fontSizeClass = "text-5xl";
  if (japaneseWordLength > 10) {
    fontSizeClass = "text-3xl";
  } else if (japaneseWordLength > 6) {
    fontSizeClass = "text-4xl";
  }


  const editButtons = !isKana && mode === "view" && isEditable ? (
    <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={handleEdit}
        aria-label={`Edit ${word.japanese}`}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={stopPropagation}
                aria-label={`Remove ${word.japanese}`}
              >
                <X className="h-4 w-4" />
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={stopPropagation}>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the word
                  <span className="font-semibold text-foreground"> {word.japanese}</span> from your list.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove}>Continue</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  ) : null;

  const memoryTestControls = mode === 'test' && isFlipped && (
     <div className="w-full px-4 pb-2">
        <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white" onClick={(e) => handleGuess(e, false)}>
                <ThumbsDown className="mr-2 h-5 w-5"/>
                Didn't Know
            </Button>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" onClick={(e) => handleGuess(e, true)}>
                <ThumbsUp className="mr-2 h-5 w-5"/>
                Knew It
            </Button>
        </div>
     </div>
  );

  const sentenceGenerator = !isKana && (
    <div className="border-t w-full p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="px-2">
        <GeneratedSentence 
          sentence={generatedSentence} 
          isLoading={isGenerating} 
          onGenerateAnother={resetSentenceGeneration}
          getRomaji={getRomaji}
        />
      </div>
      {!generatedSentence && !isGenerating && (
         <div className="flex justify-center gap-2">
            {(['Basic', 'Advanced'] as Difficulty[]).map((level) => (
                <Button
                    key={level}
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleGenerateSentence(e, level)}
                    disabled={isGenerating}
                >
                    {level}
                </Button>
            ))}
        </div>
      )}
    </div>
  );


  return (
    <div
      className="group w-full h-full [perspective:1000px] cursor-pointer"
      onClick={onFlip}
      role="button"
      aria-label={`Flashcard for ${word.japanese}. Click to flip.`}
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
          {isMastered && mode === 'view' && (
              <div className="absolute top-2 left-2 z-20">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
          )}
          <CardContent className="p-4 flex items-center justify-center">
            <p className={cn(
              "font-headline text-center text-primary drop-shadow-sm",
              "break-all",
              isKana ? "text-8xl" : fontSizeClass
            )}>
              {word.japanese}
            </p>
          </CardContent>
        </Card>

        {/* Back of the card */}
        <Card className={cn(
            "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-between overflow-hidden",
            !isFlipped && "pointer-events-none"
            )}>
            {editButtons}
           <div className="w-full flex-grow flex flex-col items-center justify-center p-4 text-center">
            {word.jlpt && (
                <div className="absolute top-2 left-2 z-20" onClick={(e) => e.stopPropagation()}>
                    <Badge variant="secondary">{word.jlpt}</Badge>
                </div>
            )}
            <div className="flex items-center justify-center relative w-full">
              <div className="flex-1">
                <p className="font-body text-3xl font-semibold text-accent break-all">
                  {word.reading}
                </p>
                <p className="text-muted-foreground mt-1 text-lg">{getRomaji(word.reading)}</p>
                <p className="text-muted-foreground mt-4 text-xl">{word.meaning}</p>
              </div>
              <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePlayAudio} 
                  disabled={isPlaying}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-accent"
                  aria-label="Play pronunciation"
                >
                  {isPlaying ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
            </div>
           </div>

           {memoryTestControls}
           {isFlipped && mode === 'view' && sentenceGenerator}
        </Card>
      </div>
    </div>
  );
}
