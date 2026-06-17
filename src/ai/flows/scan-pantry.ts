'use server';

import { getAi, withGrounding } from '@/ai/genkit';
import { z } from 'genkit';
import { ModelId } from '@genkit-ai/googleai';

const ScanPantryInputSchema = z.object({
  // One or more data URIs, e.g. "data:image/jpeg;base64,....".
  photoDataUris: z.array(z.string()).min(1).describe('The pantry/fridge photos as data URIs.'),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});
export type ScanPantryInput = z.infer<typeof ScanPantryInputSchema>;

const ScanPantryOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('Edible food ingredients visible in the photo, lowercase, singular where natural.'),
});
export type ScanPantryOutput = z.infer<typeof ScanPantryOutputSchema>;

export async function scanPantry(input: ScanPantryInput): Promise<ScanPantryOutput> {
  const ai = await getAi(input.apiKey);

  const { output } = await ai.generate({
    model: input.model as ModelId,
    config: withGrounding(input.model),
    prompt: [
      {
        text: `Look at ${input.photoDataUris.length > 1 ? 'these photos' : 'this photo'} of a fridge/pantry. List only the distinct, edible food ingredients you can clearly identify across all images. Merge duplicates so each ingredient appears once. Ignore packaging, brands, utensils, and non-food items. Return concise ingredient names.`,
      },
      ...input.photoDataUris.map(url => ({ media: { url } })),
    ],
    output: { schema: ScanPantryOutputSchema },
  });

  return output ?? { ingredients: [] };
}
