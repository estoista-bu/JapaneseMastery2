
"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ClickableReadingProps {
  japanese: string;
  reading?: string;
  isBlock?: boolean;
}

export function ClickableReading({ japanese, reading, isBlock = false }: ClickableReadingProps) {
  // Regex to check for any Japanese characters (Hiragana, Katakana, Kanji)
  const containsJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(japanese);

  // If no Japanese characters, render plain text.
  if (!containsJapanese) {
    return <span className={cn(isBlock ? "block" : "inline")}>{japanese}</span>;
  }
  
  // If no specific reading is provided, use the Japanese text itself.
  // This makes pure Hiragana and Katakana phrases clickable for consistency.
  const readingText = reading || japanese;

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const WrapperComponent = isBlock ? 'div' : 'span';
  
  return (
     <WrapperComponent className={cn(isBlock ? "block" : "inline")}>
        <Popover>
            <PopoverTrigger asChild>
                <span className="cursor-pointer hover:text-primary" onClick={stopPropagation}>
                    {japanese}
                </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" onClick={stopPropagation}>
                <p className="text-sm font-semibold text-accent">{readingText}</p>
            </PopoverContent>
        </Popover>
     </WrapperComponent>
  );
}
