'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface Deck {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  jlpt_level?: string;
  word_count: number;
  is_active: boolean;
}

export default function DeckList() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDecks();
      setDecks(response.decks || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this deck?')) {
      return;
    }

    try {
      await apiService.deleteDeck(slug);
      setMessage('✅ Deck deleted successfully');
      loadDecks(); // Reload the list
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete deck');
    }
  };

  const [message, setMessage] = useState('');

  if (loading) {
    return <div className="text-center py-8">Loading decks...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Existing Decks</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => (
          <div key={deck.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{deck.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                deck.category === 'user' ? 'bg-blue-100 text-blue-800' :
                deck.category === 'jlpt' ? 'bg-green-100 text-green-800' :
                deck.category === 'kana' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {deck.category}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-2">{deck.description}</p>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{deck.word_count} words</span>
              {deck.jlpt_level && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {deck.jlpt_level}
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => window.open(`/deck/${deck.slug}`, '_blank')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View
              </button>
              {deck.category === 'user' && (
                <button
                  onClick={() => handleDeleteDeck(deck.slug)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {decks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No decks found. Create your first deck above!
        </div>
      )}
    </div>
  );
} 