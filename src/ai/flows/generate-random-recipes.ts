
'use server';

/**
 * @fileOverview Generates one or more random, easy-to-make recipe names.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'zod';
import { ModelId } from '@genkit-ai/googleai';

const GenerateRandomRecipesInputSchema = z.object({
  count: z.number().default(1).describe('The number of random recipes to generate.'),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});

export type GenerateRandomRecipesInput = z.infer<typeof GenerateRandomRecipesInputSchema>;

const GenerateRandomRecipesOutputSchema = z.object({
  recipes: z.array(z.string()).describe('A list of recipe names.'),
});

export type GenerateRandomRecipesOutput = z.infer<typeof GenerateRandomRecipesOutputSchema>;

export async function generateRandomRecipes(
  input: GenerateRandomRecipesInput
): Promise<GenerateRandomRecipesOutput> {
  const { count, apiKey, model } = input;
  const ai = await getAi(apiKey);
  
  const prompt = `You are a helpful assistant. Your goal is to provide ${count} completely random, popular, diverse, and relatively easy-to-make recipe names. Ensure the suggestions are varied and not repetitive. Just provide the names, no extra text.`;

  const { output } = await ai.generate({
    prompt,
    model: model as ModelId,
    output: { schema: GenerateRandomRecipesOutputSchema },
  });

  return output!;
}
