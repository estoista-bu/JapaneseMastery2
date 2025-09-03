import type { VocabularyWord } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Flashcard } from "@/components/flashcard";

interface VocabularyCarouselProps {
  words: VocabularyWord[];
  onRemoveWord: (id: string) => void;
}

export function VocabularyCarousel({ words, onRemoveWord }: VocabularyCarouselProps) {
  return (
    <Carousel className="w-full h-full flex items-center justify-center px-12">
      <CarouselContent>
        {words.map((word) => (
          <CarouselItem key={word.id}>
            <div className="p-1 h-full">
              <Flashcard
                word={word}
                onRemove={() => onRemoveWord(word.id)}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
