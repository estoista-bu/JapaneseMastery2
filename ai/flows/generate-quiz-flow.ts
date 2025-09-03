
'use server';
/**
 * @fileOverview An AI flow to generate a grammar quiz based on provided lessons.
 *
 * - generateQuiz - A function that creates a custom quiz.
 */

import { ai } from '@/ai/genkit';
import { 
  QuizGenerationInputSchema, 
  QuizGenerationOutputSchema,
  type QuizGenerationInput,
  type QuizGenerationOutput
} from '@/lib/types';


const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: QuizGenerationInputSchema },
  output: { schema: QuizGenerationOutputSchema },
  prompt: `You are an expert Japanese language teacher designing a multiple-choice quiz.
The quiz should be based *only* on the content of the following grammar lessons. Do not create questions about topics not present in these lessons.

{{#each lessons}}
Lesson Title: {{this.title}}
Explanation: {{this.explanation}}
Examples:
{{#each this.exampleSentences}}
- {{this.japanese}} ({{this.meaning}})
{{/each}}
---
{{/each}}

Your task is to generate a quiz with exactly {{numQuestions}} questions.
For each question:
1.  Create a clear multiple-choice question that tests a concept from the provided lessons.
2.  Generate the single correct answer first.
3.  Generate three plausible but incorrect answers. Combine them into four distinct options.
4.  Provide Japanese readings for the question and options if they contain Kanji.
5.  Set the 'correctAnswer' field to be an EXACT copy of the correct option text.
6.  Write a concise explanation for why the answer is correct, referencing the rule from the lessons.

{{#if deckName}}
**VERY IMPORTANT**: The user has selected a flashcard deck named "{{deckName}}". Prioritize creating questions that use vocabulary from the following list. At least 75% of the questions should incorporate one or more of these words if possible.

Vocabulary from "{{deckName}}" deck:
{{#each vocabularyWords}}
- {{this.japanese}} ({{this.reading}}): {{this.meaning}}
{{/each}}
{{/if}}
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: QuizGenerationInputSchema,
    outputSchema: QuizGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await generateQuizPrompt(input);
    if (!output) {
      throw new Error('No output from quiz generation flow');
    }

    // Post-processing to ensure correctAnswer is always one of the options
    const processedQuestions = output.questions.map(q => {
      // If the provided correctAnswer is already in the options, we're good.
      if (q.options.includes(q.correctAnswer)) {
        return q;
      }
      
      // If not, find the most similar option and set it as correct.
      // This handles cases where the AI might have a slight formatting difference.
      let bestMatch = q.options[0];
      let highestSimilarity = 0;

      q.options.forEach(option => {
        const similarity = compareStrings(option, q.correctAnswer);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatch = option;
        }
      });
      
      // If no plausible match, default to the first option.
      return { ...q, correctAnswer: bestMatch || q.options[0] };
    });

    return { questions: processedQuestions };
  }
);

// Helper function to compare strings and find similarity (Levenshtein distance based)
function compareStrings(a: string, b: string): number {
  if (!a || !b) return 0;
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    matrix[j][0] = j;
  }
  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator,
      );
    }
  }
  return 1.0 - matrix[b.length][a.length] / Math.max(a.length, b.length);
}


export async function generateQuiz(input: QuizGenerationInput): Promise<QuizGenerationOutput> {
  return generateQuizFlow(input);
}
