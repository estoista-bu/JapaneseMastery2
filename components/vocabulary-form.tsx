
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { VocabularyWord, WordGenerationOutput } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Brain } from "lucide-react";
import { generateWords } from "@/ai/flows/generate-words-flow";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";

const formSchema = z.object({
  japanese: z.string().min(1, "Japanese word is required."),
  reading: z.string().min(1, "Reading is required."),
  meaning: z.string().min(1, "Meaning is required."),
  jlpt: z.string().optional(),
});

type VocabularyFormData = Omit<VocabularyWord, "id" | "deckId">;

interface VocabularyFormProps {
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

export function VocabularyForm({ onSaveWords, wordToEdit, deckId, deckName, existingWords, onLoadingChange, onCloseDialog }: VocabularyFormProps) {
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
      } else {
        setSuggestions([]);
        setIsSuggestionsOpen(false);
      }
    } catch (error) {
      console.error("Failed to fetch Jisho suggestions", error);
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (wordToEdit || !japaneseValue) {
      setIsSuggestionsOpen(false);
      return;
    };
    
    const handler = setTimeout(() => {
      fetchSuggestions(japaneseValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [japaneseValue, fetchSuggestions, wordToEdit]);

  useEffect(() => {
    if (wordToEdit) {
      form.reset(wordToEdit);
    } else {
      form.reset({
        japanese: "",
        reading: "",
        meaning: "",
        jlpt: "",
      });
    }
  }, [wordToEdit, form]);

  async function onSubmit(values: VocabularyFormData) {
    onLoadingChange?.(true); // Set loading state for regular form submission
    await onSaveWords([values], wordToEdit?.id);
    form.reset();
    setIsSuggestionsOpen(false);
    setAiSuggestions([]);
    // Note: onLoadingChange(false) will be called by the parent component after onSaveWords completes
  }

  const handleSuggestionClick = (result: JishoResult) => {
    const japanese = result.japanese[0]?.word || result.japanese[0]?.reading || "";
    const reading = result.japanese[0]?.reading || "";
    const meaning = result.senses[0]?.english_definitions.join(', ') || "";
    const jlptLevel = result.jlpt?.[0] || "";

    form.setValue("japanese", japanese, { shouldValidate: true });
    form.setValue("reading", reading, { shouldValidate: true });
    form.setValue("meaning", meaning, { shouldValidate: true });
    form.setValue("jlpt", jlptLevel.replace('jlpt-','').toUpperCase());

    setIsSuggestionsOpen(false);
    setSuggestions([]);
  };
  
  const handleAiSuggestionClick = (word: VocabularyFormData) => {
    form.setValue("japanese", word.japanese, { shouldValidate: true });
    form.setValue("reading", word.reading, { shouldValidate: true });
    form.setValue("meaning", word.meaning, { shouldValidate: true });
    form.setValue("jlpt", word.jlpt || "");
    setAiSuggestions([]);
  };
  
  const handleGenerateWords = async () => {
    setIsGenerateDialogOpen(false);
    setIsGenerating(true);
    onLoadingChange?.(true); // Notify parent component about loading state
    setAiSuggestions([]);
    setGenerationProgress(0);
    setGenerationStep('Initializing AI word generation...');
    
    try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => {
                if (prev >= 85) return prev;
                return prev + Math.random() * 8;
            });
        }, 1000);

        setGenerationStep('Analyzing deck title and requirements...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setGenerationStep('Searching database for relevant words...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setGenerationStep('Applying AI filters and semantic search...');
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Prefer backend DB-assisted selection to avoid repeats
        const backend = await import('@/lib/api');
        const deckTitle = deckName;
        
        setGenerationStep('Generating word selection...');
        const sel = await backend.apiService.selectWordsForDeck({
          deck_slug: deckId,
          deck_title: deckTitle,
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
            onLoadingChange?.(false); // Notify parent component that loading is complete
        }
        setGenerationProgress(0);
        setGenerationStep('');
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="relative">
          <FormField
            control={form.control}
            name="japanese"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Japanese Word (Kanji, etc.)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="例えば: 日本語" 
                    {...field} 
                    autoComplete="off"
                    onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
                    onFocus={() => { if(suggestions.length > 0) setIsSuggestionsOpen(true) }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isSuggestionsOpen && (
            <Card className="absolute z-10 w-full mt-1 bg-background shadow-lg max-h-60 overflow-y-auto">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(result);
                      }}
                    >
                      <p className="font-semibold">{result.japanese[0]?.word || result.japanese[0]?.reading}</p>
                      <p className="text-sm text-muted-foreground">{result.senses[0]?.english_definitions.join(', ')}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-muted-foreground">No results found.</p>
                )}
              </ScrollArea>
            </Card>
          )}
        </div>
        <FormField
          control={form.control}
          name="reading"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reading (Hiragana/Katakana)</FormLabel>
              <FormControl>
                <Input placeholder="例えば: にほんご" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meaning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meaning</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Japanese language" {...field} />
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
                <Input placeholder="e.g. N5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!wordToEdit && (
            <div className="space-y-2">
                 <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full"
                            disabled={isGenerating}
                        >
                             {isGenerating ? (
                                <Brain className="mr-2 h-4 w-4 animate-pulse"/>
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4 text-accent"/>
                            )}
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate Words</DialogTitle>
                            <DialogDescription>
                                How many new words would you like to generate for the deck "{deckName}"?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                           <div>
                                <Label htmlFor="numWords">Number of words (1-100)</Label>
                                <Input
                                    id="numWords"
                                    type="text"
                                    inputMode="numeric"
                                    value={numWordsToGenerate}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        setNumWordsToGenerate(Math.max(1, Math.min(100, parseInt(value, 10) || 1)))
                                    }}
                                    className="mt-2"
                                />
                           </div>
                           <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="autoAdd" 
                                    checked={autoAddWords} 
                                    onCheckedChange={(checked) => setAutoAddWords(!!checked)}
                                />
                                <Label
                                    htmlFor="autoAdd"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Add to deck automatically
                                </Label>
                           </div>
                           <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300 [&>svg]:text-orange-600">
                             <AlertDescription className="text-xs">
                                AI can make mistakes. Please confirm with external sources if you are unsure.
                             </AlertDescription>
                           </Alert>
                           <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 [&>svg]:text-blue-600">
                             <AlertDescription className="text-xs">
                                ⏱️ Large requests (50+ words) may take up to 10 minutes. The system will show progress updates.
                             </AlertDescription>
                           </Alert>
                           <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300 [&>svg]:text-yellow-600">
                             <AlertDescription className="text-xs">
                                📊 If you request more words than available (e.g., 100 N5 verbs when only 50 exist), the system will return all remaining words and notify you.
                             </AlertDescription>
                           </Alert>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                               <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleGenerateWords}>
                                Generate
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>

                {isGenerating && (
                    <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
                        <div className="flex items-center justify-center space-x-2">
                            <Brain className="h-5 w-5 animate-pulse text-primary" />
                            <h3 className="font-semibold text-lg">AI Word Generation</h3>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{Math.round(generationProgress)}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${generationProgress}%` }}
                                />
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">{generationStep}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                This may take up to 10 minutes for large requests
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Processing with AI and semantic search...</span>
                        </div>
                    </div>
                )}
                
                {aiSuggestions.length > 0 && (
                     <Card className="p-2">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">Suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                            {aiSuggestions.map((word, i) => (
                                <Button key={i} type="button" variant="secondary" size="sm" onClick={() => handleAiSuggestionClick(word as VocabularyFormData)}>
                                    {word.japanese}
                                </Button>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        )}
        
        <Button
          type="submit"
          className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={form.formState.isSubmitting || isGenerating}
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Word"}
        </Button>
      </form>
    </Form>
  );
}
