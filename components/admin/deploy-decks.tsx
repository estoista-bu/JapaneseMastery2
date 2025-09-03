'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, BookOpen, Users } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';
import { VocabularyForm } from '@/components/vocabulary-form';
import { AdminVocabularyForm } from '@/components/admin-vocabulary-form';


interface Deck {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_public: boolean;
  created_at: string;
  words_count: number;
  user_id?: string;
}

interface DeployDecksProps {
  currentUser: User;
}

export function DeployDecks({ currentUser }: DeployDecksProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [showAllDecks, setShowAllDecks] = useState(false);
  const [wordManagementDialogOpen, setWordManagementDialogOpen] = useState(false);
  
  // Form states
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    loadDecks();
  }, [showAllDecks]);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDecks(showAllDecks);
      setDecks(response.decks || []);
    } catch (error) {
      console.error('Error loading decks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load decks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async () => {
    if (!deckName.trim()) {
      toast({
        title: 'Error',
        description: 'Deck name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiService.createAdminDeck({
        name: deckName.trim(),
        description: deckDescription.trim() || undefined,
        category: 'admin', // Always 'admin' for admin decks
        is_public: isPublic,
      });
      
      toast({
        title: 'Success',
        description: 'Deck created successfully',
      });
      
      setCreateDialogOpen(false);
      setDeckName('');
      setDeckDescription('');
      setIsPublic(true);
      loadDecks();
    } catch (error) {
      console.error('Error creating deck:', error);
      toast({
        title: 'Error',
        description: 'Failed to create deck',
        variant: 'destructive',
      });
    }
  };

  const handleEditDeck = async () => {
    if (!selectedDeck || !deckName.trim()) {
      toast({
        title: 'Error',
        description: 'Deck name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiService.updateAdminDeck(selectedDeck.id, {
        name: deckName.trim(),
        description: deckDescription.trim() || undefined,
        category: 'admin', // Always 'admin' for admin decks
        is_public: isPublic,
      });
      
      toast({
        title: 'Success',
        description: 'Deck updated successfully',
      });
      
      setEditDialogOpen(false);
      setSelectedDeck(null);
      setDeckName('');
      setDeckDescription('');
      setIsPublic(true);
      loadDecks();
    } catch (error) {
      console.error('Error updating deck:', error);
      toast({
        title: 'Error',
        description: 'Failed to update deck',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await apiService.deleteAdminDeck(deckId);
      
      toast({
        title: 'Success',
        description: 'Deck deleted successfully',
      });
      
      loadDecks();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete deck',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (deck: Deck) => {
    setSelectedDeck(deck);
    setDeckName(deck.name);
    setDeckDescription(deck.description || '');
    setIsPublic(deck.is_public);
    setEditDialogOpen(true);
  };

  const openWordManagementDialog = (deck: Deck) => {
    setSelectedDeck(deck);
    setWordManagementDialogOpen(true);
  };

  const handleSaveWords = async (wordsData: any[], idToEdit?: string): Promise<void> => {
    if (!selectedDeck) return;

    try {
      await apiService.addWordsToAdminDeck(selectedDeck.id, wordsData);
      
      toast({
        title: 'Success',
        description: `Added ${wordsData.length} word(s) to "${selectedDeck.name}"`,
      });
      
      // Refresh deck list to update word count
      loadDecks();
    } catch (error) {
      console.error('Error saving words:', error);
      toast({
        title: 'Error',
        description: 'Failed to save words',
        variant: 'destructive',
      });
      throw error; // Re-throw so the form can handle it
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case 'admin':
        return 'default';
      case 'jlpt':
        return 'secondary';
      case 'general':
        return 'outline';
      case 'business':
        return 'destructive';
      case 'travel':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading decks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deploy Decks</h2>
          <p className="text-muted-foreground">Create and manage decks for all users</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showAllDecks"
              checked={showAllDecks}
              onChange={(e) => setShowAllDecks(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="showAllDecks">Show all decks</Label>
          </div>
          <Button onClick={loadDecks} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {showAllDecks ? 'All Decks' : 'Admin Decks'} ({decks.length})
          </CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Deck
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Deck</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deckName">Deck Name *</Label>
                  <Input
                    id="deckName"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="Enter deck name"
                  />
                </div>
                <div>
                  <Label htmlFor="deckDescription">Description</Label>
                  <Textarea
                    id="deckDescription"
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    placeholder="Enter deck description (optional)"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isPublic">Public deck (visible to all users)</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDeck}>
                    Create Deck
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {decks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No decks found. Create your first deck to get started.
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                💡 Click on any deck row to manage its words (add, generate, view)
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decks.map((deck) => (
                    <TableRow 
                      key={deck.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openWordManagementDialog(deck)}
                    >
                      <TableCell className="font-medium">{deck.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {deck.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryBadgeVariant(deck.category)}>
                          {deck.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={deck.is_public ? 'default' : 'secondary'}>
                          {deck.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {deck.words_count} words
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(deck.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(deck);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Deck</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{deck.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDeck(deck.id)}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Deck Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editDeckName">Deck Name *</Label>
              <Input
                id="editDeckName"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Enter deck name"
              />
            </div>
            <div>
              <Label htmlFor="editDeckDescription">Description</Label>
              <Textarea
                id="editDeckDescription"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                placeholder="Enter deck description (optional)"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="editIsPublic">Public deck (visible to all users)</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditDeck}>
                Update Deck
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Word Management Dialog */}
      <Dialog open={wordManagementDialogOpen} onOpenChange={setWordManagementDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto sm:max-h-[90vh]">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
            <DialogTitle>Manage Words - "{selectedDeck?.name}"</DialogTitle>
            <DialogDescription>
              Add and manage words for this deck. You can add individual words or generate multiple words at once.
            </DialogDescription>
          </DialogHeader>
          {selectedDeck && (
            <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
              <AdminVocabularyForm
                onSaveWords={handleSaveWords}
                wordToEdit={null}
                deckId={selectedDeck.id}
                deckName={selectedDeck.name}
                existingWords={[]}
                onLoadingChange={() => {}}
                onCloseDialog={() => setWordManagementDialogOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
