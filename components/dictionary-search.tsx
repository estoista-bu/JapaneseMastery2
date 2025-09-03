
'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, BookMarked } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { JishoResult } from '@/lib/types';

export function DictionarySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<JishoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a word to search for.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const response = await fetch(`/api/jisho?keyword=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setResults(data.data);
      } else {
        setResults([]);
        toast({
          title: 'No Results',
          description: `No dictionary entries found for "${query}".`,
        });
      }
    } catch (error) {
      console.error('Failed to fetch Jisho results', error);
      toast({
        title: 'An Error Occurred',
        description: 'Failed to fetch search results. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, toast]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center space-y-2 mb-4">
        <BookMarked className="mx-auto h-8 w-8 text-primary"/>
        <h2 className="text-lg font-headline font-semibold">Dictionary Search</h2>
        <p className="text-sm text-muted-foreground px-2">
            Search for Japanese words.
            <br />
            Accepts Kanji, Katakana, Hiragana, Romaji, and English.
        </p>
      </div>

      <div className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="e.g. 猫 or cat"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="text-base"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only">Search</span>
        </Button>
      </div>
       <p className="text-xs text-center text-muted-foreground">Powered by Jisho.org</p>

      <div className="space-y-4">
        {isLoading && (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        {!isLoading && results.length > 0 && (
          results.map((result, index) => (
            <Card key={index}>
              <CardContent className="p-4 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Word</p>
                  <p className="text-2xl font-bold text-primary">{result.japanese[0].word || result.japanese[0].reading}</p>
                  <p className="text-lg text-accent">{result.japanese[0].reading}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Definition</p>
                  <ul className="list-decimal list-inside text-foreground space-y-1">
                    {result.senses.map((sense, i) => (
                      <li key={i}>{sense.english_definitions.join('; ')}</li>
                    ))}
                  </ul>
                </div>
                {result.is_common && (
                    <div className="text-xs font-semibold inline-block bg-green-100 text-green-800 rounded-full px-2 py-0.5 dark:bg-green-900/50 dark:text-green-300">
                        Common word
                    </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
        {!isLoading && hasSearched && results.length === 0 && (
            <div className="text-center p-8">
                <p className="text-muted-foreground">No results found for "{query}".</p>
            </div>
        )}
      </div>
    </div>
  );
}
