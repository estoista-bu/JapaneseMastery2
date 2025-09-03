
import { z } from 'zod';

export type VocabularyWord = {
  id: string;
  japanese: string;
  reading: string;
  meaning: string;
  deckId: string;
  jlpt?: string; 
};

export type Deck = {
  id: string;
  name: string;
  description?: string;
  category?: 'user' | 'kana' | 'group' | 'jlpt';
  groupId?: string;
  slug?: string;
  jlpt_level?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  word_count?: number;
  is_active?: boolean;
};

export type GrammarLesson = {
  title: string;
  level: "N5" | "N4";
  explanation: string;
  exampleSentences: {
    japanese: string;
    reading: string;
    meaning: string;
  }[];
  isRead?: boolean;
};

export type QuizQuestion = {
  question: string;
  questionReading?: string;
  options: string[];
  optionsReading?: string[];
  correctAnswer: string;
  explanation: string;
  explanationReading?: string;
};

export type Quiz = {
  id: string;
  title: string;
  level: "N5" | "N4" | "AI";
  questions: QuizQuestion[];
  score?: number | null;
  inProgress?: boolean;
};

export type UserRole = "user" | "admin";

export type User = {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  groups?: string[]; 
}

export type Group = {
  id: string;
  name: string;
  description: string;
}

export type WordMasteryStats = {
  correct: number;
  incorrect: number;
  weight?: number;
};


// Schema for AI Grammar Checker Input
export const GrammarCheckInputSchema = z.object({
  text: z.string().describe('The Japanese text to be checked for grammatical errors.'),
});
export type GrammarCheckInput = z.infer<typeof GrammarCheckInputSchema>;

// Schema for AI Grammar Checker Output
export const GrammarCheckOutputSchema = z.object({
  corrections: z
    .array(
      z.object({
        mistake: z.string().describe('The specific part of the text that is grammatically incorrect or awkward.'),
        suggestion: z.string().describe('A proposed correction for the identified mistake.'),
        explanation: z.string().describe('A clear and simple explanation of the grammatical error and why the suggestion is more appropriate.'),
      })
    )
    .describe('A list of identified grammar corrections. If no mistakes are found, this array will be empty.'),
  overallFeedback: z.string().describe('A brief, encouraging overall assessment of the text.'),
});
export type GrammarCheckOutput = z.infer<typeof GrammarCheckOutputSchema>;


// Types for Jisho.org API Response
export interface JishoResult {
  is_common: boolean;
  japanese: {
    word?: string;
    reading?: string;
  }[];
  senses: {
    english_definitions: string[];
    parts_of_speech: string[];
  }[];
  jlpt?: string[];
}

const WordSchema = z.object({
    japanese: z.string().describe("The vocabulary word in Japanese (using Kanji where appropriate)."),
    reading: z.string().describe("The reading of the word in Hiragana."),
    meaning: z.string().describe("The English meaning of the word."),
    jlpt: z.string().optional().describe("The JLPT level of the word, if applicable."),
});

// Schemas for AI Word Generation
export const WordGenerationInputSchema = z.object({
  deckName: z.string().describe("The topic or title of the deck for which to generate vocabulary."),
  deckTopic: z.string().optional().describe("An optional specific topic for the words, like 'verbs' or 'food'."),
  existingWords: z.array(z.string()).describe("A list of Japanese words that are already in the deck to avoid generating duplicates."),
  numWords: z.number().int().min(1).max(100).describe("The number of words to generate."),
  wordBank: z.array(WordSchema).optional().describe("An optional bank of words to select from, used for JLPT decks.")
});
export type WordGenerationInput = z.infer<typeof WordGenerationInputSchema>;

export const WordGenerationOutputSchema = z.object({
  words: z.array(WordSchema)
});
export type WordGenerationOutput = z.infer<typeof WordGenerationOutputSchema>;


// Schemas for AI Sentence Generation
export const DifficultySchema = z.enum(['Basic', 'Advanced']);
export type Difficulty = z.infer<typeof DifficultySchema>;

const VocabularyWordSchema = z.object({
  japanese: z.string(),
  reading: z.string(),
  meaning: z.string(),
});

export const SentenceGenerationInputSchema = z.object({
  word: VocabularyWordSchema.describe("The word to create a sentence for."),
  difficulty: DifficultySchema.describe("The desired difficulty level for the sentence."),
});
export type SentenceGenerationInput = z.infer<typeof SentenceGenerationInputSchema>;

export const SentenceGenerationOutputSchema = z.object({
  sentence: z.string().describe("The generated example sentence in Japanese."),
  reading: z.string().describe("The reading of the sentence in hiragana."),
  translation: z.string().describe("The English translation of the sentence."),
});
export type SentenceGenerationOutput = z.infer<typeof SentenceGenerationOutputSchema>;


// Schemas for AI Quiz Generation
const GrammarLessonSchema = z.object({
    title: z.string(),
    level: z.enum(["N5", "N4"]),
    explanation: z.string(),
    exampleSentences: z.array(z.object({
        japanese: z.string(),
        reading: z.string(),
        meaning: z.string(),
    })),
});

const VocabularyWordForQuizSchema = z.object({
  japanese: z.string(),
  reading: z.string(),
  meaning: z.string(),
});

export const QuizGenerationInputSchema = z.object({
  lessons: z.array(GrammarLessonSchema).describe("A list of grammar lessons to base the quiz on."),
  numQuestions: z.number().int().min(1).max(100).describe("The number of questions to generate for the quiz."),
  deckName: z.string().optional().describe("The name of the user-selected vocabulary deck."),
  vocabularyWords: z.array(VocabularyWordForQuizSchema).optional().describe("A list of vocabulary words from the selected deck to bias the quiz questions towards."),
});
export type QuizGenerationInput = z.infer<typeof QuizGenerationInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe("The question text."),
  questionReading: z.string().optional().describe("The hiragana reading for the question text, if applicable."),
  options: z.array(z.string()).length(4).describe("An array of four possible answers."),
  optionsReading: z.array(z.string()).length(4).optional().describe("The hiragana readings for the options, if applicable."),
  correctAnswer: z.string().describe("The correct answer from the options array."),
  explanation: z.string().describe("An explanation of why the correct answer is right."),
  explanationReading: z.string().optional().describe("The hiragana reading for the explanation text, if applicable."),
});

export const QuizGenerationOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema)
});
export type QuizGenerationOutput = z.infer<typeof QuizGenerationOutputSchema>;
