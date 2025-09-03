
"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VocabularyManager } from "@/components/vocabulary-manager";
import { GrammarGuide } from "@/components/grammar-guide";
import { BookOpen, Milestone, ArrowLeft, Users, LogOut, BarChart, Target, User as UserIcon } from "lucide-react";
import type { Deck, GrammarLesson, Quiz, User as UserType, UserRole } from "@/lib/types";
import { allDecks as initialDecks } from "@/data/decks";
import { DictionarySearch } from "@/components/dictionary-search";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AiQuizGenerator } from "@/components/ai-quiz-generator";
import { StatsPage } from "@/components/stats-page";
import { KanaPractice } from "@/components/kana-practice";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { apiService } from '@/lib/api';

type AppView = "vocabulary" | "grammar" | "stats";
type GrammarView = "main" | "lessons" | "lesson" | "quizzes" | "quiz" | "checker" | "ai-quiz-generator";
type VocabularyView = "decks" | "dictionary";

export default function AppPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<AppView>("vocabulary");
  const [vocabularyView, setVocabularyView] = useState<VocabularyView>("decks");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for stored token and validate with backend
        const isAuthenticated = await apiService.checkAuth();
        if (isAuthenticated) {
          const userData = await apiService.getCurrentUser();
          setCurrentUser(userData.user);
          setShowLoginPrompt(false);
        } else {
          setShowLoginPrompt(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setShowLoginPrompt(true);
      } finally {
        setIsMounted(true);
      }
    };

    checkAuth();
  }, [router]);



  useEffect(() => {
    if (!currentUser) return;
  
    const loadDecksAndQuiz = async () => {
      await loadDecksFromBackend();
      
      const storedAiQuiz = sessionStorage.getItem(`ai-generated-quiz_${currentUser.id}`);
      if (storedAiQuiz) {
        setSelectedQuiz(JSON.parse(storedAiQuiz));
      }
    };

    loadDecksAndQuiz();
  }, [currentUser]);







  const [grammarView, setGrammarView] = useState<GrammarView>("main");
  const [selectedLesson, setSelectedLesson] = useState<GrammarLesson | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [animation, setAnimation] = useState<'in' | 'out' | null>(null);

  const loadDecksFromBackend = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoadingDecks(true);
      const response = await apiService.getDecks();
      const backendDecks = response.decks || [];
      
      // Convert backend deck format to frontend format
      const convertedDecks = backendDecks.map((deck: any) => ({
        id: deck.slug, // Use slug as ID for consistency
        name: deck.name,
        description: deck.description || '',
        category: deck.category,
        jlpt_level: deck.jlpt_level,
        word_count: deck.word_count,
        slug: deck.slug,
      }));
      
      setDecks(convertedDecks);
    } catch (error) {
      console.error('Failed to load decks from backend:', error);
      // Fallback to initial decks
      setDecks(initialDecks);
    } finally {
      setIsLoadingDecks(false);
    }
  }, [currentUser]);

  const saveDeck = async (deckData: any, id?: string) => {
    console.log('saveDeck called:', { deckData: deckData.name, id });
    try {
      if (id) {
        // Update existing deck
        const deckToUpdate = decks.find(d => d.id === id);
        if (deckToUpdate && deckToUpdate.slug) {
          console.log('Updating existing deck:', deckToUpdate.slug);
          await apiService.updateDeck(deckToUpdate.slug, deckData);
        }
      } else {
        // Create new deck
        console.log('Creating new deck in saveDeck');
        await apiService.createDeck({
          ...deckData,
          category: 'user' // Explicitly set category to user
        });
      }
      
      // Optimize: Update local state instead of full reload
      if (id) {
        // Update existing deck in local state
        setDecks(prev => prev.map(deck => 
          deck.id === id 
            ? { ...deck, ...deckData }
            : deck
        ));
      } else {
        // For new deck, we need to reload to get the new deck with proper ID/slug
        console.log('Reloading decks from backend for new deck');
        await loadDecksFromBackend();
      }
    } catch (error) {
      console.error('Failed to save deck:', error);
    }
  };
  
  const removeDeck = async (id: string) => {
    try {
      // Find the deck to get its slug
      const deckToRemove = decks.find(d => d.id === id);
      if (deckToRemove?.slug) {
        console.log('Attempting to delete deck:', deckToRemove.slug);
        // Call backend to delete the deck
        await apiService.deleteDeck(deckToRemove.slug);
        console.log('Deck deleted from backend:', deckToRemove.slug);
        
        // Show success toast
        toast({
          title: "Deck Deleted",
          description: `Deck "${deckToRemove.name}" has been deleted.`,
        });
      } else {
        console.warn('Deck not found for deletion:', id);
      }
      
      // Update local state
      setDecks((prev) => prev.filter((deck) => deck.id !== id));
    } catch (error) {
      // Handle "Deck not found" error gracefully - this is expected when deck is already deleted
      if (error instanceof Error && error.message.includes('Deck not found')) {
        console.log('Deck already deleted or not found, updating local state');
        
        // Find the deck name for the toast
        const deckToRemove = decks.find(d => d.id === id);
        if (deckToRemove) {
          toast({
            title: "Deck Deleted",
            description: `Deck "${deckToRemove.name}" has been deleted.`,
          });
        }
        
        setDecks((prev) => prev.filter((deck) => deck.id !== id));
        return;
      }
      
      console.error('Failed to delete deck:', error);
      
      // Find the deck name for the error toast
      const deckToRemove = decks.find(d => d.id === id);
      if (deckToRemove) {
        toast({
          title: "Error",
          description: `Failed to delete deck "${deckToRemove.name}". Please try again.`,
          variant: "destructive",
        });
      }
      
      // Still update local state even if backend fails
      // This ensures the UI stays responsive even if there are network issues
      setDecks((prev) => prev.filter((deck) => deck.id !== id));
    }
  };


  const handleNavigateGrammar = (view: GrammarView, data: GrammarLesson | Quiz | null = null) => {
    setAnimation('out');
    setTimeout(() => {
      if (view === "ai-quiz-generator" && currentUser) {
        const storedAiQuiz = sessionStorage.getItem(`ai-generated-quiz_${currentUser.id}`);
        if (storedAiQuiz) {
            const progressKey = `quiz-progress-ai-generated_${currentUser.id}`;
            const progress = JSON.parse(localStorage.getItem(progressKey) || "[]");
            // A quiz is in progress if there's a record and at least one question is unanswered (null)
            const isFinished = progress.length > 0 && progress.every((a: any) => a !== null);
            
            if (!isFinished) {
               setSelectedQuiz(JSON.parse(storedAiQuiz));
               setGrammarView('quiz');
               setAnimation('in');
               return; // Resume the quiz
            } else {
               // If finished, clear it out and show the generator
               sessionStorage.removeItem(`ai-generated-quiz_${currentUser.id}`);
               localStorage.removeItem(progressKey);
            }
        }
        setGrammarView('ai-quiz-generator');
        setSelectedQuiz(null);
      } else {
         setGrammarView(view);
      }
     
      if (view === "lesson" && data) {
        setSelectedLesson(data as GrammarLesson);
        setSelectedQuiz(null);
      } else if (view === "quiz" && data) {
        const quizData = data as Quiz;
        if (quizData.id === 'ai-generated' && currentUser) {
          sessionStorage.setItem(`ai-generated-quiz_${currentUser.id}`, JSON.stringify(quizData));
        }
        setSelectedQuiz(quizData);
        setSelectedLesson(null);
      } else if(view !== 'ai-quiz-generator') {
        setSelectedLesson(null);
        setSelectedQuiz(null);
      }
      setAnimation('in');
    }, 100);
  };

  const handleBackGrammar = () => {
    setAnimation('out');
    setTimeout(() => {
      if (grammarView === 'lesson') {
        setGrammarView('lessons');
        setSelectedLesson(null);
      } else if (grammarView === 'quiz') {
        if (selectedQuiz?.id === 'ai-generated') {
            setGrammarView('main');
        } else {
            setGrammarView('quizzes');
            setSelectedQuiz(null);
        }
      } else if (grammarView === 'lessons' || grammarView === 'quizzes' || grammarView === 'checker' || grammarView === 'ai-quiz-generator') {
        setGrammarView('main');
      }
      setAnimation('in');
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    router.push('/login');
  };

  const getGrammarTitle = () => {
    switch (grammarView) {
      case "lessons":
        return "Lessons";
      case "lesson":
        return selectedLesson?.title || "Lesson";
      case "quizzes":
        return "Quizzes";
      case "quiz":
        return selectedQuiz?.title || "Quiz";
      case "checker":
        return "AI Grammar Checker";
       case "ai-quiz-generator":
        return "AI Quiz Generator";
      case "main":
      default:
        return "Grammar Guide";
    }
  };
  
  const showSubHeader = grammarView !== 'main' && currentView === 'grammar';

  if (!isMounted) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            {/* You can add a loading spinner here */}
        </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (showLoginPrompt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">Nihongo Mastery</h1>
          <p className="text-muted-foreground">Welcome to your Japanese learning journey!</p>
          <div className="space-y-2">
            <Button onClick={() => router.push('/login')} className="w-full">
              Login to Continue
            </Button>
            <p className="text-xs text-muted-foreground">
              Demo accounts: user@email.com / password or admin@email.com / adminpass
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'admin') {
    return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-5xl bg-background flex flex-col pt-[env(safe-area-inset-top)] md:my-4 md:rounded-lg md:shadow-lg">
        <header className="flex flex-col p-4 border-b">
           {!showSubHeader && (
            <div className="flex justify-between items-center relative mb-4">
              <div className="w-8"></div>
              <h1 className="font-headline text-xl font-bold text-primary text-center flex-1">
                  Nihongo Mastery
              </h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Users className="h-5 w-5" />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Hi, {currentUser?.username}!</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
           )}
          <div>
            <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as AppView)}>
              <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
                <TabsTrigger value="vocabulary" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Vocabulary
                </TabsTrigger>
                <TabsTrigger value="grammar" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  <Milestone className="mr-2 h-4 w-4" />
                  Grammar
                </TabsTrigger>
                 <TabsTrigger value="stats" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  <BarChart className="mr-2 h-4 w-4" />
                  Stats
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-y-auto">
          {currentView === 'vocabulary' && currentUser && (
             <Tabs value={vocabularyView} onValueChange={(v) => setVocabularyView(v as VocabularyView)} className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                    <TabsTrigger value="decks">My Decks</TabsTrigger>
                    <TabsTrigger value="dictionary">Dictionary</TabsTrigger>
                </TabsList>
                <TabsContent value="decks" className="flex-1 overflow-y-auto">
                    {currentUser && (
                      <VocabularyManager 
                          decks={decks}
                          onSaveDeck={saveDeck}
                          onRemoveDeck={removeDeck}
                          userId={currentUser.id}
                          onDecksUpdate={loadDecksFromBackend}
                          isLoading={isLoadingDecks}
                      />
                    )}
                </TabsContent>
                <TabsContent value="dictionary" className="flex-1 overflow-y-auto">
                    <DictionarySearch />
                </TabsContent>
            </Tabs>
          )}
          {currentView === 'grammar' && (
             <div className="flex flex-col h-full">
              {showSubHeader && (
                 <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                    <div className="flex items-center px-4 py-1 border-b">
                        <button onClick={handleBackGrammar} className="flex-shrink-0 flex items-center text-sm p-2 rounded-md hover:bg-muted -ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                        </button>
                        <div className="flex-grow min-w-0 pl-4">
                            <h3 className="font-headline text-base font-bold text-primary truncate">
                                {getGrammarTitle()}
                            </h3>
                        </div>
                    </div>
                </div>
              )}
              {grammarView === 'ai-quiz-generator' ? (
                currentUser && (
                  <AiQuizGenerator
                    onQuizGenerated={(quiz) => handleNavigateGrammar('quiz', quiz)}
                    userId={currentUser.id}
                  />
                )
              ) : currentUser && (
                <GrammarGuide
                  currentView={grammarView}
                  selectedLesson={selectedLesson}
                  selectedQuiz={selectedQuiz}
                  animation={animation}
                  onNavigate={handleNavigateGrammar}
                  onQuizFinished={handleBackGrammar}
                  userId={currentUser.id}
                />
              )}
            </div>
          )}
           {currentView === 'stats' && currentUser && (
             <StatsPage userId={currentUser.id} />
          )}
        </main>
      </div>
    </div>
  );
}
