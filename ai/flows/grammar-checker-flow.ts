
'use server';
/**
 * @fileOverview An AI-powered grammar checker for Japanese text.
 *
 * - checkGrammar - A function that analyzes Japanese text for grammatical errors.
 */

import { ai } from '@/ai/genkit';
import { 
  GrammarCheckInputSchema, 
  GrammarCheckOutputSchema,
  type GrammarCheckInput,
  type GrammarCheckOutput
} from '@/lib/types';


const grammarCheckPrompt = ai.definePrompt({
  name: 'grammarCheckPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GrammarCheckInputSchema },
  output: { schema: GrammarCheckOutputSchema },
  prompt: `You are a friendly and encouraging Japanese language teacher. Your task is to analyze the user's Japanese text for grammatical errors.

Analyze the following text:
"{{text}}"

Please provide feedback based on these rules:
1.  Identify specific grammatical mistakes or unnatural phrasing.
2.  For each mistake, provide a clear suggestion for correction.
3.  Explain *why* it's a mistake in simple terms.
4.  If there are no mistakes, return an empty array for corrections and provide positive overall feedback.
5.  Keep your overall feedback encouraging.`,
});

const grammarCheckerFlow = ai.defineFlow(
  {
    name: 'grammarCheckerFlow',
    inputSchema: GrammarCheckInputSchema,
    outputSchema: GrammarCheckOutputSchema,
  },
  async (input) => {
    const { output } = await grammarCheckPrompt(input);
    if (!output) {
      throw new Error('No output from grammar check flow');
    }
    return output;
  }
);

export async function checkGrammar(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  return grammarCheckerFlow(input);
}
