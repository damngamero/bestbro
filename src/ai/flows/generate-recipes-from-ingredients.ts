'use server';

/**
 * @fileOverview Generates a list of possible recipes based on the ingredients provided by the user.
 *
 * - generateRecipesFromIngredients - A function that takes a list of ingredients and returns a list of possible recipes.
 * - GenerateRecipesFromIngredientsInput - The input type for the generateRecipesFromIngredients function.
 * - GenerateRecipesFromIngredientsOutput - The return type for the generateRecipesFromIngredients function.
 */

import { getAi } from '@/ai/genkit';
import {z} from 'genkit';
import {ModelId} from '@genkit-ai/googleai';

const GenerateRecipesFromIngredientsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients that the user has on hand.'),
  halalMode: z.boolean().optional().describe('Whether to only suggest halal recipes.'),
  allergens: z.array(z.string()).optional().describe('A list of allergens to avoid.'),
  maxCookTime: z.number().optional().describe('The maximum total cooking time in minutes.'),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});
export type GenerateRecipesFromIngredientsInput = z.infer<
  typeof GenerateRecipesFromIngredientsInputSchema
>;

const GenerateRecipesFromIngredientsOutputSchema = z.object({
  recipes: z
    .array(z.string())
    .describe('A list of 8-10 possible recipes that can be made with the given ingredients.'),
});
export type GenerateRecipesFromIngredientsOutput = z.infer<
  typeof GenerateRecipesFromIngredientsOutputSchema
>;

export async function generateRecipesFromIngredients(
  input: GenerateRecipesFromIngredientsInput
): Promise<GenerateRecipesFromIngredientsOutput> {
  const ai = await getAi(input.apiKey);

  const prompt = ai.definePrompt({
    name: 'generateRecipesFromIngredientsPrompt',
    input: {schema: GenerateRecipesFromIngredientsInputSchema},
    output: {schema: GenerateRecipesFromIngredientsOutputSchema},
    prompt: `You are a recipe expert. A user has the following ingredients. Suggest 8-10 diverse recipes they can make. Prioritize recipes that use more of the provided ingredients.
{{#if halalMode}}Only suggest halal recipes.{{/if}}
{{#if allergens}}The user is allergic to the following: {{#each allergens}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}. Do not suggest recipes containing these ingredients.{{/if}}
{{#if maxCookTime}}The total time (prep + cook) for each recipe must not exceed {{maxCookTime}} minutes.{{/if}}

Ingredients:
{{#each ingredients}}- {{this}}\n{{/each}}`,
  });

  const {output} = await prompt(input, {
    model: input.model as ModelId,
  });
  return output!;
}
