'use server';

/**
 * @fileOverview Generates a random, useful tip about the application's functionality.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'zod';
import { ModelId } from '@genkit-ai/googleai';

const GenerateCookingTipInputSchema = z.object({
  previousTips: z.array(z.string()).describe('A list of previously shown tips to avoid repetition.'),
  context: z.object({
    view: z.string().describe("The user's current view in the app (e.g., 'search', 'cooking')."),
  }).optional().describe('The context of where the user is in the app.'),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});

export type GenerateCookingTipInput = z.infer<typeof GenerateCookingTipInputSchema>;

const GenerateCookingTipOutputSchema = z.object({
  tip: z.string().describe('A single, useful, and relatively short tip about how to use the app. It should be a general tip about a feature.'),
});

export type GenerateCookingTipOutput = z.infer<typeof GenerateCookingTipOutputSchema>;

export async function generateCookingTip(
  input: GenerateCookingTipInput
): Promise<GenerateCookingTipOutput> {
  const { previousTips, context, apiKey, model } = input;
  const ai = await getAi(apiKey);

  let promptText = `You are a helpful assistant for a recipe application called RecipeSavvy. Your goal is to provide a single, useful tip about the app's functionality.

The app has the following features:
- Finding recipes by ingredients or by name.
- Halal mode and allergen filtering.
- A "Surprise Me" button to get a random recipe.
- Saving recipes to a "Cookbook".
- A "Cooking Mode" with step-by-step instructions.
- In Cooking Mode: a timer, a "what should it look like?" visual description, and a troubleshooting helper.
- Creating variations of a recipe by excluding or adding ingredients.
- An "Undo" feature when navigating back to the home screen.
- Settings to manage API key and theme.

The tip should be about using one of these features. It should be concise and easy to understand.
`;

    if (context?.view === 'cooking') {
      promptText += `
The user is currently in 'Cooking Mode'. Provide a tip relevant to the features available in this mode.`;
    } else if (context?.view === 'details') {
       promptText += `
The user is currently viewing a recipe's details. Provide a tip about the Cookbook or Recipe Variation features.`;
    } else {
      promptText += `
Provide a general tip about finding recipes, managing settings, or using the allergen filters.`;
    }

    promptText += `

To ensure variety, please do not repeat any of the following previously shown tips:
${previousTips.map(tip => `- ${tip}`).join('\n')}

Please provide one new, unique, and helpful tip about using the app. Frame it as a helpful suggestion.`;

    const { output } = await ai.generate({
      prompt: promptText,
      model: model as ModelId,
      output: { schema: GenerateCookingTipOutputSchema },
    });

    return output!;
}
