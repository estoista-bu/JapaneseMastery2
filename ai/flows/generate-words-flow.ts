
'use server';
/**
 * @fileOverview An AI-powered flow to generate new vocabulary words for a given topic.
 *
 * - generateWords - A function that suggests new Japanese vocabulary words.
 */

import { ai } from '@/ai/genkit';
import { 
  WordGenerationInputSchema, 
  WordGenerationOutputSchema,
  type WordGenerationInput,
  type WordGenerationOutput,
} from '@/lib/types';
import { n5Words } from '@/data/n5-words';
import { n4Words } from '@/data/n4-words';
import { n3Words } from '@/data/n3-words';
import { n2Words } from '@/data/n2-words';
import { n1Words } from '@/data/n1-words';

const levelMap = {
  N5: n5Words,
  N4: n4Words,
  N3: n3Words,
  N2: n2Words,
  N1: n1Words,
};

const wordSelectorPrompt = ai.definePrompt({
  name: 'wordSelectorPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: WordGenerationInputSchema },
  output: { schema: WordGenerationOutputSchema },
  prompt: `You are an expert Japanese language teacher helping a student build a vocabulary deck.
The student's deck is called: "{{deckName}}".
{{#if deckTopic}}The student wants to add words related to the topic: "{{deckTopic}}".{{/if}}

Your task is to select words from the provided "Word Bank".

Rules for selection:
1.  The selected words MUST come only from the "Word Bank" below.
2.  You MUST NOT select any words from the "Existing Words" list.
3.  {{#if deckTopic}}If a "Deck Topic" is provided, you MUST ONLY select words that are {{deckTopic}}s. Do not include any other parts of speech.{{/if}}
4.  If you cannot find enough matching words (because they are all in "Existing Words" or don't match the topic), return as many as you can. If you can't find any, return an empty list.
5.  **VERY IMPORTANT**: Return exactly {{numWords}} words if possible. Do not generate more or less than this amount unless there are not enough words in the bank.

Word Bank (Select from here):
{{#each wordBank}}
- {{this.japanese}} ({{this.reading}}): {{this.meaning}}
{{/each}}

Existing Words (Do NOT select these):
{{#each existingWords}}
- {{this}}
{{/each}}
`,
});


const generateWordsPrompt = ai.definePrompt({
  name: 'generateWordsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: WordGenerationInputSchema },
  output: { schema: WordGenerationOutputSchema },
  prompt: `You are an expert Japanese language teacher creating a vocabulary list for a student.
The student is creating a flashcard deck with the title: "{{deckName}}".
{{#if deckTopic}}The student wants to add words related to the topic: "{{deckTopic}}".{{/if}}

The student's deck already contains the following words. You MUST NOT generate any of these words.
Existing words:
{{#each existingWords}}
- {{this}}
{{/each}}

VERY IMPORTANT: Generate exactly {{numWords}} words. Do not generate more or less than this amount.
`,
});


const generateWordsFlow = ai.defineFlow(
  {
    name: 'generateWordsFlow',
    inputSchema: WordGenerationInputSchema,
    outputSchema: WordGenerationOutputSchema,
  },
  async (input) => {
    const { deckName, existingWords } = input;
    
    // Check if the deck name is for a specific JLPT level
    const jlptMatch = deckName.match(/JLPT (N[1-5])/i);
    const jlptLevels = deckName.match(/N[1-5]/gi) || [];

    if (jlptLevels.length > 0) {
      const uniqueLevels = [...new Set(jlptLevels.map(l => l.toUpperCase() as keyof typeof levelMap))];
      
      let combinedWordBank = uniqueLevels.flatMap(level => levelMap[level] || []);

      // Filter out words that already exist in the user's deck
      let availableWords = combinedWordBank.filter(word => !existingWords.includes(word.japanese));

      // Determine topic from deck name (e.g., "Verbs", "Adjectives")
      const deckTopic = deckName
        .replace(/JLPT N[1-5]/gi, '')
        .replace(/\//g, '')
        .trim()
        .toLowerCase();
        
      // If a topic is specified (and it's not just 'vocabulary'), pre-filter the word bank.
      if (deckTopic && deckTopic !== 'vocabulary' && deckTopic !== 'vocab') {
          // A simple but effective way to filter by part of speech
          const topicSingular = deckTopic.endsWith('s') ? deckTopic.slice(0, -1) : deckTopic;
          availableWords = availableWords.filter(word => 
              word.meaning.toLowerCase().includes(topicSingular)
          );
      }

      if (availableWords.length === 0) {
        // No new words to suggest from this JLPT level
        return { words: [] };
      }
      
      // Use AI to select the best words from the available list
      const { output } = await wordSelectorPrompt({
        ...input,
        deckTopic: deckTopic || undefined, // Provide topic if it exists
        wordBank: availableWords,
      });

      if (!output) {
        throw new Error('No output from word selection flow');
      }
      
      // Filter out incomplete objects that the AI might return
      const validatedWords = output.words.filter(
        word => word.japanese && word.reading && word.meaning
      );

      return { words: validatedWords };
      
    } else {
      // If it's not a JLPT deck, use the original generation logic
      const { output } = await generateWordsPrompt(input);
      if (!output) {
        throw new Error('No output from word generation flow');
      }

      // Filter out incomplete objects that the AI might return
      const validatedWords = output.words.filter(
        word => word.japanese && word.reading && word.meaning
      );

      return { words: validatedWords };
    }
  }
);

export async function generateWords(input: WordGenerationInput): Promise<WordGenerationOutput> {
  return generateWordsFlow(input);
}
