'use server';

import { getAi } from '@/ai/genkit';
import {z} from 'genkit';
import {ModelId} from '@genkit-ai/googleai';

const RecipeDetailsInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to get details for.'),
  halalMode: z.boolean().optional().describe('Whether to make the recipe halal.'),
  allergens: z.array(z.string()).optional().describe('A list of allergens to avoid.'),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});
export type RecipeDetailsInput = z.infer<typeof RecipeDetailsInputSchema>;

const RecipeDetailsOutputSchema = z.object({
  description: z.string().describe('A brief, mouth-watering description of the recipe.'),
  ingredients: z.array(z.string()).describe('List of all necessary ingredients for the recipe.'),
  instructions: z.array(z.string()).describe('Step-by-step cooking instructions.'),
  prepTime: z.string().describe('Preparation time, e.g., "15 minutes".'),
  cookTime: z.string().describe('Cooking time, e.g., "30 minutes".'),
});
export type RecipeDetailsOutput = z.infer<typeof RecipeDetailsOutputSchema>;

export async function generateRecipeDetails(
  input: RecipeDetailsInput
): Promise<RecipeDetailsOutput> {
  const ai = await getAi(input.apiKey);

  const prompt = `You are a world-class chef. A user wants to cook "${input.recipeName}". 
    
    ${input.halalMode ? 'The user requires a halal version of this recipe. Ensure all ingredients and preparation steps are halal.' : ''}
    ${input.allergens && input.allergens.length > 0 ? `The user is allergic to the following: ${input.allergens.join(', ')}. Ensure the recipe does not contain these ingredients.` : ''}

    Provide a detailed recipe including:
    1. A short, mouth-watering description of the dish.
    2. A list of all necessary ingredients.
    3. Step-by-step cooking instructions.
    4. The preparation time.
    5. The cooking time.
    
    Please format the output as a JSON object that matches the provided schema.`;

  const {output} = await ai.generate({
    prompt: prompt,
    model: input.model as ModelId,
    output: { schema: RecipeDetailsOutputSchema },
  });
  return output!;
}
