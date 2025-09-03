
"use client";

import type { User } from '@/lib/types';
import { StatsPage } from '@/components/stats-page';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface UserStatsViewProps {
  user: User;
  onBack: () => void;
}

export function UserStatsView({ user, onBack }: UserStatsViewProps) {
  return (
    <div className="w-full bg-background flex flex-col flex-1">
       <header className="flex items-center p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 md:hidden">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to User List</span>
          </Button>
          <h1 className="font-headline text-lg font-bold text-primary truncate px-2 flex-1 text-center">
            {user.username}'s Stats
          </h1>
          <div className="w-8 h-8" />
      </header>
       <div className="hidden md:flex items-center gap-4 p-4 border-b">
         <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
          </Button>
          <h1 className="font-headline text-xl font-bold text-primary truncate px-2">
            Viewing Stats for: {user.username}
          </h1>
       </div>
      <main className="flex-1 overflow-y-auto">
        <StatsPage userId={user.id} />
      </main>
    </div>
  );
}
