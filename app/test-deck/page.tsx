import DeckCreator from '@/components/deck-creator';
import DeckList from '@/components/deck-list';

export default function TestDeckPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Deck Management Test</h1>
        
        <div className="max-w-4xl mx-auto">
          <DeckCreator />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <DeckList />
        </div>
      </div>
    </div>
  );
} 