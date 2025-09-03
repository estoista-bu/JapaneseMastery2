'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users, User as UserIcon } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User as UserType } from '@/lib/types';

interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  users_count: number;
  users?: UserWithEmail[];
}

interface UserWithEmail extends UserType {
  email?: string;
}

interface GroupListProps {
  currentUser: UserType;
}

export function GroupList({ currentUser }: GroupListProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [viewGroupDialogOpen, setViewGroupDialogOpen] = useState(false);
  const [addUsersDialogOpen, setAddUsersDialogOpen] = useState(false);
  const [removeUsersDialogOpen, setRemoveUsersDialogOpen] = useState(false);
  
  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [usersToRemove, setUsersToRemove] = useState<string[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllGroups();
      setGroups(response.groups || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load groups',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async (groupId?: string) => {
    try {
      const response = await apiService.getAvailableUsers(groupId);
      setAvailableUsers(response.users || []);
    } catch (error) {
      console.error('Error loading available users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available users',
        variant: 'destructive',
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: 'Error',
        description: 'Group name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiService.createGroup({
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
      });
      
      toast({
        title: 'Success',
        description: 'Group created successfully',
      });
      
      setCreateDialogOpen(false);
      setGroupName('');
      setGroupDescription('');
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'destructive',
      });
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup || !groupName.trim()) {
      toast({
        title: 'Error',
        description: 'Group name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiService.updateGroup(selectedGroup.id, {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
      });
      
      toast({
        title: 'Success',
        description: 'Group updated successfully',
      });
      
      setEditDialogOpen(false);
      setSelectedGroup(null);
      setGroupName('');
      setGroupDescription('');
      loadGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: 'Error',
        description: 'Failed to update group',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await apiService.deleteGroup(groupId);
      
      toast({
        title: 'Success',
        description: 'Group deleted successfully',
      });
      
      loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
    }
  };

  const handleAddUsers = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select users to add',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedGroup) return;

    try {
      await apiService.addUsersToGroup(selectedGroup.id, selectedUserIds);
      
      toast({
        title: 'Success',
        description: 'Users added to group successfully',
      });
      
      setAddUsersDialogOpen(false);
      setSelectedUserIds([]);
      loadGroups();
    } catch (error) {
      console.error('Error adding users to group:', error);
      toast({
        title: 'Error',
        description: 'Failed to add users to group',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveUsers = async () => {
    if (usersToRemove.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select users to remove',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedGroup) return;

    try {
      await apiService.removeUsersFromGroup(selectedGroup.id, usersToRemove);
      
      toast({
        title: 'Success',
        description: 'Users removed from group successfully',
      });
      
      setRemoveUsersDialogOpen(false);
      setUsersToRemove([]);
      loadGroups();
    } catch (error) {
      console.error('Error removing users from group:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove users from group',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setEditDialogOpen(true);
  };

  const openViewDialog = async (group: Group) => {
    setSelectedGroup(group);
    try {
      const response = await apiService.getGroupDetails(group.id);
      setSelectedGroup(response.group);
      setViewGroupDialogOpen(true);
    } catch (error) {
      console.error('Error loading group details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load group details',
        variant: 'destructive',
      });
    }
  };

  const openAddUsersDialog = async (group: Group) => {
    setSelectedGroup(group);
    await loadAvailableUsers(group.id);
    setAddUsersDialogOpen(true);
  };

  const openRemoveUsersDialog = async (group: Group) => {
    setSelectedGroup(group);
    try {
      const response = await apiService.getGroupDetails(group.id);
      setSelectedGroup(response.group);
      setRemoveUsersDialogOpen(true);
    } catch (error) {
      console.error('Error loading group details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load group details',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading groups...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Groups</CardTitle>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <Label htmlFor="groupDescription">Description</Label>
                <Textarea
                  id="groupDescription"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Enter group description (optional)"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup}>
                  Create Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No groups found. Create your first group to get started.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              💡 Click on any group row to view details and members
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow 
                    key={group.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => openViewDialog(group)}
                  >
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {group.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {group.users_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(group.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAddUsersDialog(group)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Group</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{group.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGroup(group.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editGroupName">Group Name *</Label>
              <Input
                id="editGroupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label htmlFor="editGroupDescription">Description</Label>
              <Textarea
                id="editGroupDescription"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Enter group description (optional)"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditGroup}>
                Update Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Group Dialog */}
      <Dialog open={viewGroupDialogOpen} onOpenChange={setViewGroupDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <p className="text-sm text-muted-foreground">
                {selectedGroup?.description || 'No description'}
              </p>
            </div>
            <div>
              <Label>Members ({selectedGroup?.users?.length || 0})</Label>
              {selectedGroup?.users && selectedGroup.users.length > 0 ? (
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {selectedGroup.users.map((user) => (
                    <div key={user.id} className="flex flex-col items-center p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <UserIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium truncate w-full" title={user.username}>
                          {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate w-full" title={user.email}>
                          {user.email}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg mt-2">
                  <UserIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No members in this group</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => openRemoveUsersDialog(selectedGroup!)}
                disabled={!selectedGroup?.users || selectedGroup.users.length === 0}
              >
                Remove Users
              </Button>
              <Button onClick={() => setViewGroupDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Users Dialog */}
      <Dialog open={addUsersDialogOpen} onOpenChange={setAddUsersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Users to {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              💡 Click on user icons to select/deselect them
            </p>
            {availableUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <UserIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No available users to add to this group.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border rounded-md">
                {availableUsers.map((user) => (
                  <div key={user.id} className="relative">
                    <div 
                      className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUserIds.includes(user.id) 
                          ? 'bg-primary/10 border-primary/50' 
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        if (selectedUserIds.includes(user.id)) {
                          setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                        } else {
                          setSelectedUserIds([...selectedUserIds, user.id]);
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium truncate w-full" title={user.username}>
                          {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate w-full" title={user.email}>
                          {user.email}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                      </div>
                      {selectedUserIds.includes(user.id) && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAddUsersDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUsers} disabled={selectedUserIds.length === 0}>
                Add Selected Users ({selectedUserIds.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Users Dialog */}
      <Dialog open={removeUsersDialogOpen} onOpenChange={setRemoveUsersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Remove Users from {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              💡 Click on user icons to select/deselect them for removal
            </p>
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border rounded-md">
              {selectedGroup?.users?.map((user) => (
                <div key={user.id} className="relative">
                  <div 
                    className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      usersToRemove.includes(user.id) 
                        ? 'bg-destructive/10 border-destructive/50' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      if (usersToRemove.includes(user.id)) {
                        setUsersToRemove(usersToRemove.filter(id => id !== user.id));
                      } else {
                        setUsersToRemove([...usersToRemove, user.id]);
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium truncate w-full" title={user.username}>
                        {user.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate w-full" title={user.email}>
                        {user.email}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </Badge>
                    </div>
                    {usersToRemove.includes(user.id) && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setRemoveUsersDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRemoveUsers} disabled={usersToRemove.length === 0}>
                Remove Selected Users ({usersToRemove.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
