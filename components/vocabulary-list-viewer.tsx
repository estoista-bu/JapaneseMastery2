
"use client";

import type { VocabularyWord, WordMasteryStats } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal, Star, RefreshCw } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { ClickableReading } from "./clickable-reading";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface VocabularyListViewerProps {
  words: VocabularyWord[];
  onEdit: (word: VocabularyWord) => void;
  onRemove: (id: string) => void;
  onSelectWord: (word: VocabularyWord) => void;
  masteryStats: Record<string, WordMasteryStats>;
  masteryThreshold: number;
  onRefreshStats: () => void;
  isEditable?: boolean;
  isKana?: boolean;
}

export function VocabularyListViewer({ words, onEdit, onRemove, onSelectWord, masteryStats, masteryThreshold, onRefreshStats, isEditable = true, isKana = false }: VocabularyListViewerProps) {
  const [deletingWord, setDeletingWord] = useState<VocabularyWord | null>(null);

  const weightedAndSortedWords = useMemo(() => {
    if (!words) return [];
    const weighted = words.map(word => {
      const stats = masteryStats[word.id] || { correct: 0, incorrect: 0, weight: 1 };
      return { ...word, weight: stats.weight ?? 1 };
    });
    return weighted.sort((a, b) => b.weight - a.weight);
  }, [words, masteryStats]);


  const getWeightCategory = (weight: number): { label: 'Low' | 'Moderate' | 'High'; className: string } => {
    if (weight >= 100) {
      return { label: 'High', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };
    }
    if (weight >= 10) {
      return { label: 'Moderate', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' };
    }
    return { label: 'Low', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' };
  };

  const handleConfirmRemove = () => {
    if (deletingWord) {
      onRemove(deletingWord.id);
      setDeletingWord(null);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center p-2 border-b">
            <p className="text-sm text-muted-foreground px-2">
                Total Words: {words.length}
            </p>
             <Button variant="outline" size="sm" onClick={onRefreshStats}>
                <RefreshCw className="mr-2 h-4 w-4"/>
                Refresh Weights
            </Button>
        </div>
        <ScrollArea className="flex-1">
            <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                <TableHead>Japanese</TableHead>
                <TableHead className="hidden md:table-cell">Reading</TableHead>
                <TableHead>{isKana ? 'Category' : 'Meaning'}</TableHead>
                <TableHead className="w-[100px] hidden sm:table-cell">Weight</TableHead>
                <TableHead className="w-[80px] text-center">
                    <Star className="h-4 w-4 inline-block" />
                </TableHead>
                {isEditable && <TableHead className="text-right w-[50px]"></TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {weightedAndSortedWords.map((word) => {
                const isMastered = (masteryStats[word.id]?.correct || 0) >= masteryThreshold;
                const weightCategory = getWeightCategory(word.weight);
                return (
                <TableRow key={word.id} onClick={() => onSelectWord(word)} className="cursor-pointer">
                    <TableCell className="font-medium">
                        <ClickableReading japanese={word.japanese} reading={word.reading} />
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{word.reading}</TableCell>
                    <TableCell>{word.meaning}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger>
                            <Badge variant="outline" className={cn("border-transparent", weightCategory.className)}>
                            {weightCategory.label}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Weight: {word.weight.toFixed(4)}</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                    {isMastered && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 inline-block" />}
                    </TableCell>
                    {isEditable && (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(word)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletingWord(word)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                </TableRow>
                )})}
            </TableBody>
            </Table>
        </ScrollArea>
       </div>

      <AlertDialog open={!!deletingWord} onOpenChange={() => setDeletingWord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the word
              <span className="font-semibold text-foreground"> {deletingWord?.japanese}</span> from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
