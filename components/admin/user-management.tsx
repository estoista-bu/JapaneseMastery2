
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { User, Group, Deck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { GroupDetailView } from './group-detail-view';
import { ScrollArea } from '../ui/scroll-area';
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
} from "@/components/ui/alert-dialog"

const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['user', 'admin']),
});

const groupFormSchema = z.object({
    name: z.string().min(1, 'Group name is required.'),
    description: z.string().min(1, 'Description is required.'),
});

interface UserManagementProps {
  users: User[];
  groups: Group[];
  groupDecks: Deck[];
  onUserCreate: (user: User) => void;
  onUserDelete: (userId: string) => void;
  onGroupUpdate: (group: Group) => void;
  onGroupDelete: (groupId: string) => void;
  onAssignUserToGroup: (userId: string, groupIds: string[]) => void;
  onDeckCreateForGroup: (deckData: Omit<Deck, "id" | "category" | "groupId">, groupId: string) => void;
}

export function UserManagement({
  users,
  groups,
  groupDecks,
  onUserCreate,
  onUserDelete,
  onGroupUpdate,
  onGroupDelete,
  onAssignUserToGroup,
  onDeckCreateForGroup
}: UserManagementProps) {
  const [view, setView] = useState<'main' | 'group-detail'>('main');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

  const { toast } = useToast();
  const userForm = useForm({ resolver: zodResolver(userFormSchema), defaultValues: { username: '', password: '', role: 'user' as const } });
  const groupForm = useForm<z.infer<typeof groupFormSchema>>({ resolver: zodResolver(groupFormSchema), defaultValues: { name: '', description: '' } });

  const handleUserSubmit = (data: z.infer<typeof userFormSchema>) => {
    onUserCreate({ ...data, id: `user-${Date.now()}` });
    toast({ title: 'Success', description: `User "${data.username}" created.` });
    setIsUserFormOpen(false);
    userForm.reset();
  };

  const handleGroupSubmit = (data: z.infer<typeof groupFormSchema>) => {
    const groupToSave = { ...data, id: editingGroup?.id || `group-${Date.now()}` };
    onGroupUpdate(groupToSave);
    toast({ title: 'Success', description: `Group "${data.name}" ${editingGroup ? 'updated' : 'created'}.` });
    setIsGroupFormOpen(false);
    setEditingGroup(null);
    groupForm.reset();
  }
  
  const handleEditGroup = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    setEditingGroup(group);
    groupForm.reset({ name: group.name, description: group.description });
    setIsGroupFormOpen(true);
  };
  
  const openGroupDetails = (group: Group) => {
    setSelectedGroup(group);
    setView('group-detail');
  }

  const handleGroupDelete = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    setDeletingGroup(group);
  };


  if (view === 'group-detail' && selectedGroup) {
    return (
      <GroupDetailView 
        group={selectedGroup} 
        allUsers={users}
        groupDecks={groupDecks.filter(d => d.groupId === selectedGroup.id)}
        onBack={() => setView('main')}
        onGroupUpdate={onGroupUpdate}
        onAssignUserToGroup={onAssignUserToGroup}
        onDeckCreate={(deckData) => onDeckCreateForGroup(deckData, selectedGroup.id)}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          {/* Group Dialog Trigger */}
          <Dialog open={isGroupFormOpen} onOpenChange={(open) => { if (!open) setEditingGroup(null); setIsGroupFormOpen(open); }}>
            <DialogTrigger asChild>
              <Button onClick={() => { groupForm.reset(); setEditingGroup(null); setIsGroupFormOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
              </DialogHeader>
              <Form {...groupForm}>
                <form onSubmit={groupForm.handleSubmit(handleGroupSubmit)} className="space-y-4">
                  <FormField control={groupForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={groupForm.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit">Save Group</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* User Dialog Trigger */}
          <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> New User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="space-y-4">
                  <FormField control={userForm.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={userForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={userForm.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit">Create User</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section>
        <h3 className="text-xl font-semibold mb-2">Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <div key={group.id} onClick={() => openGroupDetails(group)} className="cursor-pointer">
              <Card className="flex flex-col h-full hover:bg-muted transition-colors">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{group.name}</span>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleEditGroup(e, group)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => handleGroupDelete(e, group)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Group: {group.name}</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the group and all associated decks. Users will be unassigned from this group. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={(e) => { e.stopPropagation(); onGroupDelete(group.id); }}>Confirm Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                  <p className="text-xs text-muted-foreground">
                    {users.filter(u => u.groups?.includes(group.id)).length} member(s)
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
          {groups.length === 0 && <p className="text-muted-foreground">No groups created yet.</p>}
        </div>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold mb-2">All Users</h3>
        <Card>
          <ScrollArea className="h-72">
            <CardContent className="p-4">
              {users.map(user => (
                <div key={user.id} className="flex justify-between items-center p-2 hover:bg-muted rounded-md">
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{groups.filter(g => user.groups?.includes(g.id)).map(g => g.name).join(', ') || 'No groups'}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingUser(user)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the user <span className="font-bold">{deletingUser?.username}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {onUserDelete(deletingUser!.id); setDeletingUser(null)}}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
              {users.length === 0 && <p className="text-muted-foreground text-center">No manageable users found.</p>}
            </CardContent>
          </ScrollArea>
        </Card>
      </section>

      {/* Standalone Alert Dialog for deleting a group */}
      <AlertDialog open={!!deletingGroup} onOpenChange={(open) => !open && setDeletingGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group: {deletingGroup?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group and all associated decks. Users will be unassigned from this group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if(deletingGroup) { onGroupDelete(deletingGroup.id); setDeletingGroup(null); } }}>Confirm Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
