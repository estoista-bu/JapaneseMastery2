"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { VocabularyWord, WordGenerationOutput } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Brain, Plus } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { apiService } from "@/lib/api";

const formSchema = z.object({
  japanese: z.string().min(1, "Japanese word is required."),
  reading: z.string().min(1, "Reading is required."),
  meaning: z.string().min(1, "Meaning is required."),
  jlpt: z.string().optional(),
});

type VocabularyFormData = Omit<VocabularyWord, "id" | "deckId">;

interface AdminVocabularyFormProps {
  onSaveWords: (data: VocabularyFormData[], id?: string) => Promise<void>;
  wordToEdit: VocabularyWord | null;
  deckId: string;
  deckName: string;
  existingWords: string[];
  onLoadingChange?: (loading: boolean) => void;
  onCloseDialog?: () => void;
}

interface JishoResult {
  japanese: { word?: string; reading?: string }[];
  senses: { english_definitions: string[] }[];
  jlpt?: string[];
}

export function AdminVocabularyForm({ onSaveWords, wordToEdit, deckId, deckName, existingWords, onLoadingChange, onCloseDialog }: AdminVocabularyFormProps) {
  const { toast } = useToast();
  const form = useForm<VocabularyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      japanese: "",
      reading: "",
      meaning: "",
      jlpt: "",
    },
  });

  const [suggestions, setSuggestions] = useState<JishoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<WordGenerationOutput['words']>([]);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [numWordsToGenerate, setNumWordsToGenerate] = useState(5);
  const [autoAddWords, setAutoAddWords] = useState(false);

  const japaneseValue = useWatch({ control: form.control, name: 'japanese' });

  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (keyword.length < 2) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/jisho?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      if (data.data) {
        setSuggestions(data.data);
        setIsSuggestionsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (japaneseValue) {
      fetchSuggestions(japaneseValue);
    }
  }, [japaneseValue, fetchSuggestions]);

  const handleSuggestionClick = (suggestion: JishoResult) => {
    const japanese = suggestion.japanese[0]?.word || '';
    const reading = suggestion.japanese[0]?.reading || '';
    const meaning = suggestion.senses[0]?.english_definitions.join(', ') || '';
    const jlpt = suggestion.jlpt?.[0] || '';

    form.setValue('japanese', japanese);
    form.setValue('reading', reading);
    form.setValue('meaning', meaning);
    form.setValue('jlpt', jlpt);
    setIsSuggestionsOpen(false);
  };

  const onSubmit = async (data: VocabularyFormData) => {
    try {
      await onSaveWords([data]);
      form.reset();
      toast({
        title: "Word added successfully",
        description: `${data.japanese} has been added to the deck.`,
      });
    } catch (error) {
      toast({
        title: "Error adding word",
        description: "Failed to add word to deck. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateWords = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep('Initializing...');
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      setGenerationStep('Analyzing deck content...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setGenerationStep('Searching database...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Use admin-specific API method
      setGenerationStep('Generating word selection...');
      const sel = await apiService.selectWordsForAdminDeck({
        deck_slug: deckId,
        deck_title: deckName,
        num: numWordsToGenerate,
      });

      clearInterval(progressInterval);
      setGenerationProgress(95);
      setGenerationStep('Processing results...');
      
      // Small delay to show the processing step
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const selected = (sel.words || []).map((w: any) => ({
        japanese: w.japanese,
        reading: w.reading || '',
        meaning: w.english,
        jlpt: w.jlpt_level || '',
      }));

      const result = { words: selected };

      // Handle different scenarios
      if (result.words.length === 0) {
          setGenerationProgress(100);
          setGenerationStep('No words found');
          
          if (sel.constraints_exhausted) {
              toast({
                  title: "All Available Words Used",
                  description: `All ${sel.total_available} words matching your deck criteria have already been added to this deck.`,
                  variant: "destructive"
              });
          } else {
              toast({
                  title: "No More Words Found",
                  description: `No more relevant words found in the database for this deck.`,
                  variant: "destructive"
              });
          }
      } else if (autoAddWords) {
          // For auto-add, continue the loading process through word saving
          setGenerationProgress(95);
          setGenerationStep('Saving words to deck...');
          
          // Call onSaveWords and wait for it to complete
          await onSaveWords(result.words as VocabularyFormData[]);
          
          // Now that save is complete, we can reach 100%
          setGenerationProgress(100);
          setGenerationStep('Words added successfully!');
          
          // Small delay to show completion
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Loading will be cleared by the parent component
          return; // Exit early, don't clear loading state here
      } else {
          // For manual add, show results immediately
          setGenerationProgress(100);
          setGenerationStep('Words ready to add');
          
          if (sel.exhausted && result.words.length > 0) {
              const message = sel.constraints_exhausted 
                  ? `Found ${result.words.length} remaining words (all available with current constraints)`
                  : `Found ${result.words.length} words (less than requested ${numWordsToGenerate})`;
              
              toast({
                  title: "Partial Results",
                  description: message,
                  variant: "default"
              });
          } else {
              toast({
                  title: "Words Generated",
                  description: `${result.words.length} words have been generated and are ready to add.`,
                  variant: "default"
              });
          }
          setAiSuggestions(result.words);
      }

  } catch (error) {
      console.error("AI Word generation failed", error);
      toast({
          title: "Generation Failed",
          description: "Could not select words. Please try again.",
          variant: "destructive"
      })
      // Add delay for error notifications too
      await new Promise(resolve => setTimeout(resolve, 1000));
  } finally {
      setIsGenerating(false);
      // Only clear loading state if not auto-adding words (let handleSaveWords handle it)
      if (!autoAddWords) {
          setGenerationProgress(0);
          setGenerationStep('');
      }
  }
  };

  const handleAddGeneratedWords = async () => {
    if (aiSuggestions.length === 0) return;
    
    try {
      await onSaveWords(aiSuggestions as VocabularyFormData[]);
      setAiSuggestions([]);
      toast({
        title: "Words added successfully",
        description: `${aiSuggestions.length} words have been added to the deck.`,
      });
    } catch (error) {
      toast({
        title: "Error adding words",
        description: "Failed to add words to deck. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Word Addition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Individual Word
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="japanese"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Japanese</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} placeholder="漢字" />
                          {isLoading && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reading</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ひらがな" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="meaning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meaning</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="English meaning" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jlpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>JLPT Level (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="N5, N4, N3, N2, N1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Word"
                )}
              </Button>
            </form>
          </Form>

          {/* Jisho Suggestions */}
          {isSuggestionsOpen && suggestions.length > 0 && (
            <div className="mt-4">
              <Label>Suggestions from Jisho:</Label>
              <ScrollArea className="h-32 w-full rounded-md border p-2">
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="cursor-pointer rounded p-2 hover:bg-muted"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="font-medium">
                        {suggestion.japanese[0]?.word} ({suggestion.japanese[0]?.reading})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.senses[0]?.english_definitions.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Word Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Words with AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numWords">Number of words to generate</Label>
              <Input
                id="numWords"
                type="number"
                min="1"
                max="50"
                value={numWordsToGenerate}
                onChange={(e) => setNumWordsToGenerate(parseInt(e.target.value) || 5)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoAdd"
                checked={autoAddWords}
                onCheckedChange={(checked) => setAutoAddWords(checked as boolean)}
              />
              <Label htmlFor="autoAdd">Automatically add generated words</Label>
            </div>
          </div>

          <Button
            onClick={handleGenerateWords}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Words
              </>
            )}
          </Button>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{generationStep}</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Generated Words */}
          {aiSuggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Generated Words ({aiSuggestions.length})</Label>
                <Button
                  onClick={handleAddGeneratedWords}
                  size="sm"
                  variant="outline"
                >
                  Add All
                </Button>
              </div>
              <ScrollArea className="h-64 w-full rounded-md border p-2">
                <div className="space-y-2">
                  {aiSuggestions.map((word, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <div className="font-medium">
                          {word.japanese} ({word.reading})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {word.meaning}
                        </div>
                      </div>
                      <Button
                        onClick={() => onSaveWords([word as VocabularyFormData])}
                        size="sm"
                        variant="ghost"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
