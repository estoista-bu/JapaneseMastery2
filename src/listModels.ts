// listModels.ts
import { googleAI } from '@genkit-ai/googleai';

async function list() {
  const models = await googleAI.listModels();
  console.log('Available models:', models);
}

list();
