'use server';

/**
 * @fileOverview Generates a variation of a recipe based on user preferences.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'zod';
import { ModelId } from '@genkit-ai/googleai';

const GenerateRecipeVariationInputSchema = z.object({
  recipeName: z.string().describe('The name of the original recipe.'),
  ingredientsToExclude: z.array(z.string()).optional().describe('A list of ingredients to remove from the recipe.'),
  addons: z.array(z.string()).optional().describe('A list of ingredients to add to the recipe.'),
  unavailableEquipment: z.array(z.string()).optional().describe('A list of cooking equipment the user does not have.'),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});

export type GenerateRecipeVariationInput = z.infer<typeof GenerateRecipeVariationInputSchema>;

const RecipeVariationOutputSchema = z.object({
  possible: z.boolean().describe("Whether it's possible to create a variation with the given constraints."),
  reason: z.string().optional().describe("The reason why a variation is not possible, if applicable."),
  newRecipe: z.object({
    name: z.string().describe("The name of the new recipe variation, e.g., 'Chicken Alfredo (No Mushrooms)'.") ,
    description: z.string().describe('A brief, mouth-watering description of the new recipe variation.'),
    ingredients: z.array(z.string()).describe('The new list of all necessary ingredients.'),
    instructions: z.array(z.string()).describe('The new step-by-step cooking instructions, adjusted for the changes.'),
    prepTime: z.string().describe('The new preparation time.'),
    cookTime: z.string().describe('The new cooking time.'),
  }).optional(),
});

export type RecipeVariationOutput = z.infer<typeof RecipeVariationOutputSchema>;


export async function generateRecipeVariation(
  input: GenerateRecipeVariationInput
): Promise<RecipeVariationOutput> {
  const { recipeName, ingredientsToExclude, addons, unavailableEquipment, apiKey, model } = input;
  const ai = await getAi(apiKey);
    
    let promptText = `You are an expert chef who specializes in adapting recipes. A user wants to make a variation of "${recipeName}".\n\n`;

    if (ingredientsToExclude && ingredientsToExclude.length > 0) {
        promptText += `Please remove the following ingredients: ${ingredientsToExclude.join(', ')}. If removing an ingredient makes the recipe impossible or fundamentally changes it for the worse, please indicate that it's not possible.\n`;
    }

    if (addons && addons.length > 0) {
        promptText += `Please add the following ingredients: ${addons.join(', ')}. Adjust the recipe instructions accordingly.\n`;
    }

    if (unavailableEquipment && unavailableEquipment.length > 0) {
        promptText += `The user does not have the following equipment: ${unavailableEquipment.join(', ')}. Please adapt the cooking instructions to use alternative common kitchen equipment. For example, if an oven is unavailable, suggest pan-frying or boiling if appropriate. If a key piece of equipment is unavailable and there is no good alternative, indicate that the variation is not possible.\n`;
    }


    promptText += `
If you can create a viable variation, please provide a complete new recipe including a new name (e.g., "${recipeName} (Variation)"), description, ingredients list, instructions, prep time, and cook time.

If it is not possible to create a good-tasting recipe with these changes, please set the "possible" flag to false and provide a brief reason why.`;


    const { output } = await ai.generate({
      prompt: promptText,
      model: model as ModelId,
      output: { schema: RecipeVariationOutputSchema },
    });
    
    return output!;
}
