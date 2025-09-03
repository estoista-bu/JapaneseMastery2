"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Target, 
  Trophy, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';

interface AdminStatsProps {
  currentUser: any;
}

interface UserStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  regular_users: number;
  total_decks: number;
  total_words: number;
  total_memory_tests: number;
  total_pronunciation_tests: number;
  total_listening_tests: number;
  total_kana_practice: number;
  average_memory_score: number;
  average_pronunciation_score: number;
  average_listening_score: number;
  total_study_time: number;
  most_active_content_type: string;
  recent_activity: {
    date: string;
    new_users: number;
    new_decks: number;
    tests_taken: number;
  }[];
}

export function AdminStats({ currentUser }: AdminStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAdminStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      toast({
        title: "Error",
        description: "Failed to load admin statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No statistics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Statistics</h2>
          <p className="text-muted-foreground">Overview of all user activity and system performance</p>
        </div>
        <Button onClick={loadAdminStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* User Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_users)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_users} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_decks)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.total_words)} total words
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_memory_tests + stats.total_pronunciation_tests + stats.total_listening_tests)}</div>
            <p className="text-xs text-muted-foreground">
              Across all test types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.total_study_time)}</div>
            <p className="text-xs text-muted-foreground">
              Total across all users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Regular Users</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{stats.regular_users}</Badge>
                <span className="text-sm text-muted-foreground">
                  {((stats.regular_users / stats.total_users) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={(stats.regular_users / stats.total_users) * 100} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Admin Users</span>
              <div className="flex items-center gap-2">
                <Badge variant="default">{stats.admin_users}</Badge>
                <span className="text-sm text-muted-foreground">
                  {((stats.admin_users / stats.total_users) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={(stats.admin_users / stats.total_users) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory Tests</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{stats.average_memory_score.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground">
                  ({formatNumber(stats.total_memory_tests)} tests)
                </span>
              </div>
            </div>
            <Progress value={stats.average_memory_score} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pronunciation Tests</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{stats.average_pronunciation_score.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground">
                  ({formatNumber(stats.total_pronunciation_tests)} tests)
                </span>
              </div>
            </div>
            <Progress value={stats.average_pronunciation_score} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Listening Tests</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{stats.average_listening_score.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground">
                  ({formatNumber(stats.total_listening_tests)} tests)
                </span>
              </div>
            </div>
            <Progress value={stats.average_listening_score} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity (Last 5 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{activity.date}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-muted-foreground">
                      {activity.new_users} new users
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {activity.new_decks} new decks
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {activity.tests_taken} tests taken
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Content Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatNumber(stats.total_memory_tests)}</div>
              <p className="text-sm text-muted-foreground">Memory Tests</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatNumber(stats.total_pronunciation_tests)}</div>
              <p className="text-sm text-muted-foreground">Pronunciation Tests</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatNumber(stats.total_listening_tests)}</div>
              <p className="text-sm text-muted-foreground">Listening Tests</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatNumber(stats.total_kana_practice)}</div>
              <p className="text-sm text-muted-foreground">Kana Practice</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-center">
              <span className="font-medium">Most Active Content:</span> {stats.most_active_content_type}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
