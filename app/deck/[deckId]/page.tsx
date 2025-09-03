
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Eye, BrainCircuit, ListChecks, Volume2, RefreshCw, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { allDecks as initialDecks } from "@/data/decks";
import { allWords as initialWords } from "@/data/words";
import type { Deck, VocabularyWord, User, UserRole, WordMasteryStats } from "@/lib/types";
import { FlashcardViewer } from "@/components/flashcard-viewer";
import { MemoryTestViewer } from "@/components/memory-test-viewer";
import { VocabularyListViewer } from "@/components/vocabulary-list-viewer";
import { ListeningTestViewer } from "@/components/listening-test-viewer";
import { SpeechTestViewer } from "@/components/speech-test-viewer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VocabularyForm } from "@/components/vocabulary-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { apiService } from '@/lib/api';
import { getContentTypeFromDeckCategory } from '@/lib/content-type-utils';

type VocabularyFormData = Omit<VocabularyWord, "id" | "deckId">;
type DeckViewMode = "select" | "view" | "test" | "list" | "listening" | "speech";
const MASTERY_THRESHOLD = 10;

export default function DeckPage({ params: paramsProp }: { params: { deckId: string } }) {
  const router = useRouter();
  const params = use(paramsProp);
  const { deckId } = params;
  const { toast } = useToast();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [shuffledWords, setShuffledWords] = useState<VocabularyWord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [wordToEdit, setWordToEdit] = useState<VocabularyWord | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isUserDeck, setIsUserDeck] = useState(false);
  const [mode, setMode] = useState<DeckViewMode>("select");
  const [previousMode, setPreviousMode] = useState<DeckViewMode>("select");
  const [initialCardIndex, setInitialCardIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [masteryStats, setMasteryStats] = useState<Record<string, WordMasteryStats>>({});

  // Check if this is a kana deck - must be declared before useEffects
  const isKanaDeck = deckId === 'hiragana' || deckId === 'katakana';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await apiService.checkAuth();
        if (isAuthenticated) {
          const userData = await apiService.getCurrentUser();
          setUserId(userData.user.id);
          setUserRole(userData.user.role);
          setIsMounted(true);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);
  
  const refreshMasteryStats = (notify: boolean = false) => {
    if (!userId) return;
    const storedMasteryStats = JSON.parse(localStorage.getItem(`wordMasteryStats_${userId}`) || '{}');
    setMasteryStats(storedMasteryStats);
    if (notify) {
        toast({
        title: "Weights Refreshed",
        description: "The word list has been updated with the latest mastery data.",
        });
    }
  };

  const trackViewWords = async (contentType: string, count: number = 1) => {
    if (!userId) return;
    
    try {
      await apiService.updateViewWordsCount(contentType, count);
    } catch (error) {
      console.error('Failed to track view words:', error);
    }
  };

    useEffect(() => {
    if (!userId) return;

    refreshMasteryStats();

    const loadDeckAndWords = async () => {
    try {
      // Check if this is a kana deck
      if (deckId === 'hiragana' || deckId === 'katakana') {
        // Create a virtual kana deck
        const kanaDeck: Deck = {
          id: deckId,
          name: deckId === 'hiragana' ? 'Hiragana Practice' : 'Katakana Practice',
          description: deckId === 'hiragana' ? 'Learn and practice hiragana characters' : 'Learn and practice katakana characters',
          category: 'kana',
          jlpt_level: undefined,
          word_count: 0,
          slug: deckId,
        };
        
        setDeck(kanaDeck);
        setIsUserDeck(false);
        
        // Load kana from database
        try {
          let response;
          if (deckId === 'hiragana') {
            response = await apiService.getHiragana();
            const kanaWords: VocabularyWord[] = response.hiragana.map((kana: any) => ({
              id: `kana-${kana.id}`,
              japanese: kana.character,
              reading: kana.romaji,
              meaning: `${kana.type} ${kana.category}`,
              deckId: deckId,
              mastery: 0,
            }));
            setWords(kanaWords);
            setShuffledWords([...kanaWords].sort(() => Math.random() - 0.5));
          } else {
            response = await apiService.getKatakana();
            const kanaWords: VocabularyWord[] = response.katakana.map((kana: any) => ({
              id: `kana-${kana.id}`,
              japanese: kana.character,
              reading: kana.romaji,
              meaning: `${kana.type} ${kana.category}`,
              deckId: deckId,
              mastery: 0,
            }));
            setWords(kanaWords);
            setShuffledWords([...kanaWords].sort(() => Math.random() - 0.5));
          }
          return;
        } catch (kanaError) {
          console.error('Failed to load kana:', kanaError);
          // Fall back to local kana data
          const localKana = deckId === 'hiragana' ? 
            require('@/data/kana').hiragana : 
            require('@/data/kana').katakana;
          
          const kanaWords: VocabularyWord[] = localKana.map((kana: any, index: number) => ({
            id: `local-kana-${index}`,
            japanese: kana.j,
            reading: kana.r,
            meaning: deckId === 'hiragana' ? 'hiragana basic' : 'katakana basic',
            deckId: deckId,
            mastery: 0,
          }));
          
          setWords(kanaWords);
          setShuffledWords([...kanaWords].sort(() => Math.random() - 0.5));
          return;
        }
      }
      
      // First, try to load the deck from backend
      const response = await apiService.getDeck(deckId);
      const backendDeck = response.deck;
      
      if (backendDeck) {
        // Convert backend deck format to frontend format
        const convertedDeck: Deck = {
          id: backendDeck.slug,
          name: backendDeck.name,
          description: backendDeck.description || '',
          category: backendDeck.category,
          jlpt_level: backendDeck.jlpt_level,
          word_count: backendDeck.word_count,
          slug: backendDeck.slug,
        };
        
        setDeck(convertedDeck);
        
        // Convert backend words to frontend format
        const backendWords = backendDeck.words || [];
        const convertedWords: VocabularyWord[] = backendWords.map((word: any) => ({
          id: word.id.toString(),
          japanese: word.japanese,
          reading: word.reading || '',
          meaning: word.english, // Backend uses 'english', frontend expects 'meaning'
          deckId: deckId,
          mastery: 0,
        }));
        
        setWords(convertedWords);
        setShuffledWords([...convertedWords].sort(() => Math.random() - 0.5));
        
        // Check if this is a user deck (editable by the current user)
        const isUserOwnedDeck = backendDeck.category === 'user' && backendDeck.user_id === userId;
        setIsUserDeck(isUserOwnedDeck);
        
        return;
      }
    } catch (error) {
      console.log('Backend deck not found, trying local decks');
      // If it's a 404 error, the deck was likely deleted
      if (error instanceof Error && error.message.includes('Deck not found')) {
        console.log('Deck was deleted, redirecting to main page');
        router.push('/');
        return;
      }
    }

      // Fallback to local deck loading
      const userDecks: Deck[] = JSON.parse(localStorage.getItem(`userDecks_${userId}`) || "[]");
      const groupDecks: Deck[] = JSON.parse(localStorage.getItem('allGroupDecks') || '[]');
      const combinedDecks = [...initialDecks, ...userDecks, ...groupDecks];
      const uniqueDecks = Array.from(new Map(combinedDecks.map(deck => [deck.id, deck])).values());
      
      const currentDeck = uniqueDecks.find((d) => d.id === deckId) || null;
      setDeck(currentDeck);

      const deckIsCustom = userDecks.some(d => d.id === deckId) || groupDecks.some(d => d.id === deckId);
      
      if (currentDeck) {
        let loadedWords: VocabularyWord[] = [];
        const userWordsKey = currentDeck.category === 'group' ? `words_${deckId}` : `words_${deckId}_${userId}`;
        const storedUserWords = JSON.parse(localStorage.getItem(userWordsKey) || "[]");

        if (storedUserWords.length > 0) {
          loadedWords = storedUserWords;
          setIsUserDeck(true);
        } else if (deckIsCustom) {
           loadedWords = [];
           setIsUserDeck(true);
        } else {
          loadedWords = initialWords.filter((word) => word.deckId === deckId);
          setIsUserDeck(false);
        }
        setWords(loadedWords);
        setShuffledWords([...loadedWords].sort(() => Math.random() - 0.5));
      }
    };

    loadDeckAndWords();
  }, [deckId, userId]);
  
  // Track view words for all decks including kana
  useEffect(() => {
    if (!userId || words.length === 0) return;
    
    let contentType;
    if (isKanaDeck) {
      // Kana practice should count under provided decks
      contentType = 'provided_decks';
    } else {
      contentType = getContentTypeFromDeckCategory(deck?.category || '');
    }
    
    trackViewWords(contentType, words.length);
  }, [words.length, userId, isKanaDeck, deck?.category]);
  
  useEffect(() => {
    if (isMounted && isUserDeck && userId && deck) {
       const userWordsKey = deck.category === 'group' ? `words_${deck.id}` : `words_${deck.id}_${userId}`;
       localStorage.setItem(userWordsKey, JSON.stringify(words));
    }
     setShuffledWords([...words]);
  }, [words, deckId, isUserDeck, isMounted, userId, deck]);


  const handleSaveWords = async (wordsData: VocabularyFormData[], idToEdit?: string): Promise<void> => {
    if (!userId || !deck) return;
    
    try {
      if (idToEdit) {
        // Update existing word
        const wordToUpdate = words.find(w => w.id === idToEdit);
        if (wordToUpdate) {
          await apiService.updateWord(parseInt(idToEdit), {
            japanese: wordsData[0].japanese,
            reading: wordsData[0].reading,
            english: wordsData[0].meaning,
            jlpt_level: wordsData[0].jlpt as any,
          });
          
          const newWords = words.map((w) => (w.id === idToEdit ? { ...w, ...wordsData[0] } : w));
          setWords(newWords);
          
          toast({
            title: "Success!",
            description: `The word "${wordsData[0].japanese}" has been updated.`,
          });
        }
      } else {
        // Add new words to deck
        const addPromises = wordsData.map(async (data) => {
          const response = await apiService.addWordToDeck({
            deck_slug: deck.slug || '',
            japanese: data.japanese,
            reading: data.reading,
            english: data.meaning,
            jlpt_level: data.jlpt as any,
          });
          return response;
        });
        
        const responses = await Promise.all(addPromises);
        
        console.log(`Showing success toast for ${wordsData.length} words`);
        toast({
          title: "Success!",
          description: `${wordsData.length} new word(s) have been added.`,
        });
        
        // Reload deck and words from backend to get the actual IDs
        try {
          console.log('Reloading deck data after adding words...');
          console.log(`Current word count before refresh: ${words.length}`);
          
          // Add a delay to ensure backend has processed the words
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const response = await apiService.getDeck(deckId);
          const backendDeck = response.deck;
          
          if (backendDeck && backendDeck.words) {
            const convertedWords: VocabularyWord[] = backendDeck.words.map((word: any) => ({
              id: word.id.toString(),
              japanese: word.japanese,
              reading: word.reading || '',
              meaning: word.english, // Backend uses 'english', frontend expects 'meaning'
              deckId: deckId,
              mastery: 0,
            }));
            
            console.log(`Loaded ${convertedWords.length} words from backend`);
            console.log(`Word count after refresh: ${convertedWords.length}`);
            setWords(convertedWords);
            setShuffledWords([...convertedWords].sort(() => Math.random() - 0.5));
            
            // Small delay to ensure UI updates
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error('Failed to reload words from backend:', error);
        }
      }

      if (!isUserDeck) {
          setIsUserDeck(true);
          if (deck.category !== 'group') {
              const userDecks: Deck[] = JSON.parse(localStorage.getItem(`userDecks_${userId}`) || "[]");
              if (!userDecks.some(d => d.id === deckId) && deck) {
                  localStorage.setItem(`userDecks_${userId}`, JSON.stringify([...userDecks, deck]));
              }
          }
      }

      closeFormDialog();
    } catch (error) {
      console.error('Failed to save words:', error);
      toast({
        title: "Error",
        description: "Failed to save words. Please try again.",
        variant: "destructive",
      });
      // Clear loading state on error too
      setIsFormLoading(false);
    }
  };


  const handleRemoveWord = async (id: string) => {
    if (!deck) return;
    
    try {
      // Remove word from deck in backend
      await apiService.removeWordFromDeck(deck.slug, parseInt(id));
      
      // Update frontend state
      setWords((prev) => prev.filter((w) => w.id !== id));
      
      toast({
        title: "Success!",
        description: "Word removed from deck.",
      });
      
      if (!isUserDeck) {
        setIsUserDeck(true);
      }
    } catch (error) {
      console.error('Failed to remove word:', error);
      toast({
        title: "Error",
        description: "Failed to remove word. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditWord = (word: VocabularyWord) => {
    setWordToEdit(word);
    setIsFormOpen(true);
  };

  const handleSelectWordFromList = (word: VocabularyWord) => {
    const index = shuffledWords.findIndex(w => w.id === word.id);
    if (index !== -1) {
      setInitialCardIndex(index);
      setPreviousMode(mode);
      setMode('view');
    }
  }

  const handleShuffle = () => {
    const newShuffledWords = [...shuffledWords];
    for (let i = newShuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newShuffledWords[i], newShuffledWords[j]] = [newShuffledWords[j], newShuffledWords[i]];
    }
    setShuffledWords(newShuffledWords);
    setInitialCardIndex(0);
  };


  const handleSetMode = (newMode: DeckViewMode) => {
    if (newMode === 'list') {
        refreshMasteryStats();
        // Track view words count when user views the word list
        if (deck && userId) {
          let contentType;
          if (isKanaDeck) {
            // Kana practice should count under provided decks
            contentType = 'provided_decks';
          } else {
            contentType = getContentTypeFromDeckCategory(deck.category);
          }
          trackViewWords(contentType, words.length);
        }
    }
    setPreviousMode(mode);
    setMode(newMode);
  }

  const handleBack = () => {
    if (userRole === 'admin' && mode !== 'select') {
        router.push('/');
        return;
    }
    if (previousMode === 'list') {
        refreshMasteryStats();
    }
    setMode(previousMode);
    setPreviousMode('select');
  }
  
  const [isFormLoading, setIsFormLoading] = useState(false);

  const handleFormOpenChange = (open: boolean) => {
    console.log(`Form open change requested: ${open}, isFormLoading: ${isFormLoading}`);
    // Prevent closing the dialog while loading
    if (!open && isFormLoading) {
      console.log('Preventing dialog close due to loading state');
      return;
    }
    
    if (!open) {
      setWordToEdit(null);
    }
    setIsFormOpen(open);
    console.log(`Form open state set to: ${open}`);
  }

  const closeFormDialog = () => {
    console.log('Closing form dialog...');
    setIsFormLoading(false); // Clear loading state first
    setIsFormOpen(false);
    setWordToEdit(null);
    console.log('Form dialog closed');
  }

  const renderContent = () => {
    if (!isMounted || !userId) {
      return (
        <div className="p-4 text-center">
            <p className="text-lg font-semibold text-muted-foreground">Loading...</p>
        </div>
      );
    }
    if (!deck) {
      return (
        <div className="p-4 text-center">
            <p className="text-lg font-semibold text-muted-foreground">Deck not found.</p>
        </div>
      );
    }
    if (words.length === 0 && !isKanaDeck) {
      return (
        <div className="p-4 text-center flex flex-col items-center justify-center h-full">
            <p className="text-lg font-semibold text-muted-foreground mb-4">This deck is empty.</p>
            <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add First Word
            </Button>
        </div>
      );
    }

    switch (mode) {
      case "view":
        return <FlashcardViewer 
                    words={shuffledWords} 
                    isKana={isKanaDeck} 
                    onEdit={handleEditWord} 
                    onRemove={handleRemoveWord} 
                    onShuffle={handleShuffle} 
                    startIndex={initialCardIndex}
                    masteryStats={masteryStats}
                    masteryThreshold={MASTERY_THRESHOLD}
                    isEditable={isUserDeck}
                />;
      case "test":
        return <MemoryTestViewer words={words} userId={userId} isKana={isKanaDeck} deckCategory={deck.category} />;
       case "listening":
        return <ListeningTestViewer words={words} userId={userId} deckCategory={deck.category} />;
       case "speech":
        return <SpeechTestViewer words={words} userId={userId} deckCategory={deck.category} isKana={isKanaDeck} />;
       case "list":
        return <VocabularyListViewer 
                    words={shuffledWords} 
                    onEdit={handleEditWord} 
                    onRemove={handleRemoveWord} 
                    onSelectWord={handleSelectWordFromList} 
                    masteryStats={masteryStats}
                    masteryThreshold={MASTERY_THRESHOLD}
                    onRefreshStats={() => refreshMasteryStats(true)}
                    isEditable={isUserDeck}
                    isKana={isKanaDeck}
                />;
      case "select":
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <Card onClick={() => handleSetMode('list')} className="p-6 text-center cursor-pointer hover:bg-muted transition-colors">
                <ListChecks className="h-10 w-10 mx-auto text-primary/80 mb-2"/>
                <h2 className="text-lg font-bold">{isKanaDeck ? "View Kana" : "View Words"}</h2>
                <p className="text-sm text-muted-foreground">See all words in the deck.</p>
                </Card>
                {userRole !== 'admin' && (
                <Card onClick={() => handleSetMode('test')} className="p-6 text-center cursor-pointer hover:bg-muted transition-colors">
                    <BrainCircuit className="h-10 w-10 mx-auto text-accent mb-2"/>
                    <h2 className="text-lg font-bold">Memory Test</h2>
                    <p className="text-sm text-muted-foreground">Test your recall.</p>
                </Card>
                )}
                {userRole !== 'admin' && !isKanaDeck && (
                <Card onClick={() => handleSetMode('listening')} className="p-6 text-center cursor-pointer hover:bg-muted transition-colors">
                    <Volume2 className="h-10 w-10 mx-auto text-accent mb-2"/>
                    <h2 className="text-lg font-bold">Listening Test</h2>
                    <p className="text-sm text-muted-foreground">Test listening comprehension.</p>
                </Card>
                )}
                 {userRole !== 'admin' && (
                <Card onClick={() => handleSetMode('speech')} className="p-6 text-center cursor-pointer hover:bg-muted transition-colors">
                    <Mic className="h-10 w-10 mx-auto text-accent mb-2"/>
                    <h2 className="text-lg font-bold">Speech Test</h2>
                    <p className="text-sm text-muted-foreground">Test your pronunciation.</p>
                </Card>
                )}
            </div>
          </div>
        );
    }
  }

  const getHeaderTitle = () => {
    if (mode === "select") return deck?.name || "...";
    if (mode === "view") return `${deck?.name || "..."} - Word View`;
    if (mode === "test") return `${deck?.name || "..."} - Memory Test`;
    if (mode === "listening") return `${deck?.name || "..."} - Listening Test`;
    if (mode === "speech") return `${deck?.name || "..."} - Speech Test`;
    if (mode === "list") return `${deck?.name || "..."} - Word List`;
    return deck?.name || "...";
  }

  const canAddWords = !isKanaDeck && mode !== 'test' && mode !== 'listening' && mode !== 'speech' && isUserDeck;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800">
        <div className="w-full max-w-5xl bg-background flex flex-col min-h-screen md:min-h-0 md:my-4 md:rounded-lg md:shadow-lg">
            <Sheet open={isFormOpen} onOpenChange={handleFormOpenChange}>
                <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                    {mode === 'select' ? (
                       <Link href="/" passHref>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Decks</span>
                        </Button>
                       </Link>
                    ) : (
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Mode Select</span>
                        </Button>
                    )}
                    <h1 className="font-headline text-xl font-bold text-primary truncate px-2">
                        {getHeaderTitle()}
                    </h1>
                    
                    {canAddWords ? (
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="w-8 h-8">
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Add Word</span>
                            </Button>
                        </SheetTrigger>
                    ) : <div className="w-8 h-8"></div>}
                </header>

                <main className="flex-1 flex flex-col">
                   {renderContent()}
                </main>

                <SheetContent side="bottom" className="rounded-t-lg">
                    <SheetHeader>
                        <SheetTitle className="font-headline flex items-center gap-2">
                            {wordToEdit ? "Edit Word" : "Add New Word"}
                            {isFormLoading && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    <span>Processing...</span>
                                </div>
                            )}
                        </SheetTitle>
                        <SheetDescription>
                            {wordToEdit ? "Update the details for this vocabulary word." : `Add a new word to the "${deck?.name}" deck.`}
                        </SheetDescription>
                    </SheetHeader>
                    <VocabularyForm
                        onSaveWords={handleSaveWords}
                        wordToEdit={wordToEdit}
                        deckId={deckId}
                        deckName={deck?.name || ''}
                        existingWords={words.map(w => w.japanese)}
                        onLoadingChange={setIsFormLoading}
                        onCloseDialog={closeFormDialog}
                    />
                </SheetContent>
            </Sheet>
        </div>
    </div>
  );
}
