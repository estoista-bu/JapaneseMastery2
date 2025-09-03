"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Award, 
  Clock, 
  BookOpen, 
  Brain,
  Mic,
  Volume2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { getContentTypeDisplayName, CONTENT_TYPES } from '@/lib/content-type-utils';
import { useToast } from '@/hooks/use-toast';

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
  quiz_results_provided: any[];
  quiz_results_ai: any[];
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

interface AnalyticsDashboardProps {
  userId: string;
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [allStats, setAllStats] = useState<AllStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'overall' | 'month' | 'week' | 'day'>('overall');
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserStats();
      setAllStats(response.stats);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceScore = (stats: ContentTypeStats) => {
    const memoryRate = stats.memory_total > 0 ? (stats.memory_score / stats.memory_total) * 100 : 0;
    const pronunciationRate = stats.pronunciation_total > 0 ? (stats.pronunciation_score / stats.pronunciation_total) * 100 : 0;
    const listeningRate = stats.listening_total > 0 ? (stats.listening_score / stats.listening_total) * 100 : 0;
    
    // Calculate overall performance (average of all test types)
    const testCount = [memoryRate, pronunciationRate, listeningRate].filter(rate => rate > 0).length;
    const overallRate = testCount > 0 ? (memoryRate + pronunciationRate + listeningRate) / testCount : 0;
    
    return {
      memoryRate,
      pronunciationRate,
      listeningRate,
      overallRate,
      testCount
    };
  };

  const getPerformanceTrend = (rate: number) => {
    if (rate >= 90) return { trend: 'excellent', icon: <TrendingUp className="h-4 w-4 text-green-500" />, color: 'text-green-500' };
    if (rate >= 75) return { trend: 'good', icon: <TrendingUp className="h-4 w-4 text-blue-500" />, color: 'text-blue-500' };
    if (rate >= 60) return { trend: 'fair', icon: <TrendingUp className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-500' };
    return { trend: 'needs_improvement', icon: <TrendingDown className="h-4 w-4 text-red-500" />, color: 'text-red-500' };
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case CONTENT_TYPES.CUSTOM_DECKS: return <BookOpen className="h-5 w-5" />;
      case CONTENT_TYPES.PROVIDED_DECKS: return <Award className="h-5 w-5" />;
      case CONTENT_TYPES.KANA_PRACTICE: return <Target className="h-5 w-5" />;
      case CONTENT_TYPES.JLPT_DECKS: return <BarChart3 className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const renderPerformanceCard = (contentType: keyof AllStats) => {
    if (!allStats) return null;
    
    const stats = allStats[contentType];
    const performance = calculatePerformanceScore(stats);
    const trend = getPerformanceTrend(performance.overallRate);
    const icon = getContentTypeIcon(contentType);
    const displayName = getContentTypeDisplayName(contentType);

    return (
      <Card key={contentType} className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-lg">{displayName}</CardTitle>
            </div>
            {trend.icon}
          </div>
          <CardDescription>
            {performance.testCount > 0 ? `${performance.testCount} test types completed` : 'No tests completed yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Performance */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${trend.color}`}>
                {performance.overallRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Performance</p>
            </div>

            {/* Individual Test Scores */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Brain className="h-3 w-3" />
                  <span className="font-medium">{performance.memoryRate.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Memory</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Mic className="h-3 w-3" />
                  <span className="font-medium">{performance.pronunciationRate.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Speech</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  <span className="font-medium">{performance.listeningRate.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Listening</p>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>Words Viewed</span>
                </div>
                <span className="font-medium">{stats.view_words_count}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComparisonChart = () => {
    if (!allStats) return null;

    const contentTypes = Object.keys(allStats) as (keyof AllStats)[];
    const performances = contentTypes.map(contentType => ({
      contentType,
      displayName: getContentTypeDisplayName(contentType),
      performance: calculatePerformanceScore(allStats[contentType])
    }));

    // Sort by overall performance
    performances.sort((a, b) => b.performance.overallRate - a.performance.overallRate);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Ranking
          </CardTitle>
          <CardDescription>
            Your performance across all content types, ranked from best to worst
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performances.map((item, index) => {
              const trend = getPerformanceTrend(item.performance.overallRate);
              return (
                <div key={item.contentType} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.performance.testCount} tests completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${trend.color}`}>
                      {item.performance.overallRate.toFixed(1)}%
                    </span>
                    {trend.icon}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActivitySummary = () => {
    if (!allStats) return null;

    const totalWordsViewed = Object.values(allStats).reduce((sum, stats) => sum + stats.view_words_count, 0);
    const totalTestsTaken = Object.values(allStats).reduce((sum, stats) => 
      sum + stats.memory_total + stats.pronunciation_total + stats.listening_total, 0
    );
    const totalCorrectAnswers = Object.values(allStats).reduce((sum, stats) => 
      sum + stats.memory_score + stats.pronunciation_score + stats.listening_score, 0
    );
    const overallAccuracy = totalTestsTaken > 0 ? (totalCorrectAnswers / totalTestsTaken) * 100 : 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Summary
          </CardTitle>
          <CardDescription>
            Your overall learning activity across all content types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalWordsViewed}</div>
              <p className="text-sm text-muted-foreground">Words Viewed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalTestsTaken}</div>
              <p className="text-sm text-muted-foreground">Tests Taken</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalCorrectAnswers}</div>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{overallAccuracy.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Overall Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderPerformanceCard('custom_decks')}
            {renderPerformanceCard('provided_decks')}
            {renderPerformanceCard('kana_practice')}
            {renderPerformanceCard('jlpt_decks')}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          {renderComparisonChart()}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          {renderActivitySummary()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
