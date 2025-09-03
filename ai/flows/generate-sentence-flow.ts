
'use server';
/**
 * @fileOverview An AI flow to generate an example sentence for a given vocabulary word.
 *
 * - generateSentence - A function that creates a contextual sentence.
 */

import { ai } from '@/ai/genkit';
import { 
  SentenceGenerationInputSchema, 
  SentenceGenerationOutputSchema,
  type SentenceGenerationInput,
  type SentenceGenerationOutput
} from '@/lib/types';


const generateSentencePrompt = ai.definePrompt({
  name: 'generateSentencePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SentenceGenerationInputSchema },
  output: { schema: SentenceGenerationOutputSchema },
  prompt: `You are a Japanese language teacher. Your task is to create a single, clear, and natural-sounding example sentence for a student.

The student is learning the word:
- Japanese: {{word.japanese}}
- Reading: {{word.reading}}
- Meaning: {{word.meaning}}

The student has requested a sentence with a difficulty level of: {{difficulty}}.

Please generate one example sentence that:
1.  Uses the word "{{word.japanese}}" correctly in context.
2.  Matches the requested difficulty level ({{difficulty}}). For 'basic', use simple grammar (e.g., masu-form). For 'advanced', use more complex structures.
3.  Is concise and suitable for a flashcard. Avoid overly long or complex sentences.
4.  Provide the sentence, its reading in hiragana, and its English translation.
`,
});

const generateSentenceFlow = ai.defineFlow(
  {
    name: 'generateSentenceFlow',
    inputSchema: SentenceGenerationInputSchema,
    outputSchema: SentenceGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await generateSentencePrompt(input);
    if (!output) {
      throw new Error('No output from sentence generation flow');
    }
    return output;
  }
);

export async function generateSentence(input: SentenceGenerationInput): Promise<SentenceGenerationOutput> {
  return generateSentenceFlow(input);
}
