'use server';

import { getAi, withGrounding, generateWithFallback } from '@/ai/genkit';
import {z} from 'genkit';
import {ModelId} from '@genkit-ai/googleai';

const RecipeDetailsInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to get details for.'),
  halalMode: z.boolean().optional().describe('Whether to make the recipe halal.'),
  allergens: z.array(z.string()).optional().describe('A list of allergens to avoid.'),
  diets: z.array(z.string()).optional().describe('Dietary requirements the recipe must satisfy, e.g. Vegan, Keto.'),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});
export type RecipeDetailsInput = z.infer<typeof RecipeDetailsInputSchema>;

const NutritionSchema = z.object({
  calories: z.string().describe('Estimated calories per serving, e.g. "520 kcal".'),
  protein: z.string().describe('Estimated protein per serving, e.g. "24 g".'),
  carbs: z.string().describe('Estimated carbohydrates per serving, e.g. "60 g".'),
  fat: z.string().describe('Estimated fat per serving, e.g. "18 g".'),
});

const RecipeDetailsOutputSchema = z.object({
  description: z.string().describe('A brief, mouth-watering description of the recipe.'),
  servings: z.number().describe('The number of servings this recipe yields as written.'),
  ingredients: z.array(z.string()).describe('List of all necessary ingredients for the recipe. Prefix each with a numeric quantity where possible, e.g. "2 cups flour".'),
  instructions: z.array(z.string()).describe('Step-by-step cooking instructions.'),
  prepTime: z.string().describe('Preparation time, e.g., "15 minutes".'),
  cookTime: z.string().describe('Cooking time, e.g., "30 minutes".'),
  nutrition: NutritionSchema.describe('Approximate nutrition facts per single serving.'),
});
export type RecipeDetailsOutput = z.infer<typeof RecipeDetailsOutputSchema>;

export async function generateRecipeDetails(
  input: RecipeDetailsInput
): Promise<RecipeDetailsOutput> {
  const ai = await getAi(input.apiKey);

  const prompt = `You are a world-class chef. A user wants to cook "${input.recipeName}". 
    
    ${input.halalMode ? 'The user requires a halal version of this recipe. Ensure all ingredients and preparation steps are halal.' : ''}
    ${input.allergens && input.allergens.length > 0 ? `The user is allergic to the following: ${input.allergens.join(', ')}. Ensure the recipe does not contain these ingredients.` : ''}
    ${input.diets && input.diets.length > 0 ? `The recipe MUST strictly comply with these dietary requirements: ${input.diets.join(', ')}. Do not include any ingredient that violates them.` : ''}

    Provide a detailed recipe including:
    1. A short, mouth-watering description of the dish.
    2. The number of servings the recipe yields.
    3. A list of all necessary ingredients. Begin each ingredient with a numeric quantity where it makes sense (e.g. "2 cups flour", "1 onion, diced").
    4. Step-by-step cooking instructions.
    5. The preparation time.
    6. The cooking time.
    7. Approximate nutrition facts PER SERVING (calories, protein, carbs, fat).

    Please format the output as a JSON object that matches the provided schema.`;

  const output = await generateWithFallback(input.model, async (model) => {
    const res = await ai.generate({
      prompt: prompt,
      model: model as ModelId,
      config: withGrounding(model),
      output: { schema: RecipeDetailsOutputSchema },
    });
    return res.output;
  });
  return output!;
}
