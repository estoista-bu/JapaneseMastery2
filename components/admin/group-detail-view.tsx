
"use client";

import { useState, useMemo } from 'react';
import type { User, Group, Deck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, UserPlus, BookCopy, PlusCircle, Pencil } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { DeckForm } from '../deck-form';
import Link from 'next/link';

interface GroupDetailViewProps {
  group: Group;
  allUsers: User[];
  groupDecks: Deck[];
  onBack: () => void;
  onGroupUpdate: (group: Group) => void;
  onAssignUserToGroup: (userId: string, groupIds: string[]) => void;
  onDeckCreate: (deckData: Omit<Deck, "id" | "category" | "groupId">) => void;
}

export function GroupDetailView({ group, allUsers, groupDecks, onBack, onGroupUpdate, onAssignUserToGroup, onDeckCreate }: GroupDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeckFormOpen, setIsDeckFormOpen] = useState(false);

  const handleToggleUser = (user: User) => {
    const currentGroups = user.groups || [];
    const isInGroup = currentGroups.includes(group.id);
    const newGroups = isInGroup 
      ? currentGroups.filter(gId => gId !== group.id)
      : [...currentGroups, group.id];
    onAssignUserToGroup(user.id, newGroups);
  };

  const handleSaveDeck = (deckData: Omit<Deck, "id" | "category">) => {
    onDeckCreate(deckData);
    setIsDeckFormOpen(false);
  }

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => 
      user.role === 'user' && 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allUsers, searchQuery]);

  return (
    <Dialog open={isDeckFormOpen} onOpenChange={setIsDeckFormOpen}>
      <div className="p-4 flex flex-col h-full space-y-4">
        <header className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <p className="text-muted-foreground">{group.description}</p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Group Decks</span>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Deck
                </Button>
              </DialogTrigger>
            </CardTitle>
            <CardDescription>Decks assigned to this group will appear in all member accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            {groupDecks.length > 0 ? (
              <ul className="space-y-2">
                {groupDecks.map(deck => (
                  <li key={deck.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <BookCopy className="h-4 w-4 mr-2 text-primary"/>
                      <span>{deck.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                       <Link href={`/app/deck/${deck.id}`}>
                         <Pencil className="h-4 w-4 mr-2" />
                         Edit Deck
                       </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No decks assigned to this group yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Manage Members</CardTitle>
            <CardDescription>Select users to add or remove from this group.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <div className="mb-4">
              <Label htmlFor="search-users">Search Users</Label>
              <Input 
                id="search-users"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ScrollArea className="flex-grow border rounded-md">
              <div className="p-4 space-y-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={user.groups?.includes(group.id)}
                        onCheckedChange={() => handleToggleUser(user)}
                      />
                      <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                        {user.username}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">No users found.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

       <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Deck for {group.name}</DialogTitle>
            <DialogDescription>
              This deck will be available to all members of this group.
            </DialogDescription>
          </DialogHeader>
          <DeckForm onSaveDeck={handleSaveDeck} deckToEdit={null} />
        </DialogContent>
    </Dialog>
  );
}
