'use server';

/**
 * @fileOverview Provides troubleshooting advice for a specific cooking step.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'genkit';
import {ModelId} from '@genkit-ai/googleai';

const TroubleshootStepInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  instruction: z.string().describe('The cooking instruction where the user is having trouble.'),
  problem: z.string().describe("The user's description of what's going wrong."),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});

export type TroubleshootStepInput = z.infer<typeof TroubleshootStepInputSchema>;

const TroubleshootStepOutputSchema = z.object({
  advice: z.string().describe('Helpful advice to fix the user\'s problem.'),
});

export type TroubleshootStepOutput = z.infer<typeof TroubleshootStepOutputSchema>;

export async function troubleshootStep(
  input: TroubleshootStepInput
): Promise<TroubleshootStepOutput> {
  const { recipeName, instruction, problem, apiKey, model } = input;
  const ai = await getAi(apiKey);
  
  const prompt = `You are an expert chef and cooking instructor. A user is having trouble making a recipe and needs help.

Recipe: ${recipeName}
The step they are on: "${instruction}"
Their problem: "${problem}"

Provide clear, concise, and encouraging advice to help them fix the problem and continue cooking. Be specific and give actionable steps. If the problem is unrecoverable, gently explain why and suggest what to do differently next time.`;

    const {output} = await ai.generate({
      prompt,
      model: model as ModelId,
      output: { schema: TroubleshootStepOutputSchema },
    });
    
    return output!;
}
