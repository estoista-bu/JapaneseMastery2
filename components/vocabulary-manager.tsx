
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Book, MoreHorizontal, ChevronDown, Group, Crown, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import type { Deck, VocabularyWord, WordMasteryStats } from "@/lib/types";
import { DeckForm } from "@/components/deck-form";
import { allWords as initialWords } from "@/data/words";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "./ui/progress";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { apiService } from '@/lib/api';

type KanaSelection = "hiragana" | "katakana";
const MASTERY_THRESHOLD = 10;

interface VocabularyManagerProps {
  decks: Deck[];
  onSaveDeck: (deckData: any, id?: string) => void;
  onRemoveDeck: (id: string) => void;
  userId: string;
  onDecksUpdate: () => void;
  isLoading?: boolean;
}

export function VocabularyManager({ decks, onSaveDeck, onRemoveDeck, userId, onDecksUpdate, isLoading = false }: VocabularyManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deletingDeck, setDeletingDeck] = useState<Deck | null>(null);
  const [selectedKana, setSelectedKana] = useState<KanaSelection>("hiragana");
  const [masteryStats, setMasteryStats] = useState<Record<string, WordMasteryStats>>({});

  useEffect(() => {
    const storedMasteryStats = JSON.parse(localStorage.getItem(`wordMasteryStats_${userId}`) || '{}');
    setMasteryStats(storedMasteryStats);
  }, [userId]);

  const handleOpenForm = (deck: Deck | null) => {
    setEditingDeck(deck);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setEditingDeck(null);
    }
    setIsFormOpen(open);
  };
  
  const handleSaveDeck = async (deckData: any, id?: string) => {
    try {
      console.log('handleSaveDeck called:', deckData.name);
      onSaveDeck(deckData, id);
      // Remove onDecksUpdate() since saveDeck already calls loadDecksFromBackend()
    } catch (error) {
      console.error('Failed to save deck:', error);
    }
  };

  const handleConfirmRemove = async () => {
    if (deletingDeck) {
      try {
  await apiService.deleteDeck(deletingDeck.id);
        onRemoveDeck(deletingDeck.id);
        // Don't call onDecksUpdate() since onRemoveDeck already updates the local state
        setDeletingDeck(null);
      } catch (error) {
        console.error('Failed to delete deck:', error);
      }
    }
  };

  const getMasteryRate = (deckId: string) => {
    const wordsForDeck: VocabularyWord[] = JSON.parse(localStorage.getItem(`words_${deckId}_${userId}`) || "[]");
    const wordList = wordsForDeck.length > 0 ? wordsForDeck : initialWords.filter(w => w.deckId === deckId);
    
    if (wordList.length === 0) return 0;

    const masteredCount = wordList.filter(word => (masteryStats[word.id]?.correct || 0) >= MASTERY_THRESHOLD).length;
    return (masteredCount / wordList.length) * 100;
  }
  
  const getDeckIcon = (deck: Deck) => {
    if (deck.category === 'group') {
      return <Group className="h-5 w-5 text-accent" />;
    }
    return <Book className="h-5 w-5 text-primary" />;
  }
  
  const userDecks = decks.filter(d => d.category === 'user');
  const groupDecks = decks.filter(d => d.category === 'group');
  const adminDecks = decks.filter(d => d.category === 'admin');
  const jlptDecks = decks.filter(d => d.category === 'jlpt').sort((a,b) => b.id - a.id);
  


  return (
    <div className="flex flex-col h-full">
      <Dialog open={isFormOpen} onOpenChange={handleFormOpenChange}>
        <div className="w-full flex flex-col">
          <header className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="font-headline text-lg font-bold">
              My Decks
            </h2>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => handleOpenForm(null)}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add New Deck</span>
              </Button>
            </DialogTrigger>
          </header>

          <div className="flex-1 p-4 pt-2 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <Card>
                  <CardHeader className="p-4 flex flex-row items-center justify-between">
                     <Link href={`/deck/${selectedKana}`} className="flex-1">
                      <div className="flex items-center gap-2">
                        <Book className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-base">Kana Practice</CardTitle>
                          <CardDescription className="text-xs">{selectedKana === "hiragana" ? "Practice hiragana characters" : "Practice katakana characters"}</CardDescription>
                        </div>
                      </div>
                     </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-4">
                          {selectedKana === "hiragana" ? "Hiragana" : "Katakana"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuRadioGroup value={selectedKana} onValueChange={(value) => setSelectedKana(value as KanaSelection)}>
                            <DropdownMenuRadioItem value="hiragana">Hiragana</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="katakana">Katakana</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
              </Card>
            </div>
            
            {jlptDecks.length > 0 && (
              <div className="space-y-2">
                  <h3 className="font-headline text-md font-semibold flex items-center gap-2 text-primary/90 px-2">
                     <Crown className="h-4 w-4"/>
                     JLPT Core Vocabulary
                  </h3>
                   <ScrollArea className="w-full whitespace-nowrap">
                     <div className="flex w-max space-x-4 pb-4">
                        {jlptDecks.map((deck) => {
                          const masteryRate = getMasteryRate(deck.id);
                          return (
                             <Card key={deck.id} className="w-48">
                                <Link href={`/deck/${deck.id}`} className="block h-full">
                                    <div className="flex flex-col h-full p-4">
                                        <div className="flex items-center gap-2">
                                            <Book className="h-5 w-5 text-primary/80" />
                                            <CardTitle className="text-base truncate">{deck.name.replace(' Vocabulary', '')}</CardTitle>
                                        </div>
                                        <CardDescription className="text-xs mt-1 flex-grow whitespace-normal break-words line-clamp-4">
                                          {deck.description}
                                        </CardDescription>
                                        <div className="space-y-1 mt-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-muted-foreground">Mastery</p>
                                                <span className="text-xs text-muted-foreground font-mono">{masteryRate.toFixed(0)}%</span>
                                            </div>
                                            <Progress value={masteryRate} className="h-2 w-full" />
                                        </div>
                                    </div>
                                </Link>
                              </Card>
                          )
                        })}
                     </div>
                     <ScrollBar orientation="horizontal" />
                   </ScrollArea>
              </div>
            )}
            
            {adminDecks.length > 0 && (
              <div className="space-y-2">
                  <h3 className="font-headline text-md font-semibold flex items-center gap-2 text-primary/90 px-2">
                     <Crown className="h-4 w-4"/>
                     Provided Decks
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {adminDecks.map((deck) => {
                      const masteryRate = getMasteryRate(deck.id);

                      return (
                        <Card key={deck.id} className="relative group">
                          <Link href={`/deck/${deck.id}`} className="block h-full">
                            <div className="flex flex-col h-full">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex items-center gap-2">
                                  <Book className="h-5 w-5 text-primary/80" />
                                  <div className="min-w-0 flex-1">
                                    <CardTitle className="text-base truncate">{deck.name}</CardTitle>
                                    {deck.description && (
                                      <CardDescription className="text-xs mt-1 overflow-hidden text-ellipsis whitespace-normal line-clamp-2 break-words">
                                        {deck.description}
                                      </CardDescription>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0 mt-auto">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground">Mastery</p>
                                    <span className="text-xs text-muted-foreground font-mono">{masteryRate.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={masteryRate} className="h-2 w-full" />
                                </div>
                              </CardContent>
                            </div>
                          </Link>
                        </Card>
                      )
                    })}
                  </div>
              </div>
            )}
            
            {userDecks.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-headline text-md font-semibold flex items-center gap-2 text-primary/90 px-2">
                  <FolderPlus className="h-4 w-4"/>
                  Custom Decks
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userDecks.map((deck) => {
                    const masteryRate = getMasteryRate(deck.id);
                    const isEditable = deck.category === 'user';
                    return (
                      <Card key={deck.id} className="relative group">
                        {isEditable && (
                          <div className="absolute top-2 right-2 z-10">
                             <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenForm(deck)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeletingDeck(deck)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                        <Link href={`/deck/${deck.id}`} className="block h-full">
                         <div className="flex flex-col h-full">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center gap-2">
                                {getDeckIcon(deck)}
                                <div>
                                  <CardTitle className="text-base">{deck.name}</CardTitle>
                                  {deck.description && <CardDescription className="text-xs mt-1">{deck.description}</CardDescription>}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 mt-auto">
                               <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                      <p className="text-xs text-muted-foreground">Mastery</p>
                                      <span className="text-xs text-muted-foreground font-mono">{masteryRate.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={masteryRate} className="h-2 w-full" />
                               </div>
                            </CardContent>
                          </div>
                        </Link>
                      </Card>
                    )})}
                </div>
              </div>
            )}
            
            {groupDecks.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-headline text-md font-semibold flex items-center gap-2 text-primary/90 px-2">
                  <Group className="h-4 w-4"/>
                  Group Decks
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupDecks.map((deck) => {
                    const masteryRate = getMasteryRate(deck.id);
                    return (
                      <Card key={deck.id} className="relative group">
                        <Link href={`/deck/${deck.id}`} className="block h-full">
                         <div className="flex flex-col h-full">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center gap-2">
                                {getDeckIcon(deck)}
                                <div>
                                  <CardTitle className="text-base">{deck.name}</CardTitle>
                                  {deck.description && <CardDescription className="text-xs mt-1">{deck.description}</CardDescription>}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 mt-auto">
                               <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                      <p className="text-xs text-muted-foreground">Mastery</p>
                                      <span className="text-xs text-muted-foreground font-mono">{masteryRate.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={masteryRate} className="h-2 w-full" />
                               </div>
                            </CardContent>
                          </div>
                        </Link>
                      </Card>
                    )})}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingDeck ? "Edit Deck" : "Create New Deck"}</DialogTitle>
            <DialogDescription>
              {editingDeck ? "Update the name and description of your deck." : "Create a new deck to organize your vocabulary."}
            </DialogDescription>
          </DialogHeader>
          <DeckForm 
            onSaveDeck={handleSaveDeck} 
            deckToEdit={editingDeck} 
            onClose={() => {
              setIsFormOpen(false);
              setEditingDeck(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingDeck} onOpenChange={() => setDeletingDeck(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <span className="font-semibold text-foreground"> {deletingDeck?.name}</span> deck and all the words within it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingDeck(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmRemove(deletingDeck!.id)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

