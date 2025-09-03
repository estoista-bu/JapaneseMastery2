
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, Group, Upload, LogOut, User } from "lucide-react";
import type { User as UserType } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { apiService } from '@/lib/api';
import { UserList } from './user-list';
import { AdminStats } from './admin-stats';
import { GroupList } from './group-list';
import { DeployDecks } from './deploy-decks';

interface AdminDashboardProps {
  currentUser: UserType;
  onLogout: () => void;
}

type AdminView = "stats" | "users" | "groups" | "deploy";

export function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AdminView>("stats");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Loading spinner */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-5xl bg-background flex flex-col pt-[env(safe-area-inset-top)] md:my-4 md:rounded-lg md:shadow-lg">
        <header className="flex flex-col p-4 border-b">
          <div className="flex justify-between items-center relative mb-4">
            <div className="w-8"></div>
            <h1 className="font-headline text-xl font-bold text-primary text-center flex-1">
              Admin Dashboard
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Open admin menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin: {currentUser?.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as AdminView)}>
              <TabsList className="grid w-full grid-cols-4 bg-transparent p-0">
                <TabsTrigger value="stats" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  <BarChart className="mr-2 h-4 w-4" />
                  Stats
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="groups" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  <Group className="mr-2 h-4 w-4" />
                  Groups
                </TabsTrigger>
                <TabsTrigger value="deploy" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  <Upload className="mr-2 h-4 w-4" />
                  Deploy Decks
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-y-auto">
          {currentView === 'stats' && (
            <AdminStats currentUser={currentUser} />
          )}
          
          {currentView === 'users' && (
            <UserList currentUser={currentUser} />
          )}
          
          {currentView === 'groups' && (
            <GroupList currentUser={currentUser} />
          )}
          
          {currentView === 'deploy' && (
            <DeployDecks currentUser={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
}
