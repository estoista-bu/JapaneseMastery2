
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCopy, Brain, Percent, Trophy, BarChart2, GraduationCap, RefreshCw, Volume2, Mic, Eye, TrendingUp } from 'lucide-react';
import { allDecks as initialDecks } from '@/data/decks';
import { allWords } from '@/data/words';
import { quizzes as allProvidedQuizzes } from '@/data/quizzes';
import { grammarLessons } from '@/data/lessons';
import type { Deck } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { AnalyticsDashboard } from './analytics-dashboard';
import { KanaPractice } from './kana-practice';

interface QuizResult {
  id?: string;
  score: number;
  total: number;
  timestamp: string;
}

interface QuizRates {
    total: number;
    correct: number;
    dailyCorrect: number;
    dailyTotal: number;
    weeklyCorrect: number;
    weeklyTotal: number;
    monthlyCorrect: number;
    monthlyTotal: number;
}

interface ContentTypeStats {
  id: number;
  user_id: number;
  content_type: string;
  memory_score: number;
  memory_total: number;
  pronunciation_score: number;
  pronunciation_total: number;
  listening_score: number;
  listening_total: number;
  view_words_count: number;
  quiz_results_provided: QuizResult[];
  quiz_results_ai: QuizResult[];
  quiz_highscores: Record<string, number>;
  word_mastery_stats: Record<string, any>;
  completed_lessons: string[];
  deck_progress: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface AllStats {
  custom_decks: ContentTypeStats;
  provided_decks: ContentTypeStats;
  kana_practice: ContentTypeStats;
  jlpt_decks: ContentTypeStats;
}

interface StatsPageProps {
  userId: string;
}

export function StatsPage({ userId }: StatsPageProps) {
    const [allStats, setAllStats] = useState<AllStats | null>(null);
    const [deckStats, setDeckStats] = useState<{ name: string; wordCount: number; isCustom: boolean }[]>([]);
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState(Date.now()); // Used to force re-render
    const { toast } = useToast();

    useEffect(() => {
        const loadStatsFromBackend = async () => {
            try {
                setLoading(true);
                const response = await apiService.getUserStats();
                setAllStats(response.stats);
                
                // Load deck stats
                await loadDeckStats();
            } catch (error) {
                console.error('Failed to load stats:', error);
                toast({
                    title: "Error",
                    description: "Failed to load statistics",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadStatsFromBackend();
    }, [userId, key]);

    const loadDeckStats = async () => {
        try {
            const response = await apiService.getDecks();
            const backendDecks = response.decks || [];
            
            const deckStatsData = backendDecks.map((deck: any) => ({
                name: deck.name,
                wordCount: deck.words_count || 0,
                isCustom: deck.category === 'user'
            }));
            
            setDeckStats(deckStatsData);
        } catch (error) {
            console.error('Failed to load deck stats:', error);
        }
    };

    const calculateRates = (results: QuizResult[]): QuizRates => {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

            return results.reduce((acc, r) => {
                acc.total += r.total;
                acc.correct += r.score;
                const timestamp = new Date(r.timestamp);
                const diff = now.getTime() - timestamp.getTime();
                if (diff < oneMonth) {
                    acc.monthlyCorrect += r.score;
                    acc.monthlyTotal += r.total;
                }
                if (diff < oneWeek) {
                    acc.weeklyCorrect += r.score;
                    acc.weeklyTotal += r.total;
                }
                if (diff < oneDay) {
                    acc.dailyCorrect += r.score;
                    acc.dailyTotal += r.total;
                }
                return acc;
            }, { 
                total: 0, correct: 0, dailyCorrect: 0, dailyTotal: 0, 
                weeklyCorrect: 0, weeklyTotal: 0, monthlyCorrect: 0, monthlyTotal: 0 
            });
        };

    const getContentTypeDisplayName = (contentType: string): string => {
        switch (contentType) {
            case 'custom_decks': return 'Custom Decks';
            case 'provided_decks': return 'Provided Decks';
            case 'kana_practice': return 'Kana Practice';
            case 'jlpt_decks': return 'JLPT Decks';
            default: return 'Unknown';
        }
    };

    const getContentTypeIcon = (contentType: string) => {
        switch (contentType) {
            case 'custom_decks': return <BookCopy className="h-4 w-4" />;
            case 'provided_decks': return <GraduationCap className="h-4 w-4" />;
            case 'kana_practice': return <Trophy className="h-4 w-4" />;
            case 'jlpt_decks': return <BarChart2 className="h-4 w-4" />;
            default: return <BookCopy className="h-4 w-4" />;
        }
    };

    const renderContentTypeStats = (contentType: keyof AllStats) => {
        if (!allStats) return null;
        
        const stats = allStats[contentType];
        const displayName = getContentTypeDisplayName(contentType);
        const icon = getContentTypeIcon(contentType);

        const memoryRate = stats.memory_total > 0 ? (stats.memory_score / stats.memory_total) * 100 : 0;
        const pronunciationRate = stats.pronunciation_total > 0 ? (stats.pronunciation_score / stats.pronunciation_total) * 100 : 0;
        const listeningRate = stats.listening_total > 0 ? (stats.listening_score / stats.listening_total) * 100 : 0;

        const providedQuizRates = calculateRates(stats.quiz_results_provided || []);
        const aiQuizRates = calculateRates(stats.quiz_results_ai || []);

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    {icon}
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Memory Test */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Memory Test</CardTitle>
                            <Brain className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{memoryRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.memory_score}/{stats.memory_total} correct
                            </p>
                        </CardContent>
                    </Card>

                    {/* Pronunciation Test */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pronunciation</CardTitle>
                            <Mic className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pronunciationRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.pronunciation_score}/{stats.pronunciation_total} correct
                            </p>
                        </CardContent>
                    </Card>

                    {/* Listening Test */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Listening</CardTitle>
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{listeningRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.listening_score}/{stats.listening_total} correct
                            </p>
                        </CardContent>
                    </Card>

                    {/* View Words Count */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Words Viewed</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.view_words_count}</div>
                            <p className="text-xs text-muted-foreground">
                                Total words viewed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quiz Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Provided Quiz Results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Overall:</span>
                                <span>{providedQuizRates.total > 0 ? ((providedQuizRates.correct / providedQuizRates.total) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Today:</span>
                                <span>{providedQuizRates.dailyTotal > 0 ? ((providedQuizRates.dailyCorrect / providedQuizRates.dailyTotal) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>This Week:</span>
                                <span>{providedQuizRates.weeklyTotal > 0 ? ((providedQuizRates.weeklyCorrect / providedQuizRates.weeklyTotal) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>This Month:</span>
                                <span>{providedQuizRates.monthlyTotal > 0 ? ((providedQuizRates.monthlyCorrect / providedQuizRates.monthlyTotal) * 100).toFixed(1) : 0}%</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">AI Quiz Results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Overall:</span>
                                <span>{aiQuizRates.total > 0 ? ((aiQuizRates.correct / aiQuizRates.total) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Today:</span>
                                <span>{aiQuizRates.dailyTotal > 0 ? ((aiQuizRates.dailyCorrect / aiQuizRates.dailyTotal) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>This Week:</span>
                                <span>{aiQuizRates.weeklyTotal > 0 ? ((aiQuizRates.weeklyCorrect / aiQuizRates.weeklyTotal) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>This Month:</span>
                                <span>{aiQuizRates.monthlyTotal > 0 ? ((aiQuizRates.monthlyCorrect / aiQuizRates.monthlyTotal) * 100).toFixed(1) : 0}%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    const resetStats = async (contentType: string) => {
        try {
            await apiService.resetStats(contentType);
            toast({
                title: "Success",
                description: `${getContentTypeDisplayName(contentType)} stats reset successfully`,
            });
            setKey(Date.now()); // Force re-render
        } catch (error) {
            console.error('Failed to reset stats:', error);
            toast({
                title: "Error",
                description: "Failed to reset statistics",
                variant: "destructive",
            });
        }
    };

    const resetAllStats = async () => {
        try {
            await apiService.resetAllStats();
            toast({
                title: "Success",
                description: "All statistics reset successfully",
            });
            setKey(Date.now()); // Force re-render
        } catch (error) {
            console.error('Failed to reset all stats:', error);
        toast({
                title: "Error",
                description: "Failed to reset all statistics",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading statistics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
                <div className="flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                Reset All Stats
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reset All Statistics</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all your statistics across all content types. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={resetAllStats}>Reset All</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                                    </div>

            <Tabs defaultValue="custom_decks" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="custom_decks">Custom Decks</TabsTrigger>
                    <TabsTrigger value="provided_decks">Provided Decks</TabsTrigger>
                    <TabsTrigger value="kana_practice">Kana Practice</TabsTrigger>
                    <TabsTrigger value="jlpt_decks">JLPT Decks</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="custom_decks" className="mt-6">
                    {renderContentTypeStats('custom_decks')}
                </TabsContent>

                <TabsContent value="provided_decks" className="mt-6">
                    {renderContentTypeStats('provided_decks')}
                </TabsContent>

                <TabsContent value="kana_practice" className="mt-6">
                    <div className="space-y-6">
                        {renderContentTypeStats('kana_practice')}
                        <div className="border-t pt-6">
                            <KanaPractice userId={userId} />
                                </div>
                    </div>
                </TabsContent>

                <TabsContent value="jlpt_decks" className="mt-6">
                    {renderContentTypeStats('jlpt_decks')}
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <AnalyticsDashboard userId={userId} />
                </TabsContent>
            </Tabs>


            </div>
    );
}
