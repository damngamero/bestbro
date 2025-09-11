'use server';

/**
 * @fileOverview Suggests recipe names based on a user's query.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'zod';
import { ModelId } from '@genkit-ai/googleai';

const SuggestRecipesInputSchema = z.object({
  query: z.string().describe("The user's partial search query for a recipe."),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});

export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 4 recipe name suggestions.'),
});

export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(
  input: SuggestRecipesInput
): Promise<SuggestRecipesOutput> {
  const { query, apiKey, model } = input;
  const ai = await getAi(apiKey);

  const prompt = `You are a recipe suggestion engine. Based on the user's query "${query}", provide 4 relevant and popular recipe name suggestions. Be concise.`;

  const { output } = await ai.generate({
    prompt,
    model: model as ModelId,
    output: { schema: SuggestRecipesOutputSchema },
  });

  return output!;
}
